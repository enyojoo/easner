import { createClient } from '@supabase/supabase-js'

// Client for real-time subscriptions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  private subscriptions: any[] = []

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    this.initialized = true

    // Load initial data
    await this.forceRefresh()
    
    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions()
    
    // Reduced refresh interval since we have real-time updates
    this.startAutoRefresh()
  }

  private setupRealtimeSubscriptions() {
    // Subscribe to transaction changes
    const transactionSub = supabase
      .channel('admin-transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          console.log('Transaction change detected, refreshing data...')
          this.forceRefresh()
        }
      )
      .subscribe()

    // Subscribe to user changes
    const userSub = supabase
      .channel('admin-users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          console.log('User change detected, refreshing data...')
          this.forceRefresh()
        }
      )
      .subscribe()

    // Subscribe to currency changes
    const currencySub = supabase
      .channel('admin-currencies')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'currencies' },
        () => {
          console.log('Currency change detected, refreshing data...')
          this.forceRefresh()
        }
      )
      .subscribe()

    // Subscribe to exchange rate changes
    const rateSub = supabase
      .channel('admin-rates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exchange_rates' },
        () => {
          console.log('Exchange rate change detected, refreshing data...')
          this.forceRefresh()
        }
      )
      .subscribe()

    this.subscriptions = [transactionSub, userSub, currencySub, rateSub]
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
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/data?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error loading admin data:', error)
      throw error
    }
  }

  async forceRefresh(): Promise<AdminData> {
    this.loading = true

    try {
      const newData = await this.loadData()
      this.data = newData
      this.notify()
      return newData
    } catch (error) {
      console.error('Error refreshing admin data:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  private startAutoRefresh() {
    // Reduced to 2 minutes since we have real-time updates
    this.refreshInterval = setInterval(
      () => {
        this.forceRefresh().catch(console.error)
      },
      2 * 60 * 1000,
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

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating transaction status:', error)
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

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating user status:', error)
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

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating user verification:', error)
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update currency status')
      }

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating currency status:', error)
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update exchange rates')
      }

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating exchange rates:', error)
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add currency')
      }

      const newCurrency = await response.json()

      // Force immediate refresh
      await this.forceRefresh()

      return newCurrency
    } catch (error) {
      console.error('Error adding currency:', error)
      throw error
    }
  }

  async deleteCurrency(currencyId: string) {
    try {
      const response = await fetch(`/api/admin/rates?id=${currencyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete currency')
      }

      // Force immediate refresh
      await this.forceRefresh()
    } catch (error) {
      console.error('Error deleting currency:', error)
      throw error
    }
  }

  async updateCurrencies() {
    try {
      await this.forceRefresh()
    } catch (error) {
      console.error('Error updating currencies:', error)
      throw error
    }
  }

  async refreshDataForBaseCurrencyChange() {
    try {
      await this.forceRefresh()
    } catch (error) {
      console.error('Error refreshing data for base currency change:', error)
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    
    // Clean up subscriptions
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    
    this.listeners.clear()
  }
}

export const adminDataStore = new AdminDataStore()
