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
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Checking cookies for auth token:", allCookies.map(c => c.name))
  }
  
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
        // Also check for nested session structure
        if (parsed.session?.access_token) {
          console.log(`Found access_token in nested session: ${cookie.name}`)
          return parsed.session.access_token
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
  // Extract project ref from Supabase URL (e.g., https://xyz.supabase.co -> xyz)
  let projectRef = ''
  try {
    const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
    if (urlMatch) {
      projectRef = urlMatch[1]
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Try specific cookie names (Supabase uses sb-<project-ref>-auth-token format)
  const cookieNames = [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token.0`,
    `sb-${projectRef}-auth-token.1`,
    `sb-access-token`,
    `sb-${projectRef}-access-token`,
    `access_token`,
    `sb-access_token`,
    // Also try without project ref
    `sb-auth-token`,
    `sb-auth-token.0`,
    `sb-auth-token.1`,
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
        // Also check for nested session structure
        if (parsed.session?.access_token) {
          console.log(`Found access_token in nested session (fallback): ${cookieName}`)
          return parsed.session.access_token
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
  
  if (process.env.NODE_ENV === 'development') {
    console.log("No access token found in any cookie. Available cookies:", allCookies.map(c => `${c.name} (${c.value.substring(0, 50)}...)`))
  }
  return null
}

/**
 * Extract access token from cookie value
 */
function extractTokenFromCookieValue(cookieValue: string, cookieName: string): string | null {
  try {
    // Handle URL encoding
    let decodedValue = cookieValue
    try {
      decodedValue = decodeURIComponent(cookieValue)
    } catch (e) {
      // Already decoded or not URL encoded
    }
    
    // Try parsing as JSON first (Supabase stores session as JSON)
    try {
      const parsed = JSON.parse(decodedValue)
      if (parsed.access_token) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found access_token in cookie: ${cookieName}`)
        }
        return parsed.access_token
      }
      // Also check for nested session structure
      if (parsed.session?.access_token) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found access_token in nested session: ${cookieName}`)
        }
        return parsed.session.access_token
      }
    } catch (e) {
      // Not JSON, continue to check if it's a direct token
    }
    
    // If not JSON, might be the token directly (less common)
    if (decodedValue && decodedValue.length > 50 && decodedValue.startsWith('eyJ')) {
      // JWT tokens start with 'eyJ'
      if (process.env.NODE_ENV === 'development') {
        console.log(`Found JWT token directly in cookie: ${cookieName}`)
      }
      return decodedValue
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
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

