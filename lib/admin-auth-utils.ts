import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  role: string
  name: string
}

/**
 * Simple admin authentication that works with the existing session
 */
export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Get the session from cookies
    const accessToken = request.cookies.get("sb-access-token")?.value
    const refreshToken = request.cookies.get("sb-refresh-token")?.value
    
    if (!accessToken || !refreshToken) {
      console.log("No session tokens found")
      return null
    }

    // Create a regular Supabase client (not service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Set the session
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log("Failed to get user from token:", error?.message)
      return null
    }

    // Check if user has admin metadata
    const isAdmin = user.user_metadata?.isAdmin === true
    const role = user.user_metadata?.role || "user"
    const name = user.user_metadata?.name || ""

    if (!isAdmin) {
      console.log("User is not an admin")
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      isAdmin: true,
      role,
      name
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
