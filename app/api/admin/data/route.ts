import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient()
    
    console.log('Fetching admin data...')

    // Fetch all data in parallel
    const [usersResult, transactionsResult, currenciesResult, exchangeRatesResult, settingsResult] = await Promise.all([
      supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('currencies').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('exchange_rates').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('settings').select('*')
    ])

    // Check for errors
    if (usersResult.error) throw usersResult.error
    if (transactionsResult.error) throw transactionsResult.error
    if (currenciesResult.error) throw currenciesResult.error
    if (exchangeRatesResult.error) throw exchangeRatesResult.error
    if (settingsResult.error) throw settingsResult.error

    console.log('Admin data fetched successfully')

    return NextResponse.json({
      users: usersResult.data || [],
      transactions: transactionsResult.data || [],
      currencies: currenciesResult.data || [],
      exchangeRates: exchangeRatesResult.data || [],
      settings: settingsResult.data || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
