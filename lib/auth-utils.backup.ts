import { type NextRequest } from "next/server"
import { createServerClient } from "./supabase"

export interface AuthenticatedUser {
  id: string
  email: string
  isAdmin: boolean
  profile: any
}

/**
 * Get authenticated user from request using Supabase Auth
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = createServerClient()
    
    // Try to get token from Authorization header first
    const authHeader = request.headers.get("authorization")
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
    
    // If no auth header, try to get from cookies
    if (!token) {
      token = request.cookies.get("sb-access-token")?.value || null
    }
    
    if (!token) {
      return null
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user profile from database
    let userProfile = null
    let isAdmin = false

    // Try regular users table first
    const { data: regularUser, error: regularUserError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (regularUser && !regularUserError) {
      userProfile = regularUser
      isAdmin = false
    } else {
      // Check admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (adminUser && !adminError) {
        userProfile = adminUser
        isAdmin = true
      }
    }

    if (!userProfile) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      isAdmin,
      profile: userProfile,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  if (user.profile.status !== "active") {
    throw new Error("Account is suspended")
  }
  
  return user
}

/**
 * Require admin authentication - throws error if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (!user.isAdmin) {
    throw new Error("Admin access required")
  }
  
  return user
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(message: string, status: number = 500) {
  return Response.json(
    { 
      error: message,
      timestamp: new Date().toISOString(),
    }, 
    { status }
  )
}

/**
 * Create standardized API success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      return await handler(request)
    } catch (error) {
      console.error("API Error:", error)
      
      if (error instanceof Error) {
        switch (error.message) {
          case "Authentication required":
            return createErrorResponse("Authentication required", 401)
          case "Admin access required":
            return createErrorResponse("Admin access required", 403)
          case "Account is suspended":
            return createErrorResponse("Account is suspended", 403)
          default:
            return createErrorResponse(
              process.env.NODE_ENV === "development" 
                ? error.message 
                : "Internal server error",
              500
            )
        }
      }
      
      return createErrorResponse("Internal server error", 500)
    }
  }
}
