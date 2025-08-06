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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency')

    if (currency) {
      // Get fresh exchange rates for specific currency
      const { data: rates, error } = await supabaseAdmin
        .from("exchange_rates")
        .select("*")
        .or(`from_currency.eq.${currency},to_currency.eq.${currency}`)
        .order("from_currency, to_currency")

      if (error) throw error

      return NextResponse.json(rates, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    // Get all rates
    const { data: rates, error } = await supabaseAdmin
      .from("exchange_rates")
      .select("*")
      .order("from_currency, to_currency")

    if (error) throw error

    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching rates:', error)
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (type === 'exchange_rates') {
      const { error } = await supabaseAdmin
        .from("exchange_rates")
        .upsert(data, {
          onConflict: "from_currency,to_currency",
          ignoreDuplicates: false,
        })

      if (error) throw error

      return NextResponse.json({ success: true }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    if (type === 'currency') {
      const { data: newCurrency, error } = await supabaseAdmin
        .from("currencies")
        .insert(data)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(newCurrency, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('Error in rates POST:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { type, id, data } = await request.json()

    if (type === 'currency_status') {
      const { error } = await supabaseAdmin
        .from("currencies")
        .update({
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      return NextResponse.json({ success: true }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('Error in rates PATCH:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currencyId = searchParams.get('id')

    if (!currencyId) {
      return NextResponse.json({ error: 'Currency ID required' }, { status: 400 })
    }

    // Get currency details first
    const { data: currency, error: fetchError } = await supabaseAdmin
      .from("currencies")
      .select("code")
      .eq("id", currencyId)
      .single()

    if (fetchError) throw fetchError

    // Delete exchange rates first
    const { error: ratesError } = await supabaseAdmin
      .from("exchange_rates")
      .delete()
      .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)

    if (ratesError) throw ratesError

    // Delete currency
    const { error } = await supabaseAdmin
      .from("currencies")
      .delete()
      .eq("id", currencyId)

    if (error) throw error

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error deleting currency:', error)
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
