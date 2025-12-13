import React, { useState, useRef, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Modal,
  Image,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MessageSquareText, ChevronDown, User } from 'lucide-react-native'
import Svg, { Path } from 'react-native-svg'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { supabase } from '../../lib/supabase'
import { Alert } from 'react-native'
import { useUserData } from '../../contexts/UserDataContext'
import { mobileFxEngine } from '../../lib/fxEngine'
import { generateTransactionId } from '../../lib/transactionId'
import { useBalance } from '../../contexts/BalanceContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const KEYPAD_BUTTON_WIDTH = 113
const KEYPAD_GAP = 8 // spacing[2]
const KEYPAD_ROW_WIDTH = (KEYPAD_BUTTON_WIDTH * 3) + (KEYPAD_GAP * 2) // 113 * 3 + 8 * 2 = 355

// Mock recipient data for UI/UX (matches Recipient type)
interface MockRecipient {
  id: string
  user_id: string
  full_name: string
  account_number: string
  currency: string
  bank_name: string
  phone_number?: string
  routing_number?: string
  sort_code?: string
  iban?: string
  swift_bic?: string
  created_at: string
  updated_at: string
}

// Landmark/Bank Icon Component
function LandmarkIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 18v-7"/>
      <Path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/>
      <Path d="M14 18v-7"/>
      <Path d="M18 18v-7"/>
      <Path d="M3 22h18"/>
      <Path d="M6 18v-7"/>
    </Svg>
  )
}

