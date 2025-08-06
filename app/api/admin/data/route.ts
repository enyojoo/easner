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
    // Get fresh data from database
    const [
      { data: users, error: usersError },
      { data: transactions, error: transactionsError },
      { data: currencies, error: currenciesError },
      { data: exchangeRates, error: ratesError },
      { data: settings, error: settingsError }
    ] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select(`
          *,
          transactions:transactions(count)
        `)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin
        .from("transactions")
        .select(`
          *,
          user:users(id, first_name, last_name, email),
          recipient:recipients(*)
        `)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin
        .from("currencies")
        .select("*")
        .order("name"),
      
      supabaseAdmin
        .from("exchange_rates")
        .select("*")
        .order("from_currency, to_currency"),
      
      supabaseAdmin
        .from("settings")
        .select("*")
        .eq("key", "base_currency")
        .single()
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
    const pendingTransactions = transactions?.filter(t => t.status === 'pending').length || 0
    
    const totalVolume = transactions?.reduce((sum, t) => {
      return sum + (parseFloat(t.send_amount) || 0)
    }, 0) || 0

    // Recent activity (last 10 transactions)
    const recentActivity = transactions?.slice(0, 10).map(t => ({
      id: t.id,
      type: 'transaction',
      description: `${t.user?.first_name} ${t.user?.last_name} sent ${t.send_amount} ${t.send_currency}`,
      timestamp: t.created_at,
      status: t.status
    })) || []

    // Currency pairs
    const currencyPairs = exchangeRates?.map(rate => ({
      from: rate.from_currency,
      to: rate.to_currency,
      rate: rate.rate,
      lastUpdated: rate.updated_at
    })) || []

    const adminData = {
      users: users || [],
      transactions: transactions || [],
      currencies: currencies || [],
      exchangeRates: exchangeRates || [],
      baseCurrency: settings?.value || 'USD',
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
