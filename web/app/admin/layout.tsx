"use client"

import { useRouteProtection } from "@/hooks/use-route-protection"
import { AdminAuthLoadingSkeleton } from "@/components/admin-auth-loading-skeleton"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isChecking } = useRouteProtection({ requireAuth: true, adminOnly: true, redirectTo: "/auth/admin/login" })

  // Show loading skeleton while checking authentication
  if (isChecking) {
    return <AdminAuthLoadingSkeleton />
  }

  return <>{children}</>
}
