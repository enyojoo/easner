import { createServerClient } from "@/lib/supabase"
import type { NextRequest } from "next/server"

export interface AuthUser {
  userId: string
  email: string
  role: "user" | "admin"
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = createServerClient()

    // Get tokens from cookies
    const accessToken = request.cookies.get("sb-access-token")?.value
    const refreshToken = request.cookies.get("sb-refresh-token")?.value

    if (!accessToken) return null

    // Set session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) return null

    // Check if user is admin (you can customize this logic)
    const isAdmin = user.email?.includes("@admin.") || user.user_metadata?.role === "admin"

    return {
      userId: user.id,
      email: user.email!,
      role: isAdmin ? "admin" : "user",
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
