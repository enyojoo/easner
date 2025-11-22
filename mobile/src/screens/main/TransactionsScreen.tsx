import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Transaction } from '../../types'
import { transactionService } from '../../lib/transactionService'
import { analytics } from '../../lib/analytics'
import { useAuth } from '../../contexts/AuthContext'
import { apiGet } from '../../lib/apiClient'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
  // Card transaction fields
  amount?: number
  currency?: string
  merchant_name?: string
  description?: string
  direction?: 'credit' | 'debit'
}

function TransactionsContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const currencies = useCurrencies()
  const { transactions: userTransactions, loading: userDataLoading } = useUserData()
  
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Transactions')
  }, [])

  // Fetch combined transactions - only if not in cache
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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

    // Load from cache first
    const loadFromCache = async () => {
      const cachedTransactions = await getCachedTransactions()
      
      // Update state if cache exists and state is empty (only on first mount)
      if (cachedTransactions !== null && transactions.length === 0) {
        setTransactions(cachedTransactions)
      }

      // If cached and valid, no need to fetch immediately
      if (cachedTransactions !== null) {
        // Fetch in background to update cache
        const fetchInBackground = async () => {
          try {
            const params = new URLSearchParams()
            params.append('type', 'all')
            params.append('limit', '100')

            const response = await apiGet(`/api/transactions?${params.toString()}`)
            if (response.ok) {
              const data = await response.json()
              const transactionsList = data.transactions || []
              setTransactions(transactionsList)
              await setCachedTransactions(transactionsList)
            }
          } catch (error) {
            console.error("Error fetching transactions in background:", error)
          }
        }
        fetchInBackground()
        return
      }

      // Only fetch missing or expired data
      const fetchCombinedTransactions = async () => {
        // Only show loading if we don't have any cached data
        if (transactions.length === 0) {
          setLoading(true)
        }
        try {
          const params = new URLSearchParams()
          params.append('type', 'all')
          params.append('limit', '100')

          const response = await apiGet(`/api/transactions?${params.toString()}`)
          if (response.ok) {
            const data = await response.json()
            const transactionsList = data.transactions || []
            setTransactions(transactionsList)
            await setCachedTransactions(transactionsList)
          } else {
            // If API fails, fall back to userTransactions from useUserData
            console.warn("API fetch failed, using cached transactions from useUserData")
            const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
            setTransactions(fallbackTransactions)
            if (fallbackTransactions.length > 0) {
              await setCachedTransactions(fallbackTransactions)
            }
          }
        } catch (error) {
          console.error("Error fetching transactions:", error)
          // Fall back to userTransactions from useUserData
          const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
          setTransactions(fallbackTransactions)
          if (fallbackTransactions.length > 0) {
            await setCachedTransactions(fallbackTransactions)
          }
        } finally {
          setLoading(false)
        }
      }

      await fetchCombinedTransactions()
    }

    loadFromCache()
  }, [userProfile?.id]) // Only fetch when user changes, not when userTransactions changes

  // Real-time subscription for transaction updates
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
        params.append('type', 'all')
        params.append('limit', '100')

        const response = await apiGet(`/api/transactions?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const transactionsList = data.transactions || []
          setTransactions(transactionsList)
          await setCachedTransactions(transactionsList)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    // Subscribe to send transactions table changes
    const sendTransactionsChannel = supabase
      .channel(`user-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('User transaction change received via Realtime:', payload.eventType)
          // Refetch transactions to get updated data
          await fetchCombinedTransactions()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user send transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('User send transactions subscription error')
        }
      })

    // Subscribe to receive transactions table changes
    const receiveTransactionsChannel = supabase
      .channel(`user-crypto-receive-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'crypto_receive_transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('User crypto receive transaction change received via Realtime:', payload.eventType)
          // Refetch transactions to get updated data
          await fetchCombinedTransactions()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user crypto receive transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('User crypto receive transactions subscription error')
        }
      })

    return () => {
      supabase.removeChannel(sendTransactionsChannel)
      supabase.removeChannel(receiveTransactionsChannel)
    }
  }, [userProfile?.id])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams()
      params.append('type', 'all')
      params.append('limit', '100')

      const response = await apiGet(`/api/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const transactionsList = data.transactions || []
        
        // Cache transactions
        if (userProfile?.id) {
          const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            value: transactionsList,
            timestamp: Date.now()
          }))
        }
        
        setTransactions(transactionsList)
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'deposited':
        return '#10b981'
      case 'pending':
      case 'confirmed':
        return '#f59e0b'
      case 'processing':
      case 'converting':
      case 'converted':
        return '#007ACC'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyData = currencies.find((c) => c && c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false
    
    // If no search term, show all transactions
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

  const renderTransaction = ({ item }: { item: CombinedTransaction }) => {
    // Determine transaction type: send or receive (match web logic)
    // Default to send for backward compatibility
    const transactionType = item.type || 'send'
    
    const detailScreen = transactionType === 'send' ? 'TransactionDetails' : 'ReceiveTransactionDetails'
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => {
          navigation.navigate(detailScreen, { 
            transactionId: item.transaction_id,
            fromScreen: 'Transactions'
          })
        }}
      >
        {/* Header with Type Badge, Transaction ID and Status */}
        <View style={styles.transactionHeader}>
          <View style={styles.headerLeft}>
            <View style={[
              styles.typeBadge, 
              transactionType === 'send' ? styles.typeBadgeSend : styles.typeBadgeReceive
            ]}>
              <Text style={styles.typeBadgeText}>
                {transactionType === 'send' ? 'Send' : 'Receive'}
              </Text>
            </View>
            <Text style={styles.transactionId}>{item.transaction_id || item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {transactionType === 'send' ? (
          <>
            {/* Recipient Info */}
            <View style={styles.recipientSection}>
              <Text style={styles.recipientLabel}>To</Text>
              <Text style={styles.recipientName}>{item.recipient?.full_name || 'Unknown'}</Text>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Send Amount</Text>
                <Text style={styles.sendAmount}>
                  {formatAmount(item.send_amount || 0, item.send_currency || '')}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Receive Amount</Text>
                <Text style={styles.receiveAmount}>
                  {formatAmount(item.receive_amount || 0, item.receive_currency || '')}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Stablecoin Info */}
            <View style={styles.recipientSection}>
              <Text style={styles.recipientLabel}>Stablecoin Received</Text>
              <Text style={styles.recipientName}>
                {formatAmount(item.crypto_amount || 0, item.crypto_currency || 'USDC')}
              </Text>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Converted To</Text>
                <Text style={styles.receiveAmount}>
                  {formatAmount(item.fiat_amount || 0, item.fiat_currency || '')}
                </Text>
              </View>
              {item.crypto_wallet?.wallet_address && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Wallet</Text>
                  <Text style={styles.walletAddress}>
                    {item.crypto_wallet.wallet_address.slice(0, 8)}...{item.crypto_wallet.wallet_address.slice(-6)}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer with Date and Arrow */}
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </TouchableOpacity>
    )
  }


  return (
    <ScreenWrapper>
      <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>View all your transfers</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search transactions..."
          placeholderTextColor="#9ca3af"
        />
      </View>


      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchTerm 
                ? 'Try adjusting your search' 
                : 'Start by sending your first transfer'
              }
            </Text>
          </View>
        }
      />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  typeBadgeSend: {
    backgroundColor: '#007ACC',
  },
  typeBadgeReceive: {
    backgroundColor: '#8b5cf6',
  },
  typeBadgeCard: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  typeBadgeCardText: {
    color: '#1f2937',
  },
  transactionId: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recipientSection: {
    marginBottom: 16,
  },
  recipientLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  amountSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sendAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  receiveAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  walletAddress: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#d1d5db',
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

// Export TransactionsScreen directly (authentication handled at navigator level)
export default function TransactionsScreen(props: NavigationProps) {
  return <TransactionsContent {...props} />
}
