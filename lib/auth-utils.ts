import { type NextRequest } from "next/server"
import { createServerClient } from "./supabase"
import { getAccessTokenFromRequest } from "./supabase-server-helpers"

export interface AuthenticatedUser {
  id: string
  email: string
  isAdmin: boolean
  profile: any
}

/**
 * Enhanced authentication with better error handling and validation
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = createServerClient()
    
    // Use the robust token extraction helper
    const token = getAccessTokenFromRequest(request)
    
    if (!token) {
      console.log("No authentication token found")
      return null
    }

    // Verify the token with Supabase with timeout
    const authPromise = supabase.auth.getUser(token)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Auth timeout")), 10000)
    )

    const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]) as any
    
    if (error) {
      console.error("Auth token verification failed:", error.message)
      return null
    }
    
    if (!user) {
      console.log("No user found in token")
      return null
    }

    // Get user profile from database with enhanced validation
    let userProfile = null
    let isAdmin = false

    try {
      // Try regular users table first
      const { data: regularUser, error: regularUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (regularUser && !regularUserError) {
        userProfile = regularUser
        isAdmin = false
        console.log("Regular user authenticated:", regularUser.email)
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
          console.log("Admin user authenticated:", adminUser.email)
        }
      }
    } catch (dbError) {
      console.error("Database profile lookup failed:", dbError)
      return null
    }

    if (!userProfile) {
      console.log("User profile not found in database")
      return null
    }

    // Additional validation
    if (userProfile.status && userProfile.status !== "active") {
      console.log("User account is not active:", userProfile.status)
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
 * Require user authentication (non-admin) - throws error if admin or not authenticated
 */
export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (user.isAdmin) {
    throw new Error("Admin users cannot access user APIs")
  }
  
  return user
}

/**
 * Validate user access to specific resource
 */
export function validateUserAccess(user: AuthenticatedUser, resourceUserId: string): boolean {
  if (user.isAdmin) {
    return true // Admins can access all resources
  }
  
  return user.id === resourceUserId
}

/**
 * Validate user access and throw error if not allowed
 */
export function requireUserAccess(user: AuthenticatedUser, resourceUserId: string): void {
  if (!validateUserAccess(user, resourceUserId)) {
    throw new Error("Access denied: You can only access your own resources")
  }
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
