import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("password_reset_otps")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .eq("used", false)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Check if OTP is expired
    const now = new Date()
    const expiresAt = new Date(otpRecord.expires_at)

    if (now > expiresAt) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("password_reset_otps")
      .update({ used: true })
      .eq("email", email)
      .eq("otp", otp)

    if (updateError) {
      console.error("Error updating OTP:", updateError)
      return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { email, purpose: "password_reset", exp: Math.floor(Date.now() / 1000) + 15 * 60 }, // 15 minutes
      process.env.JWT_SECRET!,
    )

    return NextResponse.json({
      message: "Verification code verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
