import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check if token is for password reset and email matches
    if (decoded.purpose !== "password_reset" || decoded.email !== email) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(decoded.userId, {
      password: newPassword,
    })

    if (authError) {
      // If Supabase Auth update fails, try updating the users table directly
      const { error: dbError } = await supabase
        .from("users")
        .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
        .eq("email", email)

      if (dbError) {
        console.error("Error updating password:", dbError)
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
