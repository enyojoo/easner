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
      .from("system_settings")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({ error: 'Failed to fetch system settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .upsert(settings, {
        onConflict: "key",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json({ error: 'Failed to update system settings' }, { status: 500 })
  }
}
