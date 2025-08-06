import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side admin client with service role
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
    const type = searchParams.get('type')

    switch (type) {
      case 'system_settings':
        const { data: settings, error: settingsError } = await supabaseAdmin
          .from('system_settings')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })

        if (settingsError) throw settingsError
        return NextResponse.json(settings || [])

      case 'payment_methods':
        const { data: paymentMethods, error: paymentError } = await supabaseAdmin
          .from('payment_methods')
          .select('*')
          .order('currency', { ascending: true })
          .order('is_default', { ascending: false })

        if (paymentError) throw paymentError
        return NextResponse.json(paymentMethods || [])

      case 'email_templates':
        const { data: emailTemplates, error: emailError } = await supabaseAdmin
          .from('email_templates')
          .select('*')
          .order('template_type', { ascending: true })

        if (emailError) throw emailError
        return NextResponse.json(emailTemplates || [])

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching settings data:', error)
    return NextResponse.json({ error: 'Failed to fetch settings data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case 'system_setting':
        const { error: settingError } = await supabaseAdmin
          .from('system_settings')
          .upsert({
            key: data.key,
            value: data.value,
            data_type: data.data_type,
            category: data.category,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'key'
          })

        if (settingError) throw settingError
        return NextResponse.json({ success: true })

      case 'payment_method':
        // If setting as default, unset other defaults for the same currency
        if (data.is_default) {
          await supabaseAdmin
            .from('payment_methods')
            .update({ is_default: false })
            .eq('currency', data.currency)
        }

        const { data: newPaymentMethod, error: paymentError } = await supabaseAdmin
          .from('payment_methods')
          .insert({
            ...data,
            status: 'active'
          })
          .select()
          .single()

        if (paymentError) throw paymentError
        return NextResponse.json(newPaymentMethod)

      case 'email_template':
        // If setting as default, unset other defaults for the same template type
        if (data.is_default) {
          await supabaseAdmin
            .from('email_templates')
            .update({ is_default: false })
            .eq('template_type', data.template_type)
        }

        const { data: newTemplate, error: templateError } = await supabaseAdmin
          .from('email_templates')
          .insert({
            ...data,
            status: 'active'
          })
          .select()
          .single()

        if (templateError) throw templateError
        return NextResponse.json(newTemplate)

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating settings data:', error)
    return NextResponse.json({ error: 'Failed to create settings data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { type, id, data } = await request.json()

    switch (type) {
      case 'payment_method':
        // If setting as default, unset other defaults for the same currency
        if (data.is_default) {
          await supabaseAdmin
            .from('payment_methods')
            .update({ is_default: false })
            .eq('currency', data.currency)
            .neq('id', id)
        }

        const { data: updatedPaymentMethod, error: paymentError } = await supabaseAdmin
          .from('payment_methods')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (paymentError) throw paymentError
        return NextResponse.json(updatedPaymentMethod)

      case 'payment_method_status':
        const { error: statusError } = await supabaseAdmin
          .from('payment_methods')
          .update({
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (statusError) throw statusError
        return NextResponse.json({ success: true })

      case 'payment_method_default':
        // Unset other defaults for the same currency
        await supabaseAdmin
          .from('payment_methods')
          .update({ is_default: false })
          .eq('currency', data.currency)

        // Set this one as default
        const { error: defaultError } = await supabaseAdmin
          .from('payment_methods')
          .update({
            is_default: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (defaultError) throw defaultError
        return NextResponse.json({ success: true })

      case 'email_template':
        // If setting as default, unset other defaults for the same template type
        if (data.is_default) {
          await supabaseAdmin
            .from('email_templates')
            .update({ is_default: false })
            .eq('template_type', data.template_type)
            .neq('id', id)
        }

        const { data: updatedTemplate, error: templateError } = await supabaseAdmin
          .from('email_templates')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (templateError) throw templateError
        return NextResponse.json(updatedTemplate)

      case 'email_template_status':
        const { error: templateStatusError } = await supabaseAdmin
          .from('email_templates')
          .update({
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (templateStatusError) throw templateStatusError
        return NextResponse.json({ success: true })

      case 'email_template_default':
        // Unset other defaults for the same template type
        await supabaseAdmin
          .from('email_templates')
          .update({ is_default: false })
          .eq('template_type', data.template_type)

        // Set this one as default
        const { error: templateDefaultError } = await supabaseAdmin
          .from('email_templates')
          .update({
            is_default: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (templateDefaultError) throw templateDefaultError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating settings data:', error)
    return NextResponse.json({ error: 'Failed to update settings data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    switch (type) {
      case 'payment_method':
        const { error: paymentError } = await supabaseAdmin
          .from('payment_methods')
          .delete()
          .eq('id', id)

        if (paymentError) throw paymentError
        return NextResponse.json({ success: true })

      case 'email_template':
        const { error: templateError } = await supabaseAdmin
          .from('email_templates')
          .delete()
          .eq('id', id)

        if (templateError) throw templateError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting settings data:', error)
    return NextResponse.json({ error: 'Failed to delete settings data' }, { status: 500 })
  }
}
