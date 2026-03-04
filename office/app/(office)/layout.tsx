"use client"

import { useRouteProtection } from "@/hooks/use-route-protection"
import { OfficeAuthLoadingSkeleton } from "@/components/office-auth-loading-skeleton"

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isChecking } = useRouteProtection({ requireAuth: true, adminOnly: true, redirectTo: "/auth/login" })

  if (isChecking) {
    return <OfficeAuthLoadingSkeleton />
  }

  return <>{children}</>
}
