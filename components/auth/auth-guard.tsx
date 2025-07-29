"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallbackPath?: string
}

export function AuthGuard({ children, requireAdmin = false, fallbackPath }: AuthGuardProps) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated
        const redirectPath = requireAdmin ? "/admin/login" : "/login"
        router.push(fallbackPath || redirectPath)
        return
      }

      if (requireAdmin && !isAdmin) {
        // User is authenticated but not admin
        router.push("/admin/login")
        return
      }

      if (!requireAdmin && isAdmin) {
        // Admin trying to access user routes
        router.push("/admin/dashboard")
        return
      }
    }
  }, [user, userProfile, loading, isAdmin, requireAdmin, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  if (!requireAdmin && isAdmin) {
    return null
  }

  return <>{children}</>
}
