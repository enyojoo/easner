import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient()
    
    console.log('Loading admin data...')

    // Load all data in parallel using service role client
    const [usersResult, transactionsResult, currenciesResult, exchangeRatesResult, baseCurrencyResult] = await Promise.all([
      loadUsers(supabaseAdmin),
      loadTransactions(supabaseAdmin),
      loadCurrencies(supabaseAdmin),
      loadExchangeRates(supabaseAdmin),
      getAdminBaseCurrency(supabaseAdmin),
    ])

    console.log('Data loaded:', {
      users: usersResult.length,
      transactions: transactionsResult.length,
      currencies: currenciesResult.length,
      exchangeRates: exchangeRatesResult.length
    })

    const stats = calculateStats(usersResult, transactionsResult, baseCurrencyResult)
    const recentActivity = processRecentActivity(transactionsResult.slice(0, 10))
    const currencyPairs = processCurrencyPairs(transactionsResult.filter((t) => t.status === "completed"))

    const data = {
      users: usersResult,
      transactions: transactionsResult,
      currencies: currenciesResult,
      exchangeRates: exchangeRatesResult,
      baseCurrency: baseCurrencyResult,
      stats,
      recentActivity,
      currencyPairs,
      lastUpdated: Date.now(),
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error loading admin data:', error)
    return NextResponse.json({ error: 'Failed to load admin data' }, { status: 500 })
  }
}

async function loadUsers(supabaseAdmin: any) {
  console.log('Loading users...')
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error('Error loading users:', error)
    throw error
  }

  console.log('Users loaded:', users?.length || 0)

  // Calculate transaction stats for each user
  const usersWithStats = await Promise.all(
    (users || []).map(async (user) => {
      const { data: transactions } = await supabaseAdmin
        .from("transactions")
        .select("send_amount, send_currency, status")
        .eq("user_id", user.id)

      const totalTransactions = transactions?.length || 0
      const totalVolume = (transactions || []).reduce((sum, tx) => {
        let amount = Number(tx.send_amount)

        // Convert to NGN based on actual currency
        switch (tx.send_currency) {
          case "RUB":
            amount = amount * 0.011 // RUB to NGN rate
            break
          case "USD":
            amount = amount * 1650 // USD to NGN rate
            break
          case "EUR":
            amount = amount * 1750 // EUR to NGN rate
            break
          case "GBP":
            amount = amount * 2000 // GBP to NGN rate
            break
          case "NGN":
          default:
            // Already in NGN, no conversion needed
            break
        }

        return sum + amount
      }, 0)

      return {
        ...user,
        totalTransactions,
        totalVolume,
      }
    }),
  )

  return usersWithStats
}

async function loadTransactions(supabaseAdmin: any) {
  console.log('Loading transactions...')
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select(`
      *,
      user:users(first_name, last_name, email),
      recipient:recipients(full_name, bank_name, account_number)
    `)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error loading transactions:', error)
    throw error
  }

  console.log('Transactions loaded:', data?.length || 0)
  return data || []
}

async function loadCurrencies(supabaseAdmin: any) {
  console.log('Loading currencies...')
  const { data, error } = await supabaseAdmin.from("currencies").select("*").order("code")
  
  if (error) {
    console.error('Error loading currencies:', error)
    throw error
  }

  console.log('Currencies loaded:', data?.length || 0)
  return data || []
}

async function loadExchangeRates(supabaseAdmin: any) {
  console.log('Loading exchange rates...')
  const { data, error } = await supabaseAdmin.from("exchange_rates").select(`
    *,
    from_currency_info:currencies!exchange_rates_from_currency_fkey(code, name, symbol),
    to_currency_info:currencies!exchange_rates_to_currency_fkey(code, name, symbol)
  `)
  
  if (error) {
    console.error('Error loading exchange rates:', error)
    throw error
  }

  console.log('Exchange rates loaded:', data?.length || 0)
  return data || []
}

async function getAdminBaseCurrency(supabaseAdmin: any): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.from("system_settings").select("value").eq("key", "base_currency").single()

    if (error || !data) return "NGN" // Default to NGN
    return data.value
  } catch {
    return "NGN" // Default fallback
  }
}

function calculateStats(users: any[], transactions: any[], baseCurrency: string) {
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const verifiedUsers = users.filter((u) => u.verification_status === "verified").length

  const totalTransactions = transactions.length
  const pendingTransactions = transactions.filter((t) => t.status === "pending" || t.status === "processing").length

  // Calculate total volume in admin's base currency
  const completedTransactions = transactions.filter((t) => t.status === "completed")
  const totalVolume = completedTransactions.reduce((sum, tx) => {
    let amount = Number(tx.send_amount)
    
    // Simple conversion for now
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
    
    return sum + amount
  }, 0)

  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    totalTransactions,
    totalVolume,
    pendingTransactions,
  }
}

function processRecentActivity(transactions: any[]) {
  return transactions.map((tx) => ({
    id: tx.id,
    type: getActivityType(tx.status),
    message: getActivityMessage(tx),
    user: tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : undefined,
    amount: formatCurrency(tx.send_amount, tx.send_currency),
    time: getRelativeTime(tx.created_at),
    status: getActivityStatus(tx.status),
  }))
}

function processCurrencyPairs(transactions: any[]) {
  const pairStats: { [key: string]: { volume: number; count: number } } = {}

  transactions.forEach((tx) => {
    const pair = `${tx.send_currency} → ${tx.receive_currency}`
    if (!pairStats[pair]) {
      pairStats[pair] = { volume: 0, count: 0 }
    }
    pairStats[pair].volume += tx.send_amount
    pairStats[pair].count += 1
  })

  const totalVolume = Object.values(pairStats).reduce((sum, stat) => sum + stat.volume, 0)

  return Object.entries(pairStats)
    .map(([pair, stats]) => ({
      pair,
      volume: totalVolume > 0 ? (stats.volume / totalVolume) * 100 : 0,
      transactions: stats.count,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4)
}

function getActivityType(status: string) {
  switch (status) {
    case "completed":
      return "transaction_completed"
    case "failed":
      return "transaction_failed"
    case "pending":
    case "processing":
      return "transaction_pending"
    default:
      return "transaction_pending"
  }
}

function getActivityMessage(transaction: any) {
  switch (transaction.status) {
    case "completed":
      return `Transaction ${transaction.transaction_id} completed successfully`
    case "failed":
      return `Transaction ${transaction.transaction_id} failed`
    case "pending":
      return `New transaction ${transaction.transaction_id} awaiting verification`
    default:
      return `Transaction ${transaction.transaction_id} is being processed`
  }
}

function getActivityStatus(status: string) {
  switch (status) {
    case "completed":
      return "success"
    case "failed":
      return "error"
    case "pending":
    case "processing":
      return "warning"
    default:
      return "info"
  }
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
  return `${Math.floor(diffInMinutes / 1440)} days ago`
}

function formatCurrency(amount: number, currency = "NGN") {
  const symbols: { [key: string]: string } = {
    NGN: "₦",
    RUB: "₽",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }
  return `${symbols[currency] || ""}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
