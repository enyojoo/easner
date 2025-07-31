import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    console.log("Reset password request for email:", email)

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log("Token decoded successfully for:", decoded.email)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check if token is for password reset and email matches
    if (decoded.purpose !== "password_reset" || decoded.email !== email) {
      console.log("Token validation failed - purpose or email mismatch")
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    console.log("Password hashed successfully")

    // Update password in our custom users table
    const { error: dbError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)

    if (dbError) {
      console.error("Error updating database password:", dbError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("Database password updated successfully")

    // Clean up used OTPs
    await supabase.from("password_reset_otps").delete().eq("email", email)

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
