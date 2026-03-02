import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    
    // Check if user exists in auth system
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error("Error checking email:", error)
      return NextResponse.json({ error: "Failed to check email" }, { status: 500 })
    }

    const userExists = authUsers.users.some(user => user.email === email)

    return NextResponse.json({ exists: userExists })
  } catch (error) {
    console.error("Error in check-email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
