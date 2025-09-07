"use client"

import { useRouteProtection } from "@/hooks/use-route-protection"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isChecking } = useRouteProtection({ requireAuth: true, adminOnly: true, redirectTo: "/auth/admin/login" })

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-easner-primary" />
      </div>
    )
  }

  return <>{children}</>
}
