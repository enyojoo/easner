import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/database"
import { createServerClient } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, baseCurrency } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Check if user already exists in our database
    const existingUser = await userService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create user in Supabase auth first
    const serverClient = createServerClient()
    const { data: authData, error: authError } = await serverClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        base_currency: baseCurrency || "USD",
      }
    })

    if (authError) {
      console.error("Auth user creation error:", authError)
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Create user in our database
    console.log("Creating user in database with ID:", authData.user.id)
    let user
    try {
      user = await userService.create({
        id: authData.user.id, // Use Supabase auth user ID
        email,
        password, // This won't be used since we're using Supabase auth
        firstName,
        lastName,
        phone: phone || undefined, // Make phone optional
        baseCurrency: baseCurrency || "USD",
      })
      console.log("User created successfully in database:", user)
    } catch (userError) {
      console.error("Error creating user in database:", userError)
      // If user creation fails, we should clean up the auth user
      try {
        await serverClient.auth.admin.deleteUser(authData.user.id)
        console.log("Cleaned up auth user after database creation failure")
      } catch (cleanupError) {
        console.error("Error cleaning up auth user:", cleanupError)
      }
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

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
