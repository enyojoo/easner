"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouteProtection } from "@/hooks/use-route-protection"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isExpired, loading, userProfile, adminProfile, redirectToLogin } = useRouteProtection()

  useEffect(() => {
    if (!loading && isExpired) {
      redirectToLogin()
    }
  }, [loading, isExpired, redirectToLogin])

  useEffect(() => {
    if (!loading && requireAdmin && !adminProfile) {
      redirectToLogin()
    }
  }, [loading, requireAdmin, adminProfile, redirectToLogin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (isExpired || (requireAdmin && !adminProfile)) {
    return null
  }

  return <>{children}</>
}
