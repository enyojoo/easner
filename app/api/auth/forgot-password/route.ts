import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists in auth.users (Supabase auth table)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)

    if (authError || !authUser.user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a verification code.",
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Delete any existing OTP for this email first
    await supabase.from("password_reset_otps").delete().eq("email", email)

    // Insert new OTP
    const { error: insertError } = await supabase.from("password_reset_otps").insert({
      email: email,
      otp: otp,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Failed to store OTP:", insertError)
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    // Send password reset email using Supabase Auth
    // This will use Supabase's email template with {{ .Token }} placeholder
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      data: {
        otp: otp, // This will be available as {{ .Token }} in the email template
      },
    })

    if (resetError) {
      console.error("Failed to send reset email:", resetError)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Verification code sent to your email address.",
      success: true,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
