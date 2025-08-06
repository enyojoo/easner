import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side admin client with service role
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

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case 'currency':
        const { data: newCurrency, error: currencyError } = await supabaseAdmin
          .from('currencies')
          .insert({
            ...data,
            status: 'active'
          })
          .select()
          .single()

        if (currencyError) throw currencyError
        return NextResponse.json(newCurrency)

      case 'exchange_rates':
        const { error: ratesError } = await supabaseAdmin
          .from('exchange_rates')
          .upsert(data, {
            onConflict: 'from_currency,to_currency',
            ignoreDuplicates: false
          })

        if (ratesError) throw ratesError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating rates data:', error)
    return NextResponse.json({ error: 'Failed to create rates data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { type, id, data } = await request.json()

    switch (type) {
      case 'currency_status':
        const { error: statusError } = await supabaseAdmin
          .from('currencies')
          .update({
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (statusError) throw statusError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating rates data:', error)
    return NextResponse.json({ error: 'Failed to update rates data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const currency = await supabaseAdmin
      .from('currencies')
      .select('code')
      .eq('id', id)
      .single()

    if (currency.error) throw currency.error

    // Delete exchange rates first
    const { error: ratesError } = await supabaseAdmin
      .from('exchange_rates')
      .delete()
      .or(`from_currency.eq.${currency.data.code},to_currency.eq.${currency.data.code}`)

    if (ratesError) throw ratesError

    // Delete currency
    const { error: currencyError } = await supabaseAdmin
      .from('currencies')
      .delete()
      .eq('id', id)

    if (currencyError) throw currencyError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting currency:', error)
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
