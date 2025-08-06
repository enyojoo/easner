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
    const currencyId = params.id

    const { error } = await supabaseAdmin
      .from("currencies")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currencyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating currency:', error)
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currencyId = params.id

    // First get the currency to find its code
    const { data: currency } = await supabaseAdmin
      .from("currencies")
      .select("code")
      .eq("id", currencyId)
      .single()

    if (currency) {
      // Delete exchange rates first
      await supabaseAdmin
        .from("exchange_rates")
        .delete()
        .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)
    }

    // Delete currency
    const { error } = await supabaseAdmin
      .from("currencies")
      .delete()
      .eq("id", currencyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting currency:', error)
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
