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
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a verification code.",
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Store OTP in database
    const { error: otpError } = await supabase.from("password_reset_otps").upsert(
      {
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
      {
        onConflict: "email",
      },
    )

    if (otpError) {
      console.error("Error storing OTP:", otpError)
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    // In a real application, you would send the OTP via email
    // For now, we'll just log it (remove this in production)
    console.log(`Password reset OTP for ${email}: ${otp}`)

    // TODO: Send email with OTP using your email service
    // await sendPasswordResetOTP(email, otp)

    return NextResponse.json({
      message: "Verification code sent to your email address.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
