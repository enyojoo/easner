import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { analytics } from '../../lib/analytics'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { generateTransactionId } from '../../lib/transactionId'

export default function ConfirmationScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { refreshTransactions } = useUserData()
  const insets = useSafeAreaInsets()
  const [isProcessing, setIsProcessing] = useState(false)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const cardsAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  const { 
    sendAmount, 
    sendCurrency, 
    receiveAmount, 
    receiveCurrency, 
    exchangeRate, 
    fee, 
    feeType, 
    recipient, 
    paymentMethod 
  } = route.params || {}

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerAnim, cardsAnim])

  useEffect(() => {
    analytics.trackScreenView('Confirmation')
  }, [])

  const handleConfirmTransaction = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const transactionId = generateTransactionId()
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      Alert.alert(
        'Transaction Created',
        `Your transaction has been created successfully!\n\nTransaction ID: ${transactionId}`,
        [
          {
            text: 'View Details',
            onPress: () => {
              refreshTransactions()
              navigation.navigate('TransactionDetails', { 
                transactionId,
                fromScreen: 'SendFlow'
              })
            }
          }
        ]
      )
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Error', 'Failed to create transaction. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    const names = name.trim().split(' ').filter(n => n.length > 0)
    if (names.length === 0) return '??'
    if (names.length === 1) return names[0][0].toUpperCase()
    return names.slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Confirm Transfer</Text>
          <Text style={styles.subtitle}>Review your transaction</Text>
      </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: cardsAnim,
            transform: [{
              translateY: cardsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }}
        >
          {/* Amount Summary Card */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>You Send</Text>
                  <View style={styles.summaryAmountRow}>
                    <Text style={styles.summaryFlag}>{getCountryFlag(sendCurrency)}</Text>
                    <Text style={styles.summaryAmount}>{formatCurrency(sendAmount, sendCurrency)}</Text>
                  </View>
      </View>
                <View style={styles.arrowContainer}>
                  <View style={styles.arrowCircle}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
          </View>
        </View>
                <View style={[styles.summaryItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.summaryLabel}>They Receive</Text>
                  <View style={styles.summaryAmountRow}>
                    <Text style={styles.summaryAmount}>{formatCurrency(receiveAmount, receiveCurrency)}</Text>
                    <Text style={styles.summaryFlag}>{getCountryFlag(receiveCurrency)}</Text>
                  </View>
          </View>
        </View>
        
              <View style={styles.summaryDivider} />
              
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Exchange Rate</Text>
                <Text style={styles.rateValue}>1 {sendCurrency} = {exchangeRate?.rate?.toFixed(2)} {receiveCurrency}</Text>
        </View>
            </LinearGradient>
          </View>

          {/* Recipient Card */}
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="person" size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.cardTitle}>Recipient</Text>
            </View>
            
            <View style={styles.recipientRow}>
              <LinearGradient
                colors={colors.primary.gradient}
                style={styles.recipientAvatar}
              >
                <Text style={styles.recipientAvatarText}>
                  {getInitials(recipient?.full_name || '')}
          </Text>
              </LinearGradient>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{recipient?.full_name}</Text>
                <Text style={styles.recipientBank}>{recipient?.bank_name}</Text>
                <Text style={styles.recipientAccount}>****{recipient?.account_number?.slice(-4)}</Text>
              </View>
        </View>
      </View>

          {/* Payment Method Card */}
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="card" size={18} color={colors.primary.main} />
        </View>
              <Text style={styles.cardTitle}>Payment Method</Text>
        </View>
        
        <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Method</Text>
          <Text style={styles.detailValue}>{paymentMethod?.name}</Text>
        </View>
        <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {paymentMethod?.type?.replace('_', ' ').toUpperCase()}
              </Text>
        </View>
        {paymentMethod?.account_name && (
          <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>{paymentMethod.account_name}</Text>
          </View>
        )}
      </View>

          {/* Transaction Info Card */}
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="receipt" size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.cardTitle}>Transaction Info</Text>
            </View>
        
        <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={[styles.detailValue, fee === 0 && { color: colors.success.main }]}>
                {fee === 0 ? 'FREE' : formatCurrency(fee, sendCurrency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={[styles.detailValue, styles.totalValue]}>
                {formatCurrency(sendAmount + fee, sendCurrency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate()}</Text>
        </View>
        <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Delivery</Text>
              <View style={styles.deliveryBadge}>
                <Ionicons name="flash" size={12} color={colors.success.main} />
                <Text style={styles.deliveryText}>1-3 business days</Text>
              </View>
        </View>
      </View>

          {/* Terms Notice */}
      <View style={styles.termsContainer}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary.main} />
        <Text style={styles.termsText}>
          By confirming this transfer, you agree to our Terms of Service and Privacy Policy. 
              This transaction is secured with bank-level encryption.
        </Text>
      </View>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Buttons */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Animated.View style={[styles.confirmButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
            style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
          onPress={handleConfirmTransaction}
          disabled={isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? [colors.neutral[400], colors.neutral[400]] : colors.success.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
        >
          {isProcessing ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </>
          )}
            </LinearGradient>
        </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
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
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
  },
  summaryCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  summaryGradient: {
    padding: spacing[5],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...textStyles.labelMedium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[2],
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  summaryFlag: {
    fontSize: 20,
  },
  summaryAmount: {
    ...textStyles.titleLarge,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  arrowContainer: {
    paddingHorizontal: spacing[3],
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing[4],
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    ...textStyles.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
  },
  rateValue: {
    ...textStyles.titleSmall,
    color: colors.text.inverse,
  },
  detailsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
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
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  recipientAvatarText: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  detailLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  detailValue: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing[3],
  },
  totalValue: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.background,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    gap: spacing[1],
  },
  deliveryText: {
    ...textStyles.labelSmall,
    color: colors.success.main,
  },
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  termsText: {
    flex: 1,
    ...textStyles.bodySmall,
    color: colors.primary.dark,
    lineHeight: 18,
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.background.secondary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  cancelButtonText: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
  },
  confirmButtonWrapper: {
    flex: 1,
  },
  confirmButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  confirmButtonText: {
    ...textStyles.titleMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
})
