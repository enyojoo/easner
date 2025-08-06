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

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()

    const { error } = await supabaseAdmin.from("exchange_rates").upsert(updates, {
      onConflict: "from_currency,to_currency",
      ignoreDuplicates: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating exchange rates:', error)
    return NextResponse.json({ error: 'Failed to update exchange rates' }, { status: 500 })
  }
}
