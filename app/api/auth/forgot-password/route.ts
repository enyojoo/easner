import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a verification code.",
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    const { error: otpError } = await supabase.from("password_reset_otps").upsert({
      email,
      otp,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    if (otpError) {
      console.error("OTP storage error:", otpError)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    // Send OTP via email (using Supabase Edge Functions or your email service)
    // For now, we'll just return success
    console.log(`OTP for ${email}: ${otp}`) // Remove in production

    return NextResponse.json({
      message: "Verification code sent to your email address.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
