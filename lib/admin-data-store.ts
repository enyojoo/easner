import { supabase } from "./supabase"

interface AdminData {
  users: any[]
  transactions: any[]
  currencies: any[]
  exchangeRates: any[]
  earlyAccessRequests: any[]
  baseCurrency: string
  stats: {
    totalUsers: number
    activeUsers: number
    verifiedUsers: number
    totalTransactions: number
    totalVolume: number
    pendingTransactions: number
  }
  earlyAccessStats: {
    total: number
    pending: number
    approved: number
    contacted: number
  }
  recentActivity: any[]
  currencyPairs: any[]
  lastUpdated: number
}

class AdminDataStore {
  private data: AdminData | null = null
  private loading = false
  private refreshInterval: ReturnType<typeof setInterval> | null = null
  private listeners: Set<() => void> = new Set()
  private initialized = false
  private loadingPromise: Promise<AdminData> | null = null
  private realtimeChannels: ReturnType<typeof supabase.channel>[] = []

  constructor() {
    // Don't preload data immediately - wait for explicit initialization
    // this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    this.initialized = true

    // Start loading data immediately
    this.loadData().catch(console.error)
    this.startAutoRefresh()
    this.setupRealtimeSubscriptions()
  }

  // Public method to initialize when user is authenticated
  // Skip admin check since we already know from auth context
  async initializeWhenReady() {
    // Return existing loading promise if already loading
    if (this.loading && this.loadingPromise) {
      return this.loadingPromise
    }

    // Check if data is fresh (loaded within last minute)
    if (this.isDataFresh()) {
      return this.data
    }

    console.log("AdminDataStore: Initializing...")
    await this.initialize()
  }

  // Direct initialize method (used when admin status is already confirmed)
  async initializeDirect() {
    // Try to load from cache first (for instant page loads)
    if (!this.data) {
      this.loadFromCache()
      if (this.data) {
        // Notify listeners with cached data immediately
        this.notify()
      }
    }

    // If data is fresh, return immediately
    if (this.initialized && this.isDataFresh()) {
      return this.data
    }

    // Return existing loading promise if already loading
    if (this.loading && this.loadingPromise) {
      return this.loadingPromise
    }

    if (!this.initialized) {
      this.initialized = true
      this.startAutoRefresh()
      this.setupRealtimeSubscriptions()
    }

    // Load fresh data in background (will update cache)
    this.loadingPromise = this.loadData()
    return this.loadingPromise
  }

  private isDataFresh(): boolean {
    if (!this.data) {
      // Try to load from localStorage cache
      this.loadFromCache()
      if (!this.data) return false
    }
    // Extend freshness to 5 minutes since we have real-time updates
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - this.data.lastUpdated < fiveMinutes
  }

  private saveToCache() {
    if (typeof window === 'undefined' || !this.data) return
    try {
      const cacheKey = 'admin_data_cache'
      const cacheData = {
        data: this.data,
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('AdminDataStore: Error saving to cache:', error)
    }
  }

  private loadFromCache(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const cacheKey = 'admin_data_cache'
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return false

      const { data, timestamp } = JSON.parse(cached)
      // Check if cache is still fresh (5 minutes)
      const fiveMinutes = 5 * 60 * 1000
      if (Date.now() - timestamp < fiveMinutes) {
        this.data = data
        console.log('AdminDataStore: Loaded data from cache')
        return true
      } else {
        // Cache expired, remove it
        localStorage.removeItem(cacheKey)
        return false
      }
    } catch (error) {
      console.error('AdminDataStore: Error loading from cache:', error)
      return false
    }
  }

  private clearCache() {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('admin_data_cache')
    } catch (error) {
      console.error('AdminDataStore: Error clearing cache:', error)
    }
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
    if (this.loading && this.loadingPromise) {
      return this.loadingPromise
    }

    this.loading = true

    try {
      // Create timeout promise (15 seconds)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Data loading timeout")), 15000),
      )

