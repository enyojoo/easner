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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Try to insert new OTP record
    const { error: insertError } = await supabase.from("password_reset_otps").insert({
      user_id: user.id,
      email: email,
      otp: otp,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      // If insert fails due to existing record, update it
      if (insertError.code === "23505") {
        // unique constraint violation
        const { error: updateError } = await supabase
          .from("password_reset_otps")
          .update({
            otp: otp,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (updateError) {
          console.error("Failed to update OTP:", updateError)
          return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
        }
      } else {
        console.error("Failed to insert OTP:", insertError)
        return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
      }
    }

    // In a real app, send email with OTP here
    console.log(`Password reset OTP for ${email}: ${otp}`)

    return NextResponse.json({
      message: "Verification code sent to your email",
      success: true,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
