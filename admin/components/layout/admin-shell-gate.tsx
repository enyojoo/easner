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
  // The editor is the one screen that leaves the shell (OffBlogEditor): a full-width canvas with its own top bar.
  // /dev/* is the development harness; its page answers 404 unless ADMIN_DEV_HARNESS is on.
  const isDevHarness = pathname === "/dev" || pathname.startsWith("/dev/")
  const isEditor = pathname === "/posts/new" || /^\/posts\/[^/]+$/.test(pathname)
  const mustSignIn = !isPublic && !isDevHarness && sessionResolved && access !== "loading" && access !== "ready"

  useLayoutEffect(() => {
    if (!mustSignIn) return
    if (window.location.pathname.startsWith("/auth/")) return
    window.location.replace("/auth/login")
  }, [mustSignIn])

  if (isPublic || isDevHarness) return <>{children}</>
  if (mustSignIn || access === "loading") return null

  if (isEditor) return <>{children}</>
  return <AdminShell>{children}</AdminShell>
}
