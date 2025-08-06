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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const templateId = params.id

    // If setting as default, unset other defaults for the same template type
    if (updates.is_default && updates.template_type) {
      await supabaseAdmin
        .from("email_templates")
        .update({ is_default: false })
        .eq("template_type", updates.template_type)
        .neq("id", templateId)
    }

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    const { error } = await supabaseAdmin
      .from("email_templates")
      .delete()
      .eq("id", templateId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}
