"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) {
  const { user, userProfile, adminProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      if (requireAdmin) {
        router.push("/admin/login")
      } else {
        router.push("/login")
      }
      return
    }

    if (requireAdmin && (!adminProfile || !user)) {
      router.push("/admin/login")
      return
    }

    if (requireAuth && !requireAdmin && !userProfile && user) {
      // User is authenticated but no user profile found
      router.push("/login")
      return
    }
  }, [user, userProfile, adminProfile, loading, requireAuth, requireAdmin, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (requireAdmin && (!adminProfile || !user)) {
    return null
  }

  if (requireAuth && !requireAdmin && !userProfile && user) {
    return null
  }

  return <>{children}</>
}
