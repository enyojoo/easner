// Helper functions for reading Supabase session from Next.js request cookies

import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Get Supabase access token from request cookies
 */
export function getAccessTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Get all cookies
  const allCookies = request.cookies.getAll()
  
  // Log all cookie names for debugging
  console.log("Checking cookies for auth token:", allCookies.map(c => c.name))
  
  // Supabase stores session in cookies like: sb-<project-ref>-auth-token
  // The value is a JSON string containing: { access_token, refresh_token, expires_at, etc }
  for (const cookie of allCookies) {
    const cookieName = cookie.name.toLowerCase()
    
    // Check for various Supabase cookie name patterns
    if (cookieName.includes('auth-token') || 
        cookieName.includes('access-token') ||
        cookieName.includes('sb-') && cookieName.includes('auth')) {
      try {
        // Try to parse as JSON first (Supabase stores session as JSON)
        let cookieValue = cookie.value
        
        // Handle URL encoding
        try {
          cookieValue = decodeURIComponent(cookieValue)
        } catch (e) {
          // Already decoded or not URL encoded
        }
        
        // Try parsing as JSON
        const parsed = JSON.parse(cookieValue)
        if (parsed.access_token) {
          console.log(`Found access_token in cookie: ${cookie.name}`)
          return parsed.access_token
        }
      } catch (e) {
        // If not JSON, might be the token directly (less common)
        if (cookie.value && cookie.value.length > 50 && cookie.value.startsWith('eyJ')) {
          // JWT tokens start with 'eyJ'
          console.log(`Found JWT token in cookie: ${cookie.name}`)
          return cookie.value
        }
      }
    }
  }

  // Fallback: try common cookie name patterns
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || ''
  
  // Try specific cookie names (Supabase uses sb-<project-ref>-auth-token format)
  const cookieNames = [
    `sb-${projectRef}-auth-token`,
    `sb-access-token`,
    `sb-${projectRef}-access-token`,
    `access_token`,
    `sb-access_token`,
    // Also try without project ref
    `sb-auth-token`
  ]
  
  for (const cookieName of cookieNames) {
    const cookie = request.cookies.get(cookieName)
    if (cookie?.value) {
      try {
        let cookieValue = cookie.value
        // Handle URL encoding
        try {
          cookieValue = decodeURIComponent(cookieValue)
        } catch (e) {
          // Already decoded
        }
        
        const parsed = JSON.parse(cookieValue)
        if (parsed.access_token) {
          console.log(`Found access_token in fallback cookie: ${cookieName}`)
          return parsed.access_token
        }
      } catch (e) {
        // If it's a direct token
        if (cookie.value && cookie.value.startsWith('eyJ')) {
          console.log(`Found JWT token in fallback cookie: ${cookieName}`)
          return cookie.value
        }
      }
    }
  }
  
  console.log("No access token found in any cookie")
  return null
}

/**
 * Create a Supabase client that can read the session from request cookies
 */
export function createServerSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const accessToken = getAccessTokenFromRequest(request)
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  })

  return { client, accessToken }
}

