import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "./supabase"

export interface AuthUser {
  userId: string
  email: string
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length)
  }

  // Optional: try common Supabase cookie names if present (when using auth helpers)
  const cookieToken = request.cookies.get("sb-access-token")?.value
  if (cookieToken) return cookieToken

  return null
}

async function getSupabaseUserFromToken(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data.user) return null
  return data.user
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getBearerToken(request)
  if (!token) return null
  const user = await getSupabaseUserFromToken(token)
  if (!user) return null
  return { userId: user.id, email: user.email || "" }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const authUser = await requireAuth(request)

  // Verify against admin_users table
  const server = createServerClient()
  const { data: adminUser, error } = await server
    .from("admin_users")
    .select("id, email, status")
    .eq("id", authUser.userId)
    .eq("status", "active")
    .single()

  if (error || !adminUser) {
    throw new Error("Admin access required")
  }

  return authUser
}
