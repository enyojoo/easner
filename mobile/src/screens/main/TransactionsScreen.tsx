import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Animated,
  ScrollView,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { 
  PieChart,
  ArrowDownLeft, 
  ArrowUpRight, 
  Monitor,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import ScreenWrapper from '../../components/ScreenWrapper'
import { ShimmerListItem } from '../../components/premium'
import FrameContainer from '../../components/FrameContainer'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Transaction } from '../../types'
import { analytics } from '../../lib/analytics'
import { useAuth } from '../../contexts/AuthContext'
import { useFocusRefreshAll } from '../../hooks/useFocusRefresh'
import { apiGet, apiPost } from '../../lib/apiClient'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

// Get currencies from useUserData for formatAmount
function useCurrencies() {
  const { currencies } = useUserData()
  return currencies || []
}

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: 'send' | 'receive' | 'card_funding'
  transaction_type?: 'send' | 'receive' // Bridge transactions use transaction_type
  status: string
  created_at: string
  bridge_created_at?: string
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
  }
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  receipt_destination_tx_hash?: string // Bridge transaction receipt hash
  crypto_wallet?: {
    wallet_address: string
    crypto_currency: string
  }
  destination_type?: 'bank' | 'card'
  amount?: number
  currency?: string
  merchant_name?: string
  description?: string
  direction?: 'credit' | 'debit'
  name?: string
  source_type?: string // 'virtual_account', 'liquidation_address', etc.
  source_liquidation_address_id?: string
  metadata?: any
}

// Helper function to get transaction name (defined outside component so it can be used in TransactionItem)
function getTransactionName(item: CombinedTransaction, transactionType: string): string {
  if (transactionType === 'receive') {
    // Check if it's a crypto deposit (stablecoin deposit via liquidation address)
    if (item.source_type === 'liquidation_address' || item.source_liquidation_address_id) {
      return 'Stablecoin Deposit'
    }
    
    // For fiat deposits (virtual account/ACH), show sender name only (not "Received from...")
    if (item.source_type === 'virtual_account') {
      // Check metadata for sender information
      const senderName = item.metadata?.source?.sender_name || 
                        item.metadata?.source?.originator_name ||
                        item.name
      if (senderName) {
        return senderName // Just the sender name for ACH deposits
      }
      return 'Bank Deposit'
    }
    
    // Fallback for other receive types
    return item.recipient_name ? `Received from ${item.recipient_name}` : 'Received'
  } else if (transactionType === 'send') {
    return item.recipient_name ? `Sent to ${item.recipient_name}` : 'Sent'
  } else {
    return 'Card Top-Up'
  }
}

// Animated Transaction Item Component
function TransactionItem({ 
  item, 
  index, 
  isLast,
  onPress,
  formatAmount,
  formatDate,
}: { 
  item: CombinedTransaction
  index: number
  isLast: boolean
  onPress: () => void
  formatAmount: (amount: number, currency: string, isReceived?: boolean) => string
  formatDate: (dateString: string) => string
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: Math.min(index * 50, 300),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index * 50, 300),
        useNativeDriver: true,
      }),
    ]).start()
  }, [slideAnim, opacityAnim, index])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start()
  }

  // Bridge transactions use transaction_type, legacy uses type
  const transactionType = item.transaction_type || item.type || 'send'
  const statusColor = colors.status[item.status as keyof typeof colors.status] || colors.neutral[500]

  const getTransactionIcon = () => {
    const iconColor = colors.primary.main
    
    switch (transactionType) {
      case 'send':
        return (
          <View style={styles.transactionIconBox}>
            <ArrowUpRight size={16} color={iconColor} strokeWidth={2.5} />
          </View>
        )
      case 'receive':
        return (
          <View style={styles.transactionIconBox}>
            <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.5} />
          </View>
        )
      case 'card_funding':
        return (
          <View style={styles.transactionIconBox}>
            <Monitor size={16} color={iconColor} strokeWidth={2.5} />
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

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        style={[styles.transactionItem, isLast && styles.transactionItemLast]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onPress()
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {getTransactionIcon()}
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>
            {getTransactionName(item, transactionType)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.bridge_created_at || item.created_at)}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            transactionType === 'receive' && styles.transactionAmountReceived
          ]}
        >
          {formatAmount(
            item.amount || item.send_amount || item.crypto_amount || item.fiat_amount || 0,
            item.currency || item.send_currency || item.crypto_currency || item.fiat_currency || 'USD',
            transactionType === 'receive'
          )}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Loading Skeleton
function TransactionsSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.transactionItem}>
          <ShimmerListItem />
        </View>
      ))}
    </View>
  )
}

function TransactionsContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const currencies = useCurrencies()
  const { transactions: userTransactions, refreshStaleData } = useUserData()
  
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }, [headerAnim])

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Transactions')
  }, [])

  // Cache TTL (10 minutes - same as other screens)
  const CACHE_TTL = 10 * 60 * 1000
  const CACHE_KEY = `easner_combined_transactions_${userProfile?.id || ''}`

  // Helper to get cached data (use useCallback to ensure stable reference)
  const getCachedData = React.useCallback(async <T,>(key: string): Promise<{ data: T; timestamp: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(key)
      if (!cached) return null
      return JSON.parse(cached)
    } catch {
      return null
    }
  }, [])

  // Helper to set cached data (use useCallback to ensure stable reference)
  const setCachedData = React.useCallback(async <T,>(key: string, data: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.warn(`[Transactions] Error caching ${key}:`, error)
    }
  }, [])

  // Helper to check if data is stale (use useCallback to ensure stable reference)
  const isStale = React.useCallback((timestamp: number | undefined, ttl: number): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > ttl
  }, [])

  // Fetch transactions with caching (stale-while-revalidate pattern)
  const fetchTransactions = React.useCallback(async (force = false, silent = false) => {
    if (!userProfile?.id) return

    let cached: { data: CombinedTransaction[]; timestamp: number } | null = null

    // Try to load from cache first (stale-while-revalidate)
    if (!force) {
      cached = await getCachedData<CombinedTransaction[]>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL)) {
        // Data is fresh, use cache
        setTransactions(cached.data)
        setLoading(false)
        return
      } else if (cached) {
        // Data is stale, show cached data immediately, then fetch fresh
        setTransactions(cached.data)
        setLoading(false)
        // Continue to fetch fresh data in background
      }
    }

    try {
      // Only show loading if not silent and we don't have cached data
      if (!silent && (!cached || force)) {
        setLoading(true)
      }

      const params = new URLSearchParams()
      params.append('limit', '100')

      // Try bridge transactions API first, fallback to combined transactions
      let response = await apiGet(`/api/bridge/transactions?${params.toString()}`)
      if (!response.ok || (response as any).isNetworkError) {
        // Fallback to combined transactions API
        response = await apiGet(`/api/transactions?${params.toString()}`)
      }
      
      if (response.ok && !(response as any).isNetworkError) {
        const data = await response.json()
        const transactionsList = data.transactions || []
        
        setTransactions(transactionsList)
        await setCachedData(CACHE_KEY, transactionsList)
        setError(null)
      } else if ((response as any).isNetworkError) {
        // Network error - keep cached data if available
        console.warn("Network error fetching transactions, keeping cached data")
        if (!cached) {
          setError("Network error. Please check your connection.")
          setTransactions([])
        }
      } else {
        if (!cached) {
          setTransactions([])
          setError("Failed to load transactions")
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
        console.warn("Network error fetching transactions:", error?.message || 'Network unavailable')
        if (!cached) {
          setError("Network error. Please check your connection.")
          setTransactions([])
        }
      } else {
        console.error("Error fetching transactions:", error)
        if (!cached) {
          setError("Failed to load transactions")
          setTransactions([])
        }
      }
    } finally {
      setLoading(false)
    }
  }, [userProfile?.id, CACHE_KEY, getCachedData, setCachedData, isStale])

  // Initial load
  useEffect(() => {
    if (!userProfile?.id) return
    fetchTransactions(false)
  }, [userProfile?.id, fetchTransactions])

  // Refresh stale data when screen comes into focus
  useFocusRefreshAll(false) // Only refresh if stale (> 5 minutes)

  // Real-time subscription with minimal polling fallback (only when real-time fails)
  useEffect(() => {
    if (!userProfile?.id) return

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
      // Don't start if already polling
      if (pollingInterval) {
        return
      }

      console.log(`[TRANSACTIONS] ⚠️ Real-time unavailable, using minimal polling (every ${POLL_INTERVAL_ONLY_WHEN_REALTIME_FAILS/1000/60}min)`)

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
                console.log('[TRANSACTIONS] 🔄 Polling detected transaction change, refreshing...')
                lastTransactionTimestamp = currentTimestamp
                await fetchTransactions(true, true) // Silent refresh - no skeleton
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
        console.warn('[TRANSACTIONS] No session, using minimal polling')
        startPolling()
        return
      }

      // Clean up existing channel if any
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }

      try {
        channel = supabase
          .channel(`user-bridge-transactions-${userProfile.id}-${Date.now()}`) // Unique channel name
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
                  
                console.log('[TRANSACTIONS] ✅ Real-time transaction update:', payload.eventType)
                await fetchTransactions(true, true) // Silent refresh
                } catch (error) {
                  console.error('[TRANSACTIONS] Error processing real-time update:', error)
                }
              }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[TRANSACTIONS] ✅ Real-time subscription active')
              isRealTimeActive = true
              realtimeRetryCount = 0 // Reset retry count on success
              // Stop polling if it was running (real-time is more efficient)
              if (pollingInterval) {
                clearTimeout(pollingInterval)
                pollingInterval = null
              }
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn(`[TRANSACTIONS] Real-time ${status}, will retry...`)
              isRealTimeActive = false
              
              // Retry real-time setup if we haven't exceeded max retries
              if (realtimeRetryCount < MAX_REALTIME_RETRIES) {
                realtimeRetryCount++
                if (realtimeRetryTimeout) {
                  clearTimeout(realtimeRetryTimeout)
                }
                realtimeRetryTimeout = setTimeout(() => {
                  console.log(`[TRANSACTIONS] Retrying real-time subscription (attempt ${realtimeRetryCount}/${MAX_REALTIME_RETRIES})...`)
                  setupRealtime(realtimeRetryCount)
                }, REALTIME_RETRY_DELAY)
              } else {
                // Max retries reached, fall back to minimal polling
                console.warn('[TRANSACTIONS] Max real-time retries reached, using minimal polling')
                if (!pollingInterval) {
                  startPolling()
                }
              }
            } else {
              console.log(`[TRANSACTIONS] Real-time status: ${status}`)
            }
          })
      } catch (error) {
        console.error('[TRANSACTIONS] Real-time setup error:', error)
        // Retry if we haven't exceeded max retries
        if (realtimeRetryCount < MAX_REALTIME_RETRIES) {
          realtimeRetryCount++
          if (realtimeRetryTimeout) {
            clearTimeout(realtimeRetryTimeout)
          }
          realtimeRetryTimeout = setTimeout(() => {
            console.log(`[TRANSACTIONS] Retrying real-time subscription after error (attempt ${realtimeRetryCount}/${MAX_REALTIME_RETRIES})...`)
            setupRealtime(realtimeRetryCount)
          }, REALTIME_RETRY_DELAY)
        } else {
          // Max retries reached, fall back to minimal polling
          console.warn('[TRANSACTIONS] Max real-time retries reached after error, using minimal polling')
          if (!pollingInterval) {
            startPolling()
          }
        }
      }
    }

    setupRealtime()

    return () => {
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
  }, [userProfile?.id, fetchTransactions])

  const onRefresh = async () => {
    setRefreshing(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      // Trigger sync to update transaction table in Supabase
      // This ensures any missing transactions are synced from Bridge API
      const syncPromise = apiPost('/api/bridge/sync-transactions').catch((error) => {
        console.warn('[TRANSACTIONS] Sync failed on pull-to-refresh:', error)
        // Don't block refresh if sync fails
      })
      
      // Refresh stale data from UserDataContext (forced - user pulled to refresh)
      await Promise.all([
        syncPromise, // Sync transactions from Bridge API
        refreshStaleData(), // Refresh stale user data
        fetchTransactions(true), // Force refresh transactions (bypass cache)
      ])
    } catch (error: any) {
      if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
        console.warn("Network error refreshing transactions:", error?.message || 'Network unavailable')
      } else {
        console.error("Error refreshing transactions:", error)
      }
    } finally {
      setRefreshing(false)
    }
  }

  const formatAmount = (amount: number, currency: string, isReceived: boolean = false) => {
    const sign = isReceived ? '+' : '-'
    // Normalize currency to uppercase for lookup
    const normalizedCurrency = (currency || 'USD').toUpperCase()
    const currencyData = currencies.find((c) => c && c.code === normalizedCurrency)
    // Fallback to common symbols if currency data not found
    const symbol = currencyData?.symbol || 
                   (normalizedCurrency === 'USD' ? '$' : 
                    normalizedCurrency === 'EUR' ? '€' : 
                    normalizedCurrency)
    
    // Check if amount has decimal places
    const hasDecimals = amount % 1 !== 0
    const formattedAmount = hasDecimals
      ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    
    return `${sign}${symbol}${formattedAmount}`
  }

  const formatDate = (dateString: string) => {
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

  const filteredTransactions = (transactions || []).filter(transaction => {
    if (!transaction) return false
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const txType = transaction.transaction_type || transaction.type
    const matchesSearch =
      (transaction.transaction_id || transaction.id)?.toLowerCase().includes(searchLower) ||
      transaction.name?.toLowerCase().includes(searchLower) ||
      (txType === 'send' &&
        transaction.recipient?.full_name?.toLowerCase().includes(searchLower)) ||
      (txType === 'receive' &&
        (transaction.receipt_destination_tx_hash?.toLowerCase().includes(searchLower) ||
         transaction.crypto_wallet?.wallet_address?.toLowerCase().includes(searchLower)))
    return matchesSearch
  })


  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Transactions</Text>
              <Text style={styles.subtitle}>Your complete history</Text>
            </View>
            <TouchableOpacity
              style={styles.insightsButton}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('ExpenseInsights')
              }}
              activeOpacity={0.7}
            >
              <PieChart size={18} color={colors.primary.main} strokeWidth={2} />
              <Text style={styles.insightsButtonText}>Expense Insights</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by name or ID..."
          placeholderTextColor={colors.neutral[400]}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.transactionsContainer}>
          {loading ? (
            <TransactionsSkeleton />
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={40} color={colors.neutral[400]} />
              </View>
              <Text style={styles.emptyStateTitle}>
                {searchTerm ? 'No transactions found' : 'No transactions yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all transactions' 
                  : 'Your recent transactions will appear here once you send, receive or spend money'}
              </Text>
            </View>
          ) : (
            <>
              {filteredTransactions.map((item, index) => {
                const isLast = index === filteredTransactions.length - 1
                // Use BridgeTransactionDetails for all bridge transactions
                const detailScreen = 'BridgeTransactionDetails'
                
                return (
                  <TransactionItem
                    key={item.id || item.transaction_id || `tx-${item.created_at}`}
                    item={item}
                    index={index}
                    isLast={isLast}
                    onPress={() => {
                      navigation.navigate(detailScreen as never, { 
                        transactionId: item.transaction_id,
                        fromScreen: 'Transactions'
                      } as never)
                    }}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                  />
                )
              })}
            </>
          )}
        </View>
      </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[5],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  insightsButtonText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontWeight: '600',
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  
  // Transactions List
  transactionsContainer: {
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius['3xl'],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },
  skeletonContainer: {
    paddingHorizontal: 0,
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
  
  // Empty State
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
})

export default function TransactionsScreen(props: NavigationProps) {
  return <TransactionsContent {...props} />
}
