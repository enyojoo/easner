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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentMethodData = await request.json()

    // If setting as default, unset other defaults for the same currency
    if (paymentMethodData.is_default) {
      await supabaseAdmin
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", paymentMethodData.currency)
    }

    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .insert({
        ...paymentMethodData,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 })
  }
}
