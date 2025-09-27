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
    const { status } = body

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required" 
      }, { status: 400 })
    }

    const serverClient = createServerClient()

    const { data, error } = await serverClient
      .from("payment_methods")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentMethodId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ paymentMethod: data })
  } catch (error) {
    console.error("Error updating payment method status:", error)
    return NextResponse.json({ error: "Failed to update payment method status" }, { status: 500 })
  }
}
