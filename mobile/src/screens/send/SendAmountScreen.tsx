import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import BottomButton from '../../components/BottomButton'
import { useUserData } from '../../contexts/UserDataContext'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, Currency, ExchangeRate } from '../../types'
import { analytics } from '../../lib/analytics'
import { getCountryFlag } from '../../utils/flagUtils'

export default function SendAmountScreen({ navigation }: NavigationProps) {
  const { currencies, exchangeRates, loading } = useUserData()
  const { user, userProfile } = useAuth()
  const [sendAmount, setSendAmount] = useState('100')
  const [sendCurrency, setSendCurrency] = useState('')
  const [receiveCurrency, setReceiveCurrency] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('0')
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [fee, setFee] = useState(0)
  const [feeType, setFeeType] = useState('free')
  const [lastEditedField, setLastEditedField] = useState<'send' | 'receive'>('send')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState<'send' | 'receive' | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('SendAmount', {
      sendCurrency: sendCurrency,
      receiveCurrency: receiveCurrency
    })
  }, [])

  // Set default currencies
  useEffect(() => {
    if (currencies.length > 0 && userProfile && !sendCurrency) {
      // Prioritize user's base currency from profile, otherwise USD, then first available currency that can send
      const userBaseCurrency = userProfile.profile?.base_currency || "USD"
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)
      
      if (availableSendCurrencies.length > 0) {
        // Check if user's base currency is available and can send
        const baseCurrencyExists = availableSendCurrencies.find((c) => c.code === userBaseCurrency)
        let newSendCurrency: string
        
        if (baseCurrencyExists) {
          newSendCurrency = userBaseCurrency
        } else {
          // Fallback to USD if available, otherwise first available
          const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
          newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        }
        
        setSendCurrency(newSendCurrency)
        
        // Set receive currency to first available currency that can receive (and is not the send currency)
        if (!receiveCurrency) {
          const availableReceiveCurrencies = currencies.filter(
            (c) => c.can_receive !== false && c.code !== newSendCurrency
          )
          if (availableReceiveCurrencies.length > 0) {
            // Prefer NGN if available, otherwise first available
            const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
            const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
            setReceiveCurrency(newReceiveCurrency)
          }
        }
      }
    } else if (currencies.length > 0 && !userProfile && !sendCurrency) {
      // If no user profile, fallback to USD or first available
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)
      if (availableSendCurrencies.length > 0) {
        const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
        const newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        setSendCurrency(newSendCurrency)
        
        if (!receiveCurrency) {
          const availableReceiveCurrencies = currencies.filter(
            (c) => c.can_receive !== false && c.code !== newSendCurrency
          )
          if (availableReceiveCurrencies.length > 0) {
            const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
            const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
            setReceiveCurrency(newReceiveCurrency)
          }
        }
      }
    } else if (currencies.length > 0 && sendCurrency && !receiveCurrency) {
      // Set receive currency if send currency is already set but receive currency is not
      const availableReceiveCurrencies = currencies.filter(
        (c) => c.can_receive !== false && c.code !== sendCurrency
      )
      if (availableReceiveCurrencies.length > 0) {
        // Prefer NGN if available, otherwise first available
        const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
        const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
        setReceiveCurrency(newReceiveCurrency)
      }
    }
  }, [currencies, userProfile, sendCurrency, receiveCurrency])

  // Ensure receive currency can receive when currencies change
  useEffect(() => {
    if (currencies.length > 0 && sendCurrency && receiveCurrency) {
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== sendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }, [currencies, sendCurrency, receiveCurrency])

  // Exchange rate and fee calculation functions (matching web app)
  const getExchangeRate = (from: string, to: string) => {
    return exchangeRates.find((r) => r.from_currency === from && r.to_currency === to)
  }

  const calculateFee = (amount: number, from: string, to: string) => {
    const rateData = getExchangeRate(from, to)
    if (!rateData || rateData.fee_type === "free") {
      return { fee: 0, feeType: "free" }
    }

    if (rateData.fee_type === "fixed") {
      return { fee: rateData.fee_amount, feeType: "fixed" }
    }

    if (rateData.fee_type === "percentage") {
      return { fee: (amount * rateData.fee_amount) / 100, feeType: "percentage" }
    }

    return { fee: 0, feeType: "free" }
  }

  // Update the useEffect to calculate fee and conversion (matching web app logic)
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const rate = getExchangeRate(sendCurrency, receiveCurrency)

    if (lastEditedField === "send") {
      // Calculate receive amount from send amount
      const amount = Number.parseFloat(sendAmount) || 0
      const feeData = calculateFee(amount, sendCurrency, receiveCurrency)

      if (rate) {
        const converted = amount * rate.rate
        setReceiveAmount(converted.toFixed(2))
        setExchangeRate(rate)
      } else {
        setReceiveAmount("0")
        setExchangeRate(null)
      }

      setFee(feeData.fee)
      setFeeType(feeData.feeType)
    } else {
      // Calculate send amount from receive amount (reverse calculation)
      const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0

      if (rate && rate.rate > 0) {
        // To get the target receive amount, we need to work backwards
        // receiveAmount = sendAmount * rate
        // So: sendAmount = receiveAmount / rate
        const requiredSendAmount = targetReceiveAmount / rate.rate
        setSendAmount(requiredSendAmount.toFixed(2))

        // Calculate fee based on the required send amount
        const feeData = calculateFee(requiredSendAmount, sendCurrency, receiveCurrency)
        setFee(feeData.fee)
        setFeeType(feeData.feeType)
        setExchangeRate(rate)
      } else {
        setSendAmount("0")
        setFee(0)
        setExchangeRate(null)
      }
    }
  }, [sendAmount, receiveAmount, sendCurrency, receiveCurrency, exchangeRates, lastEditedField])

  // Add new useEffect to handle min/max amounts when currency changes
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (rate) {
      // Use the actual min_amount from the exchange rate, fallback to 1 if not defined
      const minAmount = (rate as any).min_amount || 1
      const currentAmount = Number.parseFloat(sendAmount) || 0
      if (currentAmount < minAmount) {
        setSendAmount(minAmount.toString())
      }
    }
  }, [sendCurrency, receiveCurrency, exchangeRates])

  // Handle currency selection with same currency prevention
  const handleSendCurrencyChange = (newCurrency: string) => {
    setSendCurrency(newCurrency)
    // If user selects same currency as receive, find a different currency that can receive
    if (newCurrency === receiveCurrency) {
      const availableReceiveCurrencies = currencies.filter(
        (c) => c.can_receive !== false && c.code !== newCurrency
      )
      if (availableReceiveCurrencies.length > 0) {
        setReceiveCurrency(availableReceiveCurrencies[0].code)
      }
    } else {
      // Ensure receive currency can still receive
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }

  const handleReceiveCurrencyChange = (newCurrency: string) => {
    setReceiveCurrency(newCurrency)
    // If user selects same currency as send, find a different currency that can send
    if (newCurrency === sendCurrency) {
      const availableSendCurrencies = currencies.filter(
        (c) => c.can_send !== false && c.code !== newCurrency
      )
      if (availableSendCurrencies.length > 0) {
        setSendCurrency(availableSendCurrencies[0].code)
      }
    }
  }


  const handleContinue = () => {
    if (!sendAmount || !sendCurrency || !receiveCurrency) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const amount = Number(sendAmount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    if (!exchangeRate) {
      Alert.alert('Error', 'Exchange rate not available for selected currencies')
      return
    }

    // Email verification check removed - users are already verified before accessing the app

    // Check min/max limits
    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (rate) {
      if ((rate as any).min_amount && amount < (rate as any).min_amount) {
        Alert.alert('Error', `Minimum amount is ${formatCurrency((rate as any).min_amount, sendCurrency)}`)
        return
      }
      if ((rate as any).max_amount && amount > (rate as any).max_amount) {
        Alert.alert('Error', `Maximum amount is ${formatCurrency((rate as any).max_amount, sendCurrency)}`)
        return
      }
    }

    // Navigate to next screen with data
    navigation.navigate('SelectRecipient', {
      sendAmount: Number(sendAmount),
      sendCurrency,
      receiveAmount: Number(receiveAmount),
      receiveCurrency,
      exchangeRate,
      fee,
      feeType,
    })
  }


  // Filtered currencies for picker based on send/receive capability
  const filteredCurrencies = currencies.filter(currency => {
    // Filter by send/receive capability
    if (showCurrencyPicker === 'send') {
      if (currency.can_send === false) return false
    } else if (showCurrencyPicker === 'receive') {
      if (currency.can_receive === false) return false
    }

    // Filter by search term
    if (searchTerm) {
      return (
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const FlagComponent = ({ currencyCode, size = 20 }: { currencyCode: string, size?: number }) => {
    const flag = getCountryFlag(currencyCode)
    return <Text style={{ fontSize: size }}>{flag}</Text>
  }


  const renderCurrencyPicker = () => (
    <Modal
      visible={showCurrencyPicker !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Currency</Text>
          <TouchableOpacity
            onPress={() => setShowCurrencyPicker(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search currencies..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.currencyItem}
              onPress={() => {
                if (showCurrencyPicker === 'send') {
                  handleSendCurrencyChange(item.code)
                } else {
                  handleReceiveCurrencyChange(item.code)
                }
                setShowCurrencyPicker(null)
                setSearchTerm('')
              }}
            >
              <FlagComponent currencyCode={item.code} size={24} />
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>{item.code}</Text>
                <Text style={styles.currencyName}>{item.name}</Text>
              </View>
              <Text style={styles.currencySymbol}>{item.symbol}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Send Money</Text>
              <Text style={styles.subtitle}>Enter amount and select currencies</Text>
            </View>

            <View style={styles.form}>
          {/* Send Amount */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>You Send</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={sendAmount}
                onChangeText={(text) => {
                  setSendAmount(text)
                  setLastEditedField('send')
                }}
                onBlur={() => {
                  const value = Number.parseFloat(sendAmount) || 0
                  const rate = getExchangeRate(sendCurrency, receiveCurrency)
                  const minAmount = (rate as any)?.min_amount || 0
                  const maxAmount = (rate as any)?.max_amount

                  if (value < minAmount && minAmount > 0) {
                    setSendAmount(minAmount.toString())
                  } else if (maxAmount && value > maxAmount) {
                    setSendAmount(maxAmount.toString())
                  }
                }}
                placeholder="0.00"
                keyboardType="numeric"
                returnKeyType="done"
              />
              <View style={styles.currencySelector}>
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => setShowCurrencyPicker('send')}
                >
                  <FlagComponent currencyCode={sendCurrency} size={20} />
                  <Text style={styles.currencyCode}>{sendCurrency}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Min/Max Limits Display */}
            {(() => {
              const rate = getExchangeRate(sendCurrency, receiveCurrency)
              if (rate && ((rate as any).min_amount || (rate as any).max_amount)) {
                return (
                  <View style={styles.limitsContainer}>
                    <Text style={styles.limitsText}>
                      {(rate as any).min_amount && `Min: ${formatCurrency((rate as any).min_amount, sendCurrency)}`}
                      {(rate as any).min_amount && (rate as any).max_amount && " • "}
                      {(rate as any).max_amount && `Max: ${formatCurrency((rate as any).max_amount, sendCurrency)}`}
                    </Text>
                  </View>
                )
              }
              return null
            })()}
          </View>

          {/* Fee and Rate Information */}
          <View style={styles.feeRateContainer}>
            <View style={styles.feeRateItem}>
              <View style={styles.feeRateIconContainer}>
                <View style={[styles.feeRateIcon, { backgroundColor: '#dcfce7' }]}>
                  <Text style={styles.feeRateIconText}>✓</Text>
                </View>
                <Text style={styles.feeRateLabel}>Fee</Text>
              </View>
              <Text style={[styles.feeRateValue, { color: fee === 0 ? '#16a34a' : '#1f2937' }]}>
                {fee === 0 ? 'FREE' : formatCurrency(fee, sendCurrency)}
              </Text>
            </View>

            <View style={styles.feeRateItem}>
              <View style={styles.feeRateIconContainer}>
                <View style={[styles.feeRateIcon, { backgroundColor: '#dbeafe' }]}>
                  <Text style={[styles.feeRateIconText, { color: '#007ACC' }]}>%</Text>
                </View>
                <Text style={styles.feeRateLabel}>Rate</Text>
              </View>
              <Text style={[styles.feeRateValue, { color: '#007ACC' }]}>
                1 {sendCurrency} = {exchangeRate?.rate?.toFixed(4) || '0.0000'} {receiveCurrency}
              </Text>
            </View>
          </View>

          {/* Receive Amount */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Recipient Gets</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={receiveAmount}
                onChangeText={(text) => {
                  setReceiveAmount(text)
                  setLastEditedField('receive')
                }}
                onBlur={() => {
                  const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0
                  const rate = getExchangeRate(sendCurrency, receiveCurrency)

                  if (rate && targetReceiveAmount > 0) {
                    let requiredSendAmount = targetReceiveAmount / rate.rate

                    // Apply min/max constraints and adjust both fields if needed
                    if ((rate as any).min_amount && requiredSendAmount < (rate as any).min_amount) {
                      requiredSendAmount = (rate as any).min_amount
                      const adjustedReceiveAmount = requiredSendAmount * rate.rate
                      setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                      setSendAmount(requiredSendAmount.toFixed(2))
                    } else if ((rate as any).max_amount && requiredSendAmount > (rate as any).max_amount) {
                      requiredSendAmount = (rate as any).max_amount
                      const adjustedReceiveAmount = requiredSendAmount * rate.rate
                      setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                      setSendAmount(requiredSendAmount.toFixed(2))
                    }
                  }
                }}
                placeholder="0.00"
                keyboardType="numeric"
                returnKeyType="done"
              />
              <View style={styles.currencySelector}>
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => setShowCurrencyPicker('receive')}
                >
                  <FlagComponent currencyCode={receiveCurrency} size={20} />
                  <Text style={styles.currencyCode}>{receiveCurrency}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>


            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Bottom Button */}
        <BottomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!sendAmount || !exchangeRate}
        />
      </View>
      
      {/* Currency Picker Modal */}
      {renderCurrencyPicker()}

    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  form: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    paddingRight: 16,
  },
  receiveAmountText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    paddingRight: 16,
  },
  currencySelector: {
    marginLeft: 16,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  currencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  exchangeRateContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007ACC',
  },
  exchangeRateText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  feeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  limitsContainer: {
    marginTop: 8,
  },
  limitsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  feeRateContainer: {
    marginBottom: 24,
  },
  feeRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeRateIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feeRateIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeRateIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  feeRateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  feeRateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Currency Picker Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Email Verification Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
})
