"use client"

import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client"

/**
 * Query-cache persistence, Office's pattern: a reload paints every page from the on-device cache at once and
 * freshens silently. Per-user key, only queries marked `meta: { webPersist: "reduced" }`, 12h max age, cleared on
 * sign-out. Writes are coalesced (~3s) and deferred to idle.
 */

export const ADMIN_WEB_QUERY_CACHE_BUSTER = "admin-web-query-cache-v1"
export const ADMIN_WEB_QUERY_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000

const CACHE_KEY_PREFIX = "easner_admin_query_cache_v1_"
const AUTH_STORAGE_KEY = "easner-admin-auth"
export const ADMIN_JUMP_RECENTS_KEY = "admin:jump-to:recents"

export function adminWebQueryCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * The last signed-in user id, read synchronously from Supabase's auth storage. The persister must know its key on
 * the first render: PersistQueryClientProvider restores exactly once.
 */
export function probeStoredAdminUserId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const parsed = safeParse<{ user?: { id?: unknown } }>(window.localStorage.getItem(AUTH_STORAGE_KEY))
    const id = parsed?.user?.id
    return typeof id === "string" && id.trim() ? id : null
  } catch {
    return null
  }
}

export function clearAllAdminBrowserState(userId?: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (userId) {
      window.localStorage.removeItem(adminWebQueryCacheKey(userId))
    } else {
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index)
        if (key?.startsWith(CACHE_KEY_PREFIX)) window.localStorage.removeItem(key)
      }
    }
    window.localStorage.removeItem(ADMIN_JUMP_RECENTS_KEY)
    window.sessionStorage.clear()
  } catch {
    // Private mode or blocked storage: nothing was persisted.
  }
}

export function createAdminQueryPersister(userId: string | null): Persister {
  const PERSIST_THROTTLE_MS = 3_000
  let pendingClient: PersistedClient | null = null
  let flushTimer: number | null = null

  const writeNow = () => {
    if (typeof window === "undefined" || !userId) return
    const toWrite = pendingClient
    pendingClient = null
    if (!toWrite) return
    try {
      window.localStorage.setItem(adminWebQueryCacheKey(userId), JSON.stringify(toWrite))
    } catch {
      clearAllAdminBrowserState(userId)
    }
  }

  if (typeof window !== "undefined" && userId) {
    window.addEventListener("pagehide", writeNow)
  }

  return {
    persistClient: async (client: PersistedClient) => {
      if (typeof window === "undefined" || !userId) return
      pendingClient = client
      if (flushTimer != null) return
      flushTimer = window.setTimeout(() => {
        flushTimer = null
        const w = window as Window & {
          requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
        }
        if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(() => writeNow(), { timeout: 2_000 })
        else writeNow()
      }, PERSIST_THROTTLE_MS)
    },
    restoreClient: async () => {
      if (typeof window === "undefined" || !userId) return undefined
      try {
        return safeParse<PersistedClient>(window.localStorage.getItem(adminWebQueryCacheKey(userId))) ?? undefined
      } catch {
        return undefined
      }
    },
    removeClient: async () => {
      clearAllAdminBrowserState(userId)
    },
  }
}

export function shouldPersistAdminQuery(query: {
  state?: { status?: string }
  meta?: { webPersist?: "none" | "reduced" }
}): boolean {
  return query.state?.status === "success" && query.meta?.webPersist === "reduced"
}
