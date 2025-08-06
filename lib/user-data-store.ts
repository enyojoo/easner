import { transactionService, recipientService, currencyService } from "./database"

interface UserData {
  transactions: any[]
  recipients: any[]
  currencies: any[]
  exchangeRates: any[]
  lastUpdated: number
}

class UserDataStore {
  private data: UserData = {
    transactions: [],
    recipients: [],
    currencies: [],
    exchangeRates: [],
    lastUpdated: 0,
  }

  private listeners: Set<() => void> = new Set()
  private refreshInterval: NodeJS.Timeout | null = null
  private currentUserId: string | null = null
  private isLoading = false
  private loadingPromise: Promise<UserData> | null = null
  private lastActivity = Date.now()
  private activityCheckInterval: NodeJS.Timeout | null = null

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    this.updateActivity()
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.updateActivity()
    this.listeners.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("Error in data store listener:", error)
      }
    })
  }

  private updateActivity() {
    this.lastActivity = Date.now()
  }

  async initialize(userId: string) {
    this.updateActivity()

    if (this.currentUserId === userId && this.isDataFresh()) {
      return this.data
    }

    // Return existing loading promise if already loading for this user
    if (this.isLoading && this.currentUserId === userId && this.loadingPromise) {
      return this.loadingPromise
    }

    this.currentUserId = userId
    this.loadingPromise = this.loadData(userId)
    const result = await this.loadingPromise
    this.startBackgroundRefresh(userId)
    this.startActivityMonitoring()
    return result
  }

  private async loadData(userId: string, silent = false): Promise<UserData> {
    if (this.isLoading && !silent) return this.data

    try {
      this.isLoading = true
      this.updateActivity()

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Data loading timeout")), 15000),
      )

      // Load all data with timeout protection - using service calls that respect RLS
      const dataPromise = Promise.allSettled([
        this.loadCurrenciesWithCache(),
        this.loadExchangeRatesWithCache(),
        transactionService.getByUserId(userId, 20),
        recipientService.getByUserId(userId),
      ])

      const results = (await Promise.race([dataPromise, timeoutPromise])) as PromiseSettledResult<any>[]

      // Extract results with fallbacks
      const currencies = results[0].status === "fulfilled" ? results[0].value || [] : this.data.currencies
      const exchangeRates = results[1].status === "fulfilled" ? results[1].value || [] : this.data.exchangeRates
      const transactions = results[2].status === "fulfilled" ? results[2].value || [] : this.data.transactions
      const recipients = results[3].status === "fulfilled" ? results[3].value || [] : this.data.recipients

      this.data = {
        transactions,
        recipients,
        currencies,
        exchangeRates,
        lastUpdated: Date.now(),
      }

      if (!silent) {
        this.notify()
      }

      return this.data
    } catch (error) {
      console.error("Error loading user data:", error)
      // Return existing data on error to prevent blank screens
      return this.data
    } finally {
      this.isLoading = false
      this.loadingPromise = null
    }
  }

  // Cache currencies and exchange rates since they change less frequently
  private currenciesCache: { data: any[], timestamp: number } | null = null
  private exchangeRatesCache: { data: any[], timestamp: number } | null = null
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private async loadCurrenciesWithCache() {
    const now = Date.now()
    
    if (this.currenciesCache && (now - this.currenciesCache.timestamp) < this.CACHE_TTL) {
      return this.currenciesCache.data
    }

    try {
      const currencies = await currencyService.getAll()
      this.currenciesCache = { data: currencies, timestamp: now }
      return currencies
    } catch (error) {
      console.error("Error loading currencies:", error)
      return this.currenciesCache?.data || []
    }
  }

  private async loadExchangeRatesWithCache() {
    const now = Date.now()
    
    if (this.exchangeRatesCache && (now - this.exchangeRatesCache.timestamp) < this.CACHE_TTL) {
      return this.exchangeRatesCache.data
    }

    try {
      const exchangeRates = await currencyService.getExchangeRates()
      this.exchangeRatesCache = { data: exchangeRates, timestamp: now }
      return exchangeRates
    } catch (error) {
      console.error("Error loading exchange rates:", error)
      return this.exchangeRatesCache?.data || []
    }
  }

  private isDataFresh(): boolean {
    const oneMinute = 60 * 1000
    return Date.now() - this.data.lastUpdated < oneMinute
  }

  private startBackgroundRefresh(userId: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    // Auto refresh every 30 seconds for more real-time updates
    this.refreshInterval = setInterval(
      async () => {
        try {
          // Only refresh if there's been recent activity
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
          if (this.lastActivity > fiveMinutesAgo) {
            await this.loadData(userId, true)
          }
        } catch (error) {
          console.error("Background refresh error:", error)
        }
      },
      30 * 1000, // 30 seconds
    )
  }

  private startActivityMonitoring() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
    }

    // Check for inactivity every 30 seconds
    this.activityCheckInterval = setInterval(() => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000

      // If no activity for 10 minutes, stop background refresh
      if (this.lastActivity < tenMinutesAgo) {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval)
          this.refreshInterval = null
        }
      }
    }, 30 * 1000)
  }

  getData() {
    this.updateActivity()
    return this.data
  }

  getTransactions() {
    this.updateActivity()
    return this.data.transactions
  }

  getRecipients() {
    this.updateActivity()
    return this.data.recipients
  }

  getCurrencies() {
    this.updateActivity()
    return this.data.currencies
  }

  getExchangeRates() {
    this.updateActivity()
    return this.data.exchangeRates
  }

  async refreshRecipients(userId: string) {
    try {
      this.updateActivity()
      const recipients = await recipientService.getByUserId(userId)
      this.data.recipients = recipients || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing recipients:", error)
    }
  }

  async refreshTransactions(userId: string) {
    try {
      this.updateActivity()
      const transactions = await transactionService.getByUserId(userId, 20)
      this.data.transactions = transactions || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  // Force refresh all data
  async forceRefresh(userId: string) {
    this.updateActivity()
    // Clear caches to force fresh data
    this.currenciesCache = null
    this.exchangeRatesCache = null
    return await this.loadData(userId)
  }

  // Invalidate caches when data changes
  invalidateCaches() {
    this.currenciesCache = null
    this.exchangeRatesCache = null
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
      this.activityCheckInterval = null
    }
    this.listeners.clear()
    this.currentUserId = null
    this.loadingPromise = null
    this.currenciesCache = null
    this.exchangeRatesCache = null
  }
}

export const userDataStore = new UserDataStore()
