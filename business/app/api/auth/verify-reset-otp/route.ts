import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    if (otp.length !== 6) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Mock: accept any 6-digit OTP - in production this would verify with auth provider
    const resetToken = randomBytes(32).toString("hex")

    return NextResponse.json({
      message: "Verification code verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