      // Load critical data first (transactions, currencies, exchange rates, base currency)
      // These are needed for dashboard stats and can be shown immediately
      const criticalDataPromise = Promise.allSettled([
        this.loadTransactions(),
        this.loadCurrencies(),
        this.loadExchangeRates(),
        this.getAdminBaseCurrency(),
      ])

      const criticalResults = (await Promise.race([criticalDataPromise, timeoutPromise])) as PromiseSettledResult<any>[]

      // Extract critical results with fallbacks
      const transactionsResult = criticalResults[0].status === "fulfilled" ? criticalResults[0].value || [] : (this.data?.transactions || [])
      const currenciesResult = criticalResults[1].status === "fulfilled" ? criticalResults[1].value || [] : (this.data?.currencies || [])
      const exchangeRatesResult = criticalResults[2].status === "fulfilled" ? criticalResults[2].value || [] : (this.data?.exchangeRates || [])
      const baseCurrency = criticalResults[3].status === "fulfilled" ? criticalResults[3].value || "NGN" : (this.data?.baseCurrency || "NGN")

      // Calculate stats from transactions (we'll update with user count later)
      const tempStats = await this.calculateStatsFromTransactions(transactionsResult, baseCurrency)
      const recentActivity = this.processRecentActivity(transactionsResult.slice(0, 10))
      const currencyPairs = this.processCurrencyPairs(transactionsResult.filter((t) => t.status === "completed"))

      // Create initial data structure with critical data and notify listeners
      this.data = {
        users: this.data?.users || [], // Keep existing users or empty array
        transactions: transactionsResult,
        currencies: currenciesResult,
        exchangeRates: exchangeRatesResult,
        earlyAccessRequests: this.data?.earlyAccessRequests || [], // Will load in background
        baseCurrency,
        stats: tempStats,
        earlyAccessStats: this.data?.earlyAccessStats || { total: 0, pending: 0, approved: 0, contacted: 0 },
        recentActivity,
        currencyPairs,
        lastUpdated: Date.now(),
      }

      // Notify listeners with critical data immediately
      this.notify()

      // Load users and early access requests in background (these take longer)
      const backgroundDataPromise = Promise.allSettled([
        this.loadUsers(transactionsResult), // Pass transactions to avoid re-querying
        this.loadEarlyAccessRequests(),
      ])

      const backgroundResults = (await Promise.race([backgroundDataPromise, timeoutPromise])) as PromiseSettledResult<any>[]

      // Extract background results
      const usersResult = backgroundResults[0].status === "fulfilled" ? backgroundResults[0].value || [] : (this.data?.users || [])
      const earlyAccessResult = backgroundResults[1].status === "fulfilled" ? backgroundResults[1].value || [] : (this.data?.earlyAccessRequests || [])

      // Recalculate stats with actual user count
      const stats = await this.calculateStats(usersResult, transactionsResult, baseCurrency)
      const earlyAccessStats = this.calculateEarlyAccessStats(earlyAccessResult)

      // Update data with background-loaded data
      this.data = {
        users: usersResult,
        transactions: transactionsResult,
        currencies: currenciesResult,
        exchangeRates: exchangeRatesResult,
        earlyAccessRequests: earlyAccessResult,
        baseCurrency,
        stats,
        earlyAccessStats,
        recentActivity,
        currencyPairs,
        lastUpdated: Date.now(),
      }

      // Notify listeners again with complete data
      this.notify()
      
      // Save to cache for next page load
      this.saveToCache()
      
