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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id

    const { data: transaction, error } = await supabaseAdmin
      .from("transactions")
      .select(`
        *,
        user:users(id, first_name, last_name, email),
        recipient:recipients(*)
      `)
      .eq("transaction_id", transactionId)
      .single()

    if (error) throw error

    return NextResponse.json(transaction, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const transactionId = params.id

    console.log(`Updating transaction ${transactionId} to status: ${status}`)

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", transactionId)
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Transaction updated successfully:', data)

    return NextResponse.json({ success: true, data }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}
