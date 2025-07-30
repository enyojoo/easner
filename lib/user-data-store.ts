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

    this.currentUserId = userId
    await this.loadData(userId)
    this.startBackgroundRefresh(userId)
    return this.data
  }

  private async loadData(userId: string, silent = false) {
    if (this.isLoading) return

    try {
      this.isLoading = true

      const [transactions, recipients, currencies, exchangeRates] = await Promise.all([
        transactionService.getByUserId(userId),
        recipientService.getByUserId(userId),
        currencyService.getAll(),
        currencyService.getExchangeRates(),
      ])

      this.data = {
        transactions: transactions || [],
        recipients: recipients || [],
        currencies: currencies || [],
        exchangeRates: exchangeRates || [],
        lastUpdated: Date.now(),
      }

      if (!silent) {
        this.notify()
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      this.isLoading = false
    }
  }

  private isDataFresh(): boolean {
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - this.data.lastUpdated < fiveMinutes
  }

  private startBackgroundRefresh(userId: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(
      () => {
        this.loadData(userId, true) // Silent refresh
      },
      5 * 60 * 1000,
    ) // 5 minutes
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
      const transactions = await transactionService.getByUserId(userId)
      this.data.transactions = transactions || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.listeners.clear()
    this.currentUserId = null
  }
}

export const userDataStore = new UserDataStore()
