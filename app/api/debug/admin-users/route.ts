import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get all admin users
    const { data: adminUsers, error } = await supabase
      .from("admin_users")
      .select("*")
    
    if (error) {
      console.error("Error fetching admin users:", error)
      return NextResponse.json({ 
        error: "Failed to fetch admin users", 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      adminUsers: adminUsers?.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name
      })) || []
    })
  } catch (error) {
    console.error("Debug admin users error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
