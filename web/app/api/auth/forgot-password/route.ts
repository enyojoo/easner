import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Processing forgot password for:", email)

    const supabase = createServerClient()

    // Check if user exists in our users table
    const { data: user, error: userError } = await supabase.from("users").select("email").eq("email", email).single()

    if (userError || !user) {
      console.log("User not found:", email)
      // Don't reveal if email exists for security
      return NextResponse.json({
        message: "If an account with this email exists, you will receive a verification code.",
      })
    }

    // Send password reset email using Supabase Auth
    // Supabase will generate the OTP and send it via {{ .Token }} in the email template
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.easner.com"}/auth/user/reset-password`,
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
