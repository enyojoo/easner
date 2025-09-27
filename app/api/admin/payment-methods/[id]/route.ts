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
    const {
      currency,
      type,
      name,
      accountName,
      accountNumber,
      bankName,
      qrCodeData,
      instructions,
      isDefault
    } = body

    if (!currency || !type || !name) {
      return NextResponse.json({ 
        error: "Currency, type, and name are required" 
      }, { status: 400 })
    }

    const serverClient = createServerClient()
    
    // If setting as default, unset other defaults for the same currency
    if (isDefault) {
      await serverClient
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", currency)
        .neq("id", paymentMethodId)
    }

    const { data, error } = await serverClient
      .from("payment_methods")
      .update({
        currency,
        type,
        name,
        account_name: accountName || null,
        account_number: accountNumber || null,
        bank_name: bankName || null,
        qr_code_data: qrCodeData || null,
        instructions: instructions || null,
        is_default: isDefault || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentMethodId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ paymentMethod: data })
  } catch (error) {
    console.error("Error updating payment method:", error)
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    
    const paymentMethodId = params.id
    const serverClient = createServerClient()

    const { error } = await serverClient
      .from("payment_methods")
      .delete()
      .eq("id", paymentMethodId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
  }
}
