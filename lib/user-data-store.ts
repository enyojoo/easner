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

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((callback) => callback())
  }

  async initialize(userId: string) {
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
    return result
  }

  private async loadData(userId: string, silent = false): Promise<UserData> {
    if (this.isLoading && !silent) return this.data

    try {
      this.isLoading = true

      // Load currencies and exchange rates in parallel (they don't depend on userId)
      const [currenciesPromise, exchangeRatesPromise] = await Promise.allSettled([
        currencyService.getAll(),
        currencyService.getExchangeRates(),
      ])

      // Load user-specific data in parallel
      const [transactionsPromise, recipientsPromise] = await Promise.allSettled([
        transactionService.getByUserId(userId, 20), // Limit to 20 most recent
        recipientService.getByUserId(userId),
      ])

      // Extract results with fallbacks
      const currencies = currenciesPromise.status === "fulfilled" ? currenciesPromise.value || [] : []
      const exchangeRates = exchangeRatesPromise.status === "fulfilled" ? exchangeRatesPromise.value || [] : []
      const transactions = transactionsPromise.status === "fulfilled" ? transactionsPromise.value || [] : []
      const recipients = recipientsPromise.status === "fulfilled" ? recipientsPromise.value || [] : []

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

  private isDataFresh(): boolean {
    const threeMinutes = 3 * 60 * 1000 // Reduced from 5 minutes
    return Date.now() - this.data.lastUpdated < threeMinutes
  }

  private startBackgroundRefresh(userId: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    // Reduced refresh interval for better UX
    this.refreshInterval = setInterval(
      () => {
        this.loadData(userId, true) // Silent refresh
      },
      3 * 60 * 1000, // 3 minutes instead of 5
    )
  }

  getData() {
    return this.data
  }

  getTransactions() {
    return this.data.transactions
  }

  getRecipients() {
    return this.data.recipients
  }

  getCurrencies() {
    return this.data.currencies
  }

  getExchangeRates() {
    return this.data.exchangeRates
  }

  async refreshRecipients(userId: string) {
    try {
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
      const transactions = await transactionService.getByUserId(userId, 20)
      this.data.transactions = transactions || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  // Add method to get fresh data when needed
  async getFreshData(userId: string) {
    return await this.loadData(userId)
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.listeners.clear()
    this.currentUserId = null
    this.loadingPromise = null
  }
}

export const userDataStore = new UserDataStore()
