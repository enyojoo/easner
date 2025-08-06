import { create } from 'zustand'

interface AdminData {
  users: any[]
  transactions: any[]
  currencies: any[]
  exchangeRates: any[]
  settings: any[]
  isLoading: boolean
  lastFetch: number
}

interface AdminDataStore extends AdminData {
  fetchData: () => Promise<void>
  updateUser: (userId: string, updates: any) => Promise<void>
  updateTransaction: (transactionId: string, updates: any) => Promise<void>
  updateCurrencyStatus: (currencyId: string, status: string) => Promise<void>
  addCurrency: (currency: any) => Promise<void>
  deleteCurrency: (currencyId: string) => Promise<void>
  updateExchangeRates: (rates: any[]) => Promise<void>
  forceRefresh: () => Promise<void>
}

const CACHE_DURATION = 30000 // 30 seconds

export const useAdminDataStore = create<AdminDataStore>((set, get) => ({
  users: [],
  transactions: [],
  currencies: [],
  exchangeRates: [],
  settings: [],
  isLoading: false,
  lastFetch: 0,

  fetchData: async () => {
    const now = Date.now()
    const { lastFetch, isLoading } = get()
    
    // Skip if already loading or data is fresh
    if (isLoading || (now - lastFetch < CACHE_DURATION)) {
      return
    }

    set({ isLoading: true })
    
    try {
      console.log('Fetching admin data from API...')
      
      const response = await fetch('/api/admin/data', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Admin data fetched:', data)
      
      set({
        users: data.users || [],
        transactions: data.transactions || [],
        currencies: data.currencies || [],
        exchangeRates: data.exchangeRates || [],
        settings: data.settings || [],
        lastFetch: now,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
      set({ isLoading: false })
      throw error
    }
  },

  forceRefresh: async () => {
    set({ lastFetch: 0 }) // Reset cache
    await get().fetchData()
  },

  updateUser: async (userId: string, updates: any) => {
    try {
      console.log('Updating user:', userId, updates)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('User update result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  updateTransaction: async (transactionId: string, updates: any) => {
    try {
      console.log('Updating transaction:', transactionId, updates)
      
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Transaction update result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  updateCurrencyStatus: async (currencyId: string, status: string) => {
    try {
      console.log('Updating currency status:', currencyId, status)
      
      const response = await fetch('/api/admin/rates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          type: 'currency_status',
          id: currencyId,
          data: { status }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Currency status update result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error updating currency status:', error)
      throw error
    }
  },

  addCurrency: async (currency: any) => {
    try {
      console.log('Adding currency:', currency)
      
      const response = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          type: 'currency',
          data: currency
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Currency add result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error adding currency:', error)
      throw error
    }
  },

  deleteCurrency: async (currencyId: string) => {
    try {
      console.log('Deleting currency:', currencyId)
      
      const response = await fetch(`/api/admin/rates?id=${currencyId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Currency delete result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error deleting currency:', error)
      throw error
    }
  },

  updateExchangeRates: async (rates: any[]) => {
    try {
      console.log('Updating exchange rates:', rates)
      
      const response = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          type: 'exchange_rates',
          data: rates
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Exchange rates update result:', result)
      
      // Force refresh data from server
      await get().forceRefresh()
      
    } catch (error) {
      console.error('Error updating exchange rates:', error)
      throw error
    }
  }
}))
