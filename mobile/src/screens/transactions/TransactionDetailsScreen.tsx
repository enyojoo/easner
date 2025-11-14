import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Clipboard,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { transactionService, TransactionData } from '../../lib/transactionService'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { analytics } from '../../lib/analytics'
import { TransactionTimeline } from '../../components/TransactionTimeline'

export default function TransactionDetailsScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { refreshTransactions, currencies, paymentMethods } = useUserData()
  const insets = useSafeAreaInsets()
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [timerDuration, setTimerDuration] = useState(3600) // Payment method's completion_timer_seconds
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const { transactionId, fromScreen } = route.params || {}

  // Custom back navigation handler
  const handleBackNavigation = () => {
    // Use goBack() to trigger the natural transition animation
    navigation.goBack()
  }

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('TransactionDetails')
  }, [])

  // Initialize timer duration from payment method when transaction is loaded
  useEffect(() => {
    if (transaction && paymentMethods.length > 0) {
      const getDefaultPaymentMethod = (currency: string) => {
        const methods = paymentMethods.filter((pm) => pm.currency === currency && pm.status === 'active')
        return methods.find((pm) => pm.is_default) || methods[0]
      }

      const defaultMethod = getDefaultPaymentMethod(transaction.send_currency)
      const timerSeconds = defaultMethod?.completion_timer_seconds ?? 3600
      setTimerDuration(timerSeconds)
    }
  }, [transaction, paymentMethods])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (transactionId && userProfile?.id) {
      fetchTransactionDetails()
    }
  }, [transactionId, userProfile?.id])

  // Poll for transaction updates every 10 seconds
  useEffect(() => {
    if (!transaction || !userProfile?.id) return

    const pollInterval = setInterval(async () => {
      try {
        const updatedTransaction = await transactionService.getById(transaction.transaction_id)
        if (updatedTransaction.status !== transaction.status) {
          setTransaction(updatedTransaction)
        }
      } catch (error) {
        console.error('Error polling transaction status:', error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [transaction, userProfile?.id])

  const fetchTransactionDetails = async () => {
    try {
      setError(null)

      const transactionData = await transactionService.getById(transactionId.toUpperCase())

      // Verify this transaction belongs to the current user
      if (transactionData.user_id !== userProfile?.id) {
        setError('Transaction not found or access denied')
        return
      }

      setTransaction(transactionData)
    } catch (error: any) {
      console.error('Error loading transaction:', error)
      setError(error.message || 'Failed to load transaction details')
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTransactionDetails()
    setRefreshing(false)
  }

  const getTimeInfo = () => {
    if (!transaction) return { timeRemaining: 0, isOverdue: false, elapsedTime: 0 }

    const createdAt = new Date(transaction.created_at).getTime()
    const estimatedCompletionTime = 30 * 60 * 1000 // 30 minutes in milliseconds
    const targetCompletionTime = createdAt + estimatedCompletionTime
    const elapsedTime = currentTime - createdAt
    const timeRemaining = Math.max(0, targetCompletionTime - currentTime)
    const isOverdue = currentTime > targetCompletionTime

    return {
      timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
      isOverdue,
      elapsedTime: Math.floor(elapsedTime / 1000), // in seconds
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Transaction Initiated',
          description: 'Waiting for payment confirmation',
          isCompleted: false,
        }
      case 'processing':
        return {
          title: 'Payment Received',
          description: 'Your payment has been received and is being processed',
          isCompleted: false,
        }
      case 'initiated':
        return {
          title: 'Transfer in Progress',
          description: 'Your transfer has been initiated to the recipient',
          isCompleted: false,
        }
      case 'completed':
        return {
          title: 'Transfer Complete!',
          description: 'Your money has been successfully transferred',
          isCompleted: true,
        }
      case 'failed':
        return {
          title: 'Transaction Failed',
          description: 'There was an issue with your transaction. Please contact support.',
          isCompleted: false,
        }
      default:
        return {
          title: 'Transaction Processing',
          description: 'Your transaction is being processed',
          isCompleted: false,
        }
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔄'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Calculate elapsed time in seconds
  const getElapsedTime = (): number => {
    if (!transaction) return 0
    
    const createdAt = new Date(transaction.created_at).getTime()
    
    if (transaction.status === 'completed') {
      // For completed, use completed_at or updated_at
      const completedAt = transaction.completed_at 
        ? new Date(transaction.completed_at).getTime()
        : new Date(transaction.updated_at).getTime()
      return Math.floor((completedAt - createdAt) / 1000)
    } else {
      // For pending/processing, use current time
      return Math.floor((currentTime - createdAt) / 1000)
    }
  }

  // Calculate remaining time for pending/processing
  const getRemainingTime = (): number => {
    const elapsed = getElapsedTime()
    const remaining = timerDuration - elapsed
    return Math.max(0, remaining)
  }

  // Calculate delay for completed transactions or when timer has finished
  const getDelay = (): number => {
    if (!transaction) return 0
    const elapsed = getElapsedTime()
    const delay = elapsed - timerDuration
    return Math.max(0, delay)
  }

  // Get timer display text
  const getTimerDisplay = (): string | null => {
    if (!transaction) return null
    
    // Don't show timer for failed/cancelled
    if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      return null
    }

    if (transaction.status === 'completed') {
      const elapsed = getElapsedTime()
      const delay = getDelay()
      
      if (delay > 0) {
        return `Took ${formatTime(elapsed)} • Delayed ${formatTime(delay)}`
      } else {
        return `Took ${formatTime(elapsed)}`
      }
    } else {
      // Pending or processing
      const remaining = getRemainingTime()
      const delay = getDelay()
      
      // If timer has finished (remaining <= 0), show delayed time
      if (remaining <= 0 && delay > 0) {
        return `Delayed ${formatTime(delay)}`
      }
      
      // Otherwise show countdown
      return `Time left ${formatTime(remaining)}`
    }
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

  const handleViewReceipt = async () => {
    if (transaction?.receipt_url) {
      try {
        await Linking.openURL(transaction.receipt_url)
      } catch (error) {
        Alert.alert('Error', 'Could not open receipt')
      }
    }
  }

  const handleSendAgain = () => {
    navigation.navigate('MainTabs', { screen: 'Send' })
  }

  const handleContactSupport = () => {
    // Navigate to support or open support contact
    Alert.alert('Contact Support', 'Support functionality will be implemented')
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await Clipboard.setString(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard')
    }
  }

  if (error) {
    return (
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={handleBackNavigation}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
        </View>
        
      <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTransactionDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Don't render main content until transaction is loaded
  if (!transaction) {
    return (
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={handleBackNavigation}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const statusMessage = getStatusMessage(transaction.status)
  const { timeRemaining, isOverdue } = getTimeInfo()

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={handleBackNavigation}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transaction Status Header with Amount */}
        {transaction && (
          <View style={styles.statusHeaderWithTimer}>
            <Text style={styles.statusTitleSmall}>Transaction Status</Text>
            <Text style={styles.amountText}>
              {formatCurrency(transaction.send_amount, transaction.send_currency)}
            </Text>
            {getTimerDisplay() && (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#ea580c" />
                <Text style={styles.timerText}>{getTimerDisplay()}</Text>
              </View>
            )}
          </View>
        )}

        {/* Transaction ID for pending, processing, or completed statuses */}
        {(transaction.status === 'pending' ||
          transaction.status === 'processing' ||
          transaction.status === 'completed') && (
          <View style={styles.transactionIdSection}>
            <View style={styles.transactionIdRow}>
              <Text style={styles.transactionIdLabel}>Transaction ID</Text>
              <View style={styles.transactionIdValueRow}>
                <Text style={styles.transactionIdValue}>{transaction.transaction_id}</Text>
                <TouchableOpacity
                  onPress={() => handleCopy(transaction.transaction_id, "transactionId")}
                  style={styles.copyButton}
                >
                  {copiedStates.transactionId ? (
                    <Ionicons name="checkmark" size={12} color="#10b981" />
                  ) : (
                    <Ionicons name="copy" size={12} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Show Timeline for pending, processing, or completed statuses */}
        {(transaction.status === 'pending' ||
          transaction.status === 'processing' ||
          transaction.status === 'completed') ? (
          <View style={styles.timelineWrapper}>
            <TransactionTimeline transaction={transaction} />
          </View>
        ) : (
          /* Show current UI for failed/cancelled statuses */
          <>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIconContainer,
            {
                  backgroundColor: transaction.status === 'failed'
                  ? '#fef2f2'
                    : '#f3f4f6'
            }
          ]}>
            <Ionicons
                  name={transaction.status === 'failed' ? 'close-circle' : 'time'}
              size={32}
                  color={transaction.status === 'failed' ? '#dc2626' : '#6b7280'}
            />
      </View>
          <Text style={styles.statusTitle}>{statusMessage.title}</Text>
          <Text style={styles.statusDescription}>{statusMessage.description}</Text>
              
              {/* Transaction ID and Created for failed/cancelled */}
              <View style={styles.failedTransactionDetails}>
                <View style={styles.failedDetailRowInline}>
                  <Text style={styles.failedDetailLabel}>Transaction ID:</Text>
                  <Text style={styles.failedDetailValue}>{transaction.transaction_id}</Text>
                </View>
                <View style={styles.failedDetailRowInline}>
                  <Text style={styles.failedDetailLabel}>Created:</Text>
                  <Text style={styles.failedDetailValue}>
                    {formatTimestamp(transaction.created_at)}
                  </Text>
                </View>
              </View>
        </View>
        
        {/* Status Information */}
        <View style={[
          styles.statusInfo,
          {
                backgroundColor: transaction.status === 'failed' ? '#fef2f2' : '#f3f4f6'
          }
        ]}>
          <Text style={styles.statusInfoLabel}>
                {transaction.status === 'failed' ? 'Failed:' : 'Status:'}
          </Text>
          <Text style={styles.statusInfoValue}>
                {formatTimestamp(transaction.updated_at)}
          </Text>
        </View>
          </>
        )}
        
        {/* Receipt Section */}
        {transaction.receipt_url && (
          <View style={styles.receiptSection}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptIcon}>
                <Ionicons name="document-text" size={20} color="#16a34a" />
              </View>
              <View style={styles.receiptInfo}>
                <Text style={styles.receiptTitle}>Your Payment Receipt</Text>
                <Text style={styles.receiptFilename}>{transaction.receipt_filename}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.receiptButton} onPress={handleViewReceipt}>
              <Ionicons name="open-outline" size={16} color="#007ACC" />
              <Text style={styles.receiptButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You Sent</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(transaction.send_amount, transaction.send_currency)}
            </Text>
        </View>
        
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fee</Text>
            <Text style={[
              styles.summaryValue,
              transaction.fee_amount === 0 ? styles.freeText : {}
            ]}>
              {transaction.fee_amount === 0
                ? 'FREE'
                : formatCurrency(transaction.fee_amount, transaction.send_currency)}
            </Text>
        </View>
        
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(transaction.total_amount, transaction.send_currency)}
            </Text>
        </View>
        
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Recipient Gets</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
            </Text>
      </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Exchange Rate</Text>
            <Text style={styles.exchangeRateText}>
              1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(4)} {transaction.receive_currency}
            </Text>
          </View>
        </View>
        
        {/* Recipient Details */}
        {transaction.recipient && (
          <View style={styles.recipientSection}>
            <Text style={styles.recipientTitle}>Recipient</Text>
            <Text style={styles.recipientName}>{transaction.recipient.full_name}</Text>
            <Text style={styles.recipientAccount}>{transaction.recipient.account_number}</Text>
            <Text style={styles.recipientBank}>{transaction.recipient.bank_name}</Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[
        styles.bottomContainer,
        { 
          paddingBottom: Math.max(insets.bottom + 8, 16),
        }
      ]}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.secondaryBottomButton]} 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
        >
          <Text style={styles.secondaryBottomButtonText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomButton, styles.primaryBottomButton]} 
          onPress={handleSendAgain}
        >
          <Text style={styles.primaryBottomButtonText}>Send Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007ACC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007ACC',
  },
  backButtonText: {
    color: '#007ACC',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#ea580c',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  statusHeaderWithTimer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
    gap: 0,
  },
  statusTitleSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    lineHeight: 14,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  transactionIdSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIdLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionIdValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionIdValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1f2937',
  },
  timelineWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusHeader: {
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  copyButton: {
    padding: 4,
    marginLeft: 4,
  },
  statusInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  receiptSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  receiptFilename: {
    fontSize: 14,
    color: '#6b7280',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007ACC',
  },
  receiptButtonText: {
    color: '#007ACC',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  summarySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
  },
  freeText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  exchangeRateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipientSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
  },
  recipientTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  recipientBank: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryBottomButton: {
    backgroundColor: '#007ACC',
  },
  secondaryBottomButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryBottomButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBottomButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
})
