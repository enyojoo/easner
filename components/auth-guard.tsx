"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // If auth is required but user is not authenticated
    if (requireAuth && !user) {
      const loginUrl = requireAdmin ? "/admin/login" : "/login"
      router.push(loginUrl)
      return
    }

    // If admin is required but user is not admin
    if (requireAdmin && (!user || !isAdmin)) {
      router.push("/admin/login")
      return
    }

    // If user is authenticated but accessing wrong area
    if (user && userProfile) {
      if (requireAdmin && !isAdmin) {
        router.push("/login")
        return
      }

      if (!requireAdmin && isAdmin && pathname.startsWith("/user/")) {
        router.push("/admin/dashboard")
        return
      }
    }
  }, [user, userProfile, loading, isAdmin, requireAuth, requireAdmin, router, pathname])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) return null
  if (requireAdmin && (!user || !isAdmin)) return null

  return <>{children}</>
}
