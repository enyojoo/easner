import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Transaction } from '../../types'
import ScreenWrapper from '../../components/ScreenWrapper'

export default function DashboardScreen({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const { transactions, currencies, exchangeRates, loading, refreshAll } = useUserData()
  const [refreshing, setRefreshing] = useState(false)
  const [totalSent, setTotalSent] = useState(0)

  const recentTransactions = transactions.slice(0, 3)

  useEffect(() => {
    if (!userProfile?.id || !transactions?.length || !exchangeRates?.length) return

    try {
      const calculateTotalSent = () => {
        const baseCurrency = userProfile.profile.base_currency || "NGN"
        let totalInBaseCurrency = 0

        for (const transaction of transactions) {
          if (!transaction || transaction.status !== "completed") continue

          let amountInBaseCurrency = transaction.send_amount || 0

          // If transaction currency is different from base currency, convert it
          if (transaction.send_currency !== baseCurrency) {
            // Find exchange rate from transaction currency to base currency
            const rate = exchangeRates.find(
              (r) => r && r.from_currency === transaction.send_currency && r.to_currency === baseCurrency,
            )

            if (rate && rate.rate > 0) {
              amountInBaseCurrency = transaction.send_amount * rate.rate
            } else {
              // If direct rate not found, try reverse rate
              const reverseRate = exchangeRates.find(
                (r) => r && r.from_currency === baseCurrency && r.to_currency === transaction.send_currency,
              )
              if (reverseRate && reverseRate.rate > 0) {
                amountInBaseCurrency = transaction.send_amount / reverseRate.rate
              }
            }
          }

          totalInBaseCurrency += amountInBaseCurrency
        }

        setTotalSent(totalInBaseCurrency)
      }

      calculateTotalSent()
    } catch (error) {
      console.error("Error calculating total sent:", error)
      setTotalSent(0)
    }
  }, [transactions, exchangeRates, userProfile])

  const getTransactionStats = () => {
    const completedTransactions = transactions.filter(t => t.status === 'completed').length
    return {
      completedTransactions,
      totalSent
    }
  }

  const stats = getTransactionStats()

  const formatNumber = (num: number) => {
    // Values less than 1,000: show with decimals (e.g., 12.50)
    if (num < 1000) {
      return num.toFixed(2)
    }
    
    // Values 1,000 to 9,999: show as whole numbers (e.g., 1,000, 1,500)
    if (num < 10000) {
      return num.toLocaleString()
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

      {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Send')}
          >
            <Ionicons name="send" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Recipients')}
          >
            <Ionicons name="people" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Recipients</Text>
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
          recentTransactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.id} 
              style={styles.transactionItem}
              onPress={() => navigation.navigate('TransactionDetails', { transactionId: transaction.transaction_id })}
            >
              {/* Header with Transaction ID and Status */}
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionId}>{transaction.transaction_id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                    {transaction.status.toUpperCase()}
                  </Text>
                </View>
              </View>

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
                    {formatAmount(transaction.send_amount, transaction.send_currency)}
                  </Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Receive Amount</Text>
                  <Text style={styles.receiveAmount}>
                    {formatAmount(transaction.receive_amount, transaction.receive_currency)}
                  </Text>
                </View>
              </View>

              {/* Footer with Date and Arrow */}
              <View style={styles.transactionFooter}>
                <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent transactions</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Send')}
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
  },
  actionButton: {
    backgroundColor: '#007ACC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007ACC',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 0,
  },
  secondaryButtonText: {
    color: '#007ACC',
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
