import { supabase } from "./supabase"

interface AdminData {
  users: any[]
  transactions: any[]
  currencies: any[]
  exchangeRates: any[]
  baseCurrency: string
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
      const [usersResult, transactionsResult, currenciesResult, exchangeRatesResult, baseCurrency] = await Promise.all([
        this.loadUsers(),
        this.loadTransactions(),
        this.loadCurrencies(),
        this.loadExchangeRates(),
        this.getAdminBaseCurrency(),
      ])

      const stats = await this.calculateStats(usersResult, transactionsResult, baseCurrency)
      const recentActivity = this.processRecentActivity(transactionsResult.slice(0, 10))
      const currencyPairs = this.processCurrencyPairs(transactionsResult.filter((t) => t.status === "completed"))

      this.data = {
        users: usersResult,
        transactions: transactionsResult,
        currencies: currenciesResult,
        exchangeRates: exchangeRatesResult,
        baseCurrency,
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
          .eq("status", "completed") // Only completed transactions

        const totalTransactions = transactions?.length || 0

        // Calculate total volume in user's base currency (same logic as user dashboard)
        const baseCurrency = user.base_currency || "NGN"
        let totalVolumeInBaseCurrency = 0

        for (const transaction of transactions || []) {
          let amountInBaseCurrency = Number(transaction.send_amount)

          // If transaction currency is different from user's base currency, convert it
          if (transaction.send_currency !== baseCurrency) {
            // Find exchange rate from transaction currency to base currency
            const rate = this.data?.exchangeRates?.find(
              (r) => r.from_currency === transaction.send_currency && r.to_currency === baseCurrency,
            )

            if (rate) {
              amountInBaseCurrency = transaction.send_amount * rate.rate
            } else {
              // If direct rate not found, try reverse rate
              const reverseRate = this.data?.exchangeRates?.find(
                (r) => r.from_currency === baseCurrency && r.to_currency === transaction.send_currency,
              )
              if (reverseRate && reverseRate.rate > 0) {
                amountInBaseCurrency = transaction.send_amount / reverseRate.rate
              } else {
                // Fallback to hardcoded rates for conversion to NGN
                switch (transaction.send_currency) {
                  case "RUB":
                    amountInBaseCurrency = transaction.send_amount * (baseCurrency === "NGN" ? 18.2 : 0.011)
                    break
                  case "USD":
                    amountInBaseCurrency = transaction.send_amount * (baseCurrency === "NGN" ? 1650 : 0.00061)
                    break
                  case "EUR":
                    amountInBaseCurrency = transaction.send_amount * (baseCurrency === "NGN" ? 1750 : 0.00057)
                    break
                  case "GBP":
                    amountInBaseCurrency = transaction.send_amount * (baseCurrency === "NGN" ? 2000 : 0.0005)
                    break
                  default:
                    // Keep original amount if currency not recognized
                    break
                }
              }
            }
          }

          totalVolumeInBaseCurrency += amountInBaseCurrency
        }

        return {
          ...user,
          totalTransactions,
          totalVolume: totalVolumeInBaseCurrency,
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

  private async calculateStats(users: any[], transactions: any[], baseCurrency: string) {
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === "active").length
    const verifiedUsers = users.filter((u) => u.verification_status === "verified").length

    const totalTransactions = transactions.length
    const pendingTransactions = transactions.filter((t) => t.status === "pending" || t.status === "processing").length

    // Calculate total volume in admin's base currency
    const completedTransactions = transactions.filter((t) => t.status === "completed")
    const totalVolume = await this.calculateVolumeInBaseCurrency(completedTransactions, baseCurrency)

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalTransactions,
      totalVolume,
      pendingTransactions,
    }
  }

  private async getAdminBaseCurrency(): Promise<string> {
    try {
      const { data, error } = await supabase.from("system_settings").select("value").eq("key", "base_currency").single()

      if (error || !data) return "NGN" // Default to NGN
      return data.value
    } catch {
      return "NGN" // Default fallback
    }
  }

  private async calculateVolumeInBaseCurrency(transactions: any[], baseCurrency: string): Promise<number> {
    let totalVolume = 0

    for (const tx of transactions) {
      const amount = Number(tx.send_amount)
      const fromCurrency = tx.send_currency

      if (fromCurrency === baseCurrency) {
        // Same currency, no conversion needed
        totalVolume += amount
      } else {
        // Convert using exchange rate
        const convertedAmount = await this.convertCurrency(amount, fromCurrency, baseCurrency)
        totalVolume += convertedAmount
      }
    }

    return totalVolume
  }

