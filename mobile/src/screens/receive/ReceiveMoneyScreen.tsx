import React, { useState, useRef, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Animated,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { bridgeService } from '../../lib/bridgeService'
import { supabase } from '../../lib/supabase'
import { kycService } from '../../lib/kycService'
import QRCode from 'react-native-qrcode-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'

type TabType = 'bank' | 'stablecoin'

export default function ReceiveMoneyScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<TabType>('bank')
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [virtualAccount, setVirtualAccount] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletMemo, setWalletMemo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [checkingKyc, setCheckingKyc] = useState(true)
  const [creatingAccounts, setCreatingAccounts] = useState(false)
  const [accountCreationError, setAccountCreationError] = useState<string | null>(null)
  
  // Get currency from route params or default to USD (only USD/EUR supported)
  const currency = ((route.params as any)?.currency || 'USD') as 'USD' | 'EUR'
  
  // Determine if stablecoins are supported for this currency (always true for USD/EUR)
  const supportsStablecoins = currency === 'USD' || currency === 'EUR'
  
  // State to track if accounts exist in database (fallback when API times out)
  const [hasWalletInDb, setHasWalletInDb] = useState(false)
  const [hasAccountInDb, setHasAccountInDb] = useState(false)
  
  // Check if account is ready (has account and KYC approved)
  // Use database check as fallback if API call fails
  const accountReady = (virtualAccount?.hasAccount || hasAccountInDb) && kycStatus === 'approved'
  
  // Check if wallet is ready (has wallet address and KYC approved)
  // Use database check as fallback if API call fails
  const walletReady = ((walletAddress && 
    walletAddress !== 'Loading...' && 
    walletAddress !== 'Wallet address not available') || hasWalletInDb) && 
    kycStatus === 'approved'
  
  // Fetch virtual account and wallet data
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true)
        setCheckingKyc(true)
        const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
        
        // Get user ID
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) {
          setLoading(false)
          setCheckingKyc(false)
          return
        }
        
        // First, try to load KYC status from cache to prevent flickering
        try {
          const CACHE_KEY = `easner_kyc_submissions_${userId}`
          const cached = await AsyncStorage.getItem(CACHE_KEY)
          
          if (cached) {
            const { value, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minute cache
              const submissions = value as any[]
              const identitySubmission = submissions.find(s => s.type === "identity")
              const addressSubmission = submissions.find(s => s.type === "address")
              
              // Set KYC status from cache immediately to prevent flickering
              if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
                setKycStatus('approved')
              } else if (identitySubmission?.status === "rejected" || addressSubmission?.status === "rejected") {
                setKycStatus('rejected')
              } else if (identitySubmission?.status === "in_review" || addressSubmission?.status === "in_review") {
                setKycStatus('in_review')
              } else if (identitySubmission || addressSubmission) {
                setKycStatus('pending')
              } else {
                setKycStatus(null)
              }
              setCheckingKyc(false) // We have cached status, can show UI
            }
          }
        } catch (cacheError) {
          console.error('Error loading KYC cache:', cacheError)
        }
        
        // Then, check KYC submissions from database (most reliable) - fetch in background
        try {
          const submissions = await kycService.getByUserId(userId)
          const identitySubmission = submissions.find(s => s.type === "identity")
          const addressSubmission = submissions.find(s => s.type === "address")
          
          // Update cache
          const CACHE_KEY = `easner_kyc_submissions_${userId}`
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            value: submissions,
            timestamp: Date.now()
          }))
          
          // Check if both are approved
          if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
            setKycStatus('approved')
          } else if (identitySubmission?.status === "rejected" || addressSubmission?.status === "rejected") {
            setKycStatus('rejected')
          } else if (identitySubmission?.status === "in_review" || addressSubmission?.status === "in_review") {
            setKycStatus('in_review')
          } else if (identitySubmission || addressSubmission) {
            setKycStatus('pending')
          } else {
            setKycStatus(null)
          }
        } catch (kycError) {
          console.error('Error checking KYC submissions:', kycError)
        } finally {
          setCheckingKyc(false)
        }
        
        // Check database directly for wallet/account IDs (fast, no API call)
        try {
          const { data: userProfile } = await supabase
            .from('users')
            .select('bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id, bridge_kyc_status')
            .eq('id', userId)
            .single()
          
          if (userProfile) {
            // Use Bridge KYC status if available (from webhook), otherwise keep submission status
            if (userProfile.bridge_kyc_status && userProfile.bridge_kyc_status !== 'pending') {
              setKycStatus(userProfile.bridge_kyc_status)
            }
            
            // Check if wallet exists in database
            if (userProfile.bridge_wallet_id) {
              setHasWalletInDb(true)
              // Try to get wallet address from database
              const { data: wallet } = await supabase
                .from('bridge_wallets')
                .select('address')
                .eq('bridge_wallet_id', userProfile.bridge_wallet_id)
                .single()
              if (wallet?.address) {
                setWalletAddress(wallet.address)
              }
            }
            
            // Check if virtual account exists in database
            const accountId = currencyLower === 'usd' 
              ? userProfile.bridge_usd_virtual_account_id 
              : userProfile.bridge_eur_virtual_account_id
            if (accountId) {
              setHasAccountInDb(true)
              // Try to get account details from database
              const { data: account } = await supabase
                .from('bridge_virtual_accounts')
                .select('account_number, routing_number, iban, bic, bank_name, account_holder_name')
                .eq('bridge_virtual_account_id', accountId)
                .single()
              if (account) {
            setVirtualAccount({ 
                  hasAccount: true,
              currency: currencyLower,
                  accountNumber: account.account_number,
                  routingNumber: account.routing_number,
                  iban: account.iban,
                  bic: account.bic,
                  bankName: account.bank_name,
                  accountHolderName: account.account_holder_name,
                })
              }
            }
          }
        } catch (dbError) {
          console.error('Error checking database:', dbError)
        }
        
        // Try to fetch latest data from API (with timeout) - but don't block on errors
        // Only fetch if we don't have data from database
        setCheckingKyc(false)
        
        // Fetch virtual account from API only if not in database (with timeout)
        // Note: This will be called for both USD and EUR, but we only fetch the current currency
        if (!hasAccountInDb) {
          try {
            // Use AbortController for proper timeout handling
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)
            
            let account: any
            try {
              account = await bridgeService.getVirtualAccount(currencyLower)
              clearTimeout(timeoutId)
            } catch (fetchError: any) {
              clearTimeout(timeoutId)
              if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
                throw new Error('Timeout')
              }
              throw fetchError
            }
            
            console.log('Fetched virtual account:', account)
            setVirtualAccount(account)
            if (account?.hasAccount) {
              setHasAccountInDb(true)
            }
          } catch (accountError: any) {
            console.error('Error fetching virtual account:', accountError)
            // Silently fail - we already have database state
            if (!virtualAccount) {
              setVirtualAccount({ hasAccount: false, currency: currencyLower })
            }
          }
        }

        // Fetch wallet address from API only if not in database (with timeout)
        if (!walletAddress && !hasWalletInDb) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)
            
            let walletsResponse: Response
            try {
              walletsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/wallets`, {
            headers: {
                  'Authorization': `Bearer ${session?.access_token}`,
            },
                signal: controller.signal,
          })
              clearTimeout(timeoutId)
            } catch (fetchError: any) {
              clearTimeout(timeoutId)
              if (fetchError.name === 'AbortError') {
                throw new Error('Timeout')
              }
              throw fetchError
            }
            
          if (walletsResponse.ok) {
            const walletsData = await walletsResponse.json()
            const solanaWallet = walletsData.wallets?.find((w: any) => w.chain === 'solana')
            if (solanaWallet?.address) {
              setWalletAddress(solanaWallet.address)
                setHasWalletInDb(true)
              if (solanaWallet.blockchain_memo) {
                setWalletMemo(solanaWallet.blockchain_memo)
              } else {
                setWalletMemo(null)
              }
            }
          }
        } catch (walletError) {
          console.error('Error fetching wallet address:', walletError)
            // Silently fail - we already have database state
          }
        }
      } catch (error) {
        console.error('Error fetching account data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountData()
  }, [currency])
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refetch KYC status and account data when screen is focused
      const refreshData = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) return
          
          // First check cache to prevent flickering
          try {
            const CACHE_KEY = `easner_kyc_submissions_${userId}`
            const cached = await AsyncStorage.getItem(CACHE_KEY)
            
            if (cached) {
              const { value, timestamp } = JSON.parse(cached)
              if (Date.now() - timestamp < 5 * 60 * 1000) {
                const submissions = value as any[]
                const identitySubmission = submissions.find(s => s.type === "identity")
                const addressSubmission = submissions.find(s => s.type === "address")
                
                // Update status from cache first
                if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
                  setKycStatus('approved')
                } else if (identitySubmission?.status === "rejected" || addressSubmission?.status === "rejected") {
                  setKycStatus('rejected')
                } else if (identitySubmission?.status === "in_review" || addressSubmission?.status === "in_review") {
                  setKycStatus('in_review')
                } else if (identitySubmission || addressSubmission) {
                  setKycStatus('pending')
                }
              }
            }
          } catch (cacheError) {
            console.error('Error loading KYC cache on focus:', cacheError)
          }
          
          // Then refresh KYC submissions from database
          const submissions = await kycService.getByUserId(userId)
          const identitySubmission = submissions.find(s => s.type === "identity")
          const addressSubmission = submissions.find(s => s.type === "address")
          
          // Update cache
          const CACHE_KEY = `easner_kyc_submissions_${userId}`
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            value: submissions,
            timestamp: Date.now()
          }))
          
          if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
            setKycStatus('approved')
          } else if (identitySubmission?.status === "rejected" || addressSubmission?.status === "rejected") {
            setKycStatus('rejected')
          } else if (identitySubmission?.status === "in_review" || addressSubmission?.status === "in_review") {
            setKycStatus('in_review')
          } else if (identitySubmission || addressSubmission) {
            setKycStatus('pending')
          }
          
          // Refresh wallet/account IDs from database
          const { data: userProfile } = await supabase
            .from('users')
            .select('bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id')
            .eq('id', userId)
            .single()
          
          if (userProfile) {
            if (userProfile.bridge_wallet_id) {
              setHasWalletInDb(true)
              const { data: wallet } = await supabase
                .from('bridge_wallets')
                .select('address')
                .eq('bridge_wallet_id', userProfile.bridge_wallet_id)
                .single()
              if (wallet?.address) {
                setWalletAddress(wallet.address)
              }
            }
            
            const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
            const accountId = currencyLower === 'usd' 
              ? userProfile.bridge_usd_virtual_account_id 
              : userProfile.bridge_eur_virtual_account_id
            if (accountId) {
              setHasAccountInDb(true)
              const { data: account } = await supabase
                .from('bridge_virtual_accounts')
                .select('account_number, routing_number, iban, bic, bank_name, account_holder_name')
                .eq('bridge_virtual_account_id', accountId)
                .single()
              if (account) {
                setVirtualAccount({
                  hasAccount: true,
                  currency: currencyLower,
                  accountNumber: account.account_number,
                  routingNumber: account.routing_number,
                  iban: account.iban,
                  bic: account.bic,
                  bankName: account.bank_name,
                  accountHolderName: account.account_holder_name,
                })
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing data on focus:', error)
        }
      }
      
      refreshData()
    }, [currency])
  )
  
  // Set default tab based on currency support
  useEffect(() => {
    if (!supportsStablecoins) {
      setActiveTab('bank')
    }
  }, [supportsStablecoins])

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

  const formatCurrency = (amount: number, curr: string): string => {
    const symbol = curr === 'USD' ? '$' 
      : curr === 'EUR' ? '€' 
      : curr === 'NGN' ? '₦' 
      : ''
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getCurrencyName = (curr: string): string => {
    return curr === 'USD' ? 'US Dollar'
      : curr === 'EUR' ? 'Euro'
      : curr
  }

  const getCurrencyFlag = (curr: string) => {
    if (curr === 'USD') return require('../../../assets/flags/us.png')
    if (curr === 'EUR') return require('../../../assets/flags/eu.png')
    return require('../../../assets/flags/us.png')
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

  // Get bank account details from Bridge virtual account
  const getBankAccountDetails = () => {
    // Account exists and is ready, return real data from Bridge
    if (accountReady) {
      // Map all fields that Bridge provides
      if (currency === 'USD') {
        return {
          accountName: virtualAccount.accountHolderName,
          accountNumber: virtualAccount.accountNumber,
          routingNumber: virtualAccount.routingNumber, // Bridge provides this for USD
          iban: undefined, // Not for USD
          swiftBic: undefined, // Not for USD
          bankName: virtualAccount.bankName,
        }
      } else {
        // EUR account
        return {
          accountName: virtualAccount.accountHolderName,
          accountNumber: undefined, // Not for EUR
          routingNumber: undefined, // Not for EUR
          iban: virtualAccount.iban, // Bridge provides this for EUR
          swiftBic: virtualAccount.bic, // Bridge returns 'bic' for EUR accounts
          bankName: virtualAccount.bankName,
        }
      }
    }
    
    // Account not ready - return empty
    return null
  }

  const bankAccountDetails = getBankAccountDetails()

  // Get stablecoin address (from Bridge wallet)
  const getStablecoinAddress = () => {
    return {
      address: walletReady ? walletAddress! : '',
      network: 'Solana',
      supportedStablecoins: currency === 'USD' 
        ? ['USDC'] 
        : ['EURC'],
      memo: walletMemo || undefined,
    }
  }

  const stablecoinData = getStablecoinAddress()

  // Handle manual account creation (fallback if automatic creation didn't trigger)
  const handleCreateAccounts = async () => {
    try {
      setCreatingAccounts(true)
      setAccountCreationError(null)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Add timeout to create-accounts request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds for account creation
      
      let response: Response
      try {
        response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/create-accounts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw fetchError
      }

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || result.message || 'Failed to create accounts'
        
        // If error mentions TOS, provide helpful message
        if (errorMessage.toLowerCase().includes('tos') || errorMessage.toLowerCase().includes('terms of service')) {
          throw new Error(
            `${errorMessage}\n\nIf you just accepted TOS, please wait a few seconds and try again. Bridge may need a moment to process your acceptance.`
          )
        }
        
        throw new Error(errorMessage)
      }

      if (result.errors && result.errors.length > 0) {
        console.warn('Account creation completed with some errors:', result.errors)
      }

      // Show success message
      Alert.alert(
        'Accounts Created',
        `Wallet: ${result.walletCreated ? 'Created ✓' : 'Already exists'}\n` +
        `USD Account: ${result.usdAccountCreated ? 'Created ✓' : result.usdAccountId ? 'Already exists' : 'Failed'}\n` +
        `EUR Account: ${result.eurAccountCreated ? 'Created ✓' : result.eurAccountId ? 'Already exists' : 'Failed'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh account data
              const fetchAccountData = async () => {
                try {
                  setLoading(true)
                  const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
                  
                  // Refresh virtual account
                  try {
                    const account = await bridgeService.getVirtualAccount(currencyLower)
                    setVirtualAccount(account)
                    if (account?.hasAccount) {
                      setHasAccountInDb(true)
                    }
                  } catch (error) {
                    console.error('Error refreshing virtual account:', error)
                  }

                  // Refresh wallet
                  try {
                    const walletsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/wallets`, {
                      headers: {
                        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                      },
                    })
                    if (walletsResponse.ok) {
                      const walletsData = await walletsResponse.json()
                      const solanaWallet = walletsData.wallets?.find((w: any) => w.chain === 'solana')
                      if (solanaWallet?.address) {
                        setWalletAddress(solanaWallet.address)
                        setHasWalletInDb(true)
                      }
                    }
                  } catch (error) {
                    console.error('Error refreshing wallet:', error)
                  }
                } finally {
                  setLoading(false)
                }
              }
              fetchAccountData()
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Error creating accounts:', error)
      const errorMessage = error.message || 'Failed to create accounts'
      setAccountCreationError(errorMessage)
      
      // If error mentions TOS, provide helpful message with retry option
      if (errorMessage.toLowerCase().includes('tos') || errorMessage.toLowerCase().includes('terms of service')) {
        Alert.alert(
          'Terms of Service Required',
          errorMessage,
          [
            {
              text: 'Go to Verification',
              onPress: () => {
                navigation.navigate('AccountVerification' as any)
              }
            },
            {
              text: 'Retry',
              onPress: () => {
                // Wait 5 seconds then retry
                setTimeout(() => {
                  handleCreateAccounts()
                }, 5000)
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        )
      } else {
        Alert.alert('Error', errorMessage)
      }
    } finally {
      setCreatingAccounts(false)
    }
  }

  const renderCopyableField = (label: string, value: string, key: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.fieldValueContainer}
        onPress={() => handleCopy(value, key)}
        activeOpacity={0.7}
      >
        <Text style={styles.fieldValue}>{value}</Text>
        <View style={styles.copyButton}>
          {copiedStates[key] ? (
            <Ionicons name="checkmark" size={18} color={colors.primary.main} />
          ) : (
            <Ionicons name="copy-outline" size={18} color={colors.text.secondary} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )

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
            <Text style={styles.title}>Receive Money</Text>
            <View style={styles.currencyDisplay}>
              <Image 
                source={getCurrencyFlag(currency)}
                style={styles.currencyFlag}
                resizeMode="cover"
              />
              <Text style={styles.currencyText}>{currency}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Tabs - Only show if multiple options available */}
        {supportsStablecoins && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'bank' && styles.tabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveTab('bank')
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'bank' && styles.tabTextActive]}>
                Bank Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stablecoin' && styles.tabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveTab('stablecoin')
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'stablecoin' && styles.tabTextActive]}>
                Stablecoins
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
            {activeTab === 'bank' ? (
              <>
                {!accountReady && !checkingKyc ? (
                  /* Show KYC notice when account is not ready */
                  <View style={styles.kycNoticeContainer}>
                    <View style={styles.kycNoticeIconContainer}>
                      <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary.main} />
                    </View>
                    <Text style={styles.kycNoticeTitle}>
                      {kycStatus === 'approved' 
                        ? 'Account Setup in Progress' 
                        : kycStatus === 'in_review'
                        ? 'Verification in Review'
                        : 'Complete Verification to get an account'}
                    </Text>
                    <Text style={styles.kycNoticeText}>
                      {kycStatus === 'in_review'
                        ? 'Your verification is currently being reviewed. Once approved, your account information will appear here automatically.'
                        : !kycStatus || kycStatus === 'pending'
                        ? 'Complete your identity verification to receive your bank account details. Once approved, your account information will appear here automatically.'
                        : kycStatus === 'rejected'
                        ? 'Your verification was not approved. Please complete identity verification again to receive your account details.'
                        : kycStatus === 'approved'
                        ? 'Your account is being set up. This may take a few moments. Please check back shortly.'
                        : 'Complete your identity verification to receive your bank account details.'}
                    </Text>
                    {kycStatus !== 'approved' && kycStatus !== 'in_review' && (
                    <TouchableOpacity
                      style={styles.kycNoticeButton}
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        navigation.navigate('AccountVerification' as any)
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.kycNoticeButtonText}>Complete Verification</Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.text.inverse} />
                    </TouchableOpacity>
                    )}
                    {kycStatus === 'approved' && !accountReady && (
                      <>
                        <Text style={[styles.kycNoticeText, { marginTop: spacing[2], fontSize: 12 }]}>
                          Accounts are usually created automatically. If they don't appear within a few minutes, you can manually trigger creation.
                        </Text>
                      <TouchableOpacity
                          style={[styles.kycNoticeButton, creatingAccounts && styles.kycNoticeButtonDisabled, { marginTop: spacing[3] }]}
                        onPress={handleCreateAccounts}
                        disabled={creatingAccounts}
                        activeOpacity={0.7}
                      >
                        {creatingAccounts ? (
                          <>
                            <Text style={styles.kycNoticeButtonText}>Creating Accounts...</Text>
                            <Ionicons name="hourglass-outline" size={18} color={colors.text.inverse} />
                          </>
                        ) : (
                          <>
                              <Text style={styles.kycNoticeButtonText}>Create Accounts Manually</Text>
                              <Ionicons name="refresh-outline" size={18} color={colors.text.inverse} />
                          </>
                        )}
                      </TouchableOpacity>
                      </>
                    )}
                    {accountCreationError && (
                      <Text style={styles.errorText}>{accountCreationError}</Text>
                    )}
                  </View>
                ) : (
                  /* Show account details when ready */
                  <>
                    {/* Bank Account Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bank Account Details</Text>
                  
                      {/* Display all fields that Bridge provides */}
                      {bankAccountDetails && (
                        <>
                          {/* Account Holder Name - Bridge provides this */}
                          {bankAccountDetails.accountName && (
                            renderCopyableField('Account Name', bankAccountDetails.accountName, 'accountName')
                          )}
                          
                          {/* USD Account Fields - Bridge provides these for USD accounts */}
                          {currency === 'USD' && (
                            <>
                              {bankAccountDetails.accountNumber && (
                                renderCopyableField('Account Number', bankAccountDetails.accountNumber, 'accountNumber')
                              )}
                  {bankAccountDetails.routingNumber && (
                    renderCopyableField('Routing Number', bankAccountDetails.routingNumber, 'routingNumber')
                              )}
                            </>
                  )}
                  
                          {/* EUR Account Fields - Bridge provides these for EUR accounts */}
                          {currency === 'EUR' && (
                            <>
                  {bankAccountDetails.iban && (
                    renderCopyableField('IBAN', bankAccountDetails.iban, 'iban')
                  )}
                  {bankAccountDetails.swiftBic && (
                    renderCopyableField('SWIFT/BIC', bankAccountDetails.swiftBic, 'swiftBic')
                  )}
                            </>
                          )}
                          
                          {/* Bank Name - Bridge provides this */}
                          {bankAccountDetails.bankName && (
                            renderCopyableField('Bank Name', bankAccountDetails.bankName, 'bankName')
                          )}
                        </>
                      )}
                </View>

                    {/* Payment Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                  <Text style={styles.instructionsText}>
                    1. Share these bank account details with the sender{'\n'}
                    2. The sender should transfer {currency} to the account above{'\n'}
                    3. Include your name or reference in the transfer memo/note{'\n'}
                    4. Funds will be credited to your {getCurrencyName(currency)} wallet once received{'\n'}
                    5. Processing time: 1-3 business days
                  </Text>
                </View>
                  </>
                )}
              </>
            ) : (
              <>
                {!walletReady && !checkingKyc ? (
                  /* Show KYC notice when wallet is not ready */
                  <View style={styles.kycNoticeContainer}>
                    <View style={styles.kycNoticeIconContainer}>
                      <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary.main} />
                    </View>
                    <Text style={styles.kycNoticeTitle}>
                      {kycStatus === 'approved' 
                        ? 'Wallet Setup in Progress' 
                        : kycStatus === 'in_review'
                        ? 'Verification in Review'
                        : 'Complete Verification for wallet address'}
                    </Text>
                    <Text style={styles.kycNoticeText}>
                      {kycStatus === 'in_review'
                        ? 'Your verification is currently being reviewed. Once approved, your wallet information will appear here automatically.'
                        : !kycStatus || kycStatus === 'pending'
                        ? `Complete your identity verification to receive your wallet address. Once approved, your wallet information will appear here automatically.`
                        : kycStatus === 'rejected'
                        ? 'Your verification was not approved. Please complete identity verification again to receive your wallet address.'
                        : kycStatus === 'approved'
                        ? 'Your wallet is being set up. This may take a few moments. Please check back shortly.'
                        : 'Complete your identity verification to receive your wallet address.'}
                    </Text>
                    {kycStatus !== 'approved' && kycStatus !== 'in_review' && (
                    <TouchableOpacity
                      style={styles.kycNoticeButton}
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        navigation.navigate('AccountVerification' as any)
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.kycNoticeButtonText}>Complete Verification</Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.text.inverse} />
                    </TouchableOpacity>
                    )}
                    {kycStatus === 'approved' && !walletReady && (
                      <>
                        <Text style={[styles.kycNoticeText, { marginTop: spacing[2], fontSize: 12 }]}>
                          Wallets are usually created automatically. If it doesn't appear within a few minutes, you can manually trigger creation.
                        </Text>
                      <TouchableOpacity
                          style={[styles.kycNoticeButton, creatingAccounts && styles.kycNoticeButtonDisabled, { marginTop: spacing[3] }]}
                        onPress={handleCreateAccounts}
                        disabled={creatingAccounts}
                        activeOpacity={0.7}
                      >
                        {creatingAccounts ? (
                          <>
                            <Text style={styles.kycNoticeButtonText}>Creating Accounts...</Text>
                            <Ionicons name="hourglass-outline" size={18} color={colors.text.inverse} />
                          </>
                        ) : (
                          <>
                              <Text style={styles.kycNoticeButtonText}>Create Accounts Manually</Text>
                              <Ionicons name="refresh-outline" size={18} color={colors.text.inverse} />
                          </>
                        )}
                      </TouchableOpacity>
                      </>
                    )}
                    {accountCreationError && (
                      <Text style={styles.errorText}>{accountCreationError}</Text>
                    )}
                  </View>
                ) : (
                  /* Show wallet details when ready */
              <>
                {/* Stablecoin Address */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Stablecoin Address</Text>
                  
                  <View style={styles.stablecoinInfo}>
                    <Text style={styles.stablecoinLabel}>Network</Text>
                    <Text style={styles.stablecoinValue}>{stablecoinData.network}</Text>
                  </View>

                      {stablecoinData.address && (
                        renderCopyableField('Wallet Address', stablecoinData.address, 'walletAddress')
                      )}
                  
                  {stablecoinData.memo && (
                    <>
                      {renderCopyableField('Memo (Required)', stablecoinData.memo, 'memo')}
                      <View style={styles.memoWarningContainer}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning.main} />
                        <Text style={styles.memoWarning}>
                          Include this memo when sending to this address on {stablecoinData.network}
                        </Text>
                      </View>
                    </>
                  )}

                  <View style={styles.supportedStablecoinsContainer}>
                    <Text style={styles.supportedStablecoinsLabel}>Supported Stablecoins</Text>
                    <View style={styles.stablecoinChips}>
                      {stablecoinData.supportedStablecoins.map((coin) => (
                        <View key={coin} style={styles.stablecoinChip}>
                          <Text style={styles.stablecoinChipText}>{coin}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                    {/* QR Code */}
                    {walletAddress && (
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                          <QRCode
                            value={walletAddress}
                            size={200}
                            color={colors.text.primary}
                            backgroundColor={colors.background.primary}
                          />
                  </View>
                        <Text style={styles.qrHint}>Scan to send {stablecoinData.supportedStablecoins.join(' or ')}</Text>
                </View>
                    )}

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                  <Text style={styles.instructionsText}>
                    1. Share this wallet address with the sender{'\n'}
                    2. The sender should send one of the supported stablecoins to this address{'\n'}
                    3. {stablecoinData.memo && 'Include the memo when sending on Stellar\n4. '}Funds will be automatically converted to {currency} and credited to your wallet{'\n'}
                    {stablecoinData.memo ? '5' : '4'}. Processing time: Usually instant
                  </Text>
                </View>
                  </>
                )}
              </>
            )}
          </Animated.View>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...textStyles.headlineMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  currencyFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  currencyText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  tabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  tabText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Medium',
  },
  tabTextActive: {
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[3],
  },
  fieldContainer: {
    marginBottom: spacing[3],
  },
  fieldLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginBottom: spacing[1],
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  fieldValue: {
    flex: 1,
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
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
  stablecoinInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[3],
  },
  stablecoinLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  stablecoinValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  memoWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    padding: spacing[2],
    backgroundColor: colors.warning.background,
    borderRadius: borderRadius.md,
  },
  memoWarning: {
    ...textStyles.bodySmall,
    color: colors.warning.dark,
    fontFamily: 'Outfit-Regular',
    flex: 1,
  },
  supportedStablecoinsContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 0.5,
    borderTopColor: '#E2E2E2',
  },
  supportedStablecoinsLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginBottom: spacing[2],
  },
  stablecoinChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  stablecoinChip: {
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: colors.primary.main + '30',
  },
  stablecoinChipText: {
    ...textStyles.bodySmall,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  qrContainer: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing[3],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    ...shadows.sm,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
  },
  qrGradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrHint: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  kycNoticeContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[5],
    borderWidth: 1.5,
    borderColor: colors.primary.main + '30',
    alignItems: 'center',
    ...shadows.sm,
  },
  kycNoticeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  kycNoticeTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  kycNoticeText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  kycNoticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
    alignSelf: 'center',
    marginTop: spacing[2],
  },
  kycNoticeButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  kycNoticeButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error?.main || '#FF3B30',
    fontFamily: 'Outfit-Regular',
    marginTop: spacing[2],
    textAlign: 'center',
  },
})
