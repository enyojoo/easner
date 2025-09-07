"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface WithAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
  adminOnly?: boolean
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = "/login",
    requireAuth = true,
    adminOnly = false,
  } = options

  return function AuthenticatedComponent(props: P) {
    const { user, userProfile, loading, isAdmin } = useAuth()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
      if (loading) return

      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        router.push(redirectTo)
        return
      }

      // If admin access is required but user is not admin
      if (adminOnly && (!isAdmin || !userProfile)) {
        router.push("/user/dashboard") // Redirect to user dashboard instead of login
        return
      }

      // If user is logged in but trying to access login page
      if (!requireAuth && user) {
        if (isAdmin) {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }
        return
      }

      setIsChecking(false)
    }, [user, userProfile, loading, isAdmin, router, requireAuth, adminOnly])

    // Show loading spinner while checking authentication
    if (loading || isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-easner-primary mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    // If authentication is required but user is not logged in, don't render
    if (requireAuth && !user) {
      return null
    }

    // If admin access is required but user is not admin, don't render
    if (adminOnly && (!isAdmin || !userProfile)) {
      return null
    }

    // If user is logged in but trying to access login page, don't render
    if (!requireAuth && user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

// Convenience HOCs for common use cases
export const withUserAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, redirectTo: "/login" })

export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, adminOnly: true, redirectTo: "/login" })

export const withPublicAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: false })
