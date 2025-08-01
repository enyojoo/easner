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
  private abortController: AbortController | null = null

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    // Use setTimeout to prevent blocking the main thread
    setTimeout(() => {
      this.listeners.forEach((callback) => {
        try {
          callback()
        } catch (error) {
          console.error("Error in data store listener:", error)
        }
      })
    }, 0)
  }

  async initialize(userId: string) {
    // If same user and data is fresh, return immediately
    if (this.currentUserId === userId && this.isDataFresh()) {
      return this.data
    }

    // Cancel any ongoing requests for different user
    if (this.currentUserId !== userId && this.abortController) {
      this.abortController.abort()
      this.abortController = null
      this.loadingPromise = null
    }

    // Return existing loading promise if already loading for this user
    if (this.isLoading && this.currentUserId === userId && this.loadingPromise) {
      try {
        return await this.loadingPromise
      } catch (error) {
        console.error("Error waiting for existing load:", error)
        // Reset and try again
        this.isLoading = false
        this.loadingPromise = null
      }
    }

    this.currentUserId = userId
    this.abortController = new AbortController()
    this.loadingPromise = this.loadData(userId, false, this.abortController.signal)

    try {
      const result = await this.loadingPromise
      this.startBackgroundRefresh(userId)
      return result
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Data loading was aborted")
      } else {
        console.error("Error initializing user data:", error)
      }
      return this.data
    } finally {
      this.loadingPromise = null
      this.abortController = null
    }
  }

  private async loadData(userId: string, silent = false, signal?: AbortSignal): Promise<UserData> {
    if (this.isLoading && !silent) return this.data

    try {
      this.isLoading = true

      // Check if request was aborted
      if (signal?.aborted) {
        throw new Error("Request aborted")
      }

      // Load currencies and exchange rates in parallel (they don't depend on userId)
      const globalDataPromise = Promise.allSettled([currencyService.getAll(), currencyService.getExchangeRates()])

      // Load user-specific data in parallel
      const userDataPromise = Promise.allSettled([
        transactionService.getByUserId(userId),
        recipientService.getByUserId(userId),
      ])

      const [globalResults, userResults] = await Promise.all([globalDataPromise, userDataPromise])

      // Check if request was aborted after async operations
      if (signal?.aborted) {
        throw new Error("Request aborted")
      }

      // Extract results with fallbacks
      const [currenciesResult, exchangeRatesResult] = globalResults
      const [transactionsResult, recipientsResult] = userResults

      const currencies = currenciesResult.status === "fulfilled" ? currenciesResult.value || [] : []
      const exchangeRates = exchangeRatesResult.status === "fulfilled" ? exchangeRatesResult.value || [] : []
      const transactions = transactionsResult.status === "fulfilled" ? transactionsResult.value || [] : []
      const recipients = recipientsResult.status === "fulfilled" ? recipientsResult.value || [] : []

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
      if (error.name === "AbortError" || error.message === "Request aborted") {
        throw error
      }
      console.error("Error loading user data:", error)
      // Return existing data on error to prevent blank screens
      return this.data
    } finally {
      this.isLoading = false
    }
  }

  private isDataFresh(): boolean {
    const twoMinutes = 2 * 60 * 1000 // Reduced to 2 minutes for better responsiveness
    return Date.now() - this.data.lastUpdated < twoMinutes
  }

  private startBackgroundRefresh(userId: string) {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }

    // Set up new interval
    this.refreshInterval = setInterval(
      () => {
        // Only refresh if we're still on the same user
        if (this.currentUserId === userId && !this.isLoading) {
          this.loadData(userId, true).catch((error) => {
            console.error("Background refresh error:", error)
          })
        }
      },
      2 * 60 * 1000,
    ) // 2 minutes
  }

  getData() {
    return { ...this.data } // Return a copy to prevent mutations
  }

  getTransactions() {
    return [...this.data.transactions] // Return a copy
  }

  getRecipients() {
    return [...this.data.recipients] // Return a copy
  }

  getCurrencies() {
    return [...this.data.currencies] // Return a copy
  }

  getExchangeRates() {
    return [...this.data.exchangeRates] // Return a copy
  }

  async refreshRecipients(userId: string) {
    if (this.currentUserId !== userId) return

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
    if (this.currentUserId !== userId) return

    try {
      const transactions = await transactionService.getByUserId(userId)
      this.data.transactions = transactions || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  // Force refresh data
  async getFreshData(userId: string) {
    this.data.lastUpdated = 0 // Force refresh
    return await this.initialize(userId)
  }

  cleanup() {
    // Cancel any ongoing requests
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    // Clear interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }

    // Clear listeners
    this.listeners.clear()

    // Reset state
    this.currentUserId = null
    this.loadingPromise = null
    this.isLoading = false
  }

  // Get loading state
  getLoadingState() {
    return {
      isLoading: this.isLoading,
      currentUserId: this.currentUserId,
      lastUpdated: this.data.lastUpdated,
      listenersCount: this.listeners.size,
    }
  }
}

export const userDataStore = new UserDataStore()