export default function SendAmountScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const { exchangeRates: exchangeRatesFromContext } = useUserData()
  const { balances, updateBalanceOptimistically } = useBalance()
  // Ensure exchangeRates is always an array (fallback to empty array if undefined)
  const exchangeRates = exchangeRatesFromContext || []
  
  // Get recipient from route params if coming from SelectRecipient
  const recipientFromRoute = (route.params as any)?.recipient as MockRecipient | undefined
  
  // UI State only - no backend integration
  const [recipient, setRecipient] = useState<MockRecipient | null>(recipientFromRoute || null)
  const [sendAmount, setSendAmount] = useState('0.00')
  const [note, setNote] = useState('')
  const [selectedBalanceCurrency, setSelectedBalanceCurrency] = useState<string>('USD')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  // Auto-select USD Balance by default (or highest balance if USD is 0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'linkBank' | 'virtualBank' | 'otherCurrency'>(() => {
    // Auto-select balance payment method by default
    return 'balance'
  })
  const [selectedOtherCurrency, setSelectedOtherCurrency] = useState<string | null>(null)
  const [selectedOtherPaymentMethod, setSelectedOtherPaymentMethod] = useState<string | null>(null)

  // Auto-select currency with highest balance (prefer USD if > 0, then EUR)
  React.useEffect(() => {
    const usdBalance = parseFloat(balances.USD || '0')
    const eurBalance = parseFloat(balances.EUR || '0')
    if (usdBalance > 0) {
      setSelectedBalanceCurrency('USD')
    } else if (eurBalance > 0) {
      setSelectedBalanceCurrency('EUR')
    }
  }, [balances])

  // Available currencies for the dropdown (wallet balances - USD/EUR only)
  const availableCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: require('../../../assets/flags/us.png') },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: require('../../../assets/flags/eu.png') },
  ]

  // Available currencies for "From Another Currency"
  const otherCurrencies = [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: require('../../../assets/flags/ke.png') },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: require('../../../assets/flags/gh.png') },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: require('../../../assets/flags/ru.png') },
  ]

  // Payment method icons mapping
  const paymentMethodIcons: { [key: string]: any } = {
    mtn: require('../../../assets/flags/mtn.png'),
    mpesa: require('../../../assets/flags/mpesa.png'),
    sbp: require('../../../assets/flags/sbp.png'),
  }

  // Payment methods for each currency
  const currencyPaymentMethods: { [key: string]: Array<{ code: string; name: string; icon?: string }> } = {
    GHS: [
      { code: 'bankTransfer', name: 'Bank Transfer' },
      { code: 'mtnMomo', name: 'MTN MOMO', icon: 'mtn' },
    ],
    KES: [
      { code: 'mpesa', name: 'M-Pesa', icon: 'mpesa' },
      { code: 'bankTransfer', name: 'Bank Transfer' },
    ],
    RUB: [
      { code: 'bankTransfer', name: 'Bank Transfer' },
      { code: 'sbp', name: 'SBP', icon: 'sbp' },
    ],
  }

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Update recipient when screen comes into focus (smooth transition)
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as any
      if (params?.recipient) {
        // Update recipient immediately for smooth transition
        setRecipient(params.recipient)
      }
    }, [route.params])
  )

  // Run entrance animations
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

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ').filter(name => name.length > 0)
    if (names.length === 0) return '??'
    if (names.length === 1) return names[0][0].toUpperCase()
    return names.slice(0, 2).map(name => name[0]).join('').toUpperCase()
  }

  // Format amount with commas and ensure 2 decimal places
  const formatAmount = (rawValue: string): string => {
    if (!rawValue || rawValue === '.' || rawValue === '') {
      return '0.00'
    }
    
    // Remove all commas
    let cleaned = rawValue.replace(/,/g, '')
    
    // Split by decimal point
    const parts = cleaned.split('.')
    
    // Get integer part
    let integerPart = parts[0] || '0'
    // Remove leading zeros except keep at least one digit
    if (integerPart.length > 1) {
      integerPart = integerPart.replace(/^0+/, '') || '0'
    }
    
    // Get decimal part (limit to 2 places)
    let decimalPart = ''
    if (parts.length > 1) {
      decimalPart = parts[1].substring(0, 2)
    }
    
    // Format integer with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    // Always show 2 decimal places
    const formattedDecimal = decimalPart.padEnd(2, '0')
    
    return `${formattedInteger}.${formattedDecimal}`
  }

  // Calculate dynamic font size based on amount length (like Cash App/Revolut)
  const getDynamicFontSize = (amount: string): number => {
    // Remove commas and get the length of the numeric part
    const numericLength = amount.replace(/,/g, '').replace(/\./g, '').length
    
    // Minimum font size to ensure readability
    const minSize = 28
    
    // Specific font sizes based on digit count
    let fontSize: number
    if (numericLength <= 5) {
      fontSize = 65
    } else if (numericLength === 6) {
      fontSize = 55
    } else if (numericLength === 7 || numericLength === 8) {
      fontSize = 50
    } else {
      // For 9 digits and above, scale down by 5px per digit over 8
      // 9 digits = 45px, 10 digits = 40px, etc.
      fontSize = 50 - ((numericLength - 8) * 5)
    }
    
    // Ensure we don't go below minimum
    fontSize = Math.max(fontSize, minSize)
    
    return fontSize
  }

  // Keypad handlers - Smooth calculator-style input
  const handleKeypadPress = (value: string) => {
    if (!recipient) return // Disabled until recipient is selected
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Get current value as pure number string (remove commas and decimal)
    let numberString = sendAmount.replace(/,/g, '').replace(/\./g, '')
    
    if (value === 'backspace') {
      if (numberString.length > 3) {
        // Remove rightmost digit (shift right)
        numberString = numberString.slice(0, -1)
        // Ensure minimum 3 digits
        while (numberString.length < 3) {
          numberString = '0' + numberString
        }
        // Format: insert decimal before last 2 digits
        const integerPart = numberString.slice(0, -2) || '0'
        const decimalPart = numberString.slice(-2)
        setSendAmount(formatAmount(`${integerPart}.${decimalPart}`))
    } else {
        setSendAmount('0.00')
      }
    } else if (value === '.') {
      // Decimal point not needed, always 2 decimal places
      return
    } else {
      // Add number - shift left and append to right (calculator style)
      if (numberString.length >= 10) {
        // Max length reached, shift left by removing first digit
        numberString = numberString.slice(1) + value
      } else {
        // Append new digit
        numberString = numberString + value
      }
      
      // Ensure minimum 3 digits
      while (numberString.length < 3) {
        numberString = '0' + numberString
      }
      
      // Format: insert decimal before last 2 digits
      const integerPart = numberString.slice(0, -2) || '0'
      const decimalPart = numberString.slice(-2)
      setSendAmount(formatAmount(`${integerPart}.${decimalPart}`))
    }
  }

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

  const getCurrencySymbol = (currency: string): string => {
    return currency === 'USD' ? '$' 
      : currency === 'EUR' ? '€' 
      : currency === 'NGN' ? '₦' 
      : currency === 'KES' ? 'KSh' 
      : currency === 'GHS' ? '₵' 
      : currency === 'RUB' ? '₽' 
      : currency === 'GBP' ? '£' 
      : currency
  }

  const currentBalance = parseFloat(balances[selectedBalanceCurrency as 'USD' | 'EUR'] || '0')
  const receiveAmount = sendAmount ? Number.parseFloat(sendAmount.replace(/,/g, '')) || 0 : 0
  const receiveCurrency = recipient?.currency || 'EUR'
  // Determine sending currency based on payment method
  const sendCurrency = selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency 
    ? selectedOtherCurrency 
    : selectedBalanceCurrency
  
  // Get exchange rate using FX Engine (with safety check)
  const rateData = exchangeRates && Array.isArray(exchangeRates) && exchangeRates.length > 0
    ? mobileFxEngine.getRate(exchangeRates, sendCurrency, receiveCurrency)
    : null
  const exchangeRate = rateData?.rate || 1
  
  // Calculate order amounts using FX Engine
  // User enters receive amount, we calculate send amount + fees
  let sendingAmount = 0
  let feeAmount = 0
  let totalAmount = 0
  
  if (recipient && receiveAmount > 0 && sendCurrency !== receiveCurrency && rateData && exchangeRates && Array.isArray(exchangeRates)) {
    try {
      const orderAmounts = mobileFxEngine.calculateOrderAmounts(
        receiveAmount,
        sendCurrency,
        receiveCurrency,
        exchangeRates
      )
      sendingAmount = orderAmounts.sendAmount
      feeAmount = orderAmounts.feeAmount
      totalAmount = orderAmounts.totalAmount
    } catch (error) {
      console.error('Error calculating order amounts:', error)
      // Fallback to simple calculation if FX engine fails
      sendingAmount = receiveAmount / exchangeRate
    }
  } else if (receiveAmount > 0 && sendCurrency !== receiveCurrency) {
    // Fallback calculation if no rate data
    sendingAmount = receiveAmount / exchangeRate
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.scrollView}>
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
                onPress={() => {
                  // Always go back to SelectRecentRecipientScreen, never to SelectRecipientScreen
                  navigation.navigate('SelectRecentRecipient' as never)
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
              <Text style={styles.title}>Send Money</Text>
            </View>
            </Animated.View>

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
              {/* Recipient Section */}
              {recipient ? (
                // Selected Recipient View
                <TouchableOpacity
                  style={styles.recipientBar}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    navigation.navigate('SelectRecipient' as never, { selectedRecipientId: recipient.id } as never)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recipientLabel}>To:</Text>
                  <View style={styles.recipientAvatar}>
                    <Text style={styles.recipientInitials}>{getInitials(recipient.full_name)}</Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>{recipient.full_name}</Text>
                    <Text style={styles.recipientDetails}>
                      {recipient.currency} • {recipient.account_number}
                    </Text>
                  </View>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              ) : (
                // Select Recipient Box
                <TouchableOpacity
                  style={styles.selectRecipientBox}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    navigation.navigate('SelectRecipient' as never)
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.selectRecipientIcon}>
                    <User size={20} color={colors.text.secondary} strokeWidth={2} />
                  </View>
                  <Text style={styles.selectRecipientText}>Select Recipient</Text>
                </TouchableOpacity>
              )}

              {/* Amount Display - Wrapped with exchange info */}
              <View style={styles.amountSection}>
                <View style={styles.amountInputWrapper}>
                  <View style={styles.amountInputContainer}>
                    {recipient && (
                      <Text style={[styles.currencyPrefix, { fontSize: getDynamicFontSize(sendAmount) }]}>
                        {getCurrencySymbol(receiveCurrency)}
                      </Text>
                    )}
              <TextInput
                      style={[
                        styles.amountInput, 
                        !recipient && styles.amountInputDisabled,
                        { fontSize: getDynamicFontSize(sendAmount) }
                      ]}
                      value={recipient ? sendAmount : '0.00'}
                onChangeText={(text) => {
                        if (!recipient) return // Disabled until recipient is selected
                        
                        // Remove all commas and non-numeric except decimal
                        let cleaned = text.replace(/,/g, '').replace(/[^0-9.]/g, '')
                        
                        // Format the cleaned value
                        const formatted = formatAmount(cleaned)
                        setSendAmount(formatted)
                }}
                placeholder="0.00"
                      placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
                      editable={!!recipient}
                      autoFocus={false}
                      showSoftInputOnFocus={false}
                    />
              </View>
          </View>

                {/* Fixed height container to prevent layout shift */}
              <View style={styles.exchangeInfo}>
                  {recipient && sendAmount && Number.parseFloat(sendAmount.replace(/,/g, '')) > 0 && sendCurrency !== receiveCurrency ? (
                    <Text style={styles.exchangeInfoText}>
                      Sending: {formatCurrency(sendingAmount, sendCurrency)}   •   Rate: 1 {sendCurrency} = {exchangeRate.toFixed(2)} {receiveCurrency}
              </Text>
                  ) : (
                    <Text style={[styles.exchangeInfoText, { opacity: 0 }]}> </Text>
                  )}
            </View>
                </View>

              {/* Sending Method - Currency Balance Selector (Centered) */}
              <View style={styles.balanceSection}>
                <TouchableOpacity
                  style={styles.balanceSelector}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setShowCurrencyPicker(true)
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.flagContainer}>
                    {selectedPaymentMethod === 'balance' ? (
                      <Image 
                        source={
                          selectedBalanceCurrency === 'USD' 
                            ? require('../../../assets/flags/us.png') 
                            : selectedBalanceCurrency === 'EUR'
                            ? require('../../../assets/flags/eu.png')
                            : require('../../../assets/flags/ng.png')
                        }
                        style={styles.flagImage}
                        resizeMode="cover"
                      />
                    ) : selectedPaymentMethod === 'linkBank' ? (
                      <Ionicons name="link" size={20} color={colors.text.primary} />
                    ) : selectedPaymentMethod === 'virtualBank' ? (
                      <LandmarkIcon size={20} color={colors.text.primary} />
                    ) : selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency ? (
                      <Image 
                        source={
                          selectedOtherCurrency === 'KES'
                            ? require('../../../assets/flags/ke.png')
                            : selectedOtherCurrency === 'GHS'
                            ? require('../../../assets/flags/gh.png')
                            : require('../../../assets/flags/ru.png')
                        }
                        style={styles.flagImage}
                        resizeMode="cover"
                      />
                    ) : null}
              </View>
                  <Text style={styles.balanceSelectorText} numberOfLines={1}>
                    {selectedPaymentMethod === 'balance' 
                      ? `${selectedBalanceCurrency} Balance`
                      : selectedPaymentMethod === 'linkBank'
                      ? 'Link Bank'
                      : selectedPaymentMethod === 'virtualBank'
                      ? 'Bank Transfer'
                      : selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency && selectedOtherPaymentMethod
                      ? currencyPaymentMethods[selectedOtherCurrency]?.find(m => m.code === selectedOtherPaymentMethod)?.name || 'Select Method'
                      : selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency
                      ? `${selectedOtherCurrency} - Select Method`
                      : 'Select Method'}
              </Text>
                  <ChevronDown size={16} color={colors.text.primary} strokeWidth={2} />
                </TouchableOpacity>

                {/* Balance Display - Under the selector (only show for balance method) */}
                {selectedPaymentMethod === 'balance' && (
                  <Text style={styles.balanceText}>
                    Balance: {formatCurrency(currentBalance, selectedBalanceCurrency)}
                  </Text>
                )}
          </View>

              {/* Note and Keypad Wrapper */}
              <View style={styles.noteKeypadWrapper}>
                {/* Note Field */}
                <View style={styles.noteContainer}>
                  <MessageSquareText size={18} color={colors.text.secondary} strokeWidth={2} />
              <TextInput
                    style={styles.noteInput}
                    placeholder="Note"
                    placeholderTextColor={colors.text.secondary}
                    value={note}
                    onChangeText={setNote}
                    multiline={false}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
                
                {/* Numeric Keypad - 3x4 grid */}
                <View style={styles.keypadContainer}>
                  <View style={styles.keypadGrid}>
                    {/* Row 1: 1, 2, 3 */}
                    {[1, 2, 3].map((num) => (
                <TouchableOpacity
                        key={num}
                        style={styles.keypadButton}
                        onPress={() => handleKeypadPress(num.toString())}
                        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.keypadButtonText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Row 2: 4, 5, 6 */}
                    {[4, 5, 6].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={styles.keypadButton}
                        onPress={() => handleKeypadPress(num.toString())}
                        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.keypadButtonText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Row 3: 7, 8, 9 */}
                    {[7, 8, 9].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={styles.keypadButton}
                        onPress={() => handleKeypadPress(num.toString())}
                        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.keypadButtonText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Row 4: ., 0, backspace */}
                    <TouchableOpacity
                      style={styles.keypadButton}
                      onPress={() => handleKeypadPress('.')}
                      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.keypadButtonText}>.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.keypadButton}
                      onPress={() => handleKeypadPress('0')}
                      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.keypadButtonText}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.keypadButton}
                      onPress={() => handleKeypadPress('backspace')}
                      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      activeOpacity={0.6}
                      disabled={!sendAmount || sendAmount.length === 0}
                    >
                      <Ionicons 
                        name="backspace" 
                        size={24} 
                        color={(!sendAmount || sendAmount.length === 0) ? colors.text.secondary : colors.text.primary} 
                      />
                </TouchableOpacity>
              </View>
              </View>
            </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
        
        {/* Send/Authorize Button */}
        <View style={[styles.bottomContainer, { paddingTop: 25, paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (
                !sendAmount || 
                sendAmount === '0.00' || 
                Number.parseFloat(sendAmount.replace(/,/g, '')) <= 0 || 
                !recipient || 
                !selectedPaymentMethod ||
                (selectedPaymentMethod === 'otherCurrency' && (!selectedOtherCurrency || !selectedOtherPaymentMethod))
              ) && styles.sendButtonDisabled
            ]}
            onPress={async () => {
              const receiveAmountValue = Number.parseFloat(sendAmount.replace(/,/g, ''))
              if (!sendAmount || sendAmount === '0.00' || receiveAmountValue <= 0 || !recipient || !selectedPaymentMethod) return
              
              // For otherCurrency, require both currency and payment method selection
              if (selectedPaymentMethod === 'otherCurrency' && (!selectedOtherCurrency || !selectedOtherPaymentMethod)) return
              
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              
              // Calculate order amounts using FX Engine
              let calculatedSendingAmount = 0
              let calculatedFeeAmount = 0
              let calculatedTotalAmount = 0
              
              if (sendCurrency !== receiveCurrency) {
                // Validate exchangeRates before using
                if (!exchangeRates || !Array.isArray(exchangeRates) || exchangeRates.length === 0) {
                  Alert.alert('Error', 'Exchange rates not available. Please try again later.')
                  return
                }
                
                try {
                  const orderAmounts = mobileFxEngine.calculateOrderAmounts(
                    receiveAmountValue,
                    sendCurrency,
                    receiveCurrency,
                    exchangeRates
                  )
                  calculatedSendingAmount = orderAmounts.sendAmount
                  calculatedFeeAmount = orderAmounts.feeAmount
                  calculatedTotalAmount = orderAmounts.totalAmount
                } catch (error) {
                  console.error('Error calculating order amounts:', error)
                  Alert.alert('Error', 'Failed to calculate exchange rate. Please try again.')
                  return
                }
              } else {
                // Same currency - no conversion needed
                calculatedSendingAmount = receiveAmountValue
                calculatedTotalAmount = receiveAmountValue
              }
              
              if (selectedPaymentMethod === 'balance') {
                // Use Bridge transfer API to send from wallet to external bank account
                try {
                  // Get user's Bridge wallet
                  const walletsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/wallets`, {
                    headers: {
                      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                    },
                  })
                  
                  if (!walletsResponse.ok) {
                    Alert.alert('Error', 'Failed to fetch wallet. Please try again.')
                    return
                  }
                  
                  const walletsData = await walletsResponse.json()
                  const wallet = walletsData.wallets?.[0] // Get first wallet (Solana)
                  
                  if (!wallet) {
                    Alert.alert('Error', 'No wallet found. Please set up your account first.')
                    return
                  }
                  
                  // TODO: Get or create external account for recipient in Bridge
                  // For now, we'll need the recipient to have a Bridge external account ID
                  // This would typically be created when adding a recipient
                  
                  // Create Bridge transfer FIRST (transaction ID needed for optimistic update tracking)
                  const transfer = await bridgeService.createTransfer({
                    amount: calculatedTotalAmount.toString(),
                    currency: selectedBalanceCurrency.toLowerCase() as 'usd' | 'eur',
                    sourceWalletId: wallet.walletId,
                    destinationExternalAccountId: recipient.bridge_external_account_id || '', // This needs to be set when creating recipient
                  })
                  
                  // Optimistic balance update AFTER transfer created (like CashApp/Revolut - instant UI feedback)
                  // Pass transaction_id to prevent double update in real-time handler
                  if (selectedBalanceCurrency === 'USD' || selectedBalanceCurrency === 'EUR') {
                    updateBalanceOptimistically(
                      selectedBalanceCurrency as 'USD' | 'EUR', 
                      calculatedTotalAmount,
                      'subtract',
                      transfer.transaction_id || transfer.id
                    )
                  }
                  
                  // Haptic feedback for success
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  
                navigation.navigate('SendTransactionDetails' as never, {
                    transactionId: transfer.transaction_id || transfer.id,
                  sendAmount: calculatedSendingAmount,
                  receiveAmount: receiveAmountValue,
                  sendCurrency: selectedBalanceCurrency,
                  receiveCurrency: recipient.currency,
                  recipient: recipient,
                  paymentMethod: 'balance',
                    bridgeTransferId: transfer.id,
                  feeAmount: calculatedFeeAmount,
                  totalAmount: calculatedTotalAmount,
                } as never)
                } catch (error: any) {
                  console.error('Error creating transfer:', error)
                  // Revert optimistic balance update on error
                  if (selectedBalanceCurrency === 'USD' || selectedBalanceCurrency === 'EUR') {
                    // Balance will be refreshed automatically, but we could add revert logic here if needed
                  }
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                  Alert.alert('Error', error.message || 'Failed to create transfer. Please try again.')
                }
              } else if (selectedPaymentMethod === 'linkBank') {
                // Generate Transaction ID (same format as web app)
                const transactionId = generateTransactionId()
                navigation.navigate('OpenBanking' as never, {
                  transactionId: transactionId,
                  sendAmount: calculatedSendingAmount,
                  receiveAmount: receiveAmountValue,
                  sendCurrency: selectedBalanceCurrency,
                  receiveCurrency: recipient.currency,
                  recipient: recipient,
                  feeAmount: calculatedFeeAmount,
                  totalAmount: calculatedTotalAmount,
                } as never)
              } else if (selectedPaymentMethod === 'virtualBank') {
                // Generate Transaction ID (same format as web app)
                const transactionId = generateTransactionId()
                navigation.navigate('VirtualBankAccount' as never, {
                  transactionId: transactionId,
                  sendAmount: calculatedSendingAmount,
                  receiveAmount: receiveAmountValue,
                  sendCurrency: selectedBalanceCurrency,
                  receiveCurrency: recipient.currency,
                  recipient: recipient,
                  feeAmount: calculatedFeeAmount,
                  totalAmount: calculatedTotalAmount,
                } as never)
              } else if (selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency && selectedOtherPaymentMethod) {
                // Generate Transaction ID (same format as web app)
                const transactionId = generateTransactionId()
                // Navigate based on payment method type
                if (selectedOtherPaymentMethod === 'sbp') {
                  // SBP works like Plaid - navigate to OpenBanking screen
                  navigation.navigate('OpenBanking' as never, {
                    transactionId: transactionId,
                    sendAmount: calculatedSendingAmount,
                    receiveAmount: receiveAmountValue,
                    sendCurrency: selectedOtherCurrency,
                    receiveCurrency: recipient.currency,
                    recipient: recipient,
                    paymentMethod: selectedOtherPaymentMethod,
                    feeAmount: calculatedFeeAmount,
                    totalAmount: calculatedTotalAmount,
                  } as never)
                } else if (selectedOtherPaymentMethod === 'bankTransfer') {
                  navigation.navigate('VirtualBankAccount' as never, {
                    transactionId: transactionId,
                    sendAmount: calculatedSendingAmount,
                    receiveAmount: receiveAmountValue,
                    sendCurrency: selectedOtherCurrency,
                    receiveCurrency: recipient.currency,
                    recipient: recipient,
                    paymentMethod: selectedOtherPaymentMethod,
                    feeAmount: calculatedFeeAmount,
                    totalAmount: calculatedTotalAmount,
                  } as never)
                } else {
                  // For mobile money methods (M-Pesa, MTN MOMO)
                  // Navigate to MobileMoney screen for network selection and phone number
                  navigation.navigate('MobileMoney' as never, {
                    transactionId: transactionId,
                    sendAmount: calculatedSendingAmount,
                    receiveAmount: receiveAmountValue,
                    sendCurrency: selectedOtherCurrency,
                    receiveCurrency: recipient.currency,
                    recipient: recipient,
                    paymentMethod: selectedOtherPaymentMethod,
                    feeAmount: calculatedFeeAmount,
                    totalAmount: calculatedTotalAmount,
                  } as never)
                }
              }
            }}
            disabled={
              !sendAmount || 
              sendAmount === '0.00' || 
              Number.parseFloat(sendAmount.replace(/,/g, '')) <= 0 || 
              !recipient || 
              !selectedPaymentMethod ||
              (selectedPaymentMethod === 'otherCurrency' && (!selectedOtherCurrency || !selectedOtherPaymentMethod))
            }
          >
            <LinearGradient
              colors={(
                !sendAmount || 
                sendAmount === '0.00' || 
                Number.parseFloat(sendAmount.replace(/,/g, '')) <= 0 || 
                !recipient || 
                !selectedPaymentMethod ||
                (selectedPaymentMethod === 'otherCurrency' && (!selectedOtherCurrency || !selectedOtherPaymentMethod))
              ) 
                ? [colors.neutral[400], colors.neutral[400]] 
                : colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>
                {selectedPaymentMethod === 'balance' 
                  ? 'Send' 
                  : selectedPaymentMethod === 'otherCurrency' && selectedOtherCurrency && selectedOtherPaymentMethod
                  ? 'Authorize'
                  : selectedPaymentMethod 
                  ? 'Authorize' 
                  : 'Select Method'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sending Method Modal */}
        <Modal
          visible={showCurrencyPicker}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setShowCurrencyPicker(false)
          }}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCurrencyPicker(false)}
          >
            <View style={[styles.modalContainer, { 
              maxHeight: 600,
              paddingBottom: Math.max(insets.bottom, 20),
            }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>How would you like to send?</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCurrencyPicker(false)
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
      </View>
      
              <ScrollView 
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
                nestedScrollEnabled={true}
              >
                <View style={styles.currencyListContainer}>
                {/* Send from Balance Section */}
                <View style={styles.paymentSection}>
                  <Text style={styles.paymentSectionTitle}>From Balance</Text>
                  {availableCurrencies.map((item) => {
                    const balance = parseFloat(balances[item.code as 'USD' | 'EUR'] || '0')
                    const balanceFormatted = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    const isSelected = selectedBalanceCurrency === item.code && selectedPaymentMethod === 'balance'
                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.currencyItem,
                          isSelected && styles.currencyItemActive
                        ]}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          setSelectedBalanceCurrency(item.code)
                          setSelectedPaymentMethod('balance')
                          setShowCurrencyPicker(false)
                        }}
                      >
                        <View style={styles.flagContainerSmall}>
                          <Image 
                            source={item.flag}
                            style={styles.flagImageSmall}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={styles.currencyItemInfo}>
                          <Text style={styles.currencyItemCode}>{item.code} Balance</Text>
                          <Text style={styles.currencyItemBalance}>
                            {item.symbol}{balanceFormatted}
                          </Text>
                        </View>
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected
                        ]}>
                          {isSelected && (
                            <View style={styles.checkboxInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* From Another Currency Section */}
                <View style={styles.paymentSection}>
                  <Text style={styles.paymentSectionTitle}>From Another Currency</Text>
                  
                  {/* Currency Selector */}
                  {!selectedOtherCurrency ? (
                    otherCurrencies.map((currency) => (
                      <TouchableOpacity
                        key={currency.code}
                        style={styles.currencyItem}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          setSelectedOtherCurrency(currency.code)
                          setSelectedPaymentMethod('otherCurrency')
                        }}
                      >
                        <View style={styles.flagContainerSmall}>
                          <Image 
                            source={currency.flag}
                            style={styles.flagImageSmall}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={styles.currencyItemInfo}>
                          <Text style={styles.currencyItemCode}>{currency.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <>
                      {/* Back button to change currency */}
                      <TouchableOpacity
                        style={styles.currencyItem}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          setSelectedOtherCurrency(null)
                          setSelectedOtherPaymentMethod(null)
                        }}
                      >
                        <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
                        <View style={styles.currencyItemInfo}>
                          <Text style={styles.currencyItemCode}>
                            {otherCurrencies.find(c => c.code === selectedOtherCurrency)?.name}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Payment Methods for Selected Currency */}
                      {currencyPaymentMethods[selectedOtherCurrency]?.map((method) => {
                        const isSelected = selectedOtherPaymentMethod === method.code
                        return (
                          <TouchableOpacity
                            key={method.code}
                            style={[
                              styles.currencyItem,
                              isSelected && styles.currencyItemActive
                            ]}
                            onPress={async () => {
                              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                              setSelectedOtherPaymentMethod(method.code)
                              setShowCurrencyPicker(false)
                            }}
                          >
                            <View style={styles.flagContainerSmall}>
                              {method.icon && paymentMethodIcons[method.icon] ? (
                                <Image 
                                  source={paymentMethodIcons[method.icon]}
                                  style={styles.flagImageSmall}
                                  resizeMode="cover"
                                />
                              ) : (
                                <LandmarkIcon size={16} color={colors.text.primary} />
                              )}
                            </View>
                            <View style={styles.currencyItemInfo}>
                              <Text style={styles.currencyItemCode}>{method.name}</Text>
                            </View>
                            <View style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected
                            ]}>
                              {isSelected && (
                                <View style={styles.checkboxInner} />
                              )}
                            </View>
                          </TouchableOpacity>
                        )
                      })}
                    </>
                  )}
                </View>
              </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 0,
    flexDirection: 'column',
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
    justifyContent: 'center',
  },
  title: {
    ...textStyles.headlineMedium,
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    flex: 1,
    justifyContent: 'space-between',
  },
  // Select Recipient Box (when no recipient)
  selectRecipientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    height: 52,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: 25,
    gap: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  selectRecipientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  selectRecipientText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Medium',
  },
  // Recipient Bar (when recipient is selected)
  recipientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    height: 52,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: 25,
    gap: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  recipientLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  recipientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientInitials: {
    ...textStyles.titleSmall,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2,
  },
  recipientDetails: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  changeText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  amountSection: {
    marginTop: 8,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  amountInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    width: '100%',
    // Fixed height to accommodate largest font size (65px) + some padding
    // This prevents layout shift when font size changes
    height: 80,
    minHeight: 80,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    // Ensure content is vertically centered within the fixed height
    height: '100%',
  },
  currencyPrefix: {
    fontSize: 50,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'Outfit-Black',
    marginRight: 0,
    // Dynamic font size will be applied inline
  },
  amountInput: {
    // Base fontSize - will be overridden by inline style for dynamic sizing
    fontSize: 50,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'Outfit-Black',
    textAlign: 'left',
    paddingLeft: 0,
    flexShrink: 1,
    // Allow text to scale down
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  amountInputDisabled: {
    color: colors.text.secondary,
    opacity: 0.6,
  },
  exchangeInfo: {
    marginTop: 0,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeInfoText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary.main,
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
  },
  balanceSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 0,
  },
  balanceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 100,
    paddingHorizontal: spacing[3],
    paddingVertical: 0,
    marginBottom: spacing[2],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    minWidth: 180,
    height: 48,
    justifyContent: 'center',
  },
  flagContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  flagImage: {
    width: 24,
    height: 24,
  },
  balanceSelectorText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  balanceText: {
    ...textStyles.bodyMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-Medium',
  },
  noteKeypadWrapper: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 0,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: 20,
  },
  noteInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  keypadContainer: {
    width: '100%',
    paddingHorizontal: spacing[5],
    paddingTop: 0,
    paddingBottom: spacing[2],
    backgroundColor: colors.background.primary,
    alignItems: 'center',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: KEYPAD_ROW_WIDTH,
    gap: KEYPAD_GAP,
    rowGap: KEYPAD_GAP,
  },
  keypadButton: {
    width: KEYPAD_BUTTON_WIDTH,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  keypadButtonText: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: 0,
    backgroundColor: colors.background.primary,
  },
  sendButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
  },
  sendButtonText: {
    ...textStyles.titleLarge,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingTop: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSection: {
    marginBottom: spacing[4],
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
    marginTop: spacing[2],
    paddingHorizontal: spacing[5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalScrollView: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: spacing[4],
    flexGrow: 1,
  },
  currencyListContainer: {
    paddingBottom: spacing[2],
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  currencyItemActive: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2,
  },
  currencyItemBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSection: {
    marginBottom: spacing[4],
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
    marginTop: spacing[2],
    paddingHorizontal: spacing[5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.primary,
  },
  flagContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImageSmall: {
    width: 24,
    height: 24,
  },
})
