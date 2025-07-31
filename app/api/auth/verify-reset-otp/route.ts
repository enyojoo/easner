import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    console.log("Verifying token for email:", email, "Token:", otp)

    // Since Supabase generates its own token, we need to verify it differently
    // We'll try to use the token to verify the user's identity through Supabase Auth

    try {
      // Attempt to verify the token with Supabase Auth
      // The token from email should be a valid Supabase reset token
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      })

      if (verifyError || !verifyData.user) {
        console.log("Supabase token verification failed:", verifyError)
        return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
      }

      console.log("Supabase token verified successfully for:", email)

      // Check if we have a record for this email
      const { data: otpRecord, error: recordError } = await supabase
        .from("password_reset_otps")
        .select("*")
        .eq("email", email)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (recordError || !otpRecord) {
        console.log("No valid reset record found for:", email)
        return NextResponse.json({ error: "No valid reset request found" }, { status: 400 })
      }

      // Check if record is expired
      const now = new Date()
      const expiresAt = new Date(otpRecord.expires_at)

      if (now > expiresAt) {
        return NextResponse.json({ error: "Reset request has expired" }, { status: 400 })
      }

      // Mark record as used
      const { error: updateError } = await supabase
        .from("password_reset_otps")
        .update({ used: true })
        .eq("id", otpRecord.id)

      if (updateError) {
        console.error("Error updating reset record:", updateError)
        return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
      }

      // Generate our own reset token for the password reset page
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
    } catch (authError) {
      console.error("Auth verification error:", authError)
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
