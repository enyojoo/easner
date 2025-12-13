import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Monitor, 
  Apple, 
  ShoppingBag, 
  ArrowRight,
  Check
} from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationsContext'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'
import { useEffect } from 'react'
import { useFocusRefreshAll } from '../../hooks/useFocusRefresh'
import { useUserData } from '../../contexts/UserDataContext'
import { useFocusEffect } from '@react-navigation/native'
import { useBalance } from '../../contexts/BalanceContext'
import { apiGet, apiPost } from '../../lib/apiClient'
import { supabase } from '../../lib/supabase'
import { ShimmerListItem } from '../../components/premium'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Transaction interface for dashboard
interface DashboardTransaction {
  id: string
  transaction_id: string
  type: 'send' | 'receive'
  amount: number
  currency: string
  name?: string
  status: string
  created_at: string
  bridge_created_at?: string
  source_type?: string // 'virtual_account', 'liquidation_address', etc.
  source_liquidation_address_id?: string
  metadata?: any
}

export default function DashboardScreen({ navigation }: NavigationProps) {
  const { user, userProfile } = useAuth()
  const { unreadCount } = useNotifications()
  const { refreshStaleData, refreshing: dataRefreshing } = useUserData()
  const { balances, refreshBalances } = useBalance()
  const insets = useSafeAreaInsets()
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR'>('USD')
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true) // Start as loading until cache loads or API completes
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false) // Track if we've attempted to load data (cache or API)
  const dataLoadedRef = useRef(false)
  const realtimeSetupRef = useRef(false) // Track if real-time/polling is already set up
  const pollingStartedRef = useRef(false) // Track if polling has been started
  const hasLoggedPollingStartRef = useRef(false) // Track if we've logged polling start
  const lastSyncTimeRef = useRef(0) // Track last sync time to prevent frequent syncs
  const fetchRecentTransactionsRef = useRef<((force?: boolean, silent?: boolean) => Promise<void>) | null>(null)
  const refreshBalancesRef = useRef<((force?: boolean) => Promise<void>) | null>(null)

  // Available currencies for the dropdown (USD/EUR only)
  const availableCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: require('../../../assets/flags/us.png') },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: require('../../../assets/flags/eu.png') },
  ]

  // Cache TTL (10 minutes - same as other screens)
  const CACHE_TTL = 10 * 60 * 1000
  const CACHE_KEY = `easner_dashboard_transactions_${userProfile?.id || ''}`

  // Helper to get cached data
  const getCachedData = useCallback(async <T,>(key: string): Promise<{ data: T; timestamp: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(key)
      if (!cached) return null
      return JSON.parse(cached)
    } catch {
      return null
    }
  }, [])

  // Helper to set cached data
  const setCachedData = useCallback(async <T,>(key: string, data: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.warn(`[Dashboard] Error caching ${key}:`, error)
    }
  }, [])

  // Helper to check if data is stale
  const isStale = useCallback((timestamp: number | undefined, ttl: number): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > ttl
  }, [])

  // Fetch recent transactions with caching
  const fetchRecentTransactions = useCallback(async (force = false, silent = false) => {
    if (!userProfile?.id) return

    let cached: { data: DashboardTransaction[]; timestamp: number } | null = null

    // Try to load from cache first (stale-while-revalidate)
    // Note: Cache is already loaded on mount, so this is mainly for refresh scenarios
    if (!force) {
      cached = await getCachedData<DashboardTransaction[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL)) {
        // Data is fresh, use cache (only update if different to avoid unnecessary re-renders)
        if (JSON.stringify(cached.data) !== JSON.stringify(recentTransactions)) {
          setRecentTransactions(cached.data)
        }
        setLoadingTransactions(false)
        setHasAttemptedLoad(true)
        dataLoadedRef.current = true
        return
      } else if (cached) {
        // Data is stale, but already shown from mount - just fetch fresh in background
        // Don't update state again (already set from mount)
        setLoadingTransactions(false)
        setHasAttemptedLoad(true)
        dataLoadedRef.current = true
        // Continue to fetch fresh data in background
      }
    }

    try {
      // Only show loading if not silent and we don't have cached data
      if (!silent && (!cached || force)) {
        setLoadingTransactions(true)
      }

      const params = new URLSearchParams()
      params.append('limit', '5') // Only fetch 5 most recent for dashboard

      const response = await apiGet(`/api/bridge/transactions?${params.toString()}`)
      
      if (response.ok && !(response as any).isNetworkError) {
        const data = await response.json()
        const transactionsList = (data.transactions || []).map((tx: any) => ({
          id: tx.id,
          transaction_id: tx.transaction_id,
          type: tx.transaction_type,
          amount: tx.amount,
          currency: tx.currency,
          name: tx.name,
          status: tx.status,
          created_at: tx.created_at,
          bridge_created_at: tx.bridge_created_at,
          source_type: tx.source_type,
          source_liquidation_address_id: tx.source_liquidation_address_id,
          metadata: tx.metadata,
        }))
        
        setRecentTransactions(transactionsList)
        await setCachedData(CACHE_KEY, transactionsList)
        setHasAttemptedLoad(true)
        dataLoadedRef.current = true
      } else if ((response as any).isNetworkError) {
        // Network error - keep cached data if available
        console.warn("Network error fetching transactions, keeping cached data")
        if (!cached) {
          setRecentTransactions([])
        }
        setHasAttemptedLoad(true)
      } else {
        // Other error - set empty if no cache
        if (!cached) {
          setRecentTransactions([])
        }
        setHasAttemptedLoad(true)
      }
    } catch (error: any) {
      if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
        console.warn("Network error fetching transactions:", error?.message || 'Network unavailable')
        // Keep cached data on network error
        if (!cached) {
          setRecentTransactions([])
        }
        setHasAttemptedLoad(true)
      } else {
        console.error("Error fetching transactions:", error)
        if (!cached) {
          setRecentTransactions([])
        }
        setHasAttemptedLoad(true)
      }
    } finally {
      // Always mark that we've attempted to load (prevents empty state flash)
      setHasAttemptedLoad(true)
      // Always stop loading after API attempt completes
      setLoadingTransactions(false)
    }
  }, [userProfile?.id, CACHE_KEY, getCachedData, setCachedData, isStale, hasAttemptedLoad, recentTransactions])

  // Keep refs in sync with latest functions
  useEffect(() => {
    fetchRecentTransactionsRef.current = fetchRecentTransactions
    refreshBalancesRef.current = refreshBalances
  }, [fetchRecentTransactions, refreshBalances])

  // Load cached transactions immediately on mount (like balances - instant display)
  useEffect(() => {
    if (!userProfile?.id) {
      setRecentTransactions([])
      setLoadingTransactions(false)
      setHasAttemptedLoad(true)
      return
    }
    
    // Load cache first (like BalanceContext) - show immediately if available
    const loadCachedTransactions = async () => {
      try {
        const cached = await getCachedData<DashboardTransaction[]>(CACHE_KEY)
        if (cached && cached.data && cached.data.length > 0) {
          // Show cached data immediately, even if stale (stale-while-revalidate)
          setRecentTransactions(cached.data)
          setLoadingTransactions(false) // Stop loading since we have data
          setHasAttemptedLoad(true)
          dataLoadedRef.current = true
        } else {
          // No cache - keep loading skeleton until API completes
          // loadingTransactions already true from initial state
          setHasAttemptedLoad(false)
        }
      } catch (error) {
        // Silently fail - will fetch fresh data anyway
        // Keep loading skeleton (already true from initial state)
        setHasAttemptedLoad(false)
      }
    }
    
    loadCachedTransactions()
  }, [userProfile?.id, CACHE_KEY, getCachedData])

  // Initial load - rely on webhooks and real-time for instant updates
  // Only sync for backfill on first load (once per session)
  useEffect(() => {
    if (!userProfile?.id) return
    
    // Only trigger sync once per session for backfill
    // Webhooks and real-time handle new transactions instantly
    const triggerSync = async () => {
      const now = Date.now()
      const SYNC_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes - only for backfill
      
      if (now - lastSyncTimeRef.current < SYNC_COOLDOWN_MS) {
        // Already synced recently, skip
        return
      }
      
      try {
        lastSyncTimeRef.current = now
        // Sync in background - don't block UI
        apiPost('/api/bridge/sync-transactions').catch(() => {
          // Silently fail - webhooks/real-time handle new transactions
        })
      } catch (error) {
        // Silently fail - sync is optional, webhooks handle new transactions
      }
    }
    
    // Fetch fresh transactions in background (cache already shown above)
    fetchRecentTransactions(false)
    // Only sync once per session for backfill (webhooks handle new transactions)
    triggerSync()
  }, [userProfile?.id, fetchRecentTransactions])

  // Real-time subscription with minimal polling fallback (only when real-time fails)
  useEffect(() => {
    if (!userProfile?.id) {
      realtimeSetupRef.current = false
      pollingStartedRef.current = false
      return
    }

    // Prevent multiple setups
    if (realtimeSetupRef.current) {
      return
    }
    realtimeSetupRef.current = true
    pollingStartedRef.current = false // Reset when setting up new session
    hasLoggedPollingStartRef.current = false // Reset logging for new session

    let pollingInterval: NodeJS.Timeout | null = null
    let lastTransactionTimestamp: string | null = null
    let lastRefreshTime = 0
    let channel: ReturnType<typeof supabase.channel> | null = null
    let realtimeRetryTimeout: NodeJS.Timeout | null = null
    let isRealTimeActive = false
    let realtimeRetryCount = 0
    const DEBOUNCE_MS = 500
    const POLL_INTERVAL_ONLY_WHEN_REALTIME_FAILS = 300000 // 5 minutes - only when real-time fails
    const REALTIME_RETRY_DELAY = 5000 // 5 seconds between retries
    const MAX_REALTIME_RETRIES = 3

    // Start minimal polling ONLY when real-time completely fails (last resort)
    const startPolling = () => {
      // Don't start polling if real-time is active
      if (isRealTimeActive) {
        return
      }
      // Don't start if already started (use ref to persist across function calls)
      if (pollingStartedRef.current || pollingInterval) {
        return
      }
      pollingStartedRef.current = true
      
      // Only log once when polling first starts (use ref to persist)
      if (!hasLoggedPollingStartRef.current) {
        console.log(`[DASHBOARD] ⚠️ Real-time unavailable, using minimal polling (every ${POLL_INTERVAL_ONLY_WHEN_REALTIME_FAILS/1000/60}min)`)
        hasLoggedPollingStartRef.current = true
      }

      const scheduleNext = () => {
        if (pollingInterval) {
          clearTimeout(pollingInterval)
          pollingInterval = null
        }
        
        pollingInterval = setTimeout(async () => {
          try {
            const response = await apiGet(`/api/bridge/transactions?limit=1`)
            if (response.ok) {
              const data = await response.json()
              const latestTx = data.transactions?.[0]
              const currentTimestamp = latestTx?.created_at || latestTx?.bridge_created_at
              
              if (currentTimestamp && currentTimestamp !== lastTransactionTimestamp) {
                console.log('[DASHBOARD] 🔄 Polling detected transaction change, refreshing...')
                lastTransactionTimestamp = currentTimestamp
                if (fetchRecentTransactionsRef.current) {
                  await fetchRecentTransactionsRef.current(true, true) // Silent refresh - no skeleton
                }
                if (refreshBalancesRef.current) {
                  await refreshBalancesRef.current(true)
                }
              }
            }
          } catch (error: any) {
            // Silently handle errors - we're in fallback mode
          }
          
          // Schedule next poll (recursive)
          scheduleNext()
        }, POLL_INTERVAL_ONLY_WHEN_REALTIME_FAILS)
      }

      // Start polling
      scheduleNext()
    }

    // Setup real-time subscription with retry logic
    const setupRealtime = async (retryAttempt = 0) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('[DASHBOARD] No session, using minimal polling')
        if (!pollingStartedRef.current && !pollingInterval) {
          startPolling()
        }
        return
      }

      // Clean up existing channel if any
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }

      try {
        channel = supabase
          .channel(`dashboard-transactions-${userProfile.id}-${Date.now()}`) // Unique channel name
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bridge_transactions',
              filter: `user_id=eq.${userProfile.id}`,
            } as any,
            async (payload: any) => {
              try {
                // Skip UPDATE events that don't change meaningful fields (prevents excessive refreshes)
                if (payload.eventType === 'UPDATE') {
                  const txId = payload.new?.transaction_id || payload.new?.id
                  const oldStatus = payload.old?.status
                  const newStatus = payload.new?.status
                  
                  // Only process UPDATE if status actually changed
                  if (oldStatus === newStatus) {
                    // Status unchanged - skip this update to prevent excessive refreshes
                    return
                  }
                }
                
                // Debounce rapid updates (increased to 2 seconds for UPDATE events)
                const now = Date.now()
                const debounceTime = payload.eventType === 'UPDATE' ? 2000 : DEBOUNCE_MS
                if (now - lastRefreshTime < debounceTime) {
                  return
                }
                lastRefreshTime = now
                
                console.log('[DASHBOARD] ✅ Real-time transaction update:', payload.eventType)
                if (fetchRecentTransactionsRef.current) {
                  await fetchRecentTransactionsRef.current(true, true) // Silent refresh
                }
                if (refreshBalancesRef.current) {
                  refreshBalancesRef.current(true).catch(() => {})
                }
              } catch (error) {
                console.error('[DASHBOARD] Error processing real-time update:', error)
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[DASHBOARD] ✅ Real-time subscription active')
              isRealTimeActive = true
              realtimeRetryCount = 0 // Reset retry count on success
              // Stop polling if it was running (real-time is more efficient)
              if (pollingInterval) {
                clearTimeout(pollingInterval)
                pollingInterval = null
                pollingStartedRef.current = false
                hasLoggedPollingStartRef.current = false
              }
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn(`[DASHBOARD] Real-time ${status}, will retry...`)
              isRealTimeActive = false
              
              // Retry real-time setup if we haven't exceeded max retries
              if (realtimeRetryCount < MAX_REALTIME_RETRIES) {
                realtimeRetryCount++
                if (realtimeRetryTimeout) {
                  clearTimeout(realtimeRetryTimeout)
                }
                realtimeRetryTimeout = setTimeout(() => {
                  console.log(`[DASHBOARD] Retrying real-time subscription (attempt ${realtimeRetryCount}/${MAX_REALTIME_RETRIES})...`)
                  setupRealtime(realtimeRetryCount)
                }, REALTIME_RETRY_DELAY)
              } else {
                // Max retries reached, fall back to minimal polling
                console.warn('[DASHBOARD] Max real-time retries reached, using minimal polling')
                if (!pollingStartedRef.current && !pollingInterval) {
                  startPolling()
                }
              }
            } else {
              console.log(`[DASHBOARD] Real-time status: ${status}`)
            }
          })
      } catch (error) {
        console.error('[DASHBOARD] Real-time setup error:', error)
        // Retry if we haven't exceeded max retries
        if (realtimeRetryCount < MAX_REALTIME_RETRIES) {
          realtimeRetryCount++
          if (realtimeRetryTimeout) {
            clearTimeout(realtimeRetryTimeout)
          }
          realtimeRetryTimeout = setTimeout(() => {
            console.log(`[DASHBOARD] Retrying real-time subscription after error (attempt ${realtimeRetryCount}/${MAX_REALTIME_RETRIES})...`)
            setupRealtime(realtimeRetryCount)
          }, REALTIME_RETRY_DELAY)
        } else {
          // Max retries reached, fall back to minimal polling
          console.warn('[DASHBOARD] Max real-time retries reached after error, using minimal polling')
          if (!pollingStartedRef.current && !pollingInterval) {
            startPolling()
          }
        }
      }
    }

    setupRealtime()

    return () => {
      realtimeSetupRef.current = false
      pollingStartedRef.current = false
      if (realtimeRetryTimeout) {
        clearTimeout(realtimeRetryTimeout)
        realtimeRetryTimeout = null
      }
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
      if (pollingInterval) {
        clearTimeout(pollingInterval)
        pollingInterval = null
      }
    }
  }, [userProfile?.id]) // Only depend on userProfile.id to prevent re-runs

  // Refresh balances on focus only if stale (don't fetch every time)
  useFocusEffect(
    React.useCallback(() => {
      // Only refresh if data is stale - fetchBalances will check cache first
      // This prevents unnecessary API calls when data is fresh
      refreshBalances(false).catch(() => {
        // Silently fail
      })
      // Refresh transactions if stale
      if (dataLoadedRef.current) {
        fetchRecentTransactions(false).catch(() => {
          // Silently fail
        })
      }
    }, [refreshBalances, fetchRecentTransactions])
  )

  const balance = parseFloat(balances[selectedCurrency] || '0')

  // Get user's first name for greeting - use only the first word if multiple names exist
  const getDisplayName = () => {
    const fullFirstName = userProfile?.profile?.first_name || user?.first_name || 'User'
    // Extract only the first word (e.g., "David Mark" -> "David")
    return fullFirstName.split(' ')[0]
  }
  const displayName = getDisplayName()
  
  // Get user initials for avatar
  const getInitials = () => {
    const first = userProfile?.profile?.first_name?.[0] || user?.first_name?.[0] || 'U'
    const last = userProfile?.profile?.last_name?.[0] || user?.last_name?.[0] || 'S'
    return `${first}${last}`.toUpperCase()
  }

  const handleCurrencyChange = (currency: 'USD' | 'EUR') => {
    setSelectedCurrency(currency)
    setShowCurrencyDropdown(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const getTransactionIcon = (iconType: string, isReceived: boolean) => {
    const iconColor = colors.primary.main
    
    switch (iconType) {
      case 'inbox':
  return (
          <View style={styles.transactionIconBox}>
            <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.5} />
            </View>
        )
      case 'outbox':
        return (
          <View style={styles.transactionIconBox}>
            <ArrowUpRight size={16} color={iconColor} strokeWidth={2.5} />
              </View>
        )
      case 'monitor':
        return (
          <View style={styles.transactionIconBox}>
            <Monitor size={16} color={iconColor} strokeWidth={2.5} />
            </View>
        )
      case 'shopping':
        return (
          <View style={styles.transactionIconBox}>
            <Apple size={16} color={iconColor} strokeWidth={2.5} />
          </View>
        )
      default:
        return (
          <View style={styles.transactionIconBox}>
            <ArrowUpRight size={16} color={iconColor} strokeWidth={2.5} />
        </View>
        )
    }
  }

  const formatAmount = (amount: number, isReceived: boolean, currency: string = 'USD') => {
    const sign = isReceived ? '+' : '-'
    // Normalize currency to uppercase for comparison
    const normalizedCurrency = (currency || 'USD').toUpperCase()
    const currencySymbol = normalizedCurrency === 'USD' ? '$' : normalizedCurrency === 'EUR' ? '€' : currency
    
    // Check if amount has decimal places
    const absAmount = Math.abs(amount)
    const hasDecimals = absAmount % 1 !== 0
    const formattedAmount = hasDecimals
      ? absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : absAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    
    return `${sign}${currencySymbol}${formattedAmount}`
  }

  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const getTransactionName = (transaction: DashboardTransaction): string => {
    if (transaction.type === 'receive') {
      // Check if it's a crypto deposit (stablecoin deposit via liquidation address)
      if (transaction.source_type === 'liquidation_address' || transaction.source_liquidation_address_id) {
        return 'Stablecoin Deposit'
      }
      
      // For fiat deposits (virtual account/ACH), show sender name only (not "Received from...")
      if (transaction.source_type === 'virtual_account') {
        // Check metadata for sender information
        const senderName = transaction.metadata?.source?.sender_name || 
                          transaction.metadata?.source?.originator_name ||
                          transaction.name
        if (senderName) {
          return senderName // Just the sender name for ACH deposits
        }
        return 'Bank Deposit'
      }
      
      // Fallback for other receive types
      return transaction.name ? `Received from ${transaction.name}` : 'Received'
    } else {
      // For sends, use recipient name
      return transaction.name ? `Sent to ${transaction.name}` : 'Sent'
    }
  }

  const getTransactionIconType = (transaction: DashboardTransaction): string => {
    if (transaction.type === 'receive') return 'inbox'
    // Could add more logic here based on transaction metadata
    return 'outbox'
  }

  const formatBalanceDisplay = (amount: number, currency: 'USD' | 'EUR'): string => {
    const currencySymbol = currency === 'USD' ? '$' : '€'
    
    // Format as "X Million" or "X Billion" if >= 100 million
    if (amount >= 100000000) {
      // Billions
      const billions = amount / 1000000000
      if (billions >= 1) {
        return `${currencySymbol}${billions.toFixed(1)} Billion`
      }
      // Millions (100M - 999M)
      const millions = amount / 1000000
      return `${currencySymbol}${millions.toFixed(1)} Million`
    }
    
    // Show full number for amounts below 100 million
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const renderCurrencyPicker = () => {
    // Calculate approximate height: header (80) + item height (80) * number of items + padding
    const itemHeight = 80
    const headerHeight = 80
    const padding = spacing[4]
    const estimatedHeight = headerHeight + (itemHeight * availableCurrencies.length) + padding + insets.bottom

  return (
      <Modal
        visible={showCurrencyDropdown}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowCurrencyDropdown(false)
      }}
    >
      <TouchableOpacity 
          style={styles.modalOverlay}
        activeOpacity={1}
          onPress={() => setShowCurrencyDropdown(false)}
        >
          <View style={[styles.modalContainer, { 
            maxHeight: estimatedHeight,
            paddingBottom: insets.bottom,
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Balance</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCurrencyDropdown(false)
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.currencyListContainer}>
              {availableCurrencies.map((item) => {
                const balance = parseFloat(balances[item.code as 'USD' | 'EUR'] || '0')
                // Use the same formatting as the main balance display for consistency
                const balanceDisplay = balanceVisible 
                  ? formatBalanceDisplay(balance, item.code as 'USD' | 'EUR')
                  : '••••••'
                const isSelected = selectedCurrency === item.code
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemActive
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      handleCurrencyChange(item.code as 'USD' | 'EUR')
                      setShowCurrencyDropdown(false)
                    }}
                  >
                    <View style={styles.flagContainerSmall}>
                      <Image 
                        source={item.flag}
                        style={styles.flagImageSmall}
                        resizeMode="cover"
                      />
            </View>
                    <View style={styles.currencyItemInfo}>
                      <Text style={styles.currencyItemCode}>{item.code} Balance</Text>
                      <Text style={styles.currencyItemBalance}>
                        {balanceDisplay}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <View style={styles.checkboxInner} />
                      )}
            </View>
                  </TouchableOpacity>
                )
              })}
          </View>
        </View>
      </TouchableOpacity>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with Greeting and Notification */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Header Content */}
          <View style={styles.headerContent}>
            {/* User Greeting with Avatar */}
            <View style={styles.greetingContainer}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('ProfileEdit' as any)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </TouchableOpacity>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingText}>
                  Hi {displayName} 👋
                </Text>
              </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('InAppNotifications' as never)
              }}
              activeOpacity={0.7}
            >
              <Bell size={22} color={colors.primary.main} strokeWidth={2} />
              {/* Notification Badge - Show when there are unread notifications */}
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <View style={styles.notificationBadgeDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content - White Card */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={async () => {
              setRefreshing(true)
              try {
                // Trigger sync to update transaction table in Supabase
                // This ensures any missing transactions are synced from Bridge API
                const syncPromise = apiPost('/api/bridge/sync-transactions').catch((error) => {
                  console.warn('[DASHBOARD] Sync failed on pull-to-refresh:', error)
                  // Don't block refresh if sync fails
                })
                
                // Refresh all data (forced - user pulled to refresh)
                // Use Promise.allSettled to ensure all promises complete even if some fail
                await Promise.allSettled([
                  syncPromise, // Sync transactions from Bridge API
                  refreshStaleData(), // Refresh stale user data
                  refreshBalances(true), // Force refresh balances (bypass cache)
                  fetchRecentTransactions(true), // Force refresh transactions (bypass cache)
                ])
              } catch (error) {
                console.error('Error refreshing dashboard:', error)
              } finally {
                // Always reset refreshing state, even if there's an error
                setRefreshing(false)
              }
            }}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.whiteCard}>
          {/* Currency Selector with Plus Button */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                // Open dropdown immediately
                setShowCurrencyDropdown(true)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Refresh balances in background to ensure they're in sync
                refreshBalances(false).catch(error => {
                  console.error('Error refreshing balances:', error)
                })
              }}
              activeOpacity={0.7}
            >
              <View style={styles.flagContainer}>
                <Image 
                  source={
                    selectedCurrency === 'USD' 
                      ? require('../../../assets/flags/us.png') 
                      : require('../../../assets/flags/eu.png')
                  }
                  style={styles.flagImage}
                  resizeMode="cover"
                />
          </View>
              <Text style={styles.currencyText}>{selectedCurrency} Balance</Text>
              <ChevronDown size={16} color={colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          {/* Plus button hidden for now - will be used to add new balances when available */}
          {false && (
            <TouchableOpacity
              style={styles.addFundsButtonSmall}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Navigate to add funds
              }}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.primary.main} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
      </View>

          {/* Currency Picker Modal */}
          {renderCurrencyPicker()}

          {/* Balance Display */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>
              {balanceVisible 
                ? formatBalanceDisplay(balance, selectedCurrency)
                : '••••••'}
            </Text>
            <TouchableOpacity 
              style={styles.hideBalanceButton}
              onPress={toggleBalanceVisibility}
              activeOpacity={0.7}
            >
              {balanceVisible ? (
                <EyeOff size={22} color={colors.primary.main} strokeWidth={2} />
              ) : (
                <Eye size={22} color={colors.primary.main} strokeWidth={2} />
              )}
          </TouchableOpacity>
              </View>
              
          {/* Receive and Send Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('ReceiveMoney' as never, {
                  currency: selectedCurrency,
                } as never)
              }}
              activeOpacity={0.7}
            >
              <ArrowDownLeft size={20} color={colors.primary.main} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('SelectRecentRecipient' as never)
              }}
              activeOpacity={0.7}
            >
              <ArrowUpRight size={20} color={colors.primary.main} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        </View>
        
        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          {!loadingTransactions && recentTransactions.length > 0 && (
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Transactions</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('Transactions' as never)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>All</Text>
                <ArrowRight size={14} color={colors.primary.main} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        
          {/* Transaction List */}
          {loadingTransactions ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.transactionItem}>
                  <ShimmerListItem />
                </View>
              ))}
            </View>
          ) : recentTransactions.length === 0 && hasAttemptedLoad ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={40} color={colors.neutral[400]} />
              </View>
              <Text style={styles.emptyStateTitle}>No transactions yet</Text>
              <Text style={styles.emptyStateText}>
                Your recent transactions will appear here once you send, receive or spend money
              </Text>
            </View>
          ) : (
            recentTransactions.map((transaction, index) => {
              const isReceived = transaction.type === 'receive'
              const iconType = getTransactionIconType(transaction)
              const isLast = index === recentTransactions.length - 1
              return (
                <TouchableOpacity
                  key={transaction.id || transaction.transaction_id} 
                  style={[styles.transactionItem, isLast && styles.transactionItemLast]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    navigation.navigate('BridgeTransactionDetails' as never, { 
                      transactionId: transaction.transaction_id,
                      fromScreen: 'Dashboard'
                    } as never)
                  }}
                  activeOpacity={0.7}
                >
                  {getTransactionIcon(iconType, isReceived)}
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>
                      {getTransactionName(transaction)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatTransactionDate(transaction.bridge_created_at || transaction.created_at)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      isReceived && styles.transactionAmountReceived
                    ]}
                  >
                    {formatAmount(transaction.amount, isReceived, transaction.currency)}
                  </Text>
                </TouchableOpacity>
              )
            })
          )}
        </View>
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary, // White/light background for the page
  },
  headerWrapper: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[1],
  },
  header: {
    paddingVertical: spacing[1],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Outfit-Bold',
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100, // Space for bottom navigation bar
  },
  whiteCard: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: 0,
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.full,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    height: 40,
  },
  flagContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  flagImage: {
    width: 24,
    height: 24,
  },
  currencyText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  addFundsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addFundsButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingTop: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyListContainer: {
    paddingBottom: spacing[2],
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  currencyItemActive: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2,
  },
  currencyItemBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.primary,
  },
  flagContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImageSmall: {
    width: 24,
    height: 24,
  },
  currencyOptionText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text.primary,
    fontFamily: 'Outfit-Black',
    letterSpacing: -0.5,
    flex: 1,
  },
  hideBalanceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 50,
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  actionButtonText: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionsSection: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  transactionsTitle: {
    ...textStyles.headingSmall,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: '#B9CAFF',
    borderRadius: borderRadius.full,
  },
  viewAllText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2', // Match More screen divider color
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    marginBottom: spacing[1],
  },
  transactionDate: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  transactionAmount: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionAmountReceived: {
    color: colors.primary.main,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[5],
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyStateTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
  },
  emptyStateText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  skeletonContainer: {
    paddingHorizontal: spacing[5],
  },
})
