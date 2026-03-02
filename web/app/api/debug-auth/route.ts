// Debug endpoint to check authentication

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking authentication...')
    
    // Get all cookies
    const cookies = request.cookies.getAll()
    console.log('Debug: All cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Try different cookie names
    const accessToken = request.cookies.get("sb-access-token")?.value || 
                       request.cookies.get("sb-easner-access-token")?.value ||
                       request.cookies.get("access_token")?.value
    
    const refreshToken = request.cookies.get("sb-refresh-token")?.value || 
                        request.cookies.get("sb-easner-refresh-token")?.value ||
                        request.cookies.get("refresh_token")?.value
    
    console.log('Debug: Access token found:', !!accessToken)
    console.log('Debug: Refresh token found:', !!refreshToken)
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: "No access token found",
        cookies: cookies.map(c => c.name)
      }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error) {
      console.error('Debug: Auth error:', error)
      return NextResponse.json({ 
        error: "Auth error",
        details: error.message
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: "No user found"
      }, { status: 401 })
    }

    console.log('Debug: User found:', user.email)
    console.log('Debug: User metadata:', user.user_metadata)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      }
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ 
      error: 'Debug auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
