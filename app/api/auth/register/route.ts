import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, baseCurrency } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        base_currency: baseCurrency || "NGN",
      },
      email_confirm: false, // Set to true if you want email confirmation
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create user profile in users table
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      base_currency: baseCurrency || "NGN",
      status: "active",
      verification_status: "pending",
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: "Database error saving new user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: firstName,
        lastName: lastName,
        baseCurrency: baseCurrency || "NGN",
        status: "active",
        verificationStatus: "pending",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
