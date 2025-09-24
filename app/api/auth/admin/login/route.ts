import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // First check if user exists in admin_users table (before auth)
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    console.log("Admin user check:", { email, adminError, adminUser })

    if (adminError || !adminUser) {
      console.log("Admin user not found:", adminError)
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 })
    }

    // Now authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.log("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Verify the authenticated user matches the admin user
    if (authData.user.id !== adminUser.id) {
      console.log("User ID mismatch:", { authId: authData.user.id, adminId: adminUser.id })
      await supabase.auth.signOut()
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
