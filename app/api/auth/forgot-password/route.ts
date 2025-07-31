import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Use resetPasswordForEmail instead of signInWithOtp
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      console.error("Password reset error:", error)
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, we have sent you a password reset link." },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { message: "If an account with that email exists, we have sent you a password reset link." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 })
  }
}
