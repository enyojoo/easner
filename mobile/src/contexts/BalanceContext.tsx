import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { bridgeService } from '../lib/bridgeService'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface BalanceContextType {
  balances: { USD: string; EUR: string }
  refreshBalances: (force?: boolean) => Promise<void>
  updateBalanceOptimistically: (currency: 'USD' | 'EUR', amount: number, operation?: 'subtract' | 'add', transactionId?: string) => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function useBalance() {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}

interface BalanceProviderProps {
  children: ReactNode
}

// Cache TTL: 10 minutes (like Revolut/CashApp - balances don't change that frequently)
const BALANCE_CACHE_TTL = 10 * 60 * 1000
// Background refresh interval: 5 minutes
const BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000

export function BalanceProvider({ children }: BalanceProviderProps) {
  const { user } = useAuth()
  const [balances, setBalances] = useState<{ USD: string; EUR: string }>({ USD: '0', EUR: '0' })
  
  const lastFetchTimeRef = useRef<number>(0)
  const backgroundRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef<boolean>(false)
  const fetchBalancesRef = useRef<((force: boolean) => Promise<void>) | null>(null)
  const processedTransactionIdsRef = useRef<Set<string>>(new Set())
  const lastBalanceRefreshRef = useRef<number>(0)
  const DEBOUNCE_MS = 1000 // Debounce balance refreshes to prevent rapid API calls
  
  const BALANCE_CACHE_KEY = `easner_wallet_balances_${user?.id || 'anonymous'}`

  // Load balances from cache
  const loadCachedBalances = async (): Promise<{ USD: string; EUR: string } | null> => {
    try {
      const cached = await AsyncStorage.getItem(BALANCE_CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      
      // Return cached data if still fresh
      if (age < BALANCE_CACHE_TTL) {
        return data
      }
      
      // Cache expired, remove it
      await AsyncStorage.removeItem(BALANCE_CACHE_KEY)
      return null
    } catch (error) {
      console.warn('[BalanceContext] Error loading cached balances:', error)
      return null
    }
  }

  // Save balances to cache
  const saveBalancesToCache = async (walletBalances: { USD: string; EUR: string }) => {
    try {
      await AsyncStorage.setItem(BALANCE_CACHE_KEY, JSON.stringify({
        data: walletBalances,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.warn('[BalanceContext] Error saving balances to cache:', error)
    }
  }

  // Fetch balances from API (silent - no loading states)
  const fetchBalances = async (force: boolean = false): Promise<void> => {
    // Prevent concurrent fetches
    if (isRefreshingRef.current && !force) {
      return
    }

    // Check if we need to fetch (force or stale)
    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current
    const isStale = timeSinceLastFetch > BALANCE_CACHE_TTL
    
    // If not forcing and data is fresh, skip fetch
    if (!force && !isStale && lastFetchTimeRef.current > 0) {
      return
    }
    
    // Also check cache before fetching
    if (!force) {
      const cachedBalances = await loadCachedBalances()
      if (cachedBalances) {
        // Cache is fresh, use it and skip API call
        setBalances(cachedBalances)
        // Update lastFetchTime to prevent unnecessary fetches
        lastFetchTimeRef.current = Date.now()
        return
      }
    }

    isRefreshingRef.current = true

    try {
      const walletBalances = await Promise.race([
        bridgeService.getWalletBalances(),
        new Promise<{ USD: string; EUR: string }>((resolve) => 
          setTimeout(() => resolve({ USD: '0', EUR: '0' }), 10000)
        )
      ])
      
      setBalances(walletBalances)
      lastFetchTimeRef.current = Date.now()
      
      // Save to cache
      await saveBalancesToCache(walletBalances)
    } catch (error) {
      console.error('[BalanceContext] Error fetching balances:', error)
      // Don't update balances on error - keep existing values
    } finally {
      isRefreshingRef.current = false
    }
  }

  // Optimistic balance update (for immediate UI feedback after transactions)
  // Like CashApp/Revolut - update UI instantly, then sync in background
  const updateBalanceOptimistically = (currency: 'USD' | 'EUR', amount: number, operation: 'subtract' | 'add' = 'subtract', transactionId?: string) => {
    // Mark transaction as processed to prevent double update in real-time handler
    if (transactionId) {
      processedTransactionIdsRef.current.add(transactionId)
    }
    
    setBalances((prev) => {
      const current = parseFloat(prev[currency] || '0')
      const updated = operation === 'subtract' 
        ? Math.max(0, current - amount) // Don't go below 0 for sends
        : current + amount // Add for receives
      return {
        ...prev,
        [currency]: updated.toFixed(2),
      }
    })
    
    // Refresh in background IMMEDIATELY to get actual balance (stale-while-revalidate pattern)
    // This ensures balance is accurate within seconds, not minutes
    fetchBalances(true).catch(() => {
      // Silently fail - optimistic update already shown
    })
  }

  // Public refresh function (can be called from components)
  const refreshBalances = async (force: boolean = false) => {
    await fetchBalances(force)
  }

  // Store latest fetchBalances in ref for real-time subscription
  // Update ref whenever fetchBalances changes (which happens when user?.id changes)
  useEffect(() => {
    fetchBalancesRef.current = fetchBalances
  })

  // Initialize: Load from cache immediately, then fetch fresh data
  useEffect(() => {
    if (!user?.id) {
      setBalances({ USD: '0', EUR: '0' })
      return
    }

    const initializeBalances = async () => {
      // Load from cache immediately for instant display
      const cachedBalances = await loadCachedBalances()
      if (cachedBalances) {
        setBalances(cachedBalances)
      }
      
      // Fetch fresh data in background (stale-while-revalidate)
      await fetchBalances(false)
    }

    initializeBalances()

    // Set up background refresh interval (like Revolut/CashApp)
    backgroundRefreshIntervalRef.current = setInterval(() => {
      fetchBalances(false).catch(() => {
        // Silently fail
      })
    }, BACKGROUND_REFRESH_INTERVAL)

    return () => {
      if (backgroundRefreshIntervalRef.current) {
        clearInterval(backgroundRefreshIntervalRef.current)
      }
    }
  }, [user?.id])

  // Refresh when app comes to foreground
  useEffect(() => {
    if (!user?.id) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - refresh if stale
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current
        const isStale = timeSinceLastFetch > BALANCE_CACHE_TTL
        
        if (isStale) {
          // Load from cache first for immediate display
          loadCachedBalances().then((cached) => {
            if (cached) {
              setBalances(cached)
            }
          })
          
          // Then fetch fresh data
          fetchBalances(false).catch(() => {
            // Silently fail
          })
        }
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [user?.id])

  // Real-time subscription for transaction updates - simplified
  useEffect(() => {
    if (!user?.id) return

    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('[BalanceContext] No active session, skipping real-time subscription')
        return
      }

      try {
        channel = supabase
          .channel(`balance-updates-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bridge_transactions',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload: any) => {
              try {
                console.log('[BalanceContext] Real-time transaction update detected, refreshing balances:', payload.eventType)
                
                const txId = payload.new?.transaction_id || payload.new?.id || payload.old?.transaction_id || payload.old?.id
                
                // Skip if we've already processed this transaction (prevents double updates)
                if (txId && processedTransactionIdsRef.current.has(txId)) {
                  console.log('[BalanceContext] ⏭️ Skipping already processed transaction:', txId)
                  return
                }
                
                // For INSERT events (new transactions), we can do optimistic update based on transaction type
                if (payload.eventType === 'INSERT' && payload.new && !processedTransactionIdsRef.current.has(txId)) {
                  const tx = payload.new
                  const currencyLower = (tx.currency || '').toLowerCase()
                  const currency = currencyLower === 'usd' ? 'USD' : currencyLower === 'eur' ? 'EUR' : null
                  const amount = parseFloat(tx.amount || '0')
                  
                  if (currency && amount > 0) {
                    if (tx.transaction_type === 'receive' && tx.direction === 'credit') {
                      // Receive transaction - add to balance
                      setBalances((prev) => {
                        const current = parseFloat(prev[currency] || '0')
                        return {
                          ...prev,
                          [currency]: (current + amount).toFixed(2),
                        }
                      })
                      if (txId) processedTransactionIdsRef.current.add(txId)
                    } else if (tx.transaction_type === 'send' && tx.direction === 'debit') {
                      // Send transaction - already handled optimistically in SendAmountScreen
                      if (txId) processedTransactionIdsRef.current.add(txId)
                    }
                  }
                } else if (txId) {
                  processedTransactionIdsRef.current.add(txId)
                }
                
                // Debounce balance refresh
                const now = Date.now()
                if (now - lastBalanceRefreshRef.current < DEBOUNCE_MS) {
                  return
                }
                lastBalanceRefreshRef.current = now
                
                // Force refresh balances
                if (fetchBalancesRef.current) {
                  await fetchBalancesRef.current(true)
                }
              } catch (error: any) {
                console.error('[BalanceContext] Error processing real-time update:', error)
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[BalanceContext] ✅ Real-time subscription active')
            } else {
              console.log(`[BalanceContext] Real-time ${status}`)
            }
          })
      } catch (error) {
        console.warn('[BalanceContext] Real-time setup failed:', error)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id])

  const value: BalanceContextType = {
    balances,
    refreshBalances,
    updateBalanceOptimistically,
  }

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

