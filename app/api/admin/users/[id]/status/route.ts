import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create a client that can read cookies from the request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
    
    // Get session from cookies in the request
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Session error" }, { status: 401 })
    }
    
    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { user } = session
    console.log("Authenticated user:", user.id)
    
    // Check if user is admin by querying admin_users table using service role
    const serverClient = createServerClient()
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single()
    
    if (adminError) {
      console.error("Admin check error:", adminError)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    
    if (!adminUser) {
      console.error("User is not admin")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { status } = await request.json()
    const userId = params.id

    console.log(`Updating user ${userId} status to ${status}`)

    // Update user status using service role (bypasses RLS)
    const { data, error } = await serverClient
      .from("users")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database update failed" }, { status: 500 })
    }

    console.log("User status updated successfully:", data)
    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
