import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Debug admin users endpoint called")
    
    const serverClient = createServerClient()
    const { data: users, error } = await serverClient
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    console.log("Users query result:", { error, count: users?.length })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      users: users || [],
      count: users?.length || 0,
      message: "Debug successful"
    })
  } catch (error) {
    console.error("Debug admin users error:", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
  }
}