  private async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      // Get exchange rate from database
      const { data: rate, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency", fromCurrency)
        .eq("to_currency", toCurrency)
        .eq("status", "active")
        .single()

      if (error || !rate) {
        // Fallback to hardcoded rates if no rate found
        return this.convertWithFallbackRates(amount, fromCurrency, toCurrency)
      }

      return amount * rate.rate
    } catch {
      // Fallback to hardcoded rates
      return this.convertWithFallbackRates(amount, fromCurrency, toCurrency)
    }
  }

  private convertWithFallbackRates(amount: number, fromCurrency: string, toCurrency: string): number {
    // Fallback exchange rates (these should be updated regularly)
    const rates: { [key: string]: { [key: string]: number } } = {
      NGN: {
        RUB: 0.011,
        USD: 0.00061,
        EUR: 0.00057,
        GBP: 0.0005,
      },
      RUB: {
        NGN: 91.0,
        USD: 0.055,
        EUR: 0.052,
        GBP: 0.045,
      },
      USD: {
        NGN: 1650,
        RUB: 18.2,
        EUR: 0.93,
        GBP: 0.82,
      },
      EUR: {
        NGN: 1750,
        RUB: 19.5,
        USD: 1.08,
        GBP: 0.88,
      },
      GBP: {
        NGN: 2000,
        RUB: 22.2,
        USD: 1.22,
        EUR: 1.14,
      },
    }

    if (fromCurrency === toCurrency) return amount

    const rate = rates[fromCurrency]?.[toCurrency]
    if (rate) {
      return amount * rate
    }

    // If direct rate not found, convert through USD
    const toUsdRate = rates[fromCurrency]?.["USD"]
    const fromUsdRate = rates["USD"]?.[toCurrency]

    if (toUsdRate && fromUsdRate) {
      return amount * toUsdRate * fromUsdRate
    }

    // Last fallback - return original amount
    return amount
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
      EUR: "€",
      GBP: "£",
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
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
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
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
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
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateCurrencyStatus(currencyId: string, newStatus: string) {
    try {
      // Update database first
      const { error } = await supabase
        .from("currencies")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currencyId)

      if (error) throw error

      // Update local data immediately after successful database update
      if (this.data) {
        this.data.currencies = this.data.currencies.map((currency) =>
          currency.id === currencyId
            ? { ...currency, status: newStatus, updated_at: new Date().toISOString() }
            : currency,
        )
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateExchangeRates(updates: any[]) {
    try {
      // Update database first
      const { error } = await supabase.from("exchange_rates").upsert(updates, {
        onConflict: "from_currency,to_currency",
        ignoreDuplicates: false,
      })

      if (error) throw error

      // Reload exchange rates to get the latest data
      const freshExchangeRates = await this.loadExchangeRates()

      // Update local data immediately after successful database update
      if (this.data) {
        this.data.exchangeRates = freshExchangeRates
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async addCurrency(currencyData: any) {
    try {
      // Insert new currency
      const { data: newCurrency, error } = await supabase.from("currencies").insert(currencyData).select().single()

      if (error) throw error

      // Update local data immediately
      if (this.data) {
        this.data.currencies = [...this.data.currencies, newCurrency]
        this.notify()
      }

      return newCurrency
    } catch (error) {
      throw error
    }
  }

  async deleteCurrency(currencyId: string) {
    try {
      const currency = this.data?.currencies.find((c) => c.id === currencyId)
      if (!currency) return

      // Delete exchange rates first
      const { error: ratesError } = await supabase
        .from("exchange_rates")
        .delete()
        .or(`from_currency.eq.${currency.code},to_currency.eq.${currency.code}`)

      if (ratesError) throw ratesError

      // Delete currency
      const { error } = await supabase.from("currencies").delete().eq("id", currencyId)

      if (error) throw error

      // Update local data immediately
      if (this.data) {
        this.data.currencies = this.data.currencies.filter((c) => c.id !== currencyId)
        this.data.exchangeRates = this.data.exchangeRates.filter(
          (rate) => rate.from_currency !== currency.code && rate.to_currency !== currency.code,
        )
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

  // Method to refresh data when base currency changes
  async refreshDataForBaseCurrencyChange() {
    try {
      await this.loadData()
    } catch (error) {
      console.error("Error refreshing data for base currency change:", error)
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
