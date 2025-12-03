import React, { useState, useEffect, useRef } from 'react'
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
  BackHandler,
  Clipboard,
  Animated,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { transactionService, TransactionData } from '../../lib/transactionService'
import { supabase } from '../../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { analytics } from '../../lib/analytics'
import { TransactionTimeline } from '../../components/TransactionTimeline'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

export default function SendTransactionDetailsScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { refreshTransactions, currencies, paymentMethods } = useUserData()
  const insets = useSafeAreaInsets()
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [timerDuration, setTimerDuration] = useState(3600)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const { transactionId, fromScreen } = route.params || {}

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerAnim, contentAnim])

  useEffect(() => {
    analytics.trackScreenView('SendTransactionDetails')
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => true
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
      return () => backHandler.remove()
    }, [])
  )

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

  useEffect(() => {
    if (!transaction || !userProfile?.id || !transactionId) return

    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `transaction_id=eq.${transactionId.toUpperCase()}`,
        },
        async (payload) => {
          try {
            const updatedTransaction = await transactionService.getById(transactionId.toUpperCase())
            if (updatedTransaction) {
              setTransaction(updatedTransaction)
            }
          } catch (error) {
            console.error('Error fetching updated transaction:', error)
          }
        }
      )
      .subscribe()

    const pollInterval = setInterval(async () => {
      try {
        const updatedTransaction = await transactionService.getById(transaction.transaction_id)
        if (updatedTransaction.status !== transaction.status || 
            updatedTransaction.updated_at !== transaction.updated_at) {
          setTransaction(updatedTransaction)
        }
      } catch (error) {
        console.error('Error polling transaction status:', error)
      }
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [transaction, userProfile?.id, transactionId])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const transactionData = await transactionService.getById(transactionId.toUpperCase())

      if (transactionData.user_id !== userProfile?.id) {
        setError('Transaction not found or access denied')
        return
      }

      setTransaction(transactionData)
    } catch (error: any) {
      console.error('Error loading transaction:', error)
      setError(error.message || 'Failed to load transaction details')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTransactionDetails()
    setRefreshing(false)
  }

  const getElapsedTime = (): number => {
    if (!transaction) return 0
    
    const createdAt = new Date(transaction.created_at).getTime()
    
    if (transaction.status === 'completed') {
      const completedAt = transaction.completed_at 
        ? new Date(transaction.completed_at).getTime()
        : new Date(transaction.updated_at).getTime()
      return Math.floor((completedAt - createdAt) / 1000)
    } else {
      return Math.floor((currentTime - createdAt) / 1000)
    }
  }

  const getRemainingTime = (): number => {
    const elapsed = getElapsedTime()
    const remaining = timerDuration - elapsed
    return Math.max(0, remaining)
  }

  const getDelay = (): number => {
    if (!transaction) return 0
    const elapsed = getElapsedTime()
    const delay = elapsed - timerDuration
    return Math.max(0, delay)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimerDisplay = (): string | null => {
    if (!transaction) return null
    
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
      const remaining = getRemainingTime()
      const delay = getDelay()
      
      if (remaining <= 0 && delay > 0) {
        return `Delayed ${formatTime(delay)}`
      }
      
      return `Time left ${formatTime(remaining)}`
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: colors.status.pending, icon: 'time-outline' as const, label: 'Pending' }
      case 'processing':
        return { color: colors.status.processing, icon: 'sync-outline' as const, label: 'Processing' }
      case 'completed':
        return { color: colors.status.completed, icon: 'checkmark-circle' as const, label: 'Completed' }
      case 'failed':
        return { color: colors.status.failed, icon: 'close-circle' as const, label: 'Failed' }
      default:
        return { color: colors.neutral[500], icon: 'help-circle-outline' as const, label: 'Unknown' }
    }
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  const handleSendAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('SendAmount')
  }

  const handleGoToDashboard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('MainTabs', { screen: 'Dashboard' })
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await Clipboard.setString(text)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </View>
    )
  }

  if (error || !transaction) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTransactionDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const statusInfo = getStatusInfo(transaction.status)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header Card */}
        <Animated.View 
          style={[
            styles.statusCard,
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
          <LinearGradient
            colors={transaction.status === 'completed' ? colors.success.gradient : colors.primary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusGradient}
          >
            <Text style={styles.statusLabel}>Transaction Status</Text>
            <Text style={styles.amountText}>
              {formatCurrency(transaction.send_amount, transaction.send_currency)}
            </Text>
            
            <View style={styles.statusBadge}>
              <Ionicons name={statusInfo.icon} size={16} color={colors.text.inverse} />
              <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
            </View>

            {getTimerDisplay() && (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{getTimerDisplay()}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }}
        >
          {/* Transaction ID */}
          <View style={styles.card}>
            <View style={styles.transactionIdRow}>
              <Text style={styles.transactionIdLabel}>Transaction ID</Text>
              <TouchableOpacity 
                style={styles.transactionIdValueRow}
                onPress={() => handleCopy(transaction.transaction_id, "transactionId")}
              >
                <Text style={styles.transactionIdValue}>{transaction.transaction_id}</Text>
                <View style={[styles.copyIcon, copiedStates.transactionId && styles.copyIconSuccess]}>
                  <Ionicons 
                    name={copiedStates.transactionId ? "checkmark" : "copy-outline"} 
                    size={14} 
                    color={copiedStates.transactionId ? colors.success.main : colors.primary.main} 
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeline */}
          {(transaction.status === 'pending' || transaction.status === 'processing' || transaction.status === 'completed') && (
            <View style={styles.card}>
              <TransactionTimeline transaction={transaction} />
            </View>
          )}

          {/* Failed/Cancelled Status */}
          {(transaction.status === 'failed' || transaction.status === 'cancelled') && (
            <View style={styles.failedCard}>
              <View style={styles.failedIconContainer}>
                <Ionicons name="close-circle" size={32} color={colors.error.main} />
              </View>
              <Text style={styles.failedTitle}>
                {transaction.status === 'failed' ? 'Transaction Failed' : 'Transaction Cancelled'}
              </Text>
              <Text style={styles.failedDescription}>
                {transaction.status === 'failed' 
                  ? 'There was an issue with your transaction. Please contact support.'
                  : 'This transaction has been cancelled.'}
              </Text>
              <Text style={styles.failedTimestamp}>
                {formatTimestamp(transaction.updated_at)}
              </Text>
            </View>
          )}

          {/* Receipt */}
          {transaction.receipt_url && (
            <View style={styles.card}>
              <View style={styles.receiptRow}>
                <View style={styles.receiptIconContainer}>
                  <Ionicons name="document-text" size={20} color={colors.success.main} />
                </View>
                <View style={styles.receiptInfo}>
                  <Text style={styles.receiptTitle}>Payment Receipt</Text>
                  <Text style={styles.receiptFilename}>{transaction.receipt_filename}</Text>
                </View>
                <TouchableOpacity style={styles.receiptButton} onPress={handleViewReceipt}>
                  <Ionicons name="open-outline" size={16} color={colors.primary.main} />
                  <Text style={styles.receiptButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Transaction Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="receipt-outline" size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.cardTitle}>Transaction Summary</Text>
            </View>
            
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>You Sent</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(transaction.send_amount, transaction.send_currency)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={[styles.summaryValue, transaction.fee_amount === 0 && styles.freeText]}>
                  {transaction.fee_amount === 0 ? 'FREE' : formatCurrency(transaction.fee_amount, transaction.send_currency)}
                </Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(transaction.total_amount, transaction.send_currency)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient Gets</Text>
                <Text style={[styles.summaryValue, { color: colors.success.main }]}>
                  {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Exchange Rate</Text>
                <Text style={styles.rateText}>
                  1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(2)} {transaction.receive_currency}
                </Text>
              </View>
            </View>
          </View>

          {/* Recipient Details */}
          {transaction.recipient && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="person-outline" size={18} color={colors.primary.main} />
                </View>
                <Text style={styles.cardTitle}>Recipient</Text>
              </View>
              
              <View style={styles.recipientRow}>
                <LinearGradient
                  colors={colors.primary.gradient}
                  style={styles.recipientAvatar}
                >
                  <Text style={styles.recipientInitials}>
                    {transaction.recipient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{transaction.recipient.full_name}</Text>
                  <Text style={styles.recipientBank}>{transaction.recipient.bank_name}</Text>
                  <Text style={styles.recipientAccount}>{transaction.recipient.account_number}</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom + spacing[4], spacing[6]) }]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToDashboard}>
          <Text style={styles.secondaryButtonText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleSendAgain}>
          <LinearGradient
            colors={colors.primary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Send Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  errorTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  errorText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    ...textStyles.titleSmall,
    color: colors.text.inverse,
  },
  statusCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing[4],
    marginBottom: spacing[4],
    ...shadows.md,
  },
  statusGradient: {
    padding: spacing[5],
    alignItems: 'center',
  },
  statusLabel: {
    ...textStyles.labelMedium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[2],
  },
  amountText: {
    ...textStyles.displayMedium,
    color: colors.text.inverse,
    fontWeight: '700',
    marginBottom: spacing[3],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  statusBadgeText: {
    ...textStyles.labelMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    gap: spacing[1],
  },
  timerText: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  transactionIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIdLabel: {
    ...textStyles.labelMedium,
    color: colors.text.tertiary,
  },
  transactionIdValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  transactionIdValue: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  copyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIconSuccess: {
    backgroundColor: colors.success.background,
  },
  failedCard: {
    backgroundColor: colors.error.background,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[3],
    alignItems: 'center',
  },
  failedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  failedTitle: {
    ...textStyles.titleLarge,
    color: colors.error.main,
    marginBottom: spacing[2],
  },
  failedDescription: {
    ...textStyles.bodyMedium,
    color: colors.error.dark,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  failedTimestamp: {
    ...textStyles.bodySmall,
    color: colors.error.main,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.success.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTitle: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
    marginBottom: 2,
  },
  receiptFilename: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: spacing[1],
  },
  receiptButtonText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
  },
  summaryRows: {
    gap: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
  },
  freeText: {
    color: colors.success.main,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
    marginTop: spacing[1],
  },
  totalLabel: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
  },
  totalValue: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontWeight: '700',
  },
  rateText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  recipientInitials: {
    ...textStyles.titleMedium,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  recipientBank: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  recipientAccount: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryButtonText: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  primaryButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  primaryButtonText: {
    ...textStyles.titleMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
})
