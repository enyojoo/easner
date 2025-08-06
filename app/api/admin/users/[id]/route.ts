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
    const userId = params.id

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    // Get user transactions
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from("transactions")
      .select(`
        transaction_id,
        created_at,
        send_currency,
        receive_currency,
        send_amount,
        receive_amount,
        status,
        recipient:recipients(full_name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (transactionsError) throw transactionsError

    return NextResponse.json({
      user,
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = params.id

    const { error } = await supabaseAdmin
      .from("users")
      .update(body)
      .eq("id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
