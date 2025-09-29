import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { LoginAttemptService } from "@/lib/login-attempts"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if account is locked
    const lockStatus = await LoginAttemptService.isAccountLocked(email)
    if (lockStatus.locked) {
      return NextResponse.json({ 
        error: `Account is temporarily locked. Please try again in ${lockStatus.remainingTime} minutes.` 
      }, { status: 423 })
    }

    const supabase = createServerClient()

    // Use Supabase Auth for authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      // Record failed login attempt
      await LoginAttemptService.recordAttempt(email, false, ipAddress, userAgent)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Record successful login attempt
    await LoginAttemptService.recordAttempt(email, true, ipAddress, userAgent)
    
    // Clear any previous failed attempts on successful login
    await LoginAttemptService.clearFailedAttempts(email)

    // Get user profile from the database
    let userProfile = null
    let isAdmin = false

    // Try regular users table first
    const { data: regularUser, error: regularUserError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (regularUser && !regularUserError) {
      userProfile = regularUser
      isAdmin = false
    } else {
      // Check admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (adminUser && !adminError) {
        userProfile = adminUser
        isAdmin = true
      }
    }

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    if (userProfile.status !== "active") {
      return NextResponse.json({ error: "Account is suspended" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        baseCurrency: userProfile.base_currency,
        status: userProfile.status,
        verificationStatus: userProfile.verification_status,
        isAdmin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
