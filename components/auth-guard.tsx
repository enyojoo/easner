"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to appropriate login
        router.push(requireAdmin ? "/admin/login" : "/login")
        return
      }

      if (requireAdmin && !isAdmin) {
        // User is authenticated but not admin, redirect to login
        router.push("/login")
        return
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}