      return this.data
    } catch (error) {
      console.error("Error loading admin data:", error)
      // Return existing data on error to prevent blank screens
      if (this.data) {
        return this.data
      }
      // Try to load from cache as fallback
      if (this.loadFromCache()) {
        this.notify()
        return this.data
      }
      // If no existing data, return minimal structure
      throw error
    } finally {
      this.loading = false
      this.loadingPromise = null
    }
  }

  private async loadUsers(transactions?: any[]) {
    try {
      console.log("AdminDataStore: Loading users...")
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("AdminDataStore: Error loading users:", error)
        throw error
      }
      console.log("AdminDataStore: Users loaded successfully:", users?.length || 0)

      // Get auth users data to include email_confirmed_at
      let authUsers = null
      try {
        const response = await fetch('/api/admin/auth-users')
        if (response.ok) {
          const data = await response.json()
          authUsers = { users: data.users }
        } else {
          console.error("AdminDataStore: Error loading auth users:", response.statusText)
        }
      } catch (error) {
        console.error("AdminDataStore: Error fetching auth users:", error)
      }

      // Calculate transaction stats for each user from already-loaded transactions
      // This avoids N+1 queries - much faster!
      const transactionMap = new Map<string, any[]>()
      if (transactions && transactions.length > 0) {
        transactions.forEach((tx) => {
          const userId = tx.user_id
          if (!transactionMap.has(userId)) {
            transactionMap.set(userId, [])
          }
          transactionMap.get(userId)!.push(tx)
        })
      }

      const usersWithStats = (users || []).map((user) => {
        const userTransactions = transactionMap.get(user.id) || []
        const totalTransactions = userTransactions.length
        const totalVolume = userTransactions.reduce((sum, tx) => {
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

        // Find corresponding auth user to get email_confirmed_at
        const authUser = authUsers?.users?.find(au => au.id === user.id)
        
        return {
          ...user,
          totalTransactions,
          totalVolume,
          // Use email_confirmed_at from auth system for verification status
          email_confirmed_at: authUser?.email_confirmed_at,
          // Keep verification_status for backward compatibility but use email_confirmed_at as source of truth
          verification_status: authUser?.email_confirmed_at ? "verified" : (user.verification_status || "unverified"),
        }
      })

      return usersWithStats
    } catch (error) {
      console.error("Error loading users:", error)
      return [] // Return empty array on error to prevent crashes
    }
  }

  private async loadTransactions() {
    try {
      console.log("AdminDataStore: Loading transactions...")
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          user:users(first_name, last_name, email),
          recipient:recipients(full_name, bank_name, account_number, routing_number, sort_code, iban, swift_bic, currency)
        `)
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) {
        console.error("AdminDataStore: Error loading transactions:", error)
        throw error
      }
      console.log("AdminDataStore: Transactions loaded successfully:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("Error loading transactions:", error)
      return [] // Return empty array on error to prevent crashes
    }
  }

  private async loadCurrencies() {
    try {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .order("code", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error loading currencies:", error)
      return [] // Return empty array on error to prevent crashes
    }
  }

  private async loadExchangeRates() {
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select(`
          *,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(code, name, symbol),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(code, name, symbol)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error loading exchange rates:", error)
      return [] // Return empty array on error to prevent crashes
    }
  }

  private async loadEarlyAccessRequests() {
    try {
      console.log("AdminDataStore: Loading early access requests...")
      const { data, error } = await supabase
        .from("early_access_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("AdminDataStore: Error loading early access requests:", error)
        throw error
      }
      console.log("AdminDataStore: Early access requests loaded successfully:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("Error loading early access requests:", error)
      return [] // Return empty array on error to prevent crashes
    }
  }

  private async calculateStatsFromTransactions(transactions: any[], baseCurrency: string) {
    const totalTransactions = transactions.length
    const pendingTransactions = transactions.filter((t) => t.status === "pending" || t.status === "processing").length

    // Calculate total volume in admin's base currency
    const completedTransactions = transactions.filter((t) => t.status === "completed")
    const totalVolume = await this.calculateVolumeInBaseCurrency(completedTransactions, baseCurrency)

    return {
      totalUsers: 0, // Will be updated when users load
      activeUsers: 0,
      verifiedUsers: 0,
      totalTransactions,
      totalVolume,
      pendingTransactions,
    }
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

  private calculateEarlyAccessStats(requests: any[]) {
    const total = requests.length
    const pending = requests.filter((r) => r.status === "pending").length
    const approved = requests.filter((r) => r.status === "approved").length
    const contacted = requests.filter((r) => r.status === "contacted").length

    return {
      total,
      pending,
      approved,
      contacted,
    }
  }

  private async getAdminBaseCurrency(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "base_currency")
        .single()

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
      case "cancelled":
        return "transaction_cancelled"
      case "processing":
        return "transaction_processing"
      case "pending":
        return "transaction_pending"
      default:
        return "transaction_pending"
    }
  }

  private getActivityMessage(transaction: any) {
    switch (transaction.status) {
      case "completed":
        return `Transfer Complete - Transaction ${transaction.transaction_id}`
      case "failed":
        return `Transaction Failed - ${transaction.transaction_id}`
      case "cancelled":
        return `Transfer Cancelled - Transaction ${transaction.transaction_id}`
      case "processing":
        return `Payment Received - Transaction ${transaction.transaction_id}`
      case "pending":
        return `Transaction Created - ${transaction.transaction_id}`
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
      case "cancelled":
        return "error"
      case "processing":
        return "warning"
      case "pending":
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
    // Refresh data every 30 seconds in background (as fallback if real-time fails)
    this.refreshInterval = setInterval(
      () => {
        this.loadData().catch(console.error)
      },
      30 * 1000, // 30 seconds
    )
  }

  private setupRealtimeSubscriptions() {
    // Clean up any existing channels
    this.cleanupRealtimeSubscriptions()

    // Subscribe to transactions table changes
    const transactionsChannel = supabase
      .channel('admin-transactions')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
        },
        async (payload) => {
          console.log('AdminDataStore: Transaction change received via Realtime:', payload.eventType)
          // Reload transactions and recalculate stats
          await this.refreshTransactionsAndStats()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdminDataStore: Subscribed to transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('AdminDataStore: Transactions subscription error')
        }
      })

    // Subscribe to users table changes
    const usersChannel = supabase
      .channel('admin-users')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'users',
        },
        async (payload) => {
          console.log('AdminDataStore: User change received via Realtime:', payload.eventType)
          // Reload users and recalculate stats
          await this.refreshUsersAndStats()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdminDataStore: Subscribed to users real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('AdminDataStore: Users subscription error')
        }
      })

    // Subscribe to currencies table changes
    const currenciesChannel = supabase
      .channel('admin-currencies')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'currencies',
        },
        async (payload) => {
          console.log('AdminDataStore: Currency change received via Realtime:', payload.eventType)
          // Reload currencies
          await this.refreshCurrencies()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdminDataStore: Subscribed to currencies real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('AdminDataStore: Currencies subscription error')
        }
      })

    // Subscribe to exchange_rates table changes
    const exchangeRatesChannel = supabase
      .channel('admin-exchange-rates')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'exchange_rates',
        },
        async (payload) => {
          console.log('AdminDataStore: Exchange rate change received via Realtime:', payload.eventType)
          // Reload exchange rates
          await this.refreshExchangeRates()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdminDataStore: Subscribed to exchange rates real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('AdminDataStore: Exchange rates subscription error')
        }
      })

    // Subscribe to early_access_requests table changes
    const earlyAccessChannel = supabase
      .channel('admin-early-access')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'early_access_requests',
        },
        async (payload) => {
          console.log('AdminDataStore: Early access request change received via Realtime:', payload.eventType)
          // Reload early access requests
          await this.refreshEarlyAccessRequests()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdminDataStore: Subscribed to early access requests real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('AdminDataStore: Early access requests subscription error')
        }
      })

    // Store channels for cleanup
    this.realtimeChannels = [
      transactionsChannel,
      usersChannel,
      currenciesChannel,
      exchangeRatesChannel,
      earlyAccessChannel,
    ]
  }

  private async refreshTransactionsAndStats() {
    if (!this.data) return

    try {
      const transactionsResult = await this.loadTransactions()
      const stats = await this.calculateStats(this.data.users, transactionsResult, this.data.baseCurrency)
      const recentActivity = this.processRecentActivity(transactionsResult.slice(0, 10))
      const currencyPairs = this.processCurrencyPairs(transactionsResult.filter((t) => t.status === "completed"))

      this.data.transactions = transactionsResult
      this.data.stats = stats
      this.data.recentActivity = recentActivity
      this.data.currencyPairs = currencyPairs
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error('AdminDataStore: Error refreshing transactions:', error)
    }
  }

  private async refreshUsersAndStats() {
    if (!this.data) return

    try {
      // Pass existing transactions to avoid re-querying
      const usersResult = await this.loadUsers(this.data.transactions)
      const stats = await this.calculateStats(usersResult, this.data.transactions, this.data.baseCurrency)

      this.data.users = usersResult
      this.data.stats = stats
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error('AdminDataStore: Error refreshing users:', error)
    }
  }

  private async refreshCurrencies() {
    if (!this.data) return

    try {
      const currenciesResult = await this.loadCurrencies()
      this.data.currencies = currenciesResult
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error('AdminDataStore: Error refreshing currencies:', error)
    }
  }

  private async refreshExchangeRates() {
    if (!this.data) return

    try {
      const exchangeRatesResult = await this.loadExchangeRates()
      this.data.exchangeRates = exchangeRatesResult
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error('AdminDataStore: Error refreshing exchange rates:', error)
    }
  }

  private async refreshEarlyAccessRequests() {
    if (!this.data) return

    try {
      const earlyAccessResult = await this.loadEarlyAccessRequests()
      const earlyAccessStats = this.calculateEarlyAccessStats(earlyAccessResult)

      this.data.earlyAccessRequests = earlyAccessResult
      this.data.earlyAccessStats = earlyAccessStats
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error('AdminDataStore: Error refreshing early access requests:', error)
    }
  }

  private cleanupRealtimeSubscriptions() {
    this.realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.realtimeChannels = []
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

      if (error) {
        throw error
      }

      // Update local data after successful update
      if (this.data) {
        this.data.transactions = this.data.transactions.map((tx) =>
          tx.transaction_id === transactionId ? { ...tx, status: newStatus } : tx,
        )
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
        this.data.recentActivity = this.processRecentActivity(this.data.transactions.slice(0, 10))
        this.notify()
      }

      // Send email notification in background (non-blocking)
      console.log('AdminDataStore: Sending email notification for transaction:', transactionId, 'status:', newStatus)
      this.sendEmailNotification(transactionId, newStatus).catch(error => {
        console.error('Email notification failed:', error)
        // Don't throw - email failure shouldn't break the status update
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Send email notification in background (non-blocking)
   */
  private async sendEmailNotification(transactionId: string, status: string): Promise<void> {
    try {
      console.log('AdminDataStore: sendEmailNotification called for:', transactionId, status)
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      // Send user notification email only (no admin notification for status updates)
      console.log('AdminDataStore: Sending user notification email')
      const userResponse = await fetch(`${baseUrl}/api/send-email-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'transaction',
          transactionId,
          status
        })
      })
      
      console.log('AdminDataStore: User email notification response:', userResponse.status, userResponse.statusText)
      const userResponseData = await userResponse.json()
      console.log('AdminDataStore: User email notification response data:', userResponseData)
    } catch (error) {
      console.error('Failed to send email notification:', error)
      // Don't throw - this is non-blocking
    }
  }

  async updateUserStatus(userId: string, newStatus: string) {
    try {
      console.log(`AdminDataStore: Updating user ${userId} status to ${newStatus}`)
      
      const { error } = await supabase
        .from("users")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) => 
          user.id === userId ? { ...user, status: newStatus, updated_at: new Date().toISOString() } : user
        )
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
        this.notify()
        console.log("Local data updated successfully")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      throw error
    }
  }

  async updateUserVerification(userId: string, newStatus: string) {
    try {
      console.log(`AdminDataStore: Updating user ${userId} verification to ${newStatus}`)
      
      const { error } = await supabase
        .from("users")
        .update({
          verification_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) => 
          user.id === userId ? { ...user, verification_status: newStatus, updated_at: new Date().toISOString() } : user
        )
        this.data.stats = await this.calculateStats(this.data.users, this.data.transactions, this.data.baseCurrency)
        this.notify()
        console.log("Local data updated successfully")
      }
    } catch (error) {
      console.error("Error updating user verification:", error)
      throw error
    }
  }

  async updateEarlyAccessRequestStatus(requestId: string, newStatus: string, notes?: string) {
    try {
      console.log(`AdminDataStore: Updating early access request ${requestId} status to ${newStatus}`)
      
      const { error } = await supabase
        .from("early_access_requests")
        .update({
          status: newStatus,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      // Update local data
      if (this.data) {
        this.data.earlyAccessRequests = this.data.earlyAccessRequests.map((request) => 
          request.id === requestId ? { ...request, status: newStatus, notes: notes || null, updated_at: new Date().toISOString() } : request
        )
        this.data.earlyAccessStats = this.calculateEarlyAccessStats(this.data.earlyAccessRequests)
        this.notify()
        console.log("Early access request data updated successfully")
      }
    } catch (error) {
      console.error("Error updating early access request status:", error)
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

  async updateCurrency(currencyId: string, updates: { can_send?: boolean; can_receive?: boolean; [key: string]: any }) {
    try {
      // Update database first
      const { error } = await supabase
        .from("currencies")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currencyId)

      if (error) throw error

      // Update local data immediately after successful database update
      if (this.data) {
        this.data.currencies = this.data.currencies.map((currency) =>
          currency.id === currencyId
            ? { ...currency, ...updates, updated_at: new Date().toISOString() }
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

  // Method to manually refresh all data
  async refreshAllData() {
    try {
      console.log("AdminDataStore: Manually refreshing all data...")
      await this.loadData()
      console.log("AdminDataStore: Data refresh completed")
    } catch (error) {
      console.error("Error refreshing all data:", error)
    }
  }

  // Email Templates methods
  async loadEmailTemplates() {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_type", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error loading email templates:", error)
      throw error
    }
  }

  // Payment Methods methods
  async loadPaymentMethods() {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("currency", { ascending: true })
        .order("is_default", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error loading payment methods:", error)
      throw error
    }
  }

  async createPaymentMethod(paymentMethod: any) {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .insert([paymentMethod])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating payment method:", error)
      throw error
    }
  }

  async updatePaymentMethod(id: string, paymentMethod: any) {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .update(paymentMethod)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating payment method:", error)
      throw error
    }
  }

  async deletePaymentMethod(id: string) {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting payment method:", error)
      throw error
    }
  }

  async updatePaymentMethodStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating payment method status:", error)
      throw error
    }
  }

  async setDefaultPaymentMethod(id: string, currency: string) {
    try {
      // First, unset all defaults for this currency
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", currency)

      // Then set the selected payment method as default
      const { data, error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error setting default payment method:", error)
      throw error
    }
  }

  async createEmailTemplate(template: any) {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .insert([template])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating email template:", error)
      throw error
    }
  }

  async updateEmailTemplate(id: string, template: any) {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .update(template)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating email template:", error)
      throw error
    }
  }

  async deleteEmailTemplate(id: string) {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting email template:", error)
      throw error
    }
  }

  async updateEmailTemplateStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating email template status:", error)
      throw error
    }
  }

  async setDefaultEmailTemplate(id: string, templateType: string) {
    try {
      // First, unset all defaults for this template type
      await supabase
        .from("email_templates")
        .update({ is_default: false })
        .eq("template_type", templateType)

      // Then set the selected template as default
      const { data, error } = await supabase
        .from("email_templates")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error setting default email template:", error)
      throw error
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    this.cleanupRealtimeSubscriptions()
    this.listeners.clear()
    // Note: We keep cache in localStorage for next session
  }

  // Method to clear cache (useful for logout or forced refresh)
  clearDataCache() {
    this.clearCache()
    this.data = null
    this.initialized = false
  }
}

export const adminDataStore = new AdminDataStore()
