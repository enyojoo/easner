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
import { apiGet } from '../../lib/apiClient'
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
  status: string
  created_at: string
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
  stellar_transaction_hash?: string
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

  const transactionType = item.type || 'send'
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
            {transactionType === 'receive'
              ? `Received from ${item.recipient?.full_name || item.crypto_wallet?.wallet_address?.slice(0, 8) || 'Unknown'}`
              : transactionType === 'send'
              ? item.recipient?.full_name || 'Unknown'
              : 'Card Top-Up'}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            transactionType === 'receive' && styles.transactionAmountReceived
          ]}
        >
          {transactionType === 'send'
            ? formatAmount(item.receive_amount || item.send_amount || 0, 
                item.receive_currency || item.send_currency || '', false)
            : transactionType === 'receive'
            ? formatAmount(item.crypto_amount || item.fiat_amount || 0, 
                item.crypto_currency || item.fiat_currency || 'USD', true)
            : formatAmount(item.amount || 0, item.currency || 'USD', false)}
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
  const { transactions: userTransactions } = useUserData()
  
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

  // Fetch combined transactions
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000

    const getCachedTransactions = async (): Promise<CombinedTransaction[] | null> => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        await AsyncStorage.removeItem(CACHE_KEY)
        return null
      } catch {
        return null
      }
    }

    const setCachedTransactions = async (value: CombinedTransaction[]) => {
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    const loadFromCache = async () => {
      const cachedTransactions = await getCachedTransactions()
      
      if (cachedTransactions !== null && transactions.length === 0) {
        setTransactions(cachedTransactions)
        setLoading(false)
      }

      if (cachedTransactions !== null) {
        const fetchInBackground = async () => {
          try {
            const params = new URLSearchParams()
             params.append('type', 'send') // Only fetch send transactions
            params.append('limit', '100')

            const response = await apiGet(`/api/transactions?${params.toString()}`)
            if (response.ok && !(response as any).isNetworkError) {
              const data = await response.json()
              const transactionsList = data.transactions || []
               
               // Additional client-side filtering to ensure no receive/card transactions
               const filteredTransactions = transactionsList.filter((tx: any) => {
                 if (tx.type === 'receive' || tx.type === 'card_funding') return false
                 if (tx.destination_type === 'card') return false
                 return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
               })
               
               setTransactions(filteredTransactions)
               await setCachedTransactions(filteredTransactions)
            } else if ((response as any).isNetworkError) {
              // Network error - keep cached transactions
              console.warn("Network error fetching transactions in background, keeping cached data")
            }
          } catch (error: any) {
            // Only log as error if it's not a network error
            if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
              console.warn("Network error fetching transactions in background:", error?.message || 'Network unavailable')
            } else {
              console.error("Error fetching transactions in background:", error)
            }
          }
        }
        fetchInBackground()
        return
      }

      const fetchCombinedTransactions = async () => {
        try {
          const params = new URLSearchParams()
        params.append('type', 'send') // Only fetch send transactions, not receive or card
          params.append('limit', '100')

          const response = await apiGet(`/api/transactions?${params.toString()}`)
          if (response.ok && !(response as any).isNetworkError) {
            const data = await response.json()
            const transactionsList = data.transactions || []
            
            // TEMPORARILY DISABLED: Filter out receive and card_funding transactions
            const filteredTransactions = transactionsList.filter((tx: any) => {
              // Exclude receive and card_funding transactions
              if (tx.type === 'receive' || tx.type === 'card_funding') return false
              // Exclude transactions with destination_type card
              if (tx.destination_type === 'card') return false
              // Only include send transactions
              return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
            })
            
            setTransactions(filteredTransactions)
            await setCachedTransactions(filteredTransactions)
          } else if ((response as any).isNetworkError) {
            // Network error - use fallback
            console.warn("Network error fetching transactions, using fallback data")
            const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
            // Filter fallback transactions too
            const filteredFallback = fallbackTransactions.filter((tx: any) => {
              if (tx.type === 'receive' || tx.type === 'card_funding') return false
              if (tx.destination_type === 'card') return false
              return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
            })
            setTransactions(filteredFallback)
            if (filteredFallback.length > 0) {
              await setCachedTransactions(filteredFallback)
            }
          } else {
            const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
            // Filter fallback transactions too
            const filteredFallback = fallbackTransactions.filter((tx: any) => {
              if (tx.type === 'receive' || tx.type === 'card_funding') return false
              if (tx.destination_type === 'card') return false
              return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
            })
            setTransactions(filteredFallback)
            if (filteredFallback.length > 0) {
              await setCachedTransactions(filteredFallback)
            }
          }
        } catch (error: any) {
          // Handle network errors gracefully
          if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
            console.warn("Network error fetching transactions, using fallback data:", error?.message || 'Network unavailable')
          } else {
            console.error("Error fetching transactions:", error)
          }
          const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
          // Filter fallback transactions too
          const filteredFallback = fallbackTransactions.filter((tx: any) => {
            if (tx.type === 'receive' || tx.type === 'card_funding') return false
            if (tx.destination_type === 'card') return false
            return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
          })
          setTransactions(filteredFallback)
          if (filteredFallback.length > 0) {
            await setCachedTransactions(filteredFallback)
          }
        } finally {
          setLoading(false)
        }
      }

      await fetchCombinedTransactions()
    }

    loadFromCache()
  }, [userProfile?.id])

  // Real-time subscription
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
    
    const setCachedTransactions = async (value: CombinedTransaction[]) => {
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    const fetchCombinedTransactions = async () => {
      try {
        const params = new URLSearchParams()
        params.append('type', 'send') // Only fetch send transactions, not receive or card
        params.append('limit', '100')

        const response = await apiGet(`/api/transactions?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const transactionsList = data.transactions || []
          
          // Additional client-side filtering to ensure no receive/card transactions slip through
          const filteredTransactions = transactionsList.filter((tx: any) => {
            // Exclude receive and card_funding transactions
            if (tx.type === 'receive' || tx.type === 'card_funding') return false
            // Exclude transactions with destination_type card
            if (tx.destination_type === 'card') return false
            // Only include send transactions
            return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
          })
          
          setTransactions(filteredTransactions)
          await setCachedTransactions(filteredTransactions)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    const sendTransactionsChannel = supabase
      .channel(`user-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async () => {
          await fetchCombinedTransactions()
        }
      )
      .subscribe()

    // TEMPORARILY DISABLED: Receive transactions realtime subscription disabled
    // const receiveTransactionsChannel = supabase
    //   .channel(`user-crypto-receive-transactions-${userProfile.id}`)
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'crypto_receive_transactions',
    //       filter: `user_id=eq.${userProfile.id}`,
    //     },
    //     async () => {
    //       await fetchCombinedTransactions()
    //     }
    //   )
    //   .subscribe()

    return () => {
      supabase.removeChannel(sendTransactionsChannel)
      // supabase.removeChannel(receiveTransactionsChannel)
    }
  }, [userProfile?.id])

  const onRefresh = async () => {
    setRefreshing(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      const params = new URLSearchParams()
        params.append('type', 'send') // Only fetch send transactions, not receive or card
      params.append('limit', '100')

      const response = await apiGet(`/api/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const transactionsList = data.transactions || []
        
        // Filter out receive and card_funding transactions
        const filteredTransactions = transactionsList.filter((tx: any) => {
          if (tx.type === 'receive' || tx.type === 'card_funding') return false
          if (tx.destination_type === 'card') return false
          return tx.type === 'send' || (tx.send_amount || tx.receive_amount || tx.recipient)
        })
        
        if (userProfile?.id) {
          const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            value: filteredTransactions,
            timestamp: Date.now()
          }))
        }
        
        setTransactions(filteredTransactions)
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatAmount = (amount: number, currency: string, isReceived: boolean = false) => {
    const sign = isReceived ? '' : '- '
    const currencyData = currencies.find((c) => c && c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${sign}${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (transaction.transaction_id || transaction.id)?.toLowerCase().includes(searchLower) ||
      (transaction.type === 'send' &&
        transaction.recipient?.full_name?.toLowerCase().includes(searchLower)) ||
      (transaction.type === 'receive' &&
        transaction.crypto_wallet?.wallet_address?.toLowerCase().includes(searchLower))
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
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.neutral[400]} />
              </View>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptyText}>
                {searchTerm 
                  ? 'Try adjusting your search' 
                  : 'Start by sending your first transfer'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {filteredTransactions.map((item, index) => {
                const transactionType = item.type || 'send'
                const detailScreen = transactionType === 'send' ? 'TransactionDetails' : 'ReceiveTransactionDetails'
                const isLast = index === filteredTransactions.length - 1
                
                return (
                  <TransactionItem
                    key={item.id || item.transaction_id || `tx-${item.created_at}`}
                    item={item}
                    index={index}
                    isLast={isLast}
                    onPress={() => {
                      navigation.navigate(detailScreen, { 
                        transactionId: item.transaction_id,
                        fromScreen: 'Transactions'
                      })
                    }}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                  />
                )
              })}
            </View>
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
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.background,
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
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  
  // Transactions List
  transactionsContainer: {
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },
  listContent: {
    paddingHorizontal: spacing[5],
  },
  skeletonContainer: {
    paddingHorizontal: spacing[5],
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[5],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})

export default function TransactionsScreen(props: NavigationProps) {
  return <TransactionsContent {...props} />
}
