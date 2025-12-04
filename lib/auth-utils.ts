import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "./supabase"
import { getAccessTokenFromRequest } from "./supabase-server-helpers"

export interface AuthenticatedUser {
  id: string
  email: string
  isAdmin: boolean
  profile: any
}

/**
 * Get authenticated user from request - uses same pattern as admin-auth-utils
 * First gets user from session using anon key, then checks users/admin_users with service role
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Get access token from cookies (same as admin-auth-utils)
    const token = getAccessTokenFromRequest(request)
    
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log("No authentication token found")
        const allCookies = request.cookies.getAll()
        console.log("Available cookies:", allCookies.map(c => c.name))
      }
      return null
    }

    // Create anon client to verify token and get user (same as admin-auth-utils)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)
    
    if (userError || !user) {
      console.log("Failed to get user from token:", userError?.message)
      return null
    }

    console.log("Authenticated user found:", user.id, user.email)

    // Use service role client to check users/admin_users table (bypasses RLS) - same as admin-auth-utils
    const serverClient = createServerClient()
    let userProfile = null
    let isAdmin = false

    // Try regular users table first
    const { data: regularUser, error: regularUserError } = await serverClient
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
      const { data: adminUser, error: adminError } = await serverClient
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

    if (!userProfile) {
      console.log("User profile not found in database")
      return null
    }

    // Check if user is active (if status field exists)
    if (userProfile.status && userProfile.status !== "active") {
      console.log("User account is not active:", userProfile.status)
      return null
    }

    console.log("User verified:", userProfile.email)

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
 * Supports both handlers with and without params
 * In Next.js 15, params can be a Promise, so we handle that
 */
export function withErrorHandling<T extends { params?: any } = {}>(
  handler: (request: NextRequest, context?: T | Promise<T>) => Promise<Response>
) {
  return async (
    request: NextRequest, 
    context?: T | Promise<T>
  ): Promise<Response> => {
    try {
      // Handle async params in Next.js 15
      let resolvedContext = context
      if (context && typeof context === 'object' && 'then' in context) {
        resolvedContext = await context as T
      } else if (context && 'params' in context && context.params && typeof context.params === 'object' && 'then' in context.params) {
        resolvedContext = {
          ...context,
          params: await context.params
        } as T
      }
      return await handler(request, resolvedContext)
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
