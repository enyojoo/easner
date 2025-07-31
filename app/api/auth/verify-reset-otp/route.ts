import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    console.log("Verifying OTP for email:", email, "OTP:", otp)

    // Verify OTP - check both used and unused OTPs
    const { data: otpRecord, error: otpError } = await supabase
      .from("password_reset_otps")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    console.log("OTP record found:", otpRecord)
    console.log("OTP error:", otpError)

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Check if OTP is already used
    if (otpRecord.used) {
      return NextResponse.json({ error: "Verification code has already been used" }, { status: 400 })
    }

    // Check if OTP is expired (15 minutes)
    const now = new Date()
    const expiresAt = new Date(otpRecord.expires_at)

    console.log("Current time:", now)
    console.log("Expires at:", expiresAt)
    console.log("Is expired:", now > expiresAt)

    if (now > expiresAt) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("password_reset_otps")
      .update({ used: true })
      .eq("id", otpRecord.id)

    if (updateError) {
      console.error("Error updating OTP:", updateError)
      return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      {
        email,
        purpose: "password_reset",
        exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      },
      process.env.JWT_SECRET!,
    )

    console.log("Generated reset token for:", email)

    return NextResponse.json({
      message: "Verification code verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
