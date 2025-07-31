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
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      // Delete expired OTP
      await supabase.from("password_reset_otps").delete().eq("id", otpRecord.id)
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 })
    }

    // Generate reset token
    const resetToken = jwt.sign({ email, purpose: "password_reset" }, process.env.JWT_SECRET!, { expiresIn: "15m" })

    // Delete used OTP
    await supabase.from("password_reset_otps").delete().eq("id", otpRecord.id)

    return NextResponse.json({
      message: "Code verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
