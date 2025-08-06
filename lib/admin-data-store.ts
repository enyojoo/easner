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
      console.log('Fetching admin data from API...')
      
      const response = await fetch('/api/admin/data', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admin data: ${response.status} ${response.statusText}`)
      }

      const newData = await response.json()
      console.log('Admin data fetched successfully:', {
        users: newData.users?.length || 0,
        transactions: newData.transactions?.length || 0,
        currencies: newData.currencies?.length || 0,
        exchangeRates: newData.exchangeRates?.length || 0,
        lastUpdated: new Date(newData.lastUpdated).toLocaleString()
      })

      this.data = newData
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
        console.log('Auto-refreshing admin data...')
        this.loadData().catch(console.error)
      },
      30 * 1000, // Refresh every 30 seconds for testing
    )
  }

  async updateTransactionStatus(transactionId: string, newStatus: string) {
    try {
      console.log('Updating transaction status:', transactionId, newStatus)
      
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction status')
      }

      console.log('Transaction status updated successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error updating transaction status:', error)
      throw error
    }
  }

  async updateUserStatus(userId: string, newStatus: string) {
    try {
      console.log('Updating user status:', userId, newStatus)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user status')
      }

      console.log('User status updated successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  async updateUserVerification(userId: string, newStatus: string) {
    try {
      console.log('Updating user verification:', userId, newStatus)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user verification')
      }

      console.log('User verification updated successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error updating user verification:', error)
      throw error
    }
  }

  async updateCurrencyStatus(currencyId: string, newStatus: string) {
    try {
      console.log('Updating currency status:', currencyId, newStatus)
      
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update currency status')
      }

      console.log('Currency status updated successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error updating currency status:', error)
      throw error
    }
  }

  async updateExchangeRates(updates: any[]) {
    try {
      console.log('Updating exchange rates:', updates)
      
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update exchange rates')
      }

      console.log('Exchange rates updated successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error updating exchange rates:', error)
      throw error
    }
  }

  async addCurrency(currencyData: any) {
    try {
      console.log('Adding currency:', currencyData)
      
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add currency')
      }

      const newCurrency = await response.json()
      console.log('Currency added successfully:', newCurrency)

      // Force reload data from server
      await this.loadData()
      return newCurrency
    } catch (error) {
      console.error('Error adding currency:', error)
      throw error
    }
  }

  async deleteCurrency(currencyId: string) {
    try {
      console.log('Deleting currency:', currencyId)
      
      const response = await fetch(`/api/admin/rates?id=${currencyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete currency')
      }

      console.log('Currency deleted successfully')
      
      // Force reload data from server
      await this.loadData()
    } catch (error) {
      console.error('Error deleting currency:', error)
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
    console.log('Force refreshing admin data...')
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
