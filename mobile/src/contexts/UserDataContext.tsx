import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { Currency, ExchangeRate, Recipient, Transaction, PaymentMethod } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, AppStateStatus } from 'react-native'

interface UserDataContextType {
  currencies: Currency[]
  exchangeRates: ExchangeRate[]
  recipients: Recipient[]
  transactions: Transaction[]
  paymentMethods: PaymentMethod[]
  loading: boolean
  refreshing: boolean // Separate flag for background refresh
  refreshCurrencies: (force?: boolean) => Promise<void>
  refreshExchangeRates: (force?: boolean) => Promise<void>
  refreshRecipients: (force?: boolean) => Promise<void>
  refreshTransactions: (force?: boolean) => Promise<void>
  refreshPaymentMethods: (force?: boolean) => Promise<void>
  refreshAll: (force?: boolean) => Promise<void>
  refreshStaleData: () => Promise<void> // Refresh only stale data
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

interface UserDataProviderProps {
  children: ReactNode
}

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  CURRENCIES: 24 * 60 * 60 * 1000, // 24 hours (rarely changes)
  EXCHANGE_RATES: 5 * 60 * 1000, // 5 minutes (changes frequently)
  RECIPIENTS: 10 * 60 * 1000, // 10 minutes
  TRANSACTIONS: 2 * 60 * 1000, // 2 minutes (changes frequently)
  PAYMENT_METHODS: 10 * 60 * 1000, // 10 minutes
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { user } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false) // Background refresh indicator
  const [dataInitialized, setDataInitialized] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Track last fetch times for stale-while-revalidate
  const lastFetchTimes = useRef<{
    currencies?: number
    exchangeRates?: number
    recipients?: number
    transactions?: number
    paymentMethods?: number
  }>({})

  // Helper to get cached data
  const getCachedData = async <T,>(key: string): Promise<{ data: T; timestamp: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(key)
      if (!cached) return null
      return JSON.parse(cached)
    } catch {
      return null
    }
  }

  // Helper to set cached data
  const setCachedData = async <T,>(key: string, data: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.warn(`Error caching ${key}:`, error)
    }
  }

  // Helper to check if data is stale
  const isStale = (lastFetchTime: number | undefined, ttl: number): boolean => {
    if (!lastFetchTime) return true
    return Date.now() - lastFetchTime > ttl
  }

  const fetchCurrencies = async (force: boolean = false, useCache: boolean = true) => {
    const CACHE_KEY = `easner_currencies_${user?.id || 'global'}`
    
    // Try to load from cache first (stale-while-revalidate)
    if (useCache && !force) {
      const cached = await getCachedData<Currency[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL.CURRENCIES)) {
        setCurrencies(cached.data)
        lastFetchTimes.current.currencies = cached.timestamp
        // Data is fresh, no need to fetch
        return
      } else if (cached) {
        // Data is stale, show cached data immediately, then refresh
        setCurrencies(cached.data)
      }
    }

    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('status', 'active')
        .order('code')

      if (error) throw error
      const currenciesData = data || []
      setCurrencies(currenciesData)
      lastFetchTimes.current.currencies = Date.now()
      await setCachedData(CACHE_KEY, currenciesData)
    } catch (error) {
      console.error('Error fetching currencies:', error)
      // Keep cached data on error
    }
  }

  const fetchExchangeRates = async (force: boolean = false, useCache: boolean = true) => {
    const CACHE_KEY = `easner_exchange_rates_${user?.id || 'global'}`
    
    // Try to load from cache first (stale-while-revalidate)
    if (useCache && !force) {
      const cached = await getCachedData<ExchangeRate[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL.EXCHANGE_RATES)) {
        setExchangeRates(cached.data)
        lastFetchTimes.current.exchangeRates = cached.timestamp
        return
      } else if (cached) {
        setExchangeRates(cached.data)
      }
    }

    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select(`
          *,
          from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
          to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
        `)
        .eq('status', 'active')

      if (error) throw error

      const formattedRates = data?.map((rate) => ({
        ...rate,
        from_currency_info: rate.from_currency_info
          ? {
              ...rate.from_currency_info,
              flag: rate.from_currency_info.flag_svg,
            }
          : undefined,
        to_currency_info: rate.to_currency_info
          ? {
              ...rate.to_currency_info,
              flag: rate.to_currency_info.flag_svg,
            }
          : undefined,
      })) || []

      setExchangeRates(formattedRates)
      lastFetchTimes.current.exchangeRates = Date.now()
      await setCachedData(CACHE_KEY, formattedRates)
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    }
  }

  const fetchRecipients = async (force: boolean = false, useCache: boolean = true) => {
    if (!user) {
      return
    }

    const CACHE_KEY = `easner_recipients_${user.id}`
    
    // Try to load from cache first (stale-while-revalidate)
    if (useCache && !force) {
      const cached = await getCachedData<Recipient[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL.RECIPIENTS)) {
        setRecipients(cached.data)
        lastFetchTimes.current.recipients = cached.timestamp
        return
      } else if (cached) {
        setRecipients(cached.data)
      }
    }

    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      const recipientsData = data || []
      setRecipients(recipientsData)
      lastFetchTimes.current.recipients = Date.now()
      await setCachedData(CACHE_KEY, recipientsData)
    } catch (error) {
      console.error('Error fetching recipients:', error)
    }
  }

  const fetchTransactions = async (force: boolean = false, useCache: boolean = true) => {
    if (!user) {
      return
    }

    const CACHE_KEY = `easner_transactions_${user.id}`
    
    // Try to load from cache first (stale-while-revalidate)
    if (useCache && !force) {
      const cached = await getCachedData<Transaction[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL.TRANSACTIONS)) {
        setTransactions(cached.data)
        lastFetchTimes.current.transactions = cached.timestamp
        return
      } else if (cached) {
        setTransactions(cached.data)
      }
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          recipient:recipients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      const transactionsData = data || []
      setTransactions(transactionsData)
      lastFetchTimes.current.transactions = Date.now()
      await setCachedData(CACHE_KEY, transactionsData)
    } catch (error: any) {
      // Handle network errors gracefully - don't log as error if it's a network issue
      if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
        console.warn('UserDataContext: Network error fetching transactions (will retry):', error?.message)
        // Keep existing transactions if network fails
        return
      }
      console.error('Error fetching transactions:', error)
      // On other errors, still set empty array to avoid stale data
      setTransactions([])
    }
  }

  const fetchPaymentMethods = async (force: boolean = false, useCache: boolean = true) => {
    if (!user) return

    const CACHE_KEY = `easner_payment_methods_${user.id}`
    
    // Try to load from cache first (stale-while-revalidate)
    if (useCache && !force) {
      const cached = await getCachedData<PaymentMethod[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL.PAYMENT_METHODS)) {
        setPaymentMethods(cached.data)
        lastFetchTimes.current.paymentMethods = cached.timestamp
        return
      } else if (cached) {
        setPaymentMethods(cached.data)
      }
    }

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('currency', { ascending: true })
        .order('is_default', { ascending: false })

      if (error) throw error
      const paymentMethodsData = data || []
      setPaymentMethods(paymentMethodsData)
      lastFetchTimes.current.paymentMethods = Date.now()
      await setCachedData(CACHE_KEY, paymentMethodsData)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const refreshCurrencies = async (force: boolean = false) => {
    setLoading(true)
    await fetchCurrencies(force, !force) // Use cache if not forced
    setLoading(false)
  }

  const refreshExchangeRates = async (force: boolean = false) => {
    setLoading(true)
    await fetchExchangeRates(force, !force)
    setLoading(false)
  }

  const refreshRecipients = async (force: boolean = false) => {
    setLoading(true)
    await fetchRecipients(force, !force)
    setLoading(false)
  }

  const refreshTransactions = async (force: boolean = false) => {
    setLoading(true)
    await fetchTransactions(force, !force)
    setLoading(false)
  }

  const refreshPaymentMethods = async (force: boolean = false) => {
    setLoading(true)
    await fetchPaymentMethods(force, !force)
    setLoading(false)
  }

  // Refresh only stale data (for background refresh)
  const refreshStaleData = async () => {
    if (refreshing) return // Prevent multiple simultaneous refreshes
    
    setRefreshing(true)
    try {
      const refreshPromises: Promise<void>[] = []
      
      // Check each data type and refresh if stale
      if (isStale(lastFetchTimes.current.currencies, CACHE_TTL.CURRENCIES)) {
        refreshPromises.push(fetchCurrencies(false, false))
      }
      if (isStale(lastFetchTimes.current.exchangeRates, CACHE_TTL.EXCHANGE_RATES)) {
        refreshPromises.push(fetchExchangeRates(false, false))
      }
      if (isStale(lastFetchTimes.current.recipients, CACHE_TTL.RECIPIENTS)) {
        refreshPromises.push(fetchRecipients(false, false))
      }
      if (isStale(lastFetchTimes.current.transactions, CACHE_TTL.TRANSACTIONS)) {
        refreshPromises.push(fetchTransactions(false, false))
      }
      if (isStale(lastFetchTimes.current.paymentMethods, CACHE_TTL.PAYMENT_METHODS)) {
        refreshPromises.push(fetchPaymentMethods(false, false))
      }
      
      await Promise.all(refreshPromises)
    } catch (error) {
      console.error('UserDataContext: Error refreshing stale data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Priority-based initial load: critical data first, then rest
  const refreshAll = async (force: boolean = false) => {
    setLoading(true)
    
    try {
      // Phase 1: Critical data (load first for fast UI)
      await Promise.all([
        fetchExchangeRates(force, !force), // Exchange rates needed for currency conversion
        fetchTransactions(force, !force), // Recent transactions for dashboard
      ])
      
      // Phase 2: Non-critical data (load in background)
      await Promise.all([
        fetchCurrencies(force, !force),
        fetchRecipients(force, !force),
        fetchPaymentMethods(force, !force),
      ])
    } catch (error) {
      console.error('UserDataContext: Error in refreshAll:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize data on login
  useEffect(() => {
    if (user && user.id && !dataInitialized) {
      setDataInitialized(true)
      setIsClearing(false)
      
      // Initialize data immediately when user is available
      // Uses stale-while-revalidate: shows cached data immediately, then refreshes
      const initializeData = async () => {
        try {
          setLoading(true)
          await refreshAll(false) // Not forced - will use cache if available
        } catch (error) {
          console.error('UserDataContext: Error initializing data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      initializeData()
    } else if (!user && !isClearing) {
      setIsClearing(true)
      setDataInitialized(false)
      // Clear data when user logs out
      setCurrencies([])
      setExchangeRates([])
      setRecipients([])
      setTransactions([])
      setPaymentMethods([])
      lastFetchTimes.current = {}
      
      // Clear cache
      if (user?.id) {
        AsyncStorage.multiRemove([
          `easner_currencies_${user.id}`,
          `easner_exchange_rates_${user.id}`,
          `easner_recipients_${user.id}`,
          `easner_transactions_${user.id}`,
          `easner_payment_methods_${user.id}`,
        ]).catch(() => {})
      }
    }
  }, [user, dataInitialized, isClearing])

  // Background refresh when app comes to foreground
  useEffect(() => {
    if (!user?.id || !dataInitialized) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - refresh stale data in background
        // App came to foreground, refresh stale data
        refreshStaleData()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [user?.id, dataInitialized])

  const value = {
    currencies,
    exchangeRates,
    recipients,
    transactions,
    paymentMethods,
    loading,
    refreshing,
    refreshCurrencies,
    refreshExchangeRates,
    refreshRecipients,
    refreshTransactions,
    refreshPaymentMethods,
    refreshAll,
    refreshStaleData,
  }

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}
