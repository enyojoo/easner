"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function useRouteProtection() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    const isUserRoute = pathname.startsWith("/user/")
    const isAdminRoute = pathname.startsWith("/admin/")
    const isLoginPage = pathname === "/login"
    const isRegisterPage = pathname === "/register"
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/terms" ||
      pathname === "/privacy" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password"

    // If user is logged in and visits login page, redirect to dashboard
    if (user && isLoginPage) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
      return
    }

    // If user is not logged in and visits protected routes, redirect to login
    if (!user && (isUserRoute || isAdminRoute)) {
      router.push("/login")
      return
    }

    // If regular user tries to access admin routes
    if (user && !isAdmin && isAdminRoute) {
      router.push("/user/dashboard")
      return
    }

    // If admin tries to access user routes
    if (user && isAdmin && isUserRoute) {
      router.push("/admin/dashboard")
      return
    }
  }, [user, loading, isAdmin, pathname, router])

  return { user, loading, isAdmin }
}
