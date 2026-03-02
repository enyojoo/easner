"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface UseRouteProtectionOptions {
  requireAuth?: boolean
  adminOnly?: boolean
  redirectTo?: string
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const {
    requireAuth = true,
    adminOnly = false,
    redirectTo = "/auth/user/login",
  } = options

  useEffect(() => {
    // For login pages, don't show loading if we're not requiring auth
    if (!requireAuth) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // For user pages, check if user is admin and block access
    if (requireAuth && !adminOnly && user && userProfile !== undefined) {
      if (isAdmin) {
        // Admin users cannot access user pages - redirect to admin dashboard
        router.push("/admin/dashboard")
        setIsAuthorized(false)
        return
      }
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // For user pages, if we have a user but profile is still loading, wait
    if (requireAuth && !adminOnly && user && userProfile === undefined && loading) {
      return
    }

    // For admin pages, we need to wait for profile to determine admin status
    if (adminOnly && user && userProfile !== undefined) {
      if (isAdmin) {
        setIsAuthorized(true)
        setIsChecking(false)
      } else {
        router.push(redirectTo) // Use the redirectTo parameter (defaults to /login)
        setIsAuthorized(false)
      }
      return
    }

    // For admin pages, if we have a user but profile is still loading, wait
    if (adminOnly && user && userProfile === undefined && loading) {
      return
    }

    // If still loading auth, wait
    if (loading) return

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo)
      setIsAuthorized(false)
      return
    }

    // If user is logged in but trying to access login page
    if (!requireAuth && user) {
      // Only redirect if we know the user's admin status
      if (userProfile !== undefined) {
        if (isAdmin) {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }
        setIsAuthorized(false)
        return
      }
    }

    setIsAuthorized(true)
    setIsChecking(false)
  }, [user, userProfile, loading, isAdmin, router, requireAuth, adminOnly, redirectTo])

  return {
    isChecking: loading || isChecking,
    isAuthorized,
    user,
    userProfile,
    isAdmin,
  }
}
