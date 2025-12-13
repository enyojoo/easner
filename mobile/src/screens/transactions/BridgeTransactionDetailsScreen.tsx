import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import ScreenWrapper from '../../components/ScreenWrapper'
import { ShimmerListItem } from '../../components/premium'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'
import { apiGet } from '../../lib/apiClient'
import { useUserData } from '../../contexts/UserDataContext'

interface BridgeTransaction {
  id: string
  transaction_id: string
  bridge_transaction_id?: string
  transaction_type: 'send' | 'receive'
  direction: 'credit' | 'debit'
  amount: number
  currency: string
  final_amount?: number
  status: string
  source_type?: string
  source_payment_rail?: string
  destination_payment_rail?: string
  recipient_name?: string
  receipt_trace_number?: string
  receipt_imad?: string
  receipt_destination_tx_hash?: string
  receipt_final_amount?: number
  reference?: string
  metadata?: any
  created_at: string
  updated_at: string
  completed_at?: string
  bridge_created_at?: string
}

export default function BridgeTransactionDetailsScreen({ navigation, route }: NavigationProps) {
  const { transactionId, fromScreen } = route.params as { transactionId: string; fromScreen?: string }
  const insets = useSafeAreaInsets()
  const { currencies } = useUserData()
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const dataLoadedRef = useRef(false)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Cache TTL (10 minutes - same as other screens)
  const CACHE_TTL = 10 * 60 * 1000
  const CACHE_KEY = `easner_transaction_details_${transactionId}`

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
      console.warn(`[TransactionDetails] Error caching ${key}:`, error)
    }
  }, [])

  // Helper to check if data is stale
  const isStale = useCallback((timestamp: number | undefined, ttl: number): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > ttl
  }, [])

  useEffect(() => {
    if (!dataLoadedRef.current) {
      fetchTransactionDetails()
    }
  }, [transactionId])

  const fetchTransactionDetails = useCallback(async (force = false) => {
    // Prevent multiple simultaneous fetches
    if (dataLoadedRef.current && !force) return

    let cached: { data: BridgeTransaction; timestamp: number } | null = null

    // Try to load from cache first (stale-while-revalidate)
    if (!force) {
      cached = await getCachedData<BridgeTransaction>(CACHE_KEY)
      if (cached && !isStale(cached.timestamp, CACHE_TTL)) {
        // Data is fresh, use cache
        setTransaction(cached.data)
        setLoading(false)
        dataLoadedRef.current = true
        return
      } else if (cached) {
        // Data is stale, show cached data immediately, then fetch fresh
        setTransaction(cached.data)
        setLoading(false)
        dataLoadedRef.current = true
        // Continue to fetch fresh data in background
      }
    }

    try {
      if (!cached || force) {
        setLoading(true)
      }
      setError(null)

      // Try bridge transactions API first
      let response = await apiGet(`/api/bridge/transactions/${transactionId}`)
      if (!response.ok || (response as any).isNetworkError) {
        // Fallback to combined transactions API
        response = await apiGet(`/api/transactions/${transactionId}`)
      }

      if (response.ok && !(response as any).isNetworkError) {
        const data = await response.json()
        const transactionData = data.transaction
        
        setTransaction(transactionData)
        // Cache the transaction
        await setCachedData(CACHE_KEY, transactionData)
        dataLoadedRef.current = true
      } else {
        setError('Transaction not found')
      }
    } catch (err: any) {
      console.error('Error fetching transaction details:', err)
      setError('Failed to load transaction details')
    } finally {
      setLoading(false)
    }
  }, [transactionId, CACHE_KEY, getCachedData, setCachedData, isStale])

  const onRefresh = async () => {
    setRefreshing(true)
    dataLoadedRef.current = false
    await fetchTransactionDetails(true)
    setRefreshing(false)
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

  const formatAmount = (amount: number, currency: string, isReceived: boolean) => {
    const sign = isReceived ? '' : '-'
    // Normalize currency to uppercase
    const normalizedCurrency = (currency || 'USD').toUpperCase()
    const currencyData = currencies.find((c) => c && c.code === normalizedCurrency)
    const symbol = currencyData?.symbol || 
                   (normalizedCurrency === 'USD' ? '$' : 
                    normalizedCurrency === 'EUR' ? '€' : 
                    normalizedCurrency)
    
    // Check if amount has decimal places
    const absAmount = Math.abs(amount)
    const hasDecimals = absAmount % 1 !== 0
    const formattedAmount = hasDecimals
      ? absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : absAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    
    return `${sign}${symbol}${formattedAmount}`
  }

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return ''
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

  const formatScheme = (transaction: BridgeTransaction, paymentRail: string) => {
    const railLower = (paymentRail || '').toLowerCase().replace(/_/g, ' ')
    
    // For crypto deposits (liquidation address), show "USDC on SOL" format
    if (transaction.source_type === 'liquidation_address') {
      const railMap: Record<string, string> = {
        'solana': 'SOL',
        'ethereum': 'ETH',
        'polygon': 'MATIC',
      }
      const railDisplay = railMap[railLower] || railLower.toUpperCase()
      // Use currency from transaction (USDC/EURC)
      const currency = transaction.currency?.toUpperCase() || 'USDC'
      return `${currency} on ${railDisplay}`
    }
    
    // For fiat deposits (virtual account), determine ACH PUSH, ACH PULL, WIRE, SEPA, or SEPA INSTANT
    if (railLower === 'ach' || railLower.includes('ach')) {
      // Check metadata for ACH type (push/pull)
      // Bridge API typically provides this in metadata.source or activity.source
      // Normalize any underscores or variations
      const achType = (transaction.metadata?.source?.ach_type || 
                      transaction.metadata?.ach_type ||
                      transaction.metadata?.source?.type ||
                      '').toLowerCase().replace(/_/g, ' ').trim()
      
      if (achType === 'push' || achType === 'ach push' || achType.includes('push')) {
        return 'ACH PUSH'
      } else if (achType === 'pull' || achType === 'ach pull' || achType.includes('pull')) {
        return 'ACH PULL'
      }
      // Default to ACH PUSH if not specified (most common)
      return 'ACH PUSH'
    }
    
    if (railLower === 'wire' || railLower.includes('wire')) {
      return 'WIRE'
    }
    
    if (railLower === 'sepa' || railLower.includes('sepa')) {
      // Check if it's SEPA INSTANT or regular SEPA
      const sepaType = (transaction.metadata?.source?.sepa_type ||
                        transaction.metadata?.sepa_type ||
                        transaction.metadata?.source?.type ||
                        paymentRail || '').toLowerCase().replace(/_/g, ' ').trim()
      
      if (sepaType.includes('instant') || sepaType.includes('sepa instant')) {
        return 'SEPA INSTANT'
      }
      // Default to regular SEPA
      return 'SEPA'
    }
    
    // Fallback for other payment rails - remove underscores and format nicely
    return railLower.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  const getTransactionTypeDisplay = (): string => {
    if (transaction.transaction_type === 'receive') {
      if (transaction.source_type === 'liquidation_address') {
        return 'Stablecoin Deposit'
      }
      if (transaction.source_type === 'virtual_account') {
        return 'Bank Deposit'
      }
    }
    return getTransactionName()
  }

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('processed') || statusLower.includes('completed')) {
      return { 
        color: colors.success.main, 
        icon: 'checkmark-circle' as const, 
        label: 'Completed',
        gradient: colors.success.gradient
      }
    }
    if (statusLower.includes('pending') || statusLower.includes('awaiting') || statusLower.includes('scheduled') || statusLower.includes('received')) {
      return { 
        color: colors.warning.main, 
        icon: 'time-outline' as const, 
        label: 'Processing',
        gradient: colors.primary.gradient
      }
    }
    if (statusLower.includes('failed') || statusLower.includes('returned') || statusLower.includes('refunded')) {
      return { 
        color: colors.error.main, 
        icon: 'close-circle' as const, 
        label: statusLower.includes('refunded') ? 'Refunded' : 'Failed',
        gradient: colors.error.gradient || colors.primary.gradient
      }
    }
    if (statusLower.includes('review')) {
      return { 
        color: colors.warning.main, 
        icon: 'alert-circle-outline' as const, 
        label: 'In Review',
        gradient: colors.primary.gradient
      }
    }
    return { 
      color: colors.text.secondary, 
      icon: 'help-circle-outline' as const, 
      label: status.replace(/_/g, ' '),
      gradient: colors.primary.gradient
    }
  }

  const getTransactionName = (): string => {
    if (!transaction) return ''
    
    if (transaction.transaction_type === 'receive') {
      // Check if it's a crypto deposit (stablecoin deposit via liquidation address)
      if (transaction.source_type === 'liquidation_address') {
        return 'Stablecoin Deposit'
      }
      
      // For fiat deposits (virtual account/ACH), show sender name only (not "Received from...")
      if (transaction.source_type === 'virtual_account') {
        const senderName = transaction.metadata?.source?.sender_name || 
                          transaction.metadata?.source?.originator_name ||
                          transaction.name
        if (senderName) {
          return senderName // Just the sender name for ACH deposits
        }
        return 'Bank Deposit'
      }
      
      return transaction.name ? `Received from ${transaction.name}` : 'Received'
    } else {
      return transaction.name ? `Sent to ${transaction.name}` : 'Sent'
    }
  }

  const renderCopyableField = (label: string, value: string | undefined, fieldName: string) => {
    if (!value) return null

    const isCopied = copiedStates[fieldName]

    return (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.copyableValueRow}
          onPress={() => handleCopy(value, fieldName)}
          activeOpacity={0.7}
        >
          <Text style={styles.summaryValue} numberOfLines={1}>
            {value}
          </Text>
          <View style={[styles.copyIcon, isCopied && styles.copyIconSuccess]}>
            <Ionicons 
              name={isCopied ? "checkmark" : "copy-outline"} 
              size={14} 
              color={isCopied ? colors.success.main : colors.primary.main} 
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const handleSendAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                navigation.navigate('SelectRecentRecipient' as never)
  }

  // Skeleton loading component
  const TransactionDetailsSkeleton = () => (
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
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            navigation.goBack()
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing[5] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card Skeleton */}
        <View style={styles.statusCard}>
          <View style={styles.statusGradient}>
            <ShimmerListItem style={{ width: 150, height: 14, borderRadius: borderRadius.md, marginBottom: spacing[2] }} />
            <ShimmerListItem style={{ width: 200, height: 48, borderRadius: borderRadius.md, marginBottom: spacing[3] }} />
            <ShimmerListItem style={{ width: 100, height: 24, borderRadius: borderRadius.full }} />
          </View>
        </View>

        {/* Transaction Summary Skeleton */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShimmerListItem style={{ width: 32, height: 32, borderRadius: 16, marginRight: spacing[2] }} />
            <ShimmerListItem style={{ width: 180, height: 20, borderRadius: borderRadius.md }} />
          </View>
          <View style={styles.summaryRows}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.summaryRow}>
                <ShimmerListItem style={{ width: 80, height: 16, borderRadius: borderRadius.md }} />
                <ShimmerListItem style={{ width: 150, height: 16, borderRadius: borderRadius.md }} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )

  if (loading && !transaction) {
    return (
      <ScreenWrapper>
        <TransactionDetailsSkeleton />
      </ScreenWrapper>
    )
  }

  if (error || !transaction) {
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
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.goBack()
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        <View style={styles.headerContent}>
        </View>
          </Animated.View>
          
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.error.main} />
            </View>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchTransactionDetails(true)}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    )
  }

  const isReceived = transaction.transaction_type === 'receive'
  const statusInfo = getStatusInfo(transaction.status)
  const isFailed = transaction.status.toLowerCase().includes('failed') || 
                   transaction.status.toLowerCase().includes('returned') ||
                   transaction.status.toLowerCase().includes('refunded')

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
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.goBack()
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Transaction Details</Text>
          </View>
        </Animated.View>
        
        <ScrollView 
          style={styles.scrollView} 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
          }
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing[5] }]}
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
              colors={statusInfo.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusGradient}
            >
              <Text style={styles.statusLabel}>{isReceived ? 'Received' : 'Sent'}</Text>
              <Text style={styles.amountText}>
                {formatAmount(transaction.amount, transaction.currency, isReceived)}
              </Text>
              
              <View style={styles.statusBadge}>
                <Ionicons name={statusInfo.icon} size={12} color={colors.text.inverse} />
                <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
              </View>
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
            {/* Failed/Refunded Status */}
            {isFailed && (
              <View style={styles.failedCard}>
                <View style={styles.failedIconContainer}>
                  <Ionicons name="close-circle" size={32} color={colors.error.main} />
                </View>
                <Text style={styles.failedTitle}>
                  {transaction.status.toLowerCase().includes('refunded') 
                    ? 'Transaction Refunded' 
                    : transaction.status.toLowerCase().includes('returned')
                    ? 'Transaction Returned'
                    : 'Transaction Failed'}
                </Text>
                <Text style={styles.failedDescription}>
                  {transaction.status.toLowerCase().includes('refunded')
                    ? 'This transaction has been refunded to the sender.'
                    : transaction.status.toLowerCase().includes('returned')
                    ? 'This transaction was returned and could not be completed.'
                    : 'There was an issue with your transaction. Please contact support.'}
                </Text>
                
                <View style={styles.failedDetails}>
                  <View style={styles.failedDetailRow}>
                    <Text style={styles.failedDetailLabel}>Transaction ID</Text>
                    <Text style={styles.failedDetailValue}>{transaction.transaction_id}</Text>
                  </View>
                  <View style={styles.failedDetailRow}>
                    <Text style={styles.failedDetailLabel}>Date</Text>
                    <Text style={styles.failedDetailValue}>{formatTimestamp(transaction.updated_at)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Transaction Summary */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="receipt-outline" size={18} color={colors.primary.main} />
                </View>
                <Text style={styles.cardTitle}>Summary</Text>
              </View>
              
              <View style={styles.summaryRows}>
                {/* Transaction ID - always shown */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Transaction ID</Text>
                  <TouchableOpacity 
                    style={styles.copyableValueRow}
                    onPress={() => handleCopy(transaction.transaction_id, "transactionId")}
                  >
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {transaction.transaction_id}
                    </Text>
                    <View style={[styles.copyIcon, copiedStates.transactionId && styles.copyIconSuccess]}>
                      <Ionicons 
                        name={copiedStates.transactionId ? "checkmark" : "copy-outline"} 
                        size={14} 
                        color={copiedStates.transactionId ? colors.success.main : colors.primary.main} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Type - always shown */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Type</Text>
                  <Text style={styles.summaryValue}>
                    {getTransactionTypeDisplay()}
                  </Text>
                </View>

                {/* For ACH/Wire deposits (virtual account) */}
                {transaction.transaction_type === 'receive' && transaction.source_type === 'virtual_account' && (
                  <>
                    {/* Sender */}
                    {transaction.name && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sender</Text>
                        <Text style={styles.summaryValue}>
                          {transaction.name}
                        </Text>
                      </View>
                    )}

                    {/* Scheme */}
                    {transaction.source_payment_rail && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Scheme</Text>
                        <Text style={styles.summaryValue}>
                          {formatScheme(transaction, transaction.source_payment_rail)}
                        </Text>
                      </View>
                    )}

                    {/* Narration */}
                    {transaction.reference && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Narration</Text>
                        <Text style={styles.summaryValue}>
                          {transaction.reference}
                        </Text>
                      </View>
                    )}

                    {/* When */}
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>When</Text>
                      <Text style={styles.summaryValue}>
                        {formatTimestamp(transaction.bridge_created_at || transaction.created_at)}
                      </Text>
                    </View>
                  </>
                )}

                {/* For Stablecoin deposits (liquidation address) */}
                {transaction.transaction_type === 'receive' && transaction.source_type === 'liquidation_address' && (
                  <>
                    {/* Scheme */}
                    {transaction.source_payment_rail && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Scheme</Text>
                        <Text style={styles.summaryValue}>
                          {formatScheme(transaction, transaction.source_payment_rail)}
                        </Text>
                      </View>
                    )}

                    {/* When */}
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>When</Text>
                      <Text style={styles.summaryValue}>
                        {formatTimestamp(transaction.bridge_created_at || transaction.created_at)}
                      </Text>
                    </View>
                  </>
                )}

                {/* For send transactions - show existing fields */}
                {transaction.transaction_type === 'send' && (
                  <>
                    {transaction.final_amount && transaction.final_amount !== transaction.amount && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Final Amount</Text>
                        <Text style={styles.summaryValue}>
                          {formatAmount(transaction.final_amount, transaction.currency, isReceived)}
                        </Text>
                      </View>
                    )}

                    {transaction.source_payment_rail && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Scheme</Text>
                        <Text style={styles.summaryValue}>
                          {formatScheme(transaction, transaction.source_payment_rail)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Created</Text>
                      <Text style={styles.summaryValue}>
                        {formatTimestamp(transaction.bridge_created_at || transaction.created_at)}
                      </Text>
                    </View>

                    {transaction.completed_at && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Completed</Text>
                        <Text style={styles.summaryValue}>{formatTimestamp(transaction.completed_at)}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Actions */}
        {transaction.transaction_type === 'send' && (
          <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom + spacing[4], spacing[6]) }]}>
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
        )}
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
    paddingHorizontal: spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...textStyles.headlineMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  skeletonCard: {
    overflow: 'hidden',
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
    marginBottom: spacing[3],
  },
  retryButtonText: {
    ...textStyles.titleSmall,
    color: colors.text.inverse,
  },
  statusCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing[3],
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
    ...textStyles.displayLarge,
    color: colors.text.inverse,
    fontWeight: '700',
    marginBottom: spacing[3],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  statusBadgeText: {
    ...textStyles.labelSmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
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
    marginBottom: spacing[4],
  },
  failedDetails: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.error.main + '30',
    paddingTop: spacing[3],
  },
  failedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  failedDetailLabel: {
    ...textStyles.bodySmall,
    color: colors.error.dark,
  },
  failedDetailValue: {
    ...textStyles.titleSmall,
    color: colors.error.main,
    fontFamily: 'monospace',
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
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing[2],
  },
  copyableValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    justifyContent: 'flex-end',
  },
  metadataText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    backgroundColor: colors.frame.background,
    padding: spacing[3],
    borderRadius: borderRadius.md,
  },
  bottomContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopWidth: 0.5,
    borderTopColor: colors.frame.border,
  },
  primaryButton: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
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
