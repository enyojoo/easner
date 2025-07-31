import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // In production, send email with OTP here
    // For development, log the OTP
    console.log(`Password reset OTP for ${email}: ${otp}`)

    return NextResponse.json({
      message: "Verification code sent to your email address.",
      success: true,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
