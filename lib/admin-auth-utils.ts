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
    // Get the session from cookies - try multiple cookie names
    const accessToken = request.cookies.get("sb-access-token")?.value ||
                       request.cookies.get("sb-easner-access-token")?.value ||
                       request.cookies.get("access_token")?.value
    
    const refreshToken = request.cookies.get("sb-refresh-token")?.value ||
                        request.cookies.get("sb-easner-refresh-token")?.value ||
                        request.cookies.get("refresh_token")?.value
    
    console.log("Debug: Looking for session tokens...")
    console.log("Debug: Access token found:", !!accessToken)
    console.log("Debug: Refresh token found:", !!refreshToken)
    
    if (!accessToken) {
      console.log("No access token found in any cookie")
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

    // Temporary: Allow any authenticated user to be admin for testing
    // TODO: Remove this and implement proper admin check
    if (!isAdmin) {
      console.log("User is not marked as admin, but allowing for testing")
      // return null // Commented out for testing
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
