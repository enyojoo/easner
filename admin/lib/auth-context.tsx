"use client"

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { isAdminRole, type AdminRole } from "@/lib/roles"
import { clearBrowserQueryClient } from "@/lib/query/query-client"
import { clearAllAdminBrowserState, probeStoredAdminUserId } from "@/lib/query/web-persist"

/**
 * Who is signed in and what they may do. Office's auth-context pattern, for the admin's own sign-in:
 * email code (OTP) → admin_members allowlist → required MFA (aal2).
 *
 * - signed-out: no session.
 * - no-access: signed in, but not on the team (and no pending invite for this email).
 * - needs-mfa: on the team; the session is not MFA-verified yet. The database grants nothing until it is.
 * - ready: on the team with an aal2 session.
 */
export type AdminAccess = "loading" | "signed-out" | "no-access" | "needs-mfa" | "ready"

type ResolvedAccess = {
  access: Exclude<AdminAccess, "loading">
  role: AdminRole | null
  hasVerifiedFactor: boolean
}

/**
 * Membership comes from the database, never from JWT metadata. accept_admin_invite() turns a pending invite for this
 * email into membership on the first sign-in, and returns the caller's role either way.
 */
async function resolveAccess(session: Session | null): Promise<ResolvedAccess> {
  if (!session?.user) return { access: "signed-out", role: null, hasVerifiedFactor: false }
  const { data: roleData, error } = await supabase.rpc("accept_admin_invite")
  const role = !error && isAdminRole(roleData) ? roleData : null
  if (!role) return { access: "no-access", role: null, hasVerifiedFactor: false }
  const [{ data: aal }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ])
  const hasVerifiedFactor = (factors?.totp ?? []).some((factor) => factor.status === "verified")
  if (aal?.currentLevel === "aal2" && hasVerifiedFactor) return { access: "ready", role, hasVerifiedFactor }
  return { access: "needs-mfa", role, hasVerifiedFactor }
}

/**
 * Last-verified cache (Office's fast boot): a member we verified recently paints the shell and cached data at once
 * while the check runs again in the background. Every query is still checked by RLS.
 */
const ACCESS_OK_KEY_PREFIX = "easner_admin_access_ok_v1_"
const ACCESS_OK_MAX_AGE_MS = 30 * 60 * 1000

function readCachedRole(userId: string | null): AdminRole | null {
  if (!userId || typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(`${ACCESS_OK_KEY_PREFIX}${userId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { role?: unknown; at?: unknown }
    const at = typeof parsed.at === "number" ? parsed.at : 0
    if (Date.now() - at > ACCESS_OK_MAX_AGE_MS) return null
    return isAdminRole(parsed.role) ? parsed.role : null
  } catch {
    return null
  }
}

function writeCachedRole(userId: string, role: AdminRole | null): void {
  if (typeof window === "undefined") return
  try {
    const key = `${ACCESS_OK_KEY_PREFIX}${userId}`
    if (role) window.localStorage.setItem(key, JSON.stringify({ role, at: Date.now() }))
    else window.localStorage.removeItem(key)
  } catch {
    // Blocked storage: no fast boot, nothing else changes.
  }
}

export interface AuthContextType {
  user: User | null
  role: AdminRole | null
  access: AdminAccess
  /** The member has a verified authenticator (so the MFA step is "enter a code", not "set one up"). */
  hasVerifiedFactor: boolean
  /**
   * True once Supabase has resolved the stored session. During the cached fast boot `access` is "ready" while
   * `user` is still null: that means "hydrating", not "signed out".
   */
  sessionResolved: boolean
  /** Confirmed user id, or the stored id for query-cache bootstrap before hydration. */
  sessionUserId: string | null
  /** Admin queries may run (ready, or fast-boot cached). */
  adminQueriesEnabled: boolean
  /** Re-reads membership and MFA level (after a code is verified). */
  refresh: () => Promise<AdminAccess>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  access: "loading",
  hasVerifiedFactor: false,
  sessionResolved: false,
  sessionUserId: null,
  adminQueriesEnabled: false,
  refresh: async () => "loading",
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // The first render must match the server's (nothing known yet). The fast-boot cache is read right after mount,
  // before the browser paints, so a recently verified member still sees the shell at once without a hydration mismatch.
  const [bootUserId, setBootUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AdminRole | null>(null)
  const [access, setAccess] = useState<AdminAccess>("loading")
  const [hasVerifiedFactor, setHasVerifiedFactor] = useState(false)
  const [sessionResolved, setSessionResolved] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const generationRef = useRef(0)

  useLayoutEffect(() => {
    const stored = probeStoredAdminUserId()
    const cached = readCachedRole(stored)
    setBootUserId(stored)
    if (!cached) return
    // Only while nothing newer has resolved (a fast session check can finish first).
    if (generationRef.current !== 0) return
    setRole(cached)
    setAccess("ready")
    setHasVerifiedFactor(true)
  }, [])

  const sync = useCallback(async (session: Session | null): Promise<AdminAccess> => {
    const generation = ++generationRef.current
    const nextUser = session?.user ?? null
    userIdRef.current = nextUser?.id ?? null
    setUser(nextUser)
    setSessionResolved(true)
    const resolved = await resolveAccess(session)
    // A newer auth event won: a stale aal1 answer must not demote a just-verified session.
    if (generation !== generationRef.current) return resolved.access
    if (nextUser) writeCachedRole(nextUser.id, resolved.access === "ready" ? resolved.role : null)
    setRole(resolved.role)
    setHasVerifiedFactor(resolved.hasVerifiedFactor)
    setAccess(resolved.access)
    return resolved.access
  }, [])

  useEffect(() => {
    let cancelled = false
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return
      // Supabase holds its auth lock during this callback; calling it again from inside can deadlock.
      window.setTimeout(() => {
        if (!cancelled) void sync(session)
      }, 0)
    })
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void sync(session)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [sync])

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return sync(session)
  }, [sync])

  const signOut = useCallback(async () => {
    const userId = userIdRef.current
    if (userId) writeCachedRole(userId, null)
    await supabase.auth.signOut({ scope: "local" })
    clearAllAdminBrowserState(userId)
    clearBrowserQueryClient()
    setUser(null)
    setRole(null)
    setAccess("signed-out")
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
      window.location.replace("/auth/login")
    }
  }, [])

  const sessionUserId = user?.id ?? bootUserId
  const adminQueriesEnabled = access === "ready" && Boolean(sessionUserId)

  const value = useMemo(
    () => ({
      user,
      role,
      access,
      hasVerifiedFactor,
      sessionResolved,
      sessionUserId,
      adminQueriesEnabled,
      refresh,
      signOut,
    }),
    [user, role, access, hasVerifiedFactor, sessionResolved, sessionUserId, adminQueriesEnabled, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
