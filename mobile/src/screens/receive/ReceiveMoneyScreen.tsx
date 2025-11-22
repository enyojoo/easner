import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, apiPost } from '../../lib/apiClient'
import { recipientService, RecipientData } from '../../lib/recipientService'
import { getAccountTypeConfigFromCurrency, formatFieldValue } from '../../lib/currencyAccountTypes'
import { getCountryFlag } from '../../utils/flagUtils'

interface CryptoWallet {
  id: string
  crypto_currency: string
  wallet_address: string
  blockchain_address?: string
  blockchain_memo?: string
  fiat_currency: string
  status: string
  transaction_count: number
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
    currency: string
  }
}

interface SupportedCrypto {
  code: string
  name: string
  blockchain: string
}

function ReceiveMoneyContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const { recipients, currencies, refreshRecipients } = useUserData()
  const [wallets, setWallets] = useState<CryptoWallet[]>([])
  const [supportedCryptos, setSupportedCryptos] = useState<SupportedCrypto[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [selectedFiat, setSelectedFiat] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null)
  const [fiatCurrencySearch, setFiatCurrencySearch] = useState("")
  const [recipientSearch, setRecipientSearch] = useState("")
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false)
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
  })

  // Load recipients when create flow opens or when step 3 is reached
  useEffect(() => {
    if (showCreateFlow && createStep === 3) {
      refreshRecipients()
    }
  }, [showCreateFlow, createStep, refreshRecipients])

  // Fetch wallets and supported cryptos - only if not in cache
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY_WALLETS = `easner_crypto_wallets_${userProfile.id}`
    const CACHE_KEY_CRYPTOS = "easner_supported_cryptos"
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    const getCachedWallets = async (): Promise<CryptoWallet[] | null> => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_WALLETS)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        await AsyncStorage.removeItem(CACHE_KEY_WALLETS)
        return null
      } catch {
        return null
      }
    }

    const getCachedCryptos = async (): Promise<SupportedCrypto[] | null> => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_CRYPTOS)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        await AsyncStorage.removeItem(CACHE_KEY_CRYPTOS)
        return null
      } catch {
        return null
      }
    }

    const setCachedWallets = async (value: CryptoWallet[]) => {
      try {
        await AsyncStorage.setItem(CACHE_KEY_WALLETS, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    const setCachedCryptos = async (value: SupportedCrypto[]) => {
      try {
        await AsyncStorage.setItem(CACHE_KEY_CRYPTOS, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Load from cache first
    const loadFromCache = async () => {
      const cachedWallets = await getCachedWallets()
      const cachedCryptos = await getCachedCryptos()
      
      // Update state if cache exists
      if (cachedWallets !== null && cachedWallets.length > 0) {
        setWallets(cachedWallets)
      }
      if (cachedCryptos !== null && cachedCryptos.length > 0) {
        setSupportedCryptos(cachedCryptos)
      }

      // If both are cached and valid, fetch in background
      if (cachedWallets !== null && cachedCryptos !== null) {
        // Fetch in background to update cache
        fetchData(true)
        return
      }

      // Only fetch if no cache
      await fetchData(false)
    }

    const fetchData = async (background = false) => {
      if (!background) {
        setLoading(true)
      }
      try {
        const cachedWallets = await getCachedWallets()
        const cachedCryptos = await getCachedCryptos()
        
        const promises: Promise<any>[] = []
        
        if (cachedWallets === null) {
          promises.push(apiGet('/api/crypto/wallets').then(res => res.ok ? res.json() : null).catch(() => null))
        } else {
          promises.push(Promise.resolve(null))
        }

        if (cachedCryptos === null) {
          promises.push(apiGet('/api/crypto/supported').then(res => res.ok ? res.json() : null).catch(() => null))
        } else {
          promises.push(Promise.resolve(null))
        }

        const [walletsData, cryptosData] = await Promise.all(promises)

        if (walletsData) {
          const walletsList = walletsData.wallets || []
          setWallets(walletsList)
          await setCachedWallets(walletsList)
        }

        if (cryptosData) {
          const cryptosList = cryptosData.cryptocurrencies || []
          setSupportedCryptos(cryptosList)
          await setCachedCryptos(cryptosList)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        if (!background) {
          setLoading(false)
        }
      }
    }

    loadFromCache()
  }, [userProfile?.id])

  const copyToClipboard = async (text: string) => {
    try {
      // For React Native, we'll use a simple approach
      // In a real app, you'd install @react-native-clipboard/clipboard or expo-clipboard
      setCopiedAddress(text)
      setTimeout(() => setCopiedAddress(null), 2000)
      Alert.alert("Copied", "Address copied to clipboard")
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleCreateWallet = async () => {
    if (!selectedCrypto || !selectedFiat || !selectedRecipient) {
      Alert.alert("Error", "Please select a recipient for bank payout")
      return
    }

    try {
      const requestBody: any = {
        cryptoCurrency: selectedCrypto,
        fiatCurrency: selectedFiat,
        destinationType: "bank",
        chain: "stellar",
        recipientId: selectedRecipient,
      }

      const response = await apiPost('/api/crypto/wallets', requestBody)

      if (response.ok) {
        const data = await response.json()
        // Update cache
        if (userProfile?.id) {
          const CACHE_KEY_WALLETS = `easner_crypto_wallets_${userProfile.id}`
          try {
            const cached = await AsyncStorage.getItem(CACHE_KEY_WALLETS)
            if (cached) {
              const { value } = JSON.parse(cached)
              await AsyncStorage.setItem(CACHE_KEY_WALLETS, JSON.stringify({
                value: [data.wallet, ...value],
                timestamp: Date.now()
              }))
            }
          } catch {}
        }
        
        setWallets([data.wallet, ...wallets])
        setShowCreateFlow(false)
        setCreateStep(1)
        setSelectedCrypto("")
        setSelectedFiat("")
        setSelectedRecipient("")
        Alert.alert("Success", "Address created successfully")
      } else {
        const error = await response.json().catch(() => ({}))
        Alert.alert("Error", error.error || "Failed to create address")
      }
    } catch (error) {
      console.error("Error creating address:", error)
      Alert.alert("Error", "Failed to create address")
    }
  }

  const handleAddNewRecipient = async () => {
    if (!userProfile?.id) return

    try {
      const newRecipient = await recipientService.create(userProfile.id, {
        fullName: newRecipientData.fullName,
        accountNumber: newRecipientData.accountNumber,
        bankName: newRecipientData.bankName,
        currency: selectedFiat,
        routingNumber: newRecipientData.routingNumber || undefined,
        sortCode: newRecipientData.sortCode || undefined,
        iban: newRecipientData.iban || undefined,
        swiftBic: newRecipientData.swiftBic || undefined,
      })

      await refreshRecipients()
      setSelectedRecipient(newRecipient.id)
      setNewRecipientData({
        fullName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        sortCode: "",
        iban: "",
        swiftBic: "",
      })
      setShowAddRecipientModal(false)
      Alert.alert("Success", "Recipient added successfully")
    } catch (error) {
      console.error("Error adding recipient:", error)
      Alert.alert("Error", "Failed to add recipient. Please try again.")
    }
  }

  const filteredRecipients = useMemo(() => {
    if (!selectedFiat) return []
    return recipients.filter(
      (recipient) =>
        (recipient.full_name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
          recipient.account_number.includes(recipientSearch)) &&
        recipient.currency === selectedFiat,
    )
  }, [recipients, selectedFiat, recipientSearch])

  const filteredCurrencies = useMemo(() => {
    if (!fiatCurrencySearch) return currencies
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(fiatCurrencySearch.toLowerCase()) ||
        currency.name.toLowerCase().includes(fiatCurrencySearch.toLowerCase()),
    )
  }, [currencies, fiatCurrencySearch])

  const selectedFiatCurrencyData = useMemo(() => 
    currencies.find((c) => c.code === selectedFiat), 
    [currencies, selectedFiat]
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const [walletsResponse, cryptosResponse] = await Promise.all([
        apiGet('/api/crypto/wallets'),
        apiGet('/api/crypto/supported')
      ])

      if (walletsResponse.ok) {
        const walletsData = await walletsResponse.json()
        const walletsList = walletsData.wallets || []
        setWallets(walletsList)
        if (userProfile?.id) {
          const CACHE_KEY_WALLETS = `easner_crypto_wallets_${userProfile.id}`
          await AsyncStorage.setItem(CACHE_KEY_WALLETS, JSON.stringify({
            value: walletsList,
            timestamp: Date.now()
          }))
        }
      }

      if (cryptosResponse.ok) {
        const cryptosData = await cryptosResponse.json()
        const cryptosList = cryptosData.cryptocurrencies || []
        setSupportedCryptos(cryptosList)
        await AsyncStorage.setItem("easner_supported_cryptos", JSON.stringify({
          value: cryptosList,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error("Error refreshing:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Show loading only if we have no cached data
  if (loading && wallets.length === 0 && supportedCryptos.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Receive Money</Text>
          <Text style={styles.subtitle}>Receive stablecoins directly to your local currency bank account.</Text>
        </View>

        {/* Existing Wallets Section */}
        {wallets.length > 0 && (
          <View style={styles.walletsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Addresses</Text>
              {!showCreateFlow && (
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => setShowCreateFlow(true)}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.addAddressButtonText}>Add Address</Text>
                </TouchableOpacity>
              )}
            </View>

            {wallets.map((wallet) => (
              <View key={wallet.id} style={styles.walletCard}>
                <View style={styles.walletCardHeader}>
                  <View style={styles.walletIconContainer}>
                    <Ionicons name="wallet" size={24} color="#007ACC" />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletCurrency}>{wallet.crypto_currency}</Text>
                    <Text style={styles.walletSubtitle}>Stablecoin Address</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    wallet.status === "active" && styles.statusBadgeActive
                  ]}>
                    <Text style={styles.statusText}>{wallet.status}</Text>
                  </View>
                </View>

                <View style={styles.addressSection}>
                  <View style={styles.addressRow}>
                    <Text style={styles.addressLabel}>Address</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(wallet.blockchain_address || wallet.wallet_address)}
                    >
                      <Ionicons
                        name={copiedAddress === (wallet.blockchain_address || wallet.wallet_address) ? "checkmark" : "copy-outline"}
                        size={16}
                        color={copiedAddress === (wallet.blockchain_address || wallet.wallet_address) ? "#10b981" : "#6b7280"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.addressValue} numberOfLines={2}>
                    {wallet.blockchain_address || wallet.wallet_address}
                  </Text>
                  {wallet.blockchain_memo && (
                    <>
                      <View style={styles.memoDivider} />
                      <View style={styles.addressRow}>
                        <Text style={styles.addressLabel}>Memo (Required for Stellar)</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(wallet.blockchain_memo || "")}
                        >
                          <Ionicons
                            name={copiedAddress === wallet.blockchain_memo ? "checkmark" : "copy-outline"}
                            size={16}
                            color={copiedAddress === wallet.blockchain_memo ? "#10b981" : "#6b7280"}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.addressValue}>{wallet.blockchain_memo}</Text>
                      <Text style={styles.memoWarning}>
                        ⚠️ Include this memo when sending to this address on Stellar
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.walletDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Linked Account</Text>
                    <Text style={styles.detailValue}>{wallet.recipient?.full_name || "Bank Account"}</Text>
                    <Text style={styles.detailSubtext}>{wallet.recipient?.bank_name || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Currency</Text>
                    <Text style={styles.detailValue}>{wallet.fiat_currency}</Text>
                    <Text style={styles.detailSubtext}>{wallet.transaction_count || 0} transactions</Text>
                  </View>
                </View>

                <View style={styles.walletActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedWallet(wallet)
                      setShowQR(wallet.id)
                    }}
                  >
                    <Ionicons name="qr-code-outline" size={20} color="#374151" />
                    <Text style={styles.actionButtonText}>QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => {
                      // Navigate to wallet transaction history
                      navigation.navigate('ReceiveTransactionDetails', {
                        transactionId: wallet.id,
                        fromScreen: 'ReceiveMoney'
                      })
                    }}
                  >
                    <Text style={styles.actionButtonTextPrimary}>View History</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Create Flow */}
        {showCreateFlow && (
          <View style={styles.createFlowContainer}>
            <View style={styles.createFlowHeader}>
              <View style={styles.createFlowHeaderTop}>
                <Text style={styles.createFlowTitle}>Create New Address</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateFlow(false)
                    setCreateStep(1)
                    setSelectedCrypto("")
                    setSelectedFiat("")
                    setSelectedRecipient("")
                    setFiatCurrencySearch("")
                    setRecipientSearch("")
                  }}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {/* Progress Steps */}
              <View style={styles.progressSteps}>
                {[1, 2, 3, 4].map((step) => (
                  <View key={step} style={styles.progressStep}>
                    {step < 4 && (
                      <View style={[
                        styles.progressLine,
                        createStep >= step && styles.progressLineActive
                      ]} />
                    )}
                    <View style={[
                      styles.progressCircle,
                      createStep > step && styles.progressCircleCompleted,
                      createStep === step && styles.progressCircleActive
                    ]}>
                      {createStep > step ? (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      ) : (
                        <Text style={[
                          styles.progressCircleText,
                          createStep === step && styles.progressCircleTextActive
                        ]}>{step}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Step 1: Choose Stablecoin */}
            {createStep === 1 && (
              <View style={styles.createStepContent}>
                <View style={styles.stepContentWrapper}>
                  <ScrollView 
                    style={styles.stepScrollableArea}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.stepLabel}>Choose Stablecoin</Text>
                    <View style={styles.cryptoGridContainer}>
                      {supportedCryptos.map((crypto) => (
                        <TouchableOpacity
                          key={crypto.code}
                          style={[
                            styles.cryptoCard,
                            selectedCrypto === crypto.code && styles.cryptoCardSelected
                          ]}
                          onPress={() => setSelectedCrypto(crypto.code)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.cryptoEmoji}>💎</Text>
                          <Text style={styles.cryptoCode}>{crypto.code}</Text>
                          <Text style={styles.cryptoName}>{crypto.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <View style={styles.stepButtons}>
                    <TouchableOpacity
                      style={styles.stepButtonCancel}
                      onPress={() => setShowCreateFlow(false)}
                    >
                      <Text style={styles.stepButtonCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.stepButtonContinue, !selectedCrypto && styles.stepButtonDisabled]}
                      onPress={() => setCreateStep(2)}
                      disabled={!selectedCrypto}
                    >
                      <Text style={styles.stepButtonContinueText}>Continue</Text>
                      <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Step 2: Select Fiat Currency */}
            {createStep === 2 && (
              <View style={styles.createStepContent}>
                <View style={styles.stepContentWrapper}>
                  {/* Fixed Header */}
                  <View style={styles.stepFixedHeader}>
                    <Text style={styles.stepLabel}>Select Fiat Currency</Text>
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search currencies"
                        value={fiatCurrencySearch}
                        onChangeText={setFiatCurrencySearch}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                  {/* Scrollable Currency List */}
                  <View style={styles.stepScrollableArea}>
                    <ScrollView 
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {filteredCurrencies.length === 0 ? (
                        <View style={styles.emptyListContainer}>
                          <Text style={styles.emptyListText}>
                            No currencies found matching "{fiatCurrencySearch}"
                          </Text>
                        </View>
                      ) : (
                        filteredCurrencies.map((currency) => (
                          <TouchableOpacity
                            key={currency.code}
                            style={[
                              styles.currencyItem,
                              selectedFiat === currency.code && styles.currencyItemSelected
                            ]}
                            onPress={() => {
                              setSelectedFiat(currency.code)
                              setFiatCurrencySearch("")
                            }}
                          >
                            <View style={styles.currencyItemContent}>
                              <Text style={styles.currencyFlag}>{getCountryFlag(currency.code)}</Text>
                              <View style={styles.currencyItemInfo}>
                                <Text style={[
                                  styles.currencyCode,
                                  selectedFiat === currency.code && styles.currencyCodeSelected
                                ]}>
                                  {currency.code}
                                </Text>
                                <Text style={styles.currencyName}>{currency.name}</Text>
                              </View>
                            </View>
                            {selectedFiat === currency.code && (
                              <View style={styles.currencyCheck}>
                                <Ionicons name="checkmark" size={16} color="#ffffff" />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                  {/* Fixed Footer Buttons */}
                  <View style={styles.stepButtons}>
                    <TouchableOpacity
                      style={styles.stepButtonBack}
                      onPress={() => setCreateStep(1)}
                    >
                      <Ionicons name="chevron-back" size={16} color="#374151" />
                      <Text style={styles.stepButtonBackText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.stepButtonContinue, !selectedFiat && styles.stepButtonDisabled]}
                      onPress={() => setCreateStep(3)}
                      disabled={!selectedFiat}
                    >
                      <Text style={styles.stepButtonContinueText}>Continue</Text>
                      <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Link Bank Account */}
            {createStep === 3 && (
              <View style={styles.createStepContent}>
                <View style={styles.stepContentWrapper}>
                  {/* Fixed Header */}
                  <View style={styles.stepFixedHeader}>
                    <Text style={styles.stepLabel}>Link Bank Account</Text>
                    <View style={styles.recipientSearchContainer}>
                      <View style={[styles.searchContainer, styles.searchContainerFlex]}>
                        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search recipients"
                          value={recipientSearch}
                          onChangeText={setRecipientSearch}
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.addRecipientButton}
                        onPress={() => setShowAddRecipientModal(true)}
                      >
                        <Ionicons name="add" size={20} color="#007ACC" />
                        <Text style={styles.addRecipientButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Scrollable Recipient List */}
                  <View style={styles.stepScrollableArea}>
                    <ScrollView 
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {filteredRecipients.length === 0 ? (
                        <View style={styles.emptyListContainer}>
                          <Text style={styles.emptyListText}>
                            {recipientSearch
                              ? `No recipients found matching "${recipientSearch}"`
                              : `No recipients found for ${selectedFiat}`}
                          </Text>
                          <Text style={styles.emptyListSubtext}>Add a new recipient to get started</Text>
                        </View>
                      ) : (
                        filteredRecipients.map((recipient) => (
                          <TouchableOpacity
                            key={recipient.id}
                            style={[
                              styles.recipientItem,
                              selectedRecipient === recipient.id && styles.recipientItemSelected
                            ]}
                            onPress={() => setSelectedRecipient(recipient.id)}
                          >
                            <View style={styles.recipientItemContent}>
                              <View style={styles.recipientAvatar}>
                                <Text style={styles.recipientAvatarText}>
                                  {getInitials(recipient.full_name)}
                                </Text>
                                <View style={styles.recipientFlag}>
                                  <Text style={styles.recipientFlagText}>
                                    {getCountryFlag(recipient.currency)}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.recipientItemInfo}>
                                <Text style={[
                                  styles.recipientName,
                                  selectedRecipient === recipient.id && styles.recipientNameSelected
                                ]}>
                                  {recipient.full_name}
                                </Text>
                                {(() => {
                                  const accountConfig = getAccountTypeConfigFromCurrency(recipient.currency)
                                  const accountType = accountConfig.accountType
                                  const accountIdentifier = accountType === "euro" && recipient.iban
                                    ? formatFieldValue(accountType, "iban", recipient.iban)
                                    : recipient.account_number

                                  return (
                                    <View>
                                      {accountIdentifier && (
                                        <Text style={styles.recipientAccount}>{accountIdentifier}</Text>
                                      )}
                                      <Text style={styles.recipientBank}>{recipient.bank_name}</Text>
                                    </View>
                                  )
                                })()}
                              </View>
                            </View>
                            {selectedRecipient === recipient.id && (
                              <View style={styles.recipientCheck}>
                                <Ionicons name="checkmark" size={16} color="#ffffff" />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                  {/* Fixed Footer Buttons */}
                  <View style={styles.stepButtons}>
                    <TouchableOpacity
                      style={styles.stepButtonBack}
                      onPress={() => setCreateStep(2)}
                    >
                      <Ionicons name="chevron-back" size={16} color="#374151" />
                      <Text style={styles.stepButtonBackText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.stepButtonContinue, !selectedRecipient && styles.stepButtonDisabled]}
                      onPress={handleCreateWallet}
                      disabled={!selectedRecipient}
                    >
                      <Text style={styles.stepButtonContinueText}>Create Address</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {wallets.length === 0 && !showCreateFlow && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="download-outline" size={64} color="#007ACC" />
            </View>
            <Text style={styles.emptyTitle}>No Addresses Yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first stablecoin address to start receiving stablecoins automatically convert to your local currency bank account.
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateFlow(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createFirstButtonText}>Create Your First Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQR !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQR(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan to Receive</Text>
              <TouchableOpacity onPress={() => setShowQR(null)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {selectedWallet && (
              <View style={styles.qrContent}>
                <View style={styles.qrContainer}>
                  <Text style={styles.qrPlaceholder}>QR Code</Text>
                  <Text style={styles.qrHint}>QR code generation coming soon</Text>
                </View>
                <Text style={styles.qrAddressLabel}>Send {selectedWallet.crypto_currency} to this address</Text>
                <Text style={styles.qrAddress} numberOfLines={2}>
                  {selectedWallet.blockchain_address || selectedWallet.wallet_address}
                </Text>
                {selectedWallet.blockchain_memo && (
                  <View style={styles.qrMemoSection}>
                    <Text style={styles.qrMemoLabel}>Memo (Required):</Text>
                    <Text style={styles.qrMemoValue}>{selectedWallet.blockchain_memo}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Recipient Modal */}
      <Modal
        visible={showAddRecipientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddRecipientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addRecipientModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipient</Text>
              <TouchableOpacity onPress={() => setShowAddRecipientModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.addRecipientForm}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Currency</Text>
                <View style={styles.currencyDisplay}>
                  <Text style={styles.currencyDisplayFlag}>
                    {selectedFiatCurrencyData ? getCountryFlag(selectedFiatCurrencyData.code) : "🌍"}
                  </Text>
                  <Text style={styles.currencyDisplayCode}>{selectedFiat}</Text>
                  <Text style={styles.currencyDisplayAuto}>Auto-selected</Text>
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Account Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newRecipientData.fullName}
                  onChangeText={(text) => setNewRecipientData({ ...newRecipientData, fullName: text })}
                  placeholder="Enter account name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {(() => {
                const accountConfig = selectedFiat
                  ? getAccountTypeConfigFromCurrency(selectedFiat)
                  : null

                if (!accountConfig) {
                  return (
                    <View style={styles.formField}>
                      <Text style={styles.formHelpText}>
                        Please select a currency first to see the required fields
                      </Text>
                    </View>
                  )
                }

                return (
                  <>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>
                        {accountConfig.fieldLabels.bank_name} *
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        value={newRecipientData.bankName}
                        onChangeText={(text) => setNewRecipientData({ ...newRecipientData, bankName: text })}
                        placeholder={accountConfig.fieldPlaceholders.bank_name}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {accountConfig.accountType === "us" && (
                      <>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.routing_number} *
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.routingNumber}
                            onChangeText={(text) => {
                              const value = text.replace(/\D/g, "").slice(0, 9)
                              setNewRecipientData({ ...newRecipientData, routingNumber: value })
                            }}
                            placeholder={accountConfig.fieldPlaceholders.routing_number}
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            maxLength={9}
                          />
                        </View>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.account_number} *
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.accountNumber}
                            onChangeText={(text) => setNewRecipientData({ ...newRecipientData, accountNumber: text })}
                            placeholder={accountConfig.fieldPlaceholders.account_number}
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                      </>
                    )}

                    {accountConfig.accountType === "uk" && (
                      <>
                        <View style={styles.formRow}>
                          <View style={[styles.formField, styles.formFieldHalf]}>
                            <Text style={styles.formLabel}>
                              {accountConfig.fieldLabels.sort_code} *
                            </Text>
                            <TextInput
                              style={styles.formInput}
                              value={newRecipientData.sortCode}
                              onChangeText={(text) => {
                                const value = text.replace(/\D/g, "").slice(0, 6)
                                setNewRecipientData({ ...newRecipientData, sortCode: value })
                              }}
                              placeholder={accountConfig.fieldPlaceholders.sort_code}
                              placeholderTextColor="#9ca3af"
                              keyboardType="numeric"
                              maxLength={6}
                            />
                          </View>
                          <View style={[styles.formField, styles.formFieldHalf]}>
                            <Text style={styles.formLabel}>
                              {accountConfig.fieldLabels.account_number} *
                            </Text>
                            <TextInput
                              style={styles.formInput}
                              value={newRecipientData.accountNumber}
                              onChangeText={(text) => setNewRecipientData({ ...newRecipientData, accountNumber: text })}
                              placeholder={accountConfig.fieldPlaceholders.account_number}
                              placeholderTextColor="#9ca3af"
                            />
                          </View>
                        </View>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.iban}
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.iban}
                            onChangeText={(text) => setNewRecipientData({ ...newRecipientData, iban: text.toUpperCase() })}
                            placeholder={accountConfig.fieldPlaceholders.iban}
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.swift_bic} (Optional)
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.swiftBic}
                            onChangeText={(text) => setNewRecipientData({ ...newRecipientData, swiftBic: text.toUpperCase() })}
                            placeholder={accountConfig.fieldPlaceholders.swift_bic}
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="characters"
                          />
                        </View>
                      </>
                    )}

                    {accountConfig.accountType === "euro" && (
                      <>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.iban} *
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.iban}
                            onChangeText={(text) => setNewRecipientData({ ...newRecipientData, iban: text.toUpperCase() })}
                            placeholder={accountConfig.fieldPlaceholders.iban}
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>
                            {accountConfig.fieldLabels.swift_bic} (Optional)
                          </Text>
                          <TextInput
                            style={styles.formInput}
                            value={newRecipientData.swiftBic}
                            onChangeText={(text) => setNewRecipientData({ ...newRecipientData, swiftBic: text.toUpperCase() })}
                            placeholder={accountConfig.fieldPlaceholders.swift_bic}
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="characters"
                          />
                        </View>
                      </>
                    )}

                    {accountConfig.accountType === "generic" && (
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>
                          {accountConfig.fieldLabels.account_number} *
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          value={newRecipientData.accountNumber}
                          onChangeText={(text) => setNewRecipientData({ ...newRecipientData, accountNumber: text })}
                          placeholder={accountConfig.fieldPlaceholders.account_number}
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  </>
                )
              })()}
              <TouchableOpacity
                style={[
                  styles.addRecipientSubmitButton,
                  (() => {
                    if (!newRecipientData.fullName || !selectedFiat) return styles.addRecipientSubmitButtonDisabled
                    const accountConfig = getAccountTypeConfigFromCurrency(selectedFiat)
                    const requiredFields = accountConfig.requiredFields
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
                    for (const field of requiredFields) {
                      const formFieldName = mapFieldName(field)
                      const fieldValue = newRecipientData[formFieldName as keyof typeof newRecipientData]
                      if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
                        return styles.addRecipientSubmitButtonDisabled
                      }
                    }
                    return null
                  })()
                ]}
                onPress={handleAddNewRecipient}
                disabled={(() => {
                  if (!newRecipientData.fullName || !selectedFiat) return true
                  const accountConfig = getAccountTypeConfigFromCurrency(selectedFiat)
                  const requiredFields = accountConfig.requiredFields
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
                  for (const field of requiredFields) {
                    const formFieldName = mapFieldName(field)
                    const fieldValue = newRecipientData[formFieldName as keyof typeof newRecipientData]
                    if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
                      return true
                    }
                  }
                  return false
                })()}
              >
                <Text style={styles.addRecipientSubmitButtonText}>Add Recipient</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  walletsSection: {
    padding: 20,
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
    color: '#111827',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007ACC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAddressButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007ACC',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  statusBadgeActive: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  addressSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#111827',
    marginTop: 4,
  },
  memoDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  memoWarning: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 8,
  },
  walletDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  actionButtonPrimary: {
    backgroundColor: '#007ACC',
    borderColor: '#007ACC',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  actionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  createFlowContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 500,
    minHeight: 400,
  },
  createFlowHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  createFlowHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  createFlowTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  progressLineActive: {
    backgroundColor: '#007ACC',
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#007ACC',
  },
  progressCircleCompleted: {
    backgroundColor: '#007ACC',
  },
  progressCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressCircleTextActive: {
    color: '#ffffff',
  },
  createStepContent: {
    flex: 1,
    flexDirection: 'column',
  },
  stepContentWrapper: {
    flex: 1,
    flexDirection: 'column',
    padding: 24,
  },
  stepFixedHeader: {
    flexShrink: 0,
    marginBottom: 16,
  },
  stepScrollableArea: {
    flex: 1,
    minHeight: 200,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  cryptoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cryptoCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
    minHeight: 100,
  },
  cryptoCardSelected: {
    borderColor: '#007ACC',
    backgroundColor: '#007ACC',
    opacity: 0.05,
    shadowColor: '#007ACC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cryptoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cryptoCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cryptoName: {
    fontSize: 12,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchContainerFlex: {
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  currencyItemSelected: {
    borderColor: '#007ACC',
    backgroundColor: '#007ACC',
    opacity: 0.05,
  },
  currencyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  currencyCodeSelected: {
    color: '#007ACC',
  },
  currencyName: {
    fontSize: 14,
    color: '#6b7280',
  },
  currencyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007ACC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientSearchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addRecipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    justifyContent: 'center',
  },
  addRecipientButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  recipientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  recipientItemSelected: {
    borderColor: '#007ACC',
    backgroundColor: '#007ACC',
    opacity: 0.05,
  },
  recipientItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007ACC',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  recipientAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007ACC',
  },
  recipientFlag: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientFlagText: {
    fontSize: 12,
  },
  recipientItemInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  recipientNameSelected: {
    color: '#007ACC',
  },
  recipientAccount: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
    marginBottom: 2,
  },
  recipientBank: {
    fontSize: 14,
    color: '#6b7280',
  },
  recipientCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007ACC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexShrink: 0,
  },
  stepButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  stepButtonBack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  stepButtonBackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  stepButtonContinue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007ACC',
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  stepButtonContinueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  emptyListContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyListSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  addRecipientModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  addRecipientForm: {
    maxHeight: 500,
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formFieldHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formHelpText: {
    fontSize: 14,
    color: '#6b7280',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currencyDisplayFlag: {
    fontSize: 24,
  },
  currencyDisplayCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  currencyDisplayAuto: {
    fontSize: 12,
    color: '#6b7280',
  },
  addRecipientSubmitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007ACC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addRecipientSubmitButtonDisabled: {
    opacity: 0.5,
  },
  addRecipientSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007ACC',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007ACC',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  qrContent: {
    alignItems: 'center',
  },
  qrContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  qrPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  qrAddressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  qrAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#111827',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  qrMemoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    width: '100%',
  },
  qrMemoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d97706',
    marginBottom: 4,
  },
  qrMemoValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
})

export default function ReceiveMoneyScreen({ navigation, route }: NavigationProps) {
  return <ReceiveMoneyContent navigation={navigation} route={route} />
}
