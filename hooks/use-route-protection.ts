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
    redirectTo = "/login",
  } = options

  useEffect(() => {
    if (loading) return

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo)
      setIsAuthorized(false)
      return
    }

    // If admin access is required but user is not admin
    if (adminOnly && (!isAdmin || !userProfile)) {
      router.push("/user/dashboard") // Redirect to user dashboard instead of login
      setIsAuthorized(false)
      return
    }

    // If user is logged in but trying to access login page
    if (!requireAuth && user) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
      setIsAuthorized(false)
      return
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
