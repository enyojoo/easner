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

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
        this.notify()
      }
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

      // Update local data
      if (this.data) {
        this.data.users = this.data.users.map((user) =>
          user.id === userId ? { ...user, verification_status: newStatus } : user,
        )
        this.notify()
      }
    } catch (error) {
      throw error
    }
  }

  async updateCurrencyStatus(currencyId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/currencies/${currencyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update currency status')
      }

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
      const response = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update exchange rates')
      }

      // Reload data to get fresh exchange rates
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async addCurrency(currencyData: any) {
    try {
      const response = await fetch('/api/admin/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currencyData),
      })

      if (!response.ok) {
        throw new Error('Failed to add currency')
      }

      const newCurrency = await response.json()

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
      const response = await fetch(`/api/admin/currencies/${currencyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete currency')
      }

      // Update local data immediately
      if (this.data) {
        const currency = this.data.currencies.find((c) => c.id === currencyId)
        this.data.currencies = this.data.currencies.filter((c) => c.id !== currencyId)
        if (currency) {
          this.data.exchangeRates = this.data.exchangeRates.filter(
            (rate) => rate.from_currency !== currency.code && rate.to_currency !== currency.code,
          )
        }
        this.notify()
      }
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
