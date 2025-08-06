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
      .from("email_templates")
      .select("*")
      .order("template_type", { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json()

    // If setting as default, unset other defaults for the same template type
    if (templateData.is_default) {
      await supabaseAdmin
        .from("email_templates")
        .update({ is_default: false })
        .eq("template_type", templateData.template_type)
    }

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .insert({
        ...templateData,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 })
  }
}
