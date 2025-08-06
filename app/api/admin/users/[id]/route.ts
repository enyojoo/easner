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

    // Get fresh user data with related transactions
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select(`
        *,
        transactions:transactions(
          transaction_id,
          created_at,
          send_currency,
          receive_currency,
          send_amount,
          receive_amount,
          status,
          recipient:recipients(full_name, bank_name, account_number)
        )
      `)
      .eq("id", userId)
      .single()

    if (userError) throw userError

    // Get user's transaction stats
    const { data: transactionStats, error: statsError } = await supabaseAdmin
      .from("transactions")
      .select("send_amount, send_currency, status")
      .eq("user_id", userId)

    if (statsError) throw statsError

    // Calculate total volume in NGN
    let totalVolume = 0
    const totalTransactions = transactionStats?.filter(t => t.status === 'completed').length || 0

    transactionStats?.forEach(tx => {
      if (tx.status === 'completed') {
        let amount = Number(tx.send_amount)
        
        // Convert to NGN based on currency
        switch (tx.send_currency) {
          case "RUB":
            amount = amount * 0.011
            break
          case "USD":
            amount = amount * 1650
            break
          case "EUR":
            amount = amount * 1750
            break
          case "GBP":
            amount = amount * 2000
            break
          case "NGN":
          default:
            break
        }
        
        totalVolume += amount
      }
    })

    const userData = {
      ...user,
      totalTransactions,
      totalVolume,
      recentTransactions: user.transactions?.slice(0, 10) || []
    }

    return NextResponse.json(userData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
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
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
