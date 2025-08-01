import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/database"
import jwt from "jsonwebtoken"

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

    // Create new user
    try {
      const user = await userService.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        baseCurrency: baseCurrency || "NGN",
      })

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
    } catch (userError: any) {
      console.error("User creation error:", userError)
      if (userError.message?.includes("duplicate key")) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
