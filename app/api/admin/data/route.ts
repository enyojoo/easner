import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching admin data...')
    const supabase = createServerClient()

    // Fetch all data in parallel
    const [
      { data: users, error: usersError },
      { data: transactions, error: transactionsError },
      { data: currencies, error: currenciesError },
      { data: exchangeRates, error: ratesError },
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select(`
        *,
        user:users(first_name, last_name, email),
        recipient:recipients(*)
      `).order('created_at', { ascending: false }),
      supabase.from('currencies').select('*').order('code'),
      supabase.from('exchange_rates').select(`
        *,
        from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
        to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
      `).eq('status', 'active')
    ])

    if (usersError) {
      console.error('Users error:', usersError)
      throw usersError
    }
    if (transactionsError) {
      console.error('Transactions error:', transactionsError)
      throw transactionsError
    }
    if (currenciesError) {
      console.error('Currencies error:', currenciesError)
      throw currenciesError
    }
    if (ratesError) {
      console.error('Exchange rates error:', ratesError)
      throw ratesError
    }

    // Calculate stats
    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => u.status === 'active').length || 0
    const verifiedUsers = users?.filter(u => u.verification_status === 'verified').length || 0
    const totalTransactions = transactions?.length || 0
    const pendingTransactions = transactions?.filter(t => ['pending', 'processing'].includes(t.status)).length || 0
    const totalVolume = transactions?.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.send_amount || 0), 0) || 0

    const adminData = {
      users: users || [],
      transactions: transactions || [],
      currencies: currencies || [],
      exchangeRates: exchangeRates || [],
      baseCurrency: 'NGN',
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalTransactions,
        totalVolume,
        pendingTransactions,
      },
      recentActivity: [],
      currencyPairs: [],
      lastUpdated: Date.now(),
    }

    console.log('Admin data fetched successfully:', {
      users: adminData.users.length,
      transactions: adminData.transactions.length,
      currencies: adminData.currencies.length,
      exchangeRates: adminData.exchangeRates.length,
    })

    return NextResponse.json(adminData)
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin data', details: error },
      { status: 500 }
    )
  }
}
