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

    // If data is fresh for this user, return immediately without reloading
    if (this.currentUserId === userId && this.isDataFresh()) {
      // Only start background refresh if not already started
      if (!this.refreshInterval) {
        this.startBackgroundRefresh(userId)
        this.startActivityMonitoring()
      }
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

      // Load all data with timeout protection
      // Fetch combined transactions (send + receive) from API
      const transactionsPromise = (async () => {
        try {
          const res = await fetch(`/api/transactions?type=all&limit=20`, {
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            return data.transactions || []
          }
          // Fallback to old method if API fails
          return await transactionService.getByUserId(userId, 20)
        } catch (error) {
          console.error("Error fetching combined transactions, falling back to send only:", error)
          // Fallback to old method if fetch fails
          return await transactionService.getByUserId(userId, 20)
        }
      })()

      const dataPromise = Promise.allSettled([
        currencyService.getAll(),
        currencyService.getExchangeRates(),
        transactionsPromise,
        recipientService.getByUserId(userId),
      ])

      const results = (await Promise.race([dataPromise, timeoutPromise])) as PromiseSettledResult<any>[]

      // Extract results with fallbacks
      const currencies = results[0].status === "fulfilled" ? results[0].value || [] : this.data.currencies
      const exchangeRates = results[1].status === "fulfilled" ? results[1].value || [] : this.data.exchangeRates
      const transactions = results[2].status === "fulfilled" ? results[2].value || [] : this.data.transactions
      const recipients = results[3].status === "fulfilled" ? results[3].value || [] : this.data.recipients

      // Only update and notify if data actually changed to prevent unnecessary re-renders
      const dataChanged = 
        JSON.stringify(transactions) !== JSON.stringify(this.data.transactions) ||
        JSON.stringify(recipients) !== JSON.stringify(this.data.recipients) ||
        JSON.stringify(currencies) !== JSON.stringify(this.data.currencies) ||
        JSON.stringify(exchangeRates) !== JSON.stringify(this.data.exchangeRates)

      if (dataChanged) {
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
      } else {
        // Update timestamp even if data didn't change to keep it fresh
        this.data.lastUpdated = Date.now()
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
    // Increase freshness window to 5 minutes to prevent unnecessary reloads
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - this.data.lastUpdated < fiveMinutes
  }

  private startBackgroundRefresh(userId: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    // Auto refresh every minute
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
      60 * 1000, // 1 minute
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
      // Fetch combined transactions (send + receive) from API
      const response = await fetch(`/api/transactions?type=all&limit=20`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        this.data.transactions = data.transactions || []
      } else {
        // Fallback to old method if API fails
        const transactions = await transactionService.getByUserId(userId, 20)
        this.data.transactions = transactions || []
      }
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  // Force refresh all data
  async forceRefresh(userId: string) {
    this.updateActivity()
    return await this.loadData(userId)
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
  }
}

export const userDataStore = new UserDataStore()
