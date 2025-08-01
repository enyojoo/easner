import { transactionService, recipientService, currencyService, paymentMethodService } from "./database"

interface UserData {
  transactions: any[]
  recipients: any[]
  currencies: any[]
  exchangeRates: any[]
  paymentMethods: any[]
  lastUpdated: number
}

class UserDataStore {
  private data: UserData = {
    transactions: [],
    recipients: [],
    currencies: [],
    exchangeRates: [],
    paymentMethods: [],
    lastUpdated: 0,
  }

  private listeners: Set<() => void> = new Set()
  private refreshInterval: NodeJS.Timeout | null = null
  private currentUserId: string | null = null
  private isLoading = false
  private initPromise: Promise<UserData> | null = null

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((callback) => callback())
  }

  async initialize(userId: string) {
    // If already initializing for this user, return the existing promise
    if (this.currentUserId === userId && this.initPromise) {
      return this.initPromise
    }

    // If data is fresh for this user, return immediately
    if (this.currentUserId === userId && this.isDataFresh()) {
      return this.data
    }

    this.currentUserId = userId

    // Create initialization promise
    this.initPromise = this.loadData(userId, false)

    try {
      await this.initPromise
      this.startBackgroundRefresh(userId)
      return this.data
    } finally {
      this.initPromise = null
    }
  }

  private async loadData(userId: string, silent = false) {
    if (this.isLoading && !silent) return this.data

    try {
      this.isLoading = true

      // Load all data in parallel with better error handling
      const [currencies, exchangeRates, paymentMethods] = await Promise.allSettled([
        currencyService.getAll(),
        currencyService.getExchangeRates(),
        paymentMethodService.getAll(),
      ])

      // Load user-specific data in parallel
      const [transactions, recipients] = await Promise.allSettled([
        transactionService.getByUserId(userId),
        recipientService.getByUserId(userId),
      ])

      this.data = {
        transactions: transactions.status === "fulfilled" ? transactions.value || [] : [],
        recipients: recipients.status === "fulfilled" ? recipients.value || [] : [],
        currencies: currencies.status === "fulfilled" ? currencies.value || [] : [],
        exchangeRates: exchangeRates.status === "fulfilled" ? exchangeRates.value || [] : [],
        paymentMethods: paymentMethods.status === "fulfilled" ? paymentMethods.value || [] : [],
        lastUpdated: Date.now(),
      }

      if (!silent) {
        this.notify()
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      // Don't throw error, return partial data
    } finally {
      this.isLoading = false
    }

    return this.data
  }

  private isDataFresh(): boolean {
    const tenMinutes = 10 * 60 * 1000 // Increased from 5 minutes
    return Date.now() - this.data.lastUpdated < tenMinutes
  }

  private startBackgroundRefresh(userId: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(
      () => {
        this.loadData(userId, true) // Silent refresh
      },
      10 * 60 * 1000, // Increased to 10 minutes
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

  getPaymentMethods() {
    return this.data.paymentMethods
  }

  // Optimistic updates for better UX
  async refreshRecipients(userId: string) {
    try {
      const recipients = await recipientService.refreshUserRecipients(userId)
      this.data.recipients = recipients || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing recipients:", error)
    }
  }

  async refreshTransactions(userId: string) {
    try {
      const transactions = await transactionService.refreshUserTransactions(userId)
      this.data.transactions = transactions || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  // Add optimistic transaction
  addOptimisticTransaction(transaction: any) {
    this.data.transactions = [transaction, ...this.data.transactions]
    this.notify()
  }

  // Update transaction status optimistically
  updateTransactionStatus(transactionId: string, status: string) {
    const index = this.data.transactions.findIndex((t) => t.transaction_id === transactionId)
    if (index !== -1) {
      this.data.transactions[index] = {
        ...this.data.transactions[index],
        status,
        updated_at: new Date().toISOString(),
      }
      this.notify()
    }
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.listeners.clear()
    this.currentUserId = null
    this.initPromise = null
  }
}

export const userDataStore = new UserDataStore()
