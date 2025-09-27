import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get all auth users with their email confirmation status
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error("Error fetching auth users:", error)
      return NextResponse.json({ error: "Failed to fetch auth users" }, { status: 500 })
    }

    // Return only the data we need
    const usersData = authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
    }))

    return NextResponse.json({ users: usersData })
  } catch (error) {
    console.error("Error in auth-users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
