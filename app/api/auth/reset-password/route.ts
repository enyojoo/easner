import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    console.log("Reset password request:", { token: !!token, email, newPassword: !!newPassword })

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log("Decoded token:", decoded)
    } catch (error) {
      console.error("JWT verification error:", error)
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

    // Get user from Supabase Auth by email
    const { data: authUser, error: getUserError } = await supabase.auth.admin.listUsers()

    if (getUserError) {
      console.error("Error getting users:", getUserError)
      return NextResponse.json({ error: "Failed to find user" }, { status: 500 })
    }

    const user = authUser.users.find((u) => u.email === email)

    if (!user) {
      console.error("User not found in auth.users:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user:", user.id, user.email)

    // Update user password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (authError) {
      console.error("Error updating password in Supabase Auth:", authError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("Password updated successfully for user:", user.id)

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
