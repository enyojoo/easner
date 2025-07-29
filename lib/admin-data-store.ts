import { supabase } from "./supabase"

interface AdminData {
  users: any[]
  transactions: any[]
  currencies: any[]
  exchangeRates: any[]
  stats: {
    totalUsers: number
    activeUsers: number
    verifiedUsers: number
    totalTransactions: number
    totalVolume: number
    pendingTransactions: number
  }
  recentActivity: any[]
  currencyPairs: any[]
  lastUpdated: number
}

class AdminDataStore {
  private data: AdminData | null = null
  private loading = false
  private refreshInterval: NodeJS.Timeout | null = null
  private listeners: Set<() => void> = new Set()
  private initialized = false

  constructor() {
    // Preload data immediately when store is created
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    this.initialized = true

    // Start loading data immediately
    this.loadData().catch(console.error)
    this.startAutoRefresh()
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((callback) => callback())
  }

  getData(): AdminData | null {
    return this.data
  }

  isLoading(): boolean {
    return this.loading && !this.data
  }

  private async loadData(): Promise<AdminData> {
    this.loading = true

    try {
      // Load all data in parallel
      const [usersResult, transactionsResult, currenciesResult, exchangeRatesResult] = await Promise.all([
        this.loadUsers(),
        this.loadTransactions(),
        this.loadCurrencies(),
        this.loadExchangeRates(),
      ])

      const stats = this.calculateStats(usersResult, transactionsResult)
      const recentActivity = this.processRecentActivity(transactionsResult.slice(0, 10))
      const currencyPairs = this.processCurrencyPairs(transactionsResult.filter((t) => t.status === "completed"))

      this.data = {
        users: usersResult,
        transactions: transactionsResult,
        currencies: currenciesResult,
        exchangeRates: exchangeRatesResult,
        stats,
        recentActivity,
        currencyPairs,
        lastUpdated: Date.now(),
      }

      this.notify()
      return this.data
    } finally {
      this.loading = false
    }
  }

  private async loadUsers() {
    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    // Calculate transaction stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("send_amount, send_currency, status")
          .eq("user_id", user.id)

        const totalTransactions = transactions?.length || 0
        const totalVolume = (transactions || []).reduce((sum, tx) => {
          let amount = Number(tx.send_amount)
          if (tx.send_currency === "RUB") {
            amount = amount * 22.45 // Convert to NGN
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

  private async loadTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        user:users(first_name, last_name, email),
        recipient:recipients(full_name, bank_name, account_number)
      `)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return data || []
  }

  private async loadCurrencies() {
    const { data, error } = await supabase.from("currencies").select("*").order("code")
    if (error) throw error
    return data || []
  }

  private async loadExchangeRates() {
    const { data, error } = await supabase.from("exchange_rates").select(`
      *,
      from_currency_info:currencies!exchange_rates_from_currency_fkey(code, name, symbol),
      to_currency_info:currencies!exchange_rates_to_currency_fkey(code, name, symbol)
    `)
    if (error) throw error
    return data || []
  }

  private calculateStats(users: any[], transactions: any[]) {
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === "active").length
    const verifiedUsers = users.filter((u) => u.verification_status === "verified").length

    const totalTransactions = transactions.length
    const pendingTransactions = transactions.filter((t) => t.status === "pending" || t.status === "processing").length

    // Calculate total volume in NGN
    const completedTransactions = transactions.filter((t) => t.status === "completed")
    const totalVolume = completedTransactions.reduce((sum, tx) => {
      let amount = Number(tx.send_amount)
      if (tx.send_currency === "RUB") {
        amount = amount * 22.45
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

  private processRecentActivity(transactions: any[]) {
    return transactions.map((tx) => ({
      id: tx.id,
      type: this.getActivityType(tx.status),
      message: this.getActivityMessage(tx),
      user: tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : undefined,
      amount: this.formatCurrency(tx.send_amount, tx.send_currency),
      time: this.getRelativeTime(tx.created_at),
      status: this.getActivityStatus(tx.status),
    }))
  }

  private processCurrencyPairs(transactions: any[]) {
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

  private getActivityType(status: string) {
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

  private getActivityMessage(transaction: any) {
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

  private getActivityStatus(status: string) {
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

  private getRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  private formatCurrency(amount: number, currency = "NGN") {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      RUB: "₽",
      USD: "$",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  private startAutoRefresh() {
    // Refresh data every 5 minutes in background
    this.refreshInterval = setInterval(
      () => {
        this.loadData().catch(console.error)
      },
      5 * 60 * 1000,
    )
  }

  async updateTransactionStatus(transactionId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId)

      if (error) throw error

      // Update local data
      if (this.data) {
        this.data.transactions = this.data.transactions.map((tx) =>
          tx.transaction_id === transactionId ? { ...tx, status: newStatus } : tx,
        )
        this.data.stats = this.calculateStats(this.data.users, this.data.transactions)
        this.data.recentActivity = this.processRecentActivity(this.data.transactions.slice(0, 10))
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateUserStatus(userId: string, newStatus: string) {
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", userId)

      if (error) throw error

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
        this.data.stats = this.calculateStats(this.data.users, this.data.transactions)
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateUserVerification(userId: string, newStatus: string) {
    try {
      const { error } = await supabase.from("users").update({ verification_status: newStatus }).eq("id", userId)

      if (error) throw error

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) =>
          user.id === userId ? { ...user, verification_status: newStatus } : user,
        )
        this.data.stats = this.calculateStats(this.data.users, this.data.transactions)
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateCurrencies() {
    try {
      const [currencies, exchangeRates] = await Promise.all([this.loadCurrencies(), this.loadExchangeRates()])

      if (this.data) {
        this.data.currencies = currencies
        this.data.exchangeRates = exchangeRates
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    this.listeners.clear()
  }
}

export const adminDataStore = new AdminDataStore()
