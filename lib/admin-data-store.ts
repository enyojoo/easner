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
  private refreshInterval: ReturnType<typeof setInterval> | null = null
  private listeners: Set<() => void> = new Set()
  private initialized = false

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
  }

  // Public method to initialize when user is authenticated
  async initializeWhenReady() {
    // Check if user is admin by checking if they exist in admin_users table
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log("AdminDataStore: No user found, not initializing")
        return
      }

      // Check if user is admin by querying admin_users table
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!adminUser) {
        console.log("AdminDataStore: User is not admin, not initializing")
        return
      }

      console.log("AdminDataStore: User is admin, initializing...")
      await this.initialize()
    } catch (error) {
      console.error("AdminDataStore: Error checking admin status:", error)
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

      // Calculate transaction stats for each user and include auth data
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const { data: transactions } = await supabase
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
        }),
      )

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
          recipient:recipients(full_name, bank_name, account_number)
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
      
      // Call server-side API route for email sending
      console.log('AdminDataStore: Making fetch request to /api/send-email-notification')
      const response = await fetch('/api/send-email-notification', {
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
      
      console.log('AdminDataStore: Email notification response:', response.status, response.statusText)
      const responseData = await response.json()
      console.log('AdminDataStore: Email notification response data:', responseData)
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
    this.listeners.clear()
  }
}

export const adminDataStore = new AdminDataStore()
