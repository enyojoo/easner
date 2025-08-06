import { transactionService, recipientService, currencyService } from "./database"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  private subscriptions: any[] = []

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

    if (this.isLoading && this.currentUserId === userId && this.loadingPromise) {
      return this.loadingPromise
    }

    this.currentUserId = userId
    this.loadingPromise = this.loadData(userId)
    const result = await this.loadingPromise
    this.startBackgroundRefresh(userId)
    this.startActivityMonitoring()
    this.setupRealtimeSubscriptions(userId)
    return result
  }

  private setupRealtimeSubscriptions(userId: string) {
    // Clean up existing subscriptions
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    this.subscriptions = []

    // Subscribe to user's transactions
    const transactionSub = supabase
      .channel(`user-transactions-${userId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          console.log('User transaction change detected, refreshing...')
          this.refreshTransactions(userId)
        }
      )
      .subscribe()

    // Subscribe to user's recipients
    const recipientSub = supabase
      .channel(`user-recipients-${userId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'recipients',
          filter: `user_id=eq.${userId}`
        },
        () => {
          console.log('User recipient change detected, refreshing...')
          this.refreshRecipients(userId)
        }
      )
      .subscribe()

    // Subscribe to currency and exchange rate changes
    const currencySub = supabase
      .channel(`user-currencies-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'currencies' },
        () => {
          console.log('Currency change detected, refreshing...')
          this.refreshCurrencies()
        }
      )
      .subscribe()

    const rateSub = supabase
      .channel(`user-rates-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exchange_rates' },
        () => {
          console.log('Exchange rate change detected, refreshing...')
          this.refreshExchangeRates()
        }
      )
      .subscribe()

    this.subscriptions = [transactionSub, recipientSub, currencySub, rateSub]
  }

  private async loadData(userId: string, silent = false): Promise<UserData> {
    if (this.isLoading && !silent) return this.data

    try {
      this.isLoading = true
      this.updateActivity()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Data loading timeout")), 15000),
      )

      const dataPromise = Promise.allSettled([
        currencyService.getAll(),
        currencyService.getExchangeRates(),
        transactionService.getByUserId(userId, 20),
        recipientService.getByUserId(userId),
      ])

      const results = (await Promise.race([dataPromise, timeoutPromise])) as PromiseSettledResult<any>[]

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
      return this.data
    } finally {
      this.isLoading = false
      this.loadingPromise = null
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

    this.refreshInterval = setInterval(
      async () => {
        try {
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
          if (this.lastActivity > fiveMinutesAgo) {
            await this.loadData(userId, true)
          }
        } catch (error) {
          console.error("Background refresh error:", error)
        }
      },
      60 * 1000,
    )
  }

  private startActivityMonitoring() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
    }

    this.activityCheckInterval = setInterval(() => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000

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

  async refreshCurrencies() {
    try {
      this.updateActivity()
      const currencies = await currencyService.getAll()
      this.data.currencies = currencies || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing currencies:", error)
    }
  }

  async refreshExchangeRates() {
    try {
      this.updateActivity()
      const exchangeRates = await currencyService.getExchangeRates()
      this.data.exchangeRates = exchangeRates || []
      this.data.lastUpdated = Date.now()
      this.notify()
    } catch (error) {
      console.error("Error refreshing exchange rates:", error)
    }
  }

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
    
    // Clean up subscriptions
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    this.subscriptions = []
    
    this.listeners.clear()
    this.currentUserId = null
    this.loadingPromise = null
  }
}

export const userDataStore = new UserDataStore()
