"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface UseRouteProtectionOptions {
  requireAuth?: boolean
  adminOnly?: boolean
  redirectTo?: string
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  const {
    requireAuth = true,
    adminOnly = true,
    redirectTo = "/auth/login",
  } = options

  useEffect(() => {
    if (!requireAuth) {
      setIsChecking(false)
      return
    }

    if (loading) return

    if (!user) {
      router.push(redirectTo)
      setIsChecking(false)
      return
    }

    if (adminOnly && !isAdmin) {
      router.push(redirectTo)
      setIsChecking(false)
      return
    }

    setIsChecking(false)
  }, [user, loading, isAdmin, router, requireAuth, adminOnly, redirectTo])

  return {
    isChecking: loading || isChecking,
    isAdmin,
  }
}
