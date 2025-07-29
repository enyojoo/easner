"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = false, requireAdmin = false, redirectTo }: AuthGuardProps) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      if (requireAdmin) {
        router.push("/admin/login")
      } else {
        router.push("/login")
      }
      return
    }

    // If admin access is required but user is not admin
    if (requireAdmin && user && !isAdmin) {
      router.push("/login")
      return
    }

    // If user is logged in but trying to access login/register pages
    if (user && !loading) {
      if (pathname === "/login" || pathname === "/register") {
        if (isAdmin) {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }
        return
      }

      if (pathname === "/admin/login" && !isAdmin) {
        router.push("/user/dashboard")
        return
      }
    }

    // Custom redirect
    if (redirectTo) {
      router.push(redirectTo)
      return
    }
  }, [user, userProfile, loading, isAdmin, requireAuth, requireAdmin, redirectTo, router, pathname])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null
  }

  // If admin is required but user is not admin, don't render children
  if (requireAdmin && (!user || !isAdmin)) {
    return null
  }

  return <>{children}</>
}
