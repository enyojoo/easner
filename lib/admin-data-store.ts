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
      // Fetch data from server-side API route
      const response = await fetch('/api/admin/data')
      if (!response.ok) {
        throw new Error('Failed to fetch admin data')
      }

      this.data = await response.json()
      this.notify()
      return this.data
    } catch (error) {
      console.error('Error loading admin data:', error)
      throw error
    } finally {
      this.loading = false
    }
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
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transaction status')
      }

      // Update local data
      if (this.data) {
        this.data.transactions = this.data.transactions.map((tx) =>
          tx.transaction_id === transactionId ? { ...tx, status: newStatus } : tx,
        )
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateUserStatus(userId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Reload fresh data from server
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateUserVerification(userId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user verification')
      }

      // Reload fresh data from server  
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateCurrencyStatus(currencyId: string, newStatus: string) {
    try {
      const response = await fetch('/api/admin/rates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'currency_status',
          id: currencyId,
          data: { status: newStatus }
        })
      })

      if (!response.ok) throw new Error('Failed to update currency status')

      // Reload fresh data from server
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateExchangeRates(updates: any[]) {
    try {
      const { error } = await supabase.from("exchange_rates").upsert(updates, {
        onConflict: "from_currency,to_currency",
        ignoreDuplicates: false,
      })

      if (error) throw error

      // Reload data to get fresh exchange rates
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async addCurrency(currencyData: any) {
    try {
      const { data: newCurrency, error } = await supabase.from("currencies").insert(currencyData).select().single()

      if (error) throw error

      // Reload fresh data from server instead of local update
      await this.loadData()
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

      // Reload fresh data from server instead of local update
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateCurrencies() {
    try {
      // Reload all data to get fresh currencies and exchange rates
      await this.loadData()
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
