import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Transaction } from '../../types'
import ScreenWrapper from '../../components/ScreenWrapper'
import DashboardSkeleton from '../../components/DashboardSkeleton'
import { transactionService } from '../../lib/transactionService'
import { analytics } from '../../lib/analytics'
import { apiGet } from '../../lib/apiClient'
import AsyncStorage from '@react-native-async-storage/async-storage'

function DashboardContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const { transactions, currencies, exchangeRates, loading, refreshAll, refreshTransactions } = useUserData()
  const [refreshing, setRefreshing] = useState(false)
  const [totalSent, setTotalSent] = useState(0)
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([])
  const [cardTransactions, setCardTransactions] = useState<any[]>([])

  const recentTransactions = liveTransactions.length > 0 ? liveTransactions.slice(0, 2) : transactions.slice(0, 2)

  // Calculate transaction stats
  const getTransactionStats = () => {
    const currentTransactions = liveTransactions.length > 0 ? liveTransactions : transactions
    const completedTransactions = currentTransactions.filter(t => t.status === 'completed').length
    return {
      completedTransactions,
      totalSent
    }
  }

  const stats = getTransactionStats()

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Dashboard', {
      hasTransactions: transactions.length > 0,
      totalSent: stats.totalSent
    })
  }, [transactions.length, stats.totalSent])

  // Initialize live transactions with current data
  useEffect(() => {
    if (transactions.length > 0) {
      setLiveTransactions(transactions)
    }
  }, [transactions])

  // Fetch card transactions
  useEffect(() => {
    if (!userProfile?.id) return

    const fetchCardTransactions = async () => {
      try {
        // Fetch all cards first
        const cardsResponse = await apiGet('/api/cards')
        
        if (cardsResponse.ok) {
          const cardsData = await cardsResponse.json()
          const cards = cardsData.cards || []
          
          // Fetch transactions for all cards
          const transactionPromises = cards.map((card: any) =>
            apiGet(`/api/cards/${card.id}/transactions`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
          
          const transactionResults = await Promise.all(transactionPromises)
          
          // Combine all card transactions (only debit/spending transactions)
          const allCardTransactions: any[] = []
          transactionResults.forEach((result) => {
            if (result && result.transactions) {
              const debitTransactions = result.transactions
                .filter((tx: any) => {
                  // Only include debit transactions (spending)
                  const amount = parseFloat(tx.amount || "0")
                  return amount < 0 || tx.type === "debit"
                })
                .map((tx: any) => ({
                  ...tx,
                  amount: Math.abs(parseFloat(tx.amount || "0")),
                  currency: tx.currency || "USD",
                }))
              allCardTransactions.push(...debitTransactions)
            }
          })
          
          setCardTransactions(allCardTransactions)
        }
      } catch (error) {
        console.error("Error fetching card transactions:", error)
      }
    }

    fetchCardTransactions()
  }, [userProfile?.id])

  // Poll for transaction updates every 10 seconds for all transactions
  useEffect(() => {
    if (!userProfile?.id || recentTransactions.length === 0) return

    const pollInterval = setInterval(async () => {
      try {
        const updatedTransactions = await Promise.all(
          recentTransactions.map(async (transaction) => {
            try {
              const updatedTransaction = await transactionService.getById(transaction.transaction_id)
              return updatedTransaction
            } catch (error) {
              console.error('Error polling transaction:', error)
              return transaction
            }
          })
        )

        // Update only if status has changed
        const hasChanges = updatedTransactions.some((updated, index) => 
          updated.status !== recentTransactions[index].status
        )

        if (hasChanges) {
          // Update the live transactions with new data
          setLiveTransactions(prev => {
            const updated = [...prev]
            updatedTransactions.forEach((updatedTransaction, index) => {
              const originalIndex = prev.findIndex(t => t.transaction_id === updatedTransaction.transaction_id)
              if (originalIndex !== -1) {
                updated[originalIndex] = updatedTransaction as Transaction
              }
            })
            return updated
          })
        }
      } catch (error) {
        console.error('Error polling transactions:', error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [recentTransactions, userProfile?.id])

  useEffect(() => {
    const currentTransactions = liveTransactions.length > 0 ? liveTransactions : transactions
    if (!userProfile?.id || !currentTransactions?.length || !exchangeRates?.length) return

    try {
      const calculateTotalSent = () => {
        const baseCurrency = userProfile.profile.base_currency || "NGN"
        let totalInBaseCurrency = 0

        // Helper function to convert amount to base currency
        const convertToBaseCurrency = (
          amount: number,
          fromCurrency: string,
          baseCurrency: string,
          exchangeRates: any[]
        ): number => {
          if (fromCurrency === baseCurrency) return amount

          // Find exchange rate from transaction currency to base currency
          const rate = exchangeRates.find(
            (r) => r && r.from_currency === fromCurrency && r.to_currency === baseCurrency,
          )

          if (rate && rate.rate > 0) {
            return amount * rate.rate
          }

          // If direct rate not found, try reverse rate
          const reverseRate = exchangeRates.find(
            (r) => r && r.from_currency === baseCurrency && r.to_currency === fromCurrency,
          )
          if (reverseRate && reverseRate.rate > 0) {
            return amount / reverseRate.rate
          }

          // If no rate found, return original amount (assume same currency)
          return amount
        }

        // 1. Send transactions: use receive_amount (what recipient gets)
        const sendTransactions = currentTransactions.filter((t) => {
          if (!t) return false
          // Must be completed
          if (t.status !== "completed") return false
          // If type is explicitly set, use it
          if (t.type === "send") return true
          // Exclude receive and card_funding
          if (t.type === "receive" || t.type === "card_funding") return false
          // If type is not set but has send_amount/receive_amount, it's a send transaction
          // Also check if it has recipient (send transactions have recipients)
          if (t.send_amount || t.receive_amount || t.recipient) return true
          return false
        })

        for (const transaction of sendTransactions) {
          // Use receive_amount if available, otherwise fall back to send_amount
          const amount = transaction.receive_amount || transaction.send_amount || 0
          const currency = transaction.receive_currency || transaction.send_currency || baseCurrency
          
          if (amount > 0) {
            const amountInBaseCurrency = convertToBaseCurrency(
              amount,
              currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        // 2. Receive transactions: use fiat_amount (what user received as payout)
        // Only include if type is explicitly "receive" (not card_funding)
        const receiveTransactions = currentTransactions.filter((t) => {
          if (!t) return false
          if (t.status !== "completed") return false
          // Must be explicitly marked as receive (not card_funding)
          return t.type === "receive" && t.destination_type === "bank"
        })

        for (const transaction of receiveTransactions) {
          if (transaction.fiat_amount && transaction.fiat_currency) {
            const amountInBaseCurrency = convertToBaseCurrency(
              transaction.fiat_amount,
              transaction.fiat_currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        // 3. Card transactions: use amount spent (debit transactions)
        for (const cardTx of cardTransactions || []) {
          if (cardTx.amount && cardTx.currency && cardTx.amount > 0) {
            const amountInBaseCurrency = convertToBaseCurrency(
              cardTx.amount,
              cardTx.currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        setTotalSent(totalInBaseCurrency)
      }

      calculateTotalSent()
    } catch (error) {
      console.error("Error calculating total sent:", error)
      setTotalSent(0)
    }
  }, [liveTransactions, transactions, exchangeRates, userProfile, cardTransactions])

  const formatNumber = (num: number) => {
    // Values less than 1,000: show with decimals (e.g., 12.50)
    if (num < 1000) {
      return num.toFixed(2)
    }
    
    // Values 1,000 to 9,999: show as whole numbers (e.g., 1,000, 1,500)
    if (num < 10000) {
      return Math.round(num).toLocaleString()
    }
    
    // Values 10,000 and above: apply K/M/B/T rounding
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatCurrencyValue = (amount: number, currencyCode: string) => {
    try {
      const currency = currencies?.find((c) => c && c.code === currencyCode)
      const formattedNumber = formatNumber(amount)
      return `${currency?.symbol || ""}${formattedNumber}`
    } catch (error) {
      console.error("Error formatting currency:", error)
      return `${currencyCode} ${formatNumber(amount)}`
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshAll()
    // Also refresh live transactions
    if (liveTransactions.length > 0) {
      setLiveTransactions(transactions)
    }
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'processing':
        return '#007ACC'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`
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

  // Show skeleton while data is loading
  if (loading || !userProfile || !currencies?.length || !exchangeRates?.length) {
    return <DashboardSkeleton />
  }

  return (
    <ScreenWrapper>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi {userProfile?.profile.first_name || 'User'}👋🏻
        </Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.totalSentCard]}>
          <Text style={styles.totalSentNumber}>
            {formatCurrencyValue(stats.totalSent, userProfile?.profile.base_currency || "NGN")}
          </Text>
          <Text style={styles.totalSentLabel}>Total Sent</Text>
        </View>
        <View style={[styles.statCard, styles.transactionsCard]}>
          <Text style={styles.totalSentNumber}>{stats.completedTransactions}</Text>
          <Text style={styles.totalSentLabel}>Transactions</Text>
        </View>
      </View>

      {/* Quick Actions - Minimal Modern Banking Style */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SendAmount')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="send" size={24} color="#007ACC" />
            </View>
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to ReceiveMoney - use the tab navigator directly
              // Dashboard is in MainTabs, so getParent() gives us the Tab navigator
              const tabNavigator = navigation.getParent()
              if (tabNavigator) {
                tabNavigator.navigate('ReceiveMoney')
              }
            }}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="download-outline" size={24} color="#007ACC" />
            </View>
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Card')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="card-outline" size={24} color="#007ACC" />
            </View>
            <Text style={styles.actionButtonText}>Card</Text>
          </TouchableOpacity>
        </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            if (!transaction) return null
            const statusColor = getStatusColor(transaction.status)
            
            // Determine transaction type: send, receive (bank), or card_funding
            let transactionType: 'send' | 'receive' | 'card_funding' = 'send'
            if (transaction.type === 'receive' || transaction.type === 'card_funding') {
              transactionType = transaction.type
            } else if (transaction.destination_type === 'card') {
              transactionType = 'card_funding'
            } else if (transaction.destination_type === 'bank' || transaction.crypto_amount) {
              transactionType = 'receive'
            }
            
            const detailScreen = transactionType === 'send' ? 'TransactionDetails' : 'ReceiveTransactionDetails'
            
            return (
              <TouchableOpacity 
                key={transaction.id} 
                style={styles.transactionItem}
                onPress={() => {
                  if (transactionType === 'card_funding') {
                    navigation.navigate('Card')
                  } else {
                    navigation.navigate(detailScreen, { 
                      transactionId: transaction.transaction_id,
                      fromScreen: 'Dashboard'
                    })
                  }
                }}
              >
                {/* Header with Type Badge, Transaction ID and Status */}
                <View style={styles.transactionHeader}>
                  <View style={styles.headerLeft}>
                    <View style={[
                      styles.typeBadge,
                      transactionType === 'send' ? styles.typeBadgeSend :
                      transactionType === 'card_funding' ? styles.typeBadgeCard :
                      styles.typeBadgeReceive
                    ]}>
                      <Text style={[
                        styles.typeBadgeText,
                        transactionType === 'card_funding' && styles.typeBadgeCardText
                      ]}>
                        {transactionType === 'send' ? 'Send' :
                         transactionType === 'card_funding' ? 'Card Funding' :
                         'Receive'}
                      </Text>
                    </View>
                    <Text style={styles.transactionId}>{transaction.transaction_id}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {transaction.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {transactionType === 'send' ? (
                  <>
                    {/* Recipient Info */}
                    <View style={styles.recipientSection}>
                      <Text style={styles.recipientLabel}>To</Text>
                      <Text style={styles.recipientName}>{transaction.recipient?.full_name || 'Unknown'}</Text>
                    </View>

                    {/* Amount Section */}
                    <View style={styles.amountSection}>
                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Send Amount</Text>
                        <Text style={styles.sendAmount}>
                          {formatAmount(transaction.send_amount || 0, transaction.send_currency || '')}
                        </Text>
                      </View>
                      {transaction.receive_amount && transaction.receive_currency && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Receive Amount</Text>
                          <Text style={styles.receiveAmount}>
                            {formatAmount(transaction.receive_amount, transaction.receive_currency)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : transactionType === 'card_funding' ? (
                  <>
                    {/* Card Funding Info */}
                    <View style={styles.recipientSection}>
                      <Text style={styles.recipientLabel}>Card Top-Up</Text>
                      <Text style={styles.recipientName}>
                        {formatAmount(transaction.crypto_amount || 0, transaction.crypto_currency || 'USDC')}
                      </Text>
                    </View>

                    {/* Amount Section */}
                    <View style={styles.amountSection}>
                      {transaction.fiat_amount && transaction.fiat_currency && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Card Currency</Text>
                          <Text style={styles.receiveAmount}>
                            {formatAmount(transaction.fiat_amount, transaction.fiat_currency)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    {/* Receive Transaction Info */}
                    <View style={styles.recipientSection}>
                      <Text style={styles.recipientLabel}>Stablecoin Received</Text>
                      <Text style={styles.recipientName}>
                        {formatAmount(transaction.crypto_amount || 0, transaction.crypto_currency || 'USDC')}
                      </Text>
                    </View>

                    {/* Amount Section */}
                    <View style={styles.amountSection}>
                      {transaction.fiat_amount && transaction.fiat_currency && (
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>Converted To</Text>
                          <Text style={styles.receiveAmount}>
                            {formatAmount(transaction.fiat_amount, transaction.fiat_currency)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Footer with Date and Arrow */}
                <View style={styles.transactionFooter}>
                  <Text style={styles.transactionDate}>{formatTimestamp(transaction.created_at)}</Text>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent transactions</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('SendAmount')}
            >
              <Text style={styles.emptyButtonText}>Send Your First Transfer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  supportButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalSentCard: {
    flex: 1.5,
    padding: 20,
  },
  transactionsCard: {
    flex: 1,
    padding: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  totalSentNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  totalSentLabel: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#007ACC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007ACC',
    fontWeight: '500',
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
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    color: '#6b7280',
    fontFamily: 'monospace',
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
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#007ACC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})

// Export DashboardScreen directly (authentication handled at navigator level)
export default function DashboardScreen(props: NavigationProps) {
  return <DashboardContent {...props} />
}
