import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("Debug admin login attempt for:", email)
    
    // Check if user exists in admin_users table
    const serverClient = createServerClient()
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()
    
    console.log("Admin user check:", { 
      email, 
      adminError, 
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status
      } : null
    })
    
    if (adminError || !adminUser) {
      return NextResponse.json({ 
        error: "Admin user not found", 
        adminError: adminError?.message 
      }, { status: 404 })
    }
    
    // Try to authenticate with regular client
    const { createClient } = await import('@supabase/supabase-js')
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log("Auth result:", { 
      authError: authError?.message,
      userId: authData.user?.id,
      sessionExists: !!authData.session
    })
    
    if (authError) {
      return NextResponse.json({ 
        error: "Authentication failed", 
        authError: authError.message 
      }, { status: 401 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: "No user returned" }, { status: 401 })
    }
    
    // Check if user IDs match
    const userMatch = authData.user.id === adminUser.id
    console.log("User ID match:", { 
      authId: authData.user.id, 
      adminId: adminUser.id, 
      match: userMatch 
    })
    
    return NextResponse.json({
      success: true,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status
      },
      authUser: {
        id: authData.user.id,
        email: authData.user.email,
        metadata: authData.user.user_metadata
      },
      session: authData.session ? {
        access_token: authData.session.access_token.substring(0, 20) + "...",
        refresh_token: authData.session.refresh_token.substring(0, 20) + "...",
        expires_at: authData.session.expires_at
      } : null,
      userMatch
    })
  } catch (error) {
    console.error("Debug admin login error:", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
  }
}
