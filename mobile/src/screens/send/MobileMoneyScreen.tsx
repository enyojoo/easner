import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Clipboard, Alert } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

interface MockRecipient {
  id: string
  full_name: string
  account_number: string
  currency: string
  bank_name: string
}

export default function MobileMoneyScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  
  const { transactionId, sendAmount, receiveAmount, sendCurrency, receiveCurrency, recipient, paymentMethod } = route.params || {}
  
  // Determine network based on currency (single method per country)
  const getNetworkName = () => {
    if (sendCurrency === 'GHS') {
      return 'MTN MOMO'
    } else if (sendCurrency === 'KES') {
      return 'M-Pesa'
    }
    return 'Mobile Money'
  }

  const networkName = getNetworkName()
  const isGhana = sendCurrency === 'GHS'
  const isKenya = sendCurrency === 'KES'

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
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

  const formatCurrency = (amount: number, currency: string): string => {
    const symbol = currency === 'USD' ? '$' 
      : currency === 'EUR' ? '€' 
      : currency === 'NGN' ? '₦' 
      : currency === 'KES' ? 'KSh' 
      : currency === 'GHS' ? '₵' 
      : currency === 'RUB' ? '₽' 
      : currency === 'GBP' ? '£' 
      : ''
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '')
    
    // Format based on country
    if (isGhana) {
      // Ghana: 233XXXXXXXXX (country code + number)
      if (cleaned.length <= 3) return cleaned
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
      if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`
    } else if (isKenya) {
      // Kenya: 254XXXXXXXXX (country code + number)
      if (cleaned.length <= 3) return cleaned
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
      if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`
    }
    return cleaned
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

  const handleConfirmPayment = () => {
    if (!phoneNumber) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPaymentConfirmed(true)
    
    // TODO: Process mobile money payment
    // This would trigger the mobile money payment flow
    
    setTimeout(() => {
      navigation.navigate('SendTransactionDetails' as never, {
        transactionId: orderId,
        sendAmount,
        receiveAmount,
        sendCurrency,
        receiveCurrency,
        recipient: recipient as MockRecipient,
        paymentMethod: paymentMethod || 'mpesa',
        network: networkName,
        phoneNumber: phoneNumber.replace(/\s/g, ''),
      } as never)
    }, 500)
  }

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
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mobile Money Payment</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: contentAnim,
                transform: [{
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
            {/* Payment Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>You Send:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(sendAmount || 0, sendCurrency || 'USD')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient Gets:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(receiveAmount || sendAmount || 0, receiveCurrency || 'EUR')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient:</Text>
                <Text style={styles.summaryValue}>
                  {(recipient as MockRecipient)?.full_name || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transaction ID:</Text>
                <TouchableOpacity
                  style={styles.summaryValueRow}
                  onPress={() => handleCopy(transactionId || '', 'transactionId')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.summaryValue}>{transactionId || 'N/A'}</Text>
                  <Ionicons 
                    name={copiedStates.transactionId ? "checkmark" : "copy-outline"} 
                    size={16} 
                    color={copiedStates.transactionId ? colors.success.main : colors.text.secondary} 
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Network Display */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NETWORK</Text>
              <View style={styles.networkDisplay}>
                <Text style={styles.networkDisplayText}>
                  {networkName}
                </Text>
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PHONE NUMBER</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phoneIconContainer}>
                  <Ionicons name="phone-portrait" size={24} color={colors.primary.main} />
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                  placeholder={isGhana ? '233123456789' : isKenya ? '254712345678' : 'Phone number'}
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="phone-pad"
                  maxLength={isGhana || isKenya ? 15 : 20}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Payment Instructions</Text>
              <Text style={styles.instructionsText}>
                1. Enter your phone number registered with {networkName}{'\n'}
                2. Authorize the payment to complete the transaction{'\n'}
                3. You will receive a confirmation SMS
              </Text>
            </View>
          </Animated.View>
        </ScrollView>


        {/* Action Button */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!phoneNumber || paymentConfirmed) && styles.payButtonDisabled
            ]}
            onPress={handleConfirmPayment}
            activeOpacity={0.8}
            disabled={!phoneNumber || paymentConfirmed}
          >
            <LinearGradient
              colors={(!phoneNumber || paymentConfirmed)
                ? [colors.neutral[400], colors.neutral[400]] 
                : colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>
                {paymentConfirmed 
                  ? 'Processing...' 
                  : `Pay ${formatCurrency(sendAmount || 0, sendCurrency || 'USD')}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  summaryContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  summaryTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  summaryValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    textTransform: 'uppercase',
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  networkDisplay: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  networkDisplayText: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  phoneIconContainer: {
    marginRight: spacing[3],
  },
  phoneInput: {
    flex: 1,
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    paddingVertical: spacing[2],
  },
  instructionsContainer: {
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 0.5,
    borderColor: colors.primary.main + '30',
  },
  instructionsTitle: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
  },
  instructionsText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    backgroundColor: colors.background.primary,
  },
  payButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    ...textStyles.titleLarge,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
})

