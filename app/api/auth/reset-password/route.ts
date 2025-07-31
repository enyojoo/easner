import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { resetToken, email, newPassword } = await request.json()

    if (!resetToken || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify reset token
    let decoded
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as any
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    if (decoded.email !== email || decoded.purpose !== "password_reset") {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    console.log("Attempting to update password for user:", email)

    // Get user from Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("Error listing users:", listError)
      return NextResponse.json({ error: "Failed to find user" }, { status: 500 })
    }

    const authUser = authUsers.users.find((user) => user.email === email)

    if (!authUser) {
      console.error("User not found in Supabase Auth:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user in Supabase Auth:", authUser.id)

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error("Error updating password in Supabase Auth:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("Password updated successfully in Supabase Auth")

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
