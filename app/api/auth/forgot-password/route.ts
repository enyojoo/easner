import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log("Generated OTP:", otp, "for email:", email)

    // Delete any existing OTPs for this email
    await supabase.from("password_reset_otps").delete().eq("email", email)

    // Insert new OTP
    const { error: insertError } = await supabase.from("password_reset_otps").insert({
      email,
      otp,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error inserting OTP:", insertError)
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    // Send email through Supabase Auth with OTP as custom data
    const { error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      data: {
        otp: otp,
        verification_code: otp,
      },
    })

    if (emailError) {
      console.error("Error sending email:", emailError)
      // Don't reveal email sending errors for security
    }

    console.log("OTP sent successfully for:", email)

    return NextResponse.json({
      message: "Verification code sent to your email address",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
