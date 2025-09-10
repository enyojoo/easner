"use client"

import { useRouteProtection } from "@/hooks/use-route-protection"
import { Loader2 } from "lucide-react"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isChecking, isAdmin } = useRouteProtection({ requireAuth: true })

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-easner-primary" />
      </div>
    )
  }

  // Block admin users from accessing user pages
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin users cannot access user pages.</p>
          <a 
            href="/admin/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-easner-primary hover:bg-blue-700"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
