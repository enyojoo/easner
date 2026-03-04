"use client"

import { usePathname } from "next/navigation"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { OfficeAuthLoadingSkeleton } from "@/components/office-auth-loading-skeleton"

const PROTECTED_PATHS = [
  "/dashboard",
  "/blog",
  "/bridge",
  "/rates",
  "/kyc",
  "/compliance",
  "/users",
  "/settings",
  "/early-access",
  "/transactions",
]

function isProtectedPath(pathname: string | null): boolean {
  if (!pathname) return false
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isChecking } = useRouteProtection({ requireAuth: true, adminOnly: true, redirectTo: "/auth/login" })

  if (!isProtectedPath(pathname)) {
    return <>{children}</>
  }

  if (isChecking) {
    return <OfficeAuthLoadingSkeleton />
  }

  return <>{children}</>
}
