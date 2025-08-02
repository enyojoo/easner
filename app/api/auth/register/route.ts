import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/database"
import jwt from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, baseCurrency } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user using Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          base_currency: baseCurrency || "NGN",
        },
      },
    })

    if (authError) {
      console.error("Auth signup error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Insert user data into users table
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        base_currency: baseCurrency || "NGN",
        status: "active",
        verification_status: "unverified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      // Clean up auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Database error saving new user" }, { status: 500 })
    }

    const user = userData

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        baseCurrency: user.base_currency,
        status: user.status,
        verificationStatus: user.verification_status,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
