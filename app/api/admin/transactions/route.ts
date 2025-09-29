import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)

    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("transactions")
      .select(`
        *,
        user:users(email, first_name, last_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ transactions: data || [] })
  } catch (error) {
    console.error("Error loading transactions:", error)
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
