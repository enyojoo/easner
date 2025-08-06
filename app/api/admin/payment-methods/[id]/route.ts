import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const paymentMethodId = params.id

    // If setting as default, unset other defaults for the same currency
    if (updates.is_default && updates.currency) {
      await supabaseAdmin
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", updates.currency)
        .neq("id", paymentMethodId)
    }

    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentMethodId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentMethodId = params.id

    const { error } = await supabaseAdmin
      .from("payment_methods")
      .delete()
      .eq("id", paymentMethodId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
  }
}
