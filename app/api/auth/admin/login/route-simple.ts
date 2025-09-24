import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Admin login attempt for:", email)

    // Use service role client to check admin user
    const serverClient = createServerClient()

    // Check if user exists in admin_users table
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    console.log("Admin user check result:", { 
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
      console.log("Admin user not found:", adminError)
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 })
    }

    // Check if admin user is active (if status field exists)
    if (adminUser.status && adminUser.status !== "active") {
      console.log("Admin user is not active:", adminUser.status)
      return NextResponse.json({ error: "Admin account is not active." }, { status: 403 })
    }

    // For admin login, we'll create a session using the service role
    // This bypasses RLS issues entirely
    const { createClient } = await import('@supabase/supabase-js')
    
    // Create a regular supabase client for session management
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to sign in with password
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.log("Password verification failed:", authError)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Verify the authenticated user matches the admin user
    if (authData.user.id !== adminUser.id) {
      console.log("User ID mismatch:", { authId: authData.user.id, adminId: adminUser.id })
      await authClient.auth.signOut()
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 })
    }

    // Update user metadata to mark as admin
    await authClient.auth.updateUser({
      data: {
        isAdmin: true,
        role: adminUser.role,
        name: adminUser.name
      }
    })

    console.log("Admin login successful for:", email)

    // Return the session data with admin flag
    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      session: authData.session,
      isAdmin: true
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
