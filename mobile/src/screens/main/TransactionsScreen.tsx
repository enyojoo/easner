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

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: 'send' | 'receive'
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
}

function TransactionsContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'send' | 'receive'>('all')

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Transactions')
  }, [])

  // Fetch combined transactions
  useEffect(() => {
    if (userProfile?.id) {
      loadTransactions()
    }
  }, [userProfile?.id, typeFilter])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const apiBase = process.env.EXPO_PUBLIC_API_URL || ''
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.append('type', typeFilter)
      params.append('limit', '100')

      const response = await fetch(`${apiBase}/api/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadTransactions()
    setRefreshing(false)
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
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    // Format: "Nov 07, 2025 • 7:29 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
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
    const matchesSearch = transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.type === 'send' && transaction.recipient?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.type === 'receive' && transaction.crypto_wallet?.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const renderTransaction = ({ item }: { item: CombinedTransaction }) => {
    const detailScreen = item.type === 'send' ? 'TransactionDetails' : 'ReceiveTransactionDetails'
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => navigation.navigate(detailScreen, { 
          transactionId: item.transaction_id,
          fromScreen: 'Transactions'
        })}
      >
        {/* Header with Type Badge, Transaction ID and Status */}
        <View style={styles.transactionHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.typeBadge, item.type === 'send' ? styles.typeBadgeSend : styles.typeBadgeReceive]}>
              <Text style={styles.typeBadgeText}>{item.type === 'send' ? 'Send' : 'Receive'}</Text>
            </View>
            <Text style={styles.transactionId}>{item.transaction_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {item.type === 'send' ? (
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
                {item.crypto_amount} {item.crypto_currency}
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

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, typeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setTypeFilter('all')}
        >
          <Text style={[styles.filterTabText, typeFilter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, typeFilter === 'send' && styles.filterTabActive]}
          onPress={() => setTypeFilter('send')}
        >
          <Text style={[styles.filterTabText, typeFilter === 'send' && styles.filterTabTextActive]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, typeFilter === 'receive' && styles.filterTabActive]}
          onPress={() => setTypeFilter('receive')}
        >
          <Text style={[styles.filterTabText, typeFilter === 'receive' && styles.filterTabTextActive]}>
            Receive
          </Text>
        </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007ACC',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
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
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
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
