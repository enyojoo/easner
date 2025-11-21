import { type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { getAccessTokenFromRequest } from "@/lib/supabase-server-helpers"

export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  role: string
  name: string
}

/**
 * Get admin user from request - checks admin_users table
 * First gets user from session using anon key, then checks admin_users with service role
 */
export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Get access token from cookies
    const token = getAccessTokenFromRequest(request)
    
    if (!token) {
      console.log("No authentication token found")
      const allCookies = request.cookies.getAll()
      console.log("Available cookies:", allCookies.map(c => c.name))
      return null
    }

    // Create anon client to verify token and get user
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)
    
    if (userError || !user) {
      console.log("Failed to get user from token:", userError?.message)
      return null
    }

    console.log("Authenticated user found:", user.id, user.email)

    // Use service role client to check admin_users table (bypasses RLS)
    const serverClient = createServerClient()
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single()
    
    if (adminError || !adminUser) {
      console.log("User is not an admin:", adminError?.message)
      return null
    }

    // Check if admin user is active (if status field exists)
    if (adminUser.status && adminUser.status !== "active") {
      console.log("Admin user is not active:", adminUser.status)
      return null
    }

    console.log("Admin user verified:", adminUser.email)

    return {
      id: adminUser.id,
      email: adminUser.email,
      isAdmin: true,
      role: adminUser.role || "admin",
      name: adminUser.name || ""
    }
  } catch (error) {
    console.error("Admin auth error:", error)
    return null
  }
}

export async function requireAdmin(request: NextRequest): Promise<AdminUser> {
  const user = await getAdminUser(request)
  if (!user) {
    throw new Error("Admin access required")
  }
  return user
}
