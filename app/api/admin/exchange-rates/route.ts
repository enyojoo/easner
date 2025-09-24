import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-utils"

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { rates } = await request.json()

    const serverClient = createServerClient()
    
    // Update exchange rates
    const updates = rates.map((rate: any) => ({
      from_currency: rate.from_currency,
      to_currency: rate.to_currency,
      rate: rate.rate,
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await serverClient
      .from("exchange_rates")
      .upsert(updates, { onConflict: "from_currency,to_currency" })

    if (error) throw error

    return NextResponse.json({ success: true, rates: data })
  } catch (error) {
    console.error("Error updating exchange rates:", error)
    return NextResponse.json({ error: "Failed to update exchange rates" }, { status: 500 })
  }
}