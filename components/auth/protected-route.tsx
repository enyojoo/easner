"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading, isSessionExpired } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth) {
      if (!user || isSessionExpired()) {
        router.push("/login")
      }
    }
  }, [user, loading, requireAuth, isSessionExpired, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (requireAuth && (!user || isSessionExpired())) {
    return null
  }

  return <>{children}</>
}
