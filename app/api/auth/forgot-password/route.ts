import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Processing forgot password for:", email)

    // Check if user exists in our users table
    const { data: user, error: userError } = await supabase.from("users").select("email").eq("email", email).single()

    if (userError || !user) {
      console.log("User not found:", email)
      // Don't reveal if email exists for security
      return NextResponse.json({
        message: "If an account with this email exists, you will receive a verification code.",
      })
    }

    // Send OTP code using Supabase Auth
    // This will send a 6-digit OTP code to the user's email
    const { error: resetError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (resetError) {
      console.error("Error sending reset email:", resetError)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    console.log("Password reset email sent successfully for:", email)

    return NextResponse.json({
      message: "Verification code sent to your email address",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
