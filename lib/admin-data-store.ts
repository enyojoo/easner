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
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    this.initialized = true

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
      const response = await fetch('/api/admin/data', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
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

      // Force reload data from server
      await this.loadData()
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

      // Force reload data from server
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

      // Force reload data from server
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

      // Force reload data from server
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateExchangeRates(updates: any[]) {
    try {
      const response = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'exchange_rates',
          data: updates
        })
      })

      if (!response.ok) throw new Error('Failed to update exchange rates')

      // Force reload data from server
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async addCurrency(currencyData: any) {
    try {
      const response = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'currency',
          data: currencyData
        })
      })

      if (!response.ok) throw new Error('Failed to add currency')

      const newCurrency = await response.json()

      // Force reload data from server
      await this.loadData()
      return newCurrency
    } catch (error) {
      throw error
    }
  }

  async deleteCurrency(currencyId: string) {
    try {
      const response = await fetch(`/api/admin/rates?id=${currencyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete currency')

      // Force reload data from server
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async updateCurrencies() {
    try {
      await this.loadData()
    } catch (error) {
      throw error
    }
  }

  async refreshDataForBaseCurrencyChange() {
    try {
      await this.loadData()
    } catch (error) {
      console.error("Error refreshing data for base currency change:", error)
    }
  }

  // Force refresh method for manual refresh
  async forceRefresh() {
    await this.loadData()
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    this.listeners.clear()
  }
}

export const adminDataStore = new AdminDataStore()
