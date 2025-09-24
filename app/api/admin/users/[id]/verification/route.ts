import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Check if user is authenticated and is admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { user } = session
    
    // Check if user is admin by querying admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single()
    
    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { verification_status } = await request.json()
    const userId = params.id

    // Update user verification status using service role (bypasses RLS)
    const { data, error } = await supabase
      .from("users")
      .update({ 
        verification_status,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Error updating user verification:", error)
    return NextResponse.json({ error: "Failed to update user verification" }, { status: 500 })
  }
}
