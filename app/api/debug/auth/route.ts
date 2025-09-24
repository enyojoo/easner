import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Debug auth endpoint called")
    
    // Check cookies
    const cookies = request.cookies.getAll()
    console.log("Cookies:", cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + "..." })))
    
    // Check headers
    const authHeader = request.headers.get("authorization")
    console.log("Auth header:", authHeader ? "Present" : "Missing")
    
    // Try to get user from Supabase
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log("Supabase user:", user ? { id: user.id, email: user.email } : "No user")
    console.log("Supabase error:", error)
    
    // Check user metadata
    if (user) {
      console.log("User metadata:", user.user_metadata)
    }
    
    return NextResponse.json({
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      authHeader: !!authHeader,
      user: user ? { id: user.id, email: user.email, metadata: user.user_metadata } : null,
      error: error?.message
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
  }
}
