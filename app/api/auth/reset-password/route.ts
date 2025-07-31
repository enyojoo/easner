import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    console.log("Reset password request:", { email, hasToken: !!token, hasPassword: !!newPassword })

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log("Decoded token:", decoded)
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check if token is for password reset and email matches
    if (decoded.purpose !== "password_reset" || decoded.email !== email) {
      console.error("Token validation failed:", {
        purpose: decoded.purpose,
        tokenEmail: decoded.email,
        requestEmail: email,
      })
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    // Update user password in Supabase Auth
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(decoded.userId, {
        password: newPassword,
      })

      if (authError) {
        console.error("Supabase Auth update error:", authError)
        // If Supabase Auth update fails, try updating the users table directly
        const { error: dbError } = await supabase
          .from("users")
          .update({
            password_hash: newPassword, // Store plain password temporarily for testing
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (dbError) {
          console.error("Database update error:", dbError)
          return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
        }
      }
    } catch (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    // Mark the reset request as used
    try {
      await supabase.from("password_reset_otps").update({ used: true }).eq("email", email).eq("used", false)
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError)
      // Don't fail the request if cleanup fails
    }

    console.log("Password reset successful for:", email)
    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
