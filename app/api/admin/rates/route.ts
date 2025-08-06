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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'currency':
        const { data: newCurrency, error: currencyError } = await supabaseAdmin
          .from('currencies')
          .insert({
            code: data.code.toUpperCase(),
            name: data.name,
            symbol: data.symbol,
            flag_svg: data.flag_svg || `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ccc"/></svg>`,
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
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating rate data:', error)
    return NextResponse.json({ error: 'Failed to create rate data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

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
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating rate data:', error)
    return NextResponse.json({ error: 'Failed to update rate data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 })
    }

    // Get currency info first
    const { data: currency, error: getCurrencyError } = await supabaseAdmin
      .from('currencies')
      .select('code')
      .eq('id', id)
      .single()
    
    if (getCurrencyError) throw getCurrencyError

    // Delete exchange rates first
    const { error: ratesError } = await supabaseAdmin
      .from('exchange_rates')
      .delete()
      .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)
    
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
