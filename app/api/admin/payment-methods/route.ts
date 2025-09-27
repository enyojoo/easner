import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error

    return NextResponse.json({ paymentMethods: data || [] })
  } catch (error) {
    console.error("Error loading payment methods:", error)
    return NextResponse.json({ error: "Failed to load payment methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    
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
    }

    const { data, error } = await serverClient
      .from("payment_methods")
      .insert({
        currency,
        type,
        name,
        account_name: accountName || null,
        account_number: accountNumber || null,
        bank_name: bankName || null,
        qr_code_data: qrCodeData || null,
        instructions: instructions || null,
        is_default: isDefault || false,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ paymentMethod: data })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 })
  }
}
