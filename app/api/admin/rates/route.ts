import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    console.log('Admin rates POST:', type, data)
    
    const supabase = createServerClient()

    if (type === 'currency') {
      const { data: currency, error } = await supabase
        .from('currencies')
        .insert({
          code: data.code,
          name: data.name,
          symbol: data.symbol,
          flag_svg: data.flag_svg,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(currency)
    }

    if (type === 'exchange_rates') {
      const { data: rates, error } = await supabase
        .from('exchange_rates')
        .upsert(data, {
          onConflict: 'from_currency,to_currency',
          ignoreDuplicates: false,
        })
        .select()

      if (error) throw error
      return NextResponse.json(rates)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error in admin rates POST:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body
    
    console.log('Admin rates PATCH:', type, id, data)
    
    const supabase = createServerClient()

    if (type === 'currency_status') {
      const { data: currency, error } = await supabase
        .from('currencies')
        .update({ status: data.status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(currency)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error in admin rates PATCH:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    console.log('Admin rates DELETE:', id)
    
    const supabase = createServerClient()

    // Get currency code first
    const { data: currency, error: currencyError } = await supabase
      .from('currencies')
      .select('code')
      .eq('id', id)
      .single()

    if (currencyError) throw currencyError

    // Delete exchange rates first
    const { error: ratesError } = await supabase
      .from('exchange_rates')
      .delete()
      .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)

    if (ratesError) throw ratesError

    // Delete currency
    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin rates DELETE:', error)
    return NextResponse.json(
      { error: 'Failed to delete currency', details: error },
      { status: 500 }
    )
  }
}
