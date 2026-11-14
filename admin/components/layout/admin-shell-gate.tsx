"use client"

import type React from "react"
import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { AdminShell } from "@/components/layout/admin-shell"
import { useAuth } from "@/lib/auth-context"

/**
 * Mounts the shell once, from the root layout, for every admin route (Office's OfficeShellGate): the sidebar persists
 * across navigations and only the content swaps. Anyone not fully signed in (no session, not on the team, or no MFA
 * yet) goes to /auth/login, which shows the right step.
 */
export function AdminShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ""
  const { access, sessionResolved } = useAuth()
  const isPublic = pathname === "/auth" || pathname.startsWith("/auth/")
  const mustSignIn = !isPublic && sessionResolved && access !== "loading" && access !== "ready"

  useLayoutEffect(() => {
    if (!mustSignIn) return
    if (window.location.pathname.startsWith("/auth/")) return
    window.location.replace("/auth/login")
  }, [mustSignIn])

  if (isPublic) return <>{children}</>
  if (mustSignIn || access === "loading") return null

  return <AdminShell>{children}</AdminShell>
}
