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
    const currencyData = await request.json()

    const { data: newCurrency, error } = await supabaseAdmin
      .from("currencies")
      .insert(currencyData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newCurrency)
  } catch (error) {
    console.error('Error creating currency:', error)
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
  }
}
