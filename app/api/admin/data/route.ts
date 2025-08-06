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
    // Fetch all data using service role to bypass RLS
    const [
      { data: users, error: usersError },
      { data: transactions, error: transactionsError },
      { data: currencies, error: currenciesError },
      { data: exchangeRates, error: ratesError }
    ] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      
      supabaseAdmin
        .from("transactions")
        .select(`
          *,
          user:users(id, first_name, last_name, email),
          recipient:recipients(*)
        `)
        .order("created_at", { ascending: false })
        .limit(200),
      
      supabaseAdmin
        .from("currencies")
        .select("*")
        .order("code"),
      
      supabaseAdmin
        .from("exchange_rates")
        .select(`
          *,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
        `)
        .eq("status", "active")
    ])

    if (usersError) throw usersError
    if (transactionsError) throw transactionsError
    if (currenciesError) throw currenciesError
    if (ratesError) throw ratesError

    // Calculate stats
    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => u.status === 'active').length || 0
    const verifiedUsers = users?.filter(u => u.verification_status === 'verified').length || 0
    
    const totalTransactions = transactions?.length || 0
    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.send_amount || 0), 0) || 0
    const pendingTransactions = transactions?.filter(t => ['pending', 'processing'].includes(t.status)).length || 0

    // Get recent activity (last 10 transactions)
    const recentActivity = transactions?.slice(0, 10) || []

    // Create currency pairs for exchange rates
    const currencyPairs = currencies?.flatMap(from => 
      currencies?.filter(to => to.code !== from.code)
        .map(to => ({
          from: from.code,
          to: to.code,
          rate: exchangeRates?.find(r => r.from_currency === from.code && r.to_currency === to.code)?.rate || 0
        }))
    ) || []

    const adminData = {
      users: users || [],
      transactions: transactions || [],
      currencies: currencies || [],
      exchangeRates: exchangeRates || [],
      baseCurrency: "USD",
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalTransactions,
        totalVolume,
        pendingTransactions
      },
      recentActivity,
      currencyPairs,
      lastUpdated: Date.now()
    }

    return NextResponse.json(adminData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
