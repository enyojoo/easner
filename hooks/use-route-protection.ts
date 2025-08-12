"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export const useRouteProtection = () => {
  const { userProfile, adminProfile, loading } = useAuth()
  const router = useRouter()

  const redirectToLogin = () => {
    router.push("/login")
  }

  const redirectToDashboard = () => {
    if (adminProfile) {
      router.push("/admin/dashboard")
    } else if (userProfile) {
      router.push("/user/dashboard")
    }
  }

  const isAuthenticated = !loading && (!!userProfile || !!adminProfile)
  const isExpired = !loading && !userProfile && !adminProfile

  return {
    isAuthenticated,
    isExpired,
    loading,
    userProfile,
    adminProfile,
    redirectToLogin,
    redirectToDashboard,
  }
}
