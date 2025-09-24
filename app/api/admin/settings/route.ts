import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("settings")
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Error loading settings:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}
