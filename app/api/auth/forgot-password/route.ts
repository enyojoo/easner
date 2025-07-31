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

    // Send password reset email first to get the token from Supabase
    const { data: resetData, error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    // The actual token sent by Supabase is not directly accessible
    // So we'll use a different approach - generate our own OTP and send it via custom email
    // For now, let's use the Supabase token approach but store a placeholder

    // Generate 6-digit OTP as placeholder (this won't be used for verification)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log("Generated placeholder OTP:", otp, "for email:", email)
    console.log("Note: User should use the token from Supabase email, not this OTP")

    // Delete any existing OTPs for this email
    await supabase.from("password_reset_otps").delete().eq("email", email)

    // Insert placeholder OTP (won't be used for verification)
    const { error: insertError } = await supabase.from("password_reset_otps").insert({
      email,
      otp: "SUPABASE_TOKEN", // Placeholder indicating Supabase handles the token
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error inserting OTP record:", insertError)
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    console.log("Password reset email sent via Supabase for:", email)

    return NextResponse.json({
      message: "Verification code sent to your email address",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
