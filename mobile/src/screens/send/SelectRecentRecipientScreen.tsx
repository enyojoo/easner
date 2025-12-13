import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { User, Wallet, Building2, Smartphone } from 'lucide-react-native'
import { NavigationProps, Recipient } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUserData } from '../../contexts/UserDataContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { recipientService } from '../../lib/recipientService'
import { getCountryFlag } from '../../utils/flagUtils'
import { getAccountTypeConfigFromCurrency } from '../../lib/currencyAccountTypes'
import { formatIBAN, formatSortCode, formatRoutingNumber, formatAccountNumber } from '../../utils/formatters'
import { getAllCountryCurrencies, CountryCurrency } from '../../lib/countryCurrencyMapping'
import { ShimmerListItem } from '../../components/premium'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Helper function to get flag image source for currency
const getFlagImageSource = (currency: string) => {
  const flagMap: Record<string, any> = {
    'USD': require('../../../assets/flags/us.png'),
    'EUR': require('../../../assets/flags/eu.png'),
    'GBP': require('../../../assets/flags/gb.png'),
    'NGN': require('../../../assets/flags/ng.png'),
    'KES': require('../../../assets/flags/ke.png'),
    'GHS': require('../../../assets/flags/gh.png'),
    'RUB': require('../../../assets/flags/ru.png'),
  }
  return flagMap[currency] || require('../../../assets/flags/us.png')
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const CACHE_KEY_PREFIX = 'recent_recipients_'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export default function SelectRecentRecipientScreen({ navigation }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const { user, userProfile } = useAuth()
  const { recipients, refreshRecipients, currencies } = useUserData()
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([])
  const [hasTransactions, setHasTransactions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Add recipient flow states
  const [showRecipientTypeModal, setShowRecipientTypeModal] = useState(false)
  const [showBankAccountForm, setShowBankAccountForm] = useState(false)
  const [selectedRecipientType, setSelectedRecipientType] = useState<'wallet' | 'bank' | 'mobile' | null>(null)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearchTerm, setCurrencySearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedCountryCurrency, setSelectedCountryCurrency] = useState<CountryCurrency | null>(null)
  const [transferType, setTransferType] = useState<'ACH' | 'Wire' | null>(null)
  
  const [newRecipient, setNewRecipient] = useState({
    fullName: '',
    accountNumber: '',
    bankName: '',
    currency: 'NGN',
    routingNumber: '',
    sortCode: '',
    iban: '',
    swiftBic: '',
  })

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

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

  // Get recent recipients with caching
  useEffect(() => {
    const getRecentRecipients = async () => {
      if (!user || recipients.length === 0) {
        setRecentRecipients([])
        setHasTransactions(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const cacheKey = `${CACHE_KEY_PREFIX}${user.id}`
      
      try {
        // Check cache first
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const now = Date.now()
          if (now - timestamp < CACHE_TTL) {
            setRecentRecipients(data.recipients || [])
            setHasTransactions(data.hasTransactions || false)
            setIsLoading(false)
            // Continue to fetch fresh data in background
          }
        }

        // Get transactions with recipient_id, ordered by most recent
        const { data: transactionData, error } = await supabase
          .from('transactions')
          .select('recipient_id, created_at')
          .eq('user_id', user.id)
          .not('recipient_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        // Check if user has made any transactions
        if (!transactionData || transactionData.length === 0) {
          setRecentRecipients([])
          setHasTransactions(false)
          setIsLoading(false)
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: { recipients: [], hasTransactions: false },
            timestamp: Date.now()
          }))
          return
        }

        setHasTransactions(true)

        // Extract unique recipient IDs from most recent transactions
        const recentRecipientIds = new Set<string>()
        for (const tx of transactionData) {
          if (tx.recipient_id && !recentRecipientIds.has(tx.recipient_id)) {
            recentRecipientIds.add(tx.recipient_id)
            if (recentRecipientIds.size >= 5) break
          }
        }

        // Map recipient IDs to full recipient objects
        const recentRecipientsList = Array.from(recentRecipientIds)
          .map(id => recipients.find(r => r.id === id))
          .filter((r): r is Recipient => r !== undefined)

        setRecentRecipients(recentRecipientsList)
        setIsLoading(false)
        
        // Update cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: { recipients: recentRecipientsList, hasTransactions: true },
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching recent recipients:', error)
        setRecentRecipients([])
        setHasTransactions(false)
        setIsLoading(false)
      }
    }

    getRecentRecipients()
  }, [user, recipients])

  const handleSelectRecipient = async (recipient: Recipient) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Navigate directly to SendAmountScreen with selected recipient
    // Pass fromSelectRecentRecipient to enable instant transition
    navigation.navigate('SendAmount' as never, { recipient, fromSelectRecentRecipient: true } as never)
  }

  const handleViewAllRecipients = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Navigate to SelectRecipientScreen (full list)
    navigation.navigate('SelectRecipient' as never)
  }

  const handleAddNewRecipient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    resetForm()
    setShowRecipientTypeModal(true)
  }

  const resetForm = () => {
    setNewRecipient({
      fullName: '',
      accountNumber: '',
      bankName: '',
      currency: 'NGN',
      routingNumber: '',
      sortCode: '',
      iban: '',
      swiftBic: '',
    })
    setError('')
    setSelectedCountryCurrency(null)
    setTransferType(null)
  }

  const mapFieldName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      account_name: "fullName",
      routing_number: "routingNumber",
      account_number: "accountNumber",
      bank_name: "bankName",
      sort_code: "sortCode",
      iban: "iban",
      swift_bic: "swiftBic",
    }
    return fieldMap[fieldName] || fieldName
  }

  const isFormValid = () => {
    if (!newRecipient.fullName || !newRecipient.bankName || !newRecipient.currency) return false

    if (selectedCountryCurrency?.countryCode === 'US' && !transferType) {
      return false
    }

    const accountConfig = getAccountTypeConfigFromCurrency(newRecipient.currency)
    const requiredFields = accountConfig.requiredFields

    for (const field of requiredFields) {
      const formFieldName = mapFieldName(field)
      const fieldValue = newRecipient[formFieldName as keyof typeof newRecipient]
      if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
        return false
      }
    }

    return true
  }

  const handleAddRecipient = async () => {
    if (!userProfile?.id) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const newRecipientData = await recipientService.create(userProfile.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        currency: newRecipient.currency,
        routingNumber: newRecipient.routingNumber || undefined,
        sortCode: newRecipient.sortCode || undefined,
        iban: newRecipient.iban || undefined,
        swiftBic: newRecipient.swiftBic || undefined,
      })

      await refreshRecipients()
      
      // Clear cache to force refresh
      if (user) {
        await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${user.id}`)
      }
      
      setError('')
      resetForm()
      setShowBankAccountForm(false)
      setShowRecipientTypeModal(false)
      
      // Navigate to SendAmountScreen with the newly added recipient
      navigation.navigate('SendAmount' as never, { recipient: newRecipientData, fromSelectRecentRecipient: true } as never)
    } catch (error) {
      console.error('Error adding recipient:', error)
      setError('Failed to add recipient')
      Alert.alert('Error', 'Failed to add recipient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCurrencies = currencies.filter(currency => {
    if (currencySearchTerm) {
      return (
        currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
      )
    }
    return true
  })

  const renderRecipient = ({ item }: { item: Recipient }) => {
    return (
      <TouchableOpacity
        style={styles.recipientItem}
        onPress={() => handleSelectRecipient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.recipientRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientAvatarText}>
                {getInitials(item.full_name)}
              </Text>
            </View>
            {/* Flag badge on bottom edge of avatar */}
            <View style={styles.avatarFlagBadge}>
              <View style={styles.flagContainer}>
                <Image 
                  source={getFlagImageSource(item.currency)}
                  style={styles.flagImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{item.full_name}</Text>
            <Text style={styles.recipientBank}>{item.bank_name}</Text>
            <Text style={styles.recipientAccount}>
              {item.iban || item.account_number || ''}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
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
                  // Always go back to App Dash (MainTabs), never to SendAmountScreen
                  navigation.navigate('MainTabs' as never)
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
              <Text style={styles.title}>Send Money</Text>
            </View>
            </Animated.View>

          {/* Recipient Selector Box - Matching SendAmountScreen */}
          <Animated.View 
            style={[
              styles.recipientSelectorContainer,
              {
                opacity: contentAnim,
                transform: [{
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.selectRecipientBox}
              onPress={handleViewAllRecipients}
              activeOpacity={0.7}
            >
              <View style={styles.selectRecipientIcon}>
                <User size={20} color={colors.text.secondary} strokeWidth={2} />
              </View>
              <Text style={styles.selectRecipientText}>Select Recipient</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Loading Skeleton */}
          {isLoading ? (
            <Animated.View
              style={[
                styles.recipientsContainer,
                {
                  opacity: contentAnim,
                  transform: [{
                    translateY: contentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.recipientItem}>
                  <View style={styles.recipientRow}>
                    <ShimmerListItem style={{ width: 48, height: 48, borderRadius: 24, marginRight: spacing[3] }} />
                    <View style={{ flex: 1 }}>
                      <ShimmerListItem style={{ width: '60%', height: 16, borderRadius: borderRadius.md, marginBottom: spacing[1] }} />
                      <ShimmerListItem style={{ width: '40%', height: 14, borderRadius: borderRadius.md, marginBottom: spacing[1] }} />
                      <ShimmerListItem style={{ width: '50%', height: 14, borderRadius: borderRadius.md }} />
                    </View>
                  </View>
                </View>
              ))}
            </Animated.View>
          ) : hasTransactions && recentRecipients.length > 0 ? (
            <>
              <Animated.View
                style={[
                  styles.sectionTitleContainer,
                  {
                    opacity: contentAnim,
                    transform: [{
                      translateY: contentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.sectionTitle}>Recent</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.recipientsContainer,
                  {
                    opacity: contentAnim,
                    transform: [{
                      translateY: contentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <FlatList
                  data={recentRecipients}
                  renderItem={renderRecipient}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </Animated.View>
            </>
          ) : (
            <Animated.View
              style={[
                styles.emptyState,
                {
                  opacity: contentAnim,
                  transform: [{
                    translateY: contentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="people-outline" size={48} color={colors.text.secondary} />
              </View>
              <Text style={styles.emptyTitle}>Add or Select a recipient</Text>
              <Text style={styles.emptyText}>and make your first transfer</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Add a recipient Button - Fixed at bottom */}
        <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
          <TouchableOpacity
            style={styles.addRecipientButton}
            onPress={handleAddNewRecipient}
            activeOpacity={0.7}
          >
            <Text style={styles.addRecipientButtonText}>Add a recipient</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 1: Recipient Type Selection Modal */}
      <Modal
        visible={showRecipientTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowRecipientTypeModal(false)
          resetForm()
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowRecipientTypeModal(false)
              resetForm()
            }}
          />
          <View style={[styles.modalContainer, styles.recipientTypeModal, { 
            paddingBottom: Math.max(insets.bottom, 20),
          }]} 
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => {}}
        >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a new</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRecipientTypeModal(false)
                  resetForm()
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.recipientTypeOptions}>
              <TouchableOpacity
                style={styles.recipientTypeOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedRecipientType('wallet')
                  setShowRecipientTypeModal(false)
                  Alert.alert('Coming Soon', 'Wallet address recipient will be available soon')
                }}
                activeOpacity={0.7}
              >
                <View style={styles.recipientTypeIcon}>
                  <Wallet size={24} color={colors.primary.main} strokeWidth={2} />
                </View>
                <View style={styles.recipientTypeContent}>
                  <Text style={styles.recipientTypeTitle}>Wallet address</Text>
                  <Text style={styles.recipientTypeSubtitle}>Send stablecoins to an address</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recipientTypeOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedRecipientType('bank')
                  setShowRecipientTypeModal(false)
                  setShowBankAccountForm(true)
                }}
                activeOpacity={0.7}
              >
                <View style={styles.recipientTypeIcon}>
                  <Building2 size={24} color={colors.primary.main} strokeWidth={2} />
                </View>
                <View style={styles.recipientTypeContent}>
                  <Text style={styles.recipientTypeTitle}>Bank account</Text>
                  <Text style={styles.recipientTypeSubtitle}>Send cash to a bank account</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recipientTypeOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedRecipientType('mobile')
                  setShowRecipientTypeModal(false)
                  setShowBankAccountForm(true)
                }}
                activeOpacity={0.7}
              >
                <View style={styles.recipientTypeIcon}>
                  <Smartphone size={24} color={colors.primary.main} strokeWidth={2} />
                </View>
                <View style={styles.recipientTypeContent}>
                  <Text style={styles.recipientTypeTitle}>Mobile wallet</Text>
                  <Text style={styles.recipientTypeSubtitle}>Send cash to a mobile wallet</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Step 2: Bank Account Form Modal */}
      <Modal
        visible={showBankAccountForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBankAccountForm(false)
          resetForm()
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowBankAccountForm(false)
              resetForm()
            }}
          />
          <View 
            style={[styles.modalContainer, { 
              maxHeight: '90%',
              paddingBottom: Math.max(insets.bottom, 20),
            }]} 
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedRecipientType === 'mobile' ? 'Add mobile wallet' : 'Add bank account'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBankAccountForm(false)
                  resetForm()
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
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
            {/* Country/Currency Selector */}
            <View style={styles.currencySelectorWrapper}>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown)
                  setCurrencySearchTerm('')
                }}
                activeOpacity={0.7}
              >
                <View style={styles.currencySelectorContent}>
                  <Text style={styles.currencyFlag}>{getCountryFlag(newRecipient.currency)}</Text>
                  <Text style={styles.currencySelectorText}>
                    {newRecipient.currency} - {currencies.find(c => c.code === newRecipient.currency)?.name || 'Select Currency'}
                  </Text>
                  <Ionicons 
                    name={showCurrencyDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#6b7280" 
                  />
                </View>
              </TouchableOpacity>
              
              {showCurrencyDropdown && (
                <View style={styles.currencyDropdown}>
                  <View style={styles.currencyDropdownSearch}>
                    <Ionicons name="search" size={18} color={colors.neutral[400]} />
                    <TextInput
                      style={styles.currencyDropdownSearchInput}
                      placeholder="Search currencies..."
                      placeholderTextColor={colors.neutral[400]}
                      value={currencySearchTerm}
                      onChangeText={setCurrencySearchTerm}
                    />
                  </View>
                  <ScrollView 
                    style={styles.currencyDropdownList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredCurrencies.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.currencyDropdownItem,
                          newRecipient.currency === item.code && styles.currencyDropdownItemSelected
                        ]}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          const countryCurrency = getAllCountryCurrencies().find(
                            cc => cc.currencyCode === item.code
                          )
                          if (countryCurrency) {
                            setSelectedCountryCurrency(countryCurrency)
                            if (countryCurrency.countryCode === 'US') {
                              setTransferType(null)
                            } else {
                              setTransferType(null)
                            }
                          } else {
                            setSelectedCountryCurrency(null)
                            setTransferType(null)
                          }
                          setNewRecipient(prev => ({ ...prev, currency: item.code }))
                          setShowCurrencyDropdown(false)
                          setCurrencySearchTerm('')
                        }}
                      >
                        <Text style={styles.currencyFlag}>{getCountryFlag(item.code)}</Text>
                        <View style={styles.currencyInfo}>
                          <Text style={styles.currencyCode}>{item.code}</Text>
                          <Text style={styles.currencyName}>{item.name}</Text>
                        </View>
                        <Text style={styles.currencySymbol}>{item.symbol}</Text>
                        {newRecipient.currency === item.code && (
                          <Ionicons name="checkmark" size={18} color={colors.primary.main} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

              {(() => {
                const accountConfig = newRecipient.currency
                  ? getAccountTypeConfigFromCurrency(newRecipient.currency)
                  : null

                if (!accountConfig) {
                  return (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>Please select a currency first to see the required fields</Text>
                    </View>
                  )
                }

                return (
                  <>
                    {/* Transfer Type Selection - First field for US accounts */}
                    {accountConfig.accountType === "us" && (
                      <View style={styles.transferTypeContainer}>
                        <View style={styles.transferTypeOptions}>
                          <TouchableOpacity
                            style={[styles.transferTypeOption, transferType === 'ACH' && styles.transferTypeOptionSelected]}
                            onPress={() => {
                              setTransferType('ACH')
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.transferTypeOptionText, transferType === 'ACH' && styles.transferTypeOptionTextSelected]}>
                              ACH
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.transferTypeOption, transferType === 'Wire' && styles.transferTypeOptionSelected]}
                            onPress={() => {
                              setTransferType('Wire')
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.transferTypeOptionText, transferType === 'Wire' && styles.transferTypeOptionTextSelected]}>
                              Wire
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Account Name */}
                    <View>
                      <TextInput
                        style={styles.modalInput}
                        value={newRecipient.fullName}
                        onChangeText={(text) => setNewRecipient(prev => ({ ...prev, fullName: text }))}
                        placeholder="Account name"
                        placeholderTextColor={colors.text.secondary}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        editable={!isSubmitting}
                      />
                    </View>

                    {/* Bank Name */}
                    <View>
                      <TextInput
                        style={styles.modalInput}
                        value={newRecipient.bankName}
                        onChangeText={(text) => setNewRecipient(prev => ({ ...prev, bankName: text }))}
                        placeholder={`${accountConfig.fieldLabels.bank_name} *`}
                        placeholderTextColor={colors.text.secondary}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        editable={!isSubmitting}
                      />
                    </View>

                    {/* US Account Fields */}
                    {accountConfig.accountType === "us" && (
                      <>
                        <View>
                          <TextInput
                            style={styles.modalInput}
                            value={newRecipient.routingNumber}
                            onChangeText={(text) => {
                              const formatted = formatRoutingNumber(text)
                              setNewRecipient(prev => ({ ...prev, routingNumber: formatted }))
                            }}
                            placeholder={`${accountConfig.fieldLabels.routing_number} *`}
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="number-pad"
                            maxLength={9}
                            autoComplete="off"
                            autoCorrect={false}
                            textContentType="none"
                            editable={!isSubmitting}
                          />
                        </View>
                        <View>
                          <TextInput
                            style={styles.modalInput}
                            value={newRecipient.accountNumber}
                            onChangeText={(text) => {
                              const formatted = formatAccountNumber(text)
                              setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                            }}
                            placeholder={`${accountConfig.fieldLabels.account_number} *`}
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="number-pad"
                            autoComplete="off"
                            autoCorrect={false}
                            textContentType="none"
                            editable={!isSubmitting}
                          />
                        </View>
                      </>
                    )}

                    {/* UK Account Fields */}
                    {accountConfig.accountType === "uk" && (
                      <>
                        <View style={styles.twoColumnRow}>
                          <View style={styles.halfInput}>
                            <TextInput
                              style={styles.modalInput}
                              value={newRecipient.sortCode}
                              onChangeText={(text) => {
                                const formatted = formatSortCode(text)
                                setNewRecipient(prev => ({ ...prev, sortCode: formatted }))
                              }}
                              placeholder={`${accountConfig.fieldLabels.sort_code} *`}
                              placeholderTextColor={colors.text.secondary}
                              keyboardType="number-pad"
                              maxLength={8}
                              autoComplete="off"
                              autoCorrect={false}
                              textContentType="none"
                              editable={!isSubmitting}
                            />
                          </View>
                          <View style={styles.halfInput}>
                            <TextInput
                              style={styles.modalInput}
                              value={newRecipient.accountNumber}
                              onChangeText={(text) => {
                                const formatted = formatAccountNumber(text)
                                setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                              }}
                              placeholder={`${accountConfig.fieldLabels.account_number} *`}
                              placeholderTextColor={colors.text.secondary}
                              keyboardType="number-pad"
                              autoComplete="off"
                              autoCorrect={false}
                              textContentType="none"
                              editable={!isSubmitting}
                            />
                          </View>
                        </View>
                        <View>
                          <TextInput
                            style={styles.modalInput}
                            value={newRecipient.iban}
                            onChangeText={(text) => {
                              const formatted = formatIBAN(text)
                              setNewRecipient(prev => ({ ...prev, iban: formatted }))
                            }}
                            placeholder={accountConfig.fieldLabels.iban}
                            placeholderTextColor={colors.text.secondary}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            editable={!isSubmitting}
                          />
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          placeholderTextColor={colors.text.secondary}
                          autoCapitalize="characters"
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* EURO Account Fields */}
                    {accountConfig.accountType === "euro" && (
                      <>
                        <View>
                          <TextInput
                            style={styles.modalInput}
                            value={newRecipient.iban}
                            onChangeText={(text) => {
                              const formatted = formatIBAN(text)
                              setNewRecipient(prev => ({ ...prev, iban: formatted }))
                            }}
                            placeholder={`${accountConfig.fieldLabels.iban} *`}
                            placeholderTextColor={colors.text.secondary}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            editable={!isSubmitting}
                          />
                        </View>
                        <View>
                          <TextInput
                            style={styles.modalInput}
                            value={newRecipient.swiftBic}
                            onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                            placeholder={accountConfig.fieldLabels.swift_bic}
                            placeholderTextColor={colors.text.secondary}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            editable={!isSubmitting}
                          />
                        </View>
                      </>
                    )}

                    {/* Generic Account Fields */}
                    {accountConfig.accountType === "generic" && (
                      <View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.accountNumber}
                          onChangeText={(text) => {
                            const formatted = formatAccountNumber(text)
                            setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                          }}
                          placeholder={`${accountConfig.fieldLabels.account_number} *`}
                          placeholderTextColor={colors.text.secondary}
                          keyboardType="number-pad"
                          autoComplete="off"
                          autoCorrect={false}
                          textContentType="none"
                          editable={!isSubmitting}
                        />
                      </View>
                    )}
                  </>
                )
              })()}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowBankAccountForm(false)
                    setError('')
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, (isSubmitting || !isFormValid()) && styles.disabledButton]}
                  onPress={handleAddRecipient}
                  disabled={isSubmitting || !isFormValid()}
                >
                  <Text style={styles.saveButtonText}>
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 0,
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
  recipientSelectorContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
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
  sectionTitleContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Medium',
  },
  recipientsContainer: {
    paddingHorizontal: spacing[5],
  },
  recipientItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientAvatarText: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '700',
  },
  avatarFlagBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  flagContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  flagImage: {
    width: 20,
    height: 20,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[1],
  },
  recipientBank: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginBottom: spacing[0],
  },
  recipientAccount: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 0.5,
    borderTopColor: colors.frame.border,
    ...shadows.md,
  },
  addRecipientButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRecipientButtonText: {
    ...textStyles.bodyLarge,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
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
  modalScrollView: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: spacing[8],
    flexGrow: 1,
  },
  modalContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    backgroundColor: '#F9F9F9',
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    minHeight: 48,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  saveButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  currencySelectorWrapper: {
    marginBottom: spacing[4],
    zIndex: 1000,
  },
  currencySelector: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    backgroundColor: '#F9F9F9',
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelectorText: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    marginLeft: spacing[2],
    fontFamily: 'Outfit-Regular',
  },
  currencyDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing[1],
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    maxHeight: 220,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  currencyDropdownSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[2],
  },
  currencyDropdownSearchInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    paddingVertical: spacing[1],
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  currencyDropdownList: {
    maxHeight: 180,
  },
  currencyDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[2],
  },
  currencyDropdownItemSelected: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyFlag: {
    fontSize: 16,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  currencyCode: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  currencyName: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0],
    fontFamily: 'Outfit-Regular',
  },
  currencySymbol: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  recipientTypeModal: {
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingTop: spacing[2],
  },
  recipientTypeOptions: {
    padding: spacing[5],
    gap: spacing[3],
  },
  recipientTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    gap: spacing[3],
  },
  recipientTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientTypeContent: {
    flex: 1,
  },
  recipientTypeTitle: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[1],
  },
  recipientTypeSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  transferTypeContainer: {
    marginBottom: spacing[2],
  },
  transferTypeOptions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  transferTypeOption: {
    flex: 1,
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.frame.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferTypeOptionSelected: {
    backgroundColor: colors.primary.main + '15',
    borderColor: colors.primary.main,
    borderWidth: 1.5,
  },
  transferTypeOptionText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  transferTypeOptionTextSelected: {
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  errorContainer: {
    backgroundColor: colors.error.background,
    borderColor: colors.error.light,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
})
