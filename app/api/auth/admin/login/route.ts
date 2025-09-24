import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Admin login attempt for:", email)

    // First authenticate with regular client to get the user
    const { createClient } = await import('@supabase/supabase-js')
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verify password with regular auth client
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

    console.log("User authenticated:", { id: authData.user.id, email: authData.user.email })

    // Now check if this user is an admin using service role
    const serverClient = createServerClient()
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("id", authData.user.id)  // Check by user ID, not email
      .single()

    console.log("Admin user check:", { 
      userId: authData.user.id,
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
      console.log("Admin user not found for user ID:", authData.user.id, adminError)
      await authClient.auth.signOut()
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 })
    }

    // Check if admin user is active (if status field exists)
    if (adminUser.status && adminUser.status !== "active") {
      console.log("Admin user is not active:", adminUser.status)
      await authClient.auth.signOut()
      return NextResponse.json({ error: "Admin account is not active." }, { status: 403 })
    }

    // Update user metadata to mark as admin
    const { error: updateError } = await authClient.auth.updateUser({
      data: {
        isAdmin: true,
        role: adminUser.role,
        name: adminUser.name
      }
    })

    if (updateError) {
      console.error("Failed to update user metadata:", updateError)
      // Continue anyway, the session is still valid
    }

    console.log("Admin login successful for:", email)
    console.log("Session data:", {
      access_token: authData.session?.access_token ? "Present" : "Missing",
      refresh_token: authData.session?.refresh_token ? "Present" : "Missing",
      expires_at: authData.session?.expires_at
    })

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
