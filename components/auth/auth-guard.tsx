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
  const { user, userProfile, adminProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(requireAdmin ? "/admin/login" : "/login")
        return
      }

      if (requireAdmin && !adminProfile) {
        router.push("/admin/login")
        return
      }

      if (!requireAdmin && !userProfile) {
        router.push("/login")
        return
      }
    }
  }, [user, userProfile, adminProfile, loading, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && !adminProfile) {
    return null
  }

  if (!requireAdmin && !userProfile) {
    return null
  }

  return <>{children}</>
}
