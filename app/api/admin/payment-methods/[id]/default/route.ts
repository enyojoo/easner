import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    
    const paymentMethodId = params.id
    const body = await request.json()
    const { currency } = body

    if (!currency) {
      return NextResponse.json({ 
        error: "Currency is required" 
      }, { status: 400 })
    }

    const serverClient = createServerClient()

    // Unset other defaults for the same currency
    await serverClient
      .from("payment_methods")
      .update({ is_default: false })
      .eq("currency", currency)

    // Set this one as default
    const { data, error } = await serverClient
      .from("payment_methods")
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentMethodId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ paymentMethod: data })
  } catch (error) {
    console.error("Error setting default payment method:", error)
    return NextResponse.json({ error: "Failed to set default payment method" }, { status: 500 })
  }
}
