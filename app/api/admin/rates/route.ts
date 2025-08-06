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

    console.log('Admin rates POST:', type, data)

    switch (type) {
      case 'currency':
        const { data: newCurrency, error: currencyError } = await supabaseAdmin
          .from('currencies')
          .insert({
            code: data.code.toUpperCase(),
            name: data.name,
            symbol: data.symbol,
            flag_svg: data.flag_svg || `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ccc"/></svg>`,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (currencyError) {
          console.error('Currency creation error:', currencyError)
          throw currencyError
        }
        
        console.log('Currency created:', newCurrency)
        return NextResponse.json(newCurrency)

      case 'exchange_rates':
        const { error: ratesError } = await supabaseAdmin
          .from('exchange_rates')
          .upsert(data.map((rate: any) => ({
            ...rate,
            updated_at: new Date().toISOString()
          })), {
            onConflict: 'from_currency,to_currency',
            ignoreDuplicates: false
          })
        
        if (ratesError) {
          console.error('Exchange rates error:', ratesError)
          throw ratesError
        }
        
        console.log('Exchange rates updated')
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in admin rates POST:', error)
    return NextResponse.json({ error: 'Failed to create rate data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    console.log('Admin rates PATCH:', type, id, data)

    switch (type) {
      case 'currency_status':
        const { error: statusError } = await supabaseAdmin
          .from('currencies')
          .update({ 
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        
        if (statusError) {
          console.error('Currency status update error:', statusError)
          throw statusError
        }
        
        console.log('Currency status updated')
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in admin rates PATCH:', error)
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

    console.log('Deleting currency:', id)

    // Get currency info first
    const { data: currency, error: getCurrencyError } = await supabaseAdmin
      .from('currencies')
      .select('code')
      .eq('id', id)
      .single()
    
    if (getCurrencyError) {
      console.error('Get currency error:', getCurrencyError)
      throw getCurrencyError
    }

    // Delete exchange rates first
    const { error: ratesError } = await supabaseAdmin
      .from('exchange_rates')
      .delete()
      .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)
    
    if (ratesError) {
      console.error('Delete rates error:', ratesError)
      throw ratesError
    }

    // Delete currency
    const { error: currencyError } = await supabaseAdmin
      .from('currencies')
      .delete()
      .eq('id', id)
    
    if (currencyError) {
      console.error('Delete currency error:', currencyError)
      throw currencyError
    }

    console.log('Currency deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting currency:', error)
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
