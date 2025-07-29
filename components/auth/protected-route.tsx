"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Store current path for redirect after login
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem("redirectAfterLogin", currentPath)
        router.push("/login")
        return
      }

      if (requireAdmin && (!user || !isAdmin)) {
        router.push("/admin/login")
        return
      }

      // Check if user account is suspended
      if (user && userProfile && userProfile.status === "suspended") {
        router.push("/account-suspended")
        return
      }
    }
  }, [user, userProfile, loading, isAdmin, requireAuth, requireAdmin, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (requireAuth && !user) {
    return null
  }

  if (requireAdmin && (!user || !isAdmin)) {
    return null
  }

  return <>{children}</>
}
