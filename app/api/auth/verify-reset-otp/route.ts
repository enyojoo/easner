import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    console.log("Verifying Supabase OTP for email:", email, "OTP:", otp)

    // Verify the OTP directly with Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "email",
    })

    if (error) {
      console.error("Supabase OTP verification error:", error)
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    console.log("Supabase OTP verified successfully for:", email)

    // Generate reset token for our password reset page
    const resetToken = jwt.sign(
      {
        email,
        purpose: "password_reset",
        exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      },
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
