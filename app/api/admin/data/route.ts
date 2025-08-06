import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side admin client with service role - bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    // Add cache-busting headers
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    // Fetch all data in parallel with fresh queries
    const [
      usersResult,
      transactionsResult,
      currenciesResult,
      exchangeRatesResult,
      settingsResult
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('currencies').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('exchange_rates').select('*').order('updated_at', { ascending: false }),
      supabaseAdmin.from('admin_settings').select('*').single()
    ])

    if (usersResult.error) throw usersResult.error
    if (transactionsResult.error) throw transactionsResult.error
    if (currenciesResult.error) throw currenciesResult.error
    if (exchangeRatesResult.error) throw exchangeRatesResult.error

    const users = usersResult.data || []
    const transactions = transactionsResult.data || []
    const currencies = currenciesResult.data || []
    const exchangeRates = exchangeRatesResult.data || []
    const settings = settingsResult.data || { base_currency: 'USD' }

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      verifiedUsers: users.filter(u => u.verification_status === 'verified').length,
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0),
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length
    }

    // Recent activity (last 10 transactions)
    const recentActivity = transactions.slice(0, 10).map(tx => ({
      id: tx.transaction_id,
      type: 'transaction',
      description: `${tx.sender_name} sent ${tx.amount} ${tx.from_currency} to ${tx.recipient_name}`,
      timestamp: tx.created_at,
      status: tx.status
    }))

    // Currency pairs for quick reference
    const currencyPairs = currencies.map(currency => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rates: exchangeRates.filter(rate => rate.from_currency === currency.code)
    }))

    const adminData = {
      users,
      transactions,
      currencies,
      exchangeRates,
      baseCurrency: settings.base_currency,
      stats,
      recentActivity,
      currencyPairs,
      lastUpdated: Date.now()
    }

    return NextResponse.json(adminData, { headers })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
