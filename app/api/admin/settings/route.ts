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
          .order('category')
        
        if (settingsError) throw settingsError
        return NextResponse.json(settings || [])

      case 'payment_methods':
        const { data: paymentMethods, error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .select('*')
          .order('currency')
          .order('is_default', { ascending: false })
        
        if (pmError) throw pmError
        return NextResponse.json(paymentMethods || [])

      case 'email_templates':
        const { data: templates, error: templatesError } = await supabaseAdmin
          .from('email_templates')
          .select('*')
          .order('template_type')
        
        if (templatesError) throw templatesError
        return NextResponse.json(templates || [])

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'system_setting':
        const { error: settingError } = await supabaseAdmin
          .from('system_settings')
          .upsert({
            key: data.key,
            value: String(data.value),
            data_type: data.data_type || 'string',
            category: data.category || 'platform',
            is_active: true,
            updated_at: new Date().toISOString()
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

        const { data: newPaymentMethod, error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .insert({
            currency: data.currency,
            type: data.type,
            name: data.name,
            account_name: data.account_name || null,
            account_number: data.account_number || null,
            bank_name: data.bank_name || null,
            qr_code_data: data.qr_code_data || null,
            instructions: data.instructions || null,
            is_default: data.is_default || false,
            status: 'active'
          })
          .select()
          .single()
        
        if (pmError) throw pmError
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
            name: data.name,
            subject: data.subject,
            template_type: data.template_type,
            html_content: data.html_content,
            text_content: data.text_content,
            variables: data.variables || '',
            is_default: data.is_default || false,
            status: 'active'
          })
          .select()
          .single()
        
        if (templateError) throw templateError
        return NextResponse.json(newTemplate)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    switch (type) {
      case 'payment_method':
        // If setting as default, unset other defaults for the same currency
        if (data.is_default && data.currency) {
          await supabaseAdmin
            .from('payment_methods')
            .update({ is_default: false })
            .eq('currency', data.currency)
            .neq('id', id)
        }

        const { data: updatedPaymentMethod, error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .update({
            currency: data.currency,
            type: data.type,
            name: data.name,
            account_name: data.account_name || null,
            account_number: data.account_number || null,
            bank_name: data.bank_name || null,
            qr_code_data: data.qr_code_data || null,
            instructions: data.instructions || null,
            is_default: data.is_default || false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
        
        if (pmError) throw pmError
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
            name: data.name,
            subject: data.subject,
            template_type: data.template_type,
            html_content: data.html_content,
            text_content: data.text_content,
            variables: data.variables || '',
            is_default: data.is_default || false,
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
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 })
    }

    switch (type) {
      case 'payment_method':
        const { error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .delete()
          .eq('id', id)
        
        if (pmError) throw pmError
        return NextResponse.json({ success: true })

      case 'email_template':
        const { error: templateError } = await supabaseAdmin
          .from('email_templates')
          .delete()
          .eq('id', id)
        
        if (templateError) throw templateError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}
