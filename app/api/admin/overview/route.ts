import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const supabase = createServerClient()

    const [usersRes, transactionsRes, currenciesRes, exchangeRatesRes, baseCurrencyRes] = await Promise.all([
      supabase.from("users").select("*"),
      supabase
        .from("transactions")
        .select(`*, user:users(first_name, last_name, email), recipient:recipients(full_name, bank_name, account_number)`) 
        .order("created_at", { ascending: false }) 
        .limit(200),
      supabase.from("currencies").select("*").order("code"),
      supabase
        .from("exchange_rates")
        .select(`*, from_currency_info:currencies!exchange_rates_from_currency_fkey(code, name, symbol), to_currency_info:currencies!exchange_rates_to_currency_fkey(code, name, symbol)`),
      supabase.from("system_settings").select("value").eq("key", "base_currency").single(),
    ])

    const users = usersRes.data || []
    const transactions = transactionsRes.data || []
    const currencies = currenciesRes.data || []
    const exchangeRates = exchangeRatesRes.data || []
    const baseCurrency = baseCurrencyRes.data?.value || "NGN"

    // Stats
    const totalUsers = users.length
    const activeUsers = users.filter((u: any) => u.status === "active").length
    const verifiedUsers = users.filter((u: any) => u.verification_status === "verified").length
    const totalTransactions = transactions.length
    const pendingTransactions = transactions.filter((t: any) => t.status === "pending" || t.status === "processing").length

    // Volume (best-effort using send_amount; for exact, convert by rates server-side if needed)
    const totalVolume = (transactions || [])
      .filter((t: any) => t.status === "completed")
      .reduce((sum: number, t: any) => sum + Number(t.send_amount || 0), 0)

    // Recent activity
    const recentActivity = (transactions || []).slice(0, 10).map((tx: any) => ({
      id: tx.id,
      type:
        tx.status === "completed"
          ? "transaction_completed"
          : tx.status === "failed"
          ? "transaction_failed"
          : "transaction_pending",
      message:
        tx.status === "completed"
          ? `Transaction ${tx.transaction_id} completed successfully`
          : tx.status === "failed"
          ? `Transaction ${tx.transaction_id} failed`
          : `New transaction ${tx.transaction_id} awaiting verification`,
      user: tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : undefined,
      amount: tx.send_amount,
      time: tx.created_at,
      status:
        tx.status === "completed" ? "success" : tx.status === "failed" ? "error" : "warning",
    }))

    // Currency pair popularity
    const pairStats: Record<string, { volume: number; count: number }> = {}
    transactions
      .filter((t: any) => t.status === "completed")
      .forEach((tx: any) => {
        const pair = `${tx.send_currency} → ${tx.receive_currency}`
        if (!pairStats[pair]) pairStats[pair] = { volume: 0, count: 0 }
        pairStats[pair].volume += Number(tx.send_amount || 0)
        pairStats[pair].count += 1
      })
    const totalPairVolume = Object.values(pairStats).reduce((sum, s) => sum + s.volume, 0)
    const currencyPairs = Object.entries(pairStats)
      .map(([pair, stats]) => ({
        pair,
        volume: totalPairVolume > 0 ? (stats.volume / totalPairVolume) * 100 : 0,
        transactions: stats.count,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4)

    const stats = { totalUsers, activeUsers, verifiedUsers, totalTransactions, totalVolume, pendingTransactions }

    return NextResponse.json({ users, transactions, currencies, exchangeRates, baseCurrency, stats, recentActivity, currencyPairs, lastUpdated: Date.now() })
  } catch (error) {
    console.error("Admin overview error:", error)
    return NextResponse.json({ error: "Admin overview failed" }, { status: 500 })
  }
}

