import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Image,
  Share,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { bridgeService } from '../../lib/bridgeService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import QRCode from 'react-native-qrcode-svg'

type TabType = 'bank' | 'stablecoin'

export default function ReceiveMoneyScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('bank')
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [virtualAccount, setVirtualAccount] = useState<any>(null)
  const [liquidationAddress, setLiquidationAddress] = useState<string | null>(null)
  const [liquidationMemo, setLiquidationMemo] = useState<string | null>(null)
  // Keep walletAddress for backward compatibility during migration
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletMemo, setWalletMemo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // Start as false, will be set to true only if we need to fetch
  const [creatingAccounts, setCreatingAccounts] = useState(false)
  const [accountCreationError, setAccountCreationError] = useState<string | null>(null)
  
  // Get currency from route params or default to USD (only USD/EUR supported)
  const currency = ((route.params as any)?.currency || 'USD') as 'USD' | 'EUR'
  
  // Determine if stablecoins are supported for this currency (always true for USD/EUR)
  const supportsStablecoins = currency === 'USD' || currency === 'EUR'
  
  // State to track if accounts exist in database (fallback when API times out)
  const [hasWalletInDb, setHasWalletInDb] = useState(false)
  const [hasAccountInDb, setHasAccountInDb] = useState(false)
  // Start as false - only set to true after we've checked for data
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)
  const [dataLoadedFromCache, setDataLoadedFromCache] = useState(false)
  
  // Get KYC status from userProfile (Bridge KYC status)
  // Map Bridge status values to our display logic
  const getKycStatus = (): string | null => {
    const bridgeStatus = userProfile?.bridge_kyc_status || userProfile?.profile?.bridge_kyc_status
    if (!bridgeStatus) return null
    
    // Map Bridge status to our display status
    switch (bridgeStatus) {
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      case 'under_review':
      case 'in_review':
        return 'in_review'
      case 'not_started':
      case 'incomplete':
      default:
        return null // Treat as pending/not started
    }
  }
  
  const kycStatus = getKycStatus()
  
  // Check if account data exists (from DB or API)
  const hasAccountData = virtualAccount?.hasAccount || hasAccountInDb || (virtualAccount && virtualAccount.accountNumber)
  
  // Check if account is ready (has account and KYC approved)
  // If account data exists, always show it (don't show "in progress")
  const accountReady = hasAccountData && kycStatus === 'approved'
  
  // Check if liquidation address data exists (preferred) or wallet data (fallback)
  const hasLiquidationData = liquidationAddress && liquidationAddress !== 'Loading...' && liquidationAddress !== 'Liquidation address not available'
  const hasWalletData = (walletAddress && 
    walletAddress !== 'Loading...' && 
    walletAddress !== 'Wallet address not available') || hasWalletInDb
  // Use liquidation address if available, otherwise fall back to wallet address
  const hasStablecoinData = hasLiquidationData || hasWalletData
  
  // Check if stablecoin address is ready (has liquidation address or wallet address and KYC approved)
  // If address data exists, always show it (don't show "in progress")
  const walletReady = hasStablecoinData && kycStatus === 'approved'
  
  // Ref to track if we've already triggered account creation
  const accountCreationTriggeredRef = useRef(false)
  // Ref to track if we've loaded data to prevent unnecessary refetches
  const dataLoadedRef = useRef(false)
  // Ref to track previous currency to detect actual changes
  const prevCurrencyRef = useRef<string | null>(null)
  // Ref to track if initial load is in progress (prevent multiple loads)
  const initialLoadInProgressRef = useRef(false)
  
  // Cache TTL (10 minutes - same as recipients)
  const CACHE_TTL = 10 * 60 * 1000
  
  // Helper to get cached data (use useCallback to ensure stable reference)
  const getCachedData = React.useCallback(async <T,>(key: string): Promise<{ data: T; timestamp: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(key)
      if (!cached) return null
      return JSON.parse(cached)
    } catch {
      return null
    }
  }, [])
  
  // Helper to set cached data (use useCallback to ensure stable reference)
  const setCachedData = React.useCallback(async <T,>(key: string, data: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.warn(`[ReceiveMoney] Error caching ${key}:`, error)
    }
  }, [])
  
  // Helper to check if data is stale (use useCallback to ensure stable reference)
  const isStale = React.useCallback((timestamp: number | undefined, ttl: number): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > ttl
  }, [])
  
  // Fetch virtual account and wallet data function (defined outside useEffect so it can be called from multiple places)
  const fetchAccountData = async (skipIfLoaded = false) => {
      // AGGRESSIVE GUARD: Always skip if data is already loaded (prevents all refetches)
      if (dataLoadedRef.current) {
        console.log('[ReceiveMoney] 🛑 BLOCKED fetchAccountData - data already loaded (dataLoadedRef=true)')
        return
      }
      
      // Also check if we have account data in state
      if (hasAccountData || virtualAccount?.hasAccount) {
        console.log('[ReceiveMoney] 🛑 BLOCKED fetchAccountData - account data exists in state')
        dataLoadedRef.current = true // Set ref to prevent future calls
        return
      }
      
      // Skip if initial load is in progress
      if (initialLoadInProgressRef.current) {
        console.log('[ReceiveMoney] 🛑 BLOCKED fetchAccountData - initial load in progress')
        return
      }
      
      console.log('[ReceiveMoney] ▶️ Starting fetchAccountData...')
      try {
        const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
        
        // Get user ID
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) {
          setLoading(false)
          return
        }
        
        // Check database FIRST (fast, no API call) - this prevents showing "in progress" if account exists
        // BUT skip if data is already loaded (loadInitialData already handled it)
        let accountFoundInDb = false
        if (dataLoadedRef.current && hasAccountData) {
          // Data already loaded, skip
          accountFoundInDb = true
        } else {
          try {
            const { data: userProfileData } = await supabase
              .from('users')
              .select('bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id, bridge_kyc_status')
              .eq('id', userId)
              .single()
            
            if (userProfileData) {
            
            // Check if wallet exists in database
            if (userProfileData.bridge_wallet_id) {
              setHasWalletInDb(true)
              // Try to get wallet address from database
              const { data: wallet } = await supabase
                .from('bridge_wallets')
                .select('address')
                .eq('bridge_wallet_id', userProfileData.bridge_wallet_id)
                .single()
              if (wallet?.address) {
                setWalletAddress(wallet.address)
              }
            }
            
            // Check if virtual account exists in database
            const accountId = currencyLower === 'usd' 
              ? userProfileData.bridge_usd_virtual_account_id 
              : userProfileData.bridge_eur_virtual_account_id
            if (accountId) {
              // Try to get account details from database
              const { data: account } = await supabase
                .from('bridge_virtual_accounts')
                .select('account_number, routing_number, iban, bic, bank_name, bank_address, account_holder_name')
                .eq('bridge_virtual_account_id', accountId)
                .single()
              if (account) {
                // Set account data immediately from database - this prevents "in progress" flash
                accountFoundInDb = true
                setHasAccountInDb(true)
                setVirtualAccount({ 
                  hasAccount: true,
                  currency: currencyLower,
                  accountNumber: account.account_number,
                  routingNumber: account.routing_number,
                  iban: account.iban,
                  bic: account.bic,
                  bankName: account.bank_name,
                  bankAddress: account.bank_address,
                  accountHolderName: account.account_holder_name,
                })
                // Set loading to false immediately if we have database data
                // This prevents showing "Account Setup in Progress" when account already exists
                setLoading(false)
                // Mark data as loaded to prevent unnecessary refetches
                dataLoadedRef.current = true
              } else {
                // Account ID exists but no account data found - might need to fetch from API
                console.log('Account ID exists but no account data in database, will fetch from API')
              }
            }
            }
            // Mark initial check as complete after database check
            setInitialCheckComplete(true)
          } catch (dbError) {
            console.error('Error checking database:', dbError)
            setInitialCheckComplete(true) // Still mark as complete even on error
          }
        }
        
        // Only fetch from API if we don't have complete data from database
        // This prevents unnecessary API calls and delays when data already exists
        if (!accountFoundInDb) {
          setLoading(true)
          
          // Fetch virtual account from API
          // The API will update the database with any missing fields from Bridge
          // and return the complete data
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
            
          console.log('[ReceiveMoney] Fetched virtual account from API:', JSON.stringify(account, null, 2))
          if (account && account.hasAccount) {
            // Only update if we don't already have data (prevent overwriting existing data)
            if (!dataLoadedRef.current || !hasAccountData) {
              // Update with API data - it has the most complete information
              setVirtualAccount(account)
              setHasAccountInDb(true)
              dataLoadedRef.current = true
            } else {
              // Data already loaded, skip API update
            }
          } else {
            console.log('[ReceiveMoney] API returned no account or hasAccount=false')
            // Only set to no account if we don't already have data
            if (!hasAccountData) {
              setVirtualAccount({ hasAccount: false, currency: currencyLower })
            }
          }
        } catch (accountError: any) {
          console.error('Error fetching virtual account from API:', accountError)
          // Keep database data if we have it, otherwise set to no account
          if (!hasAccountData) {
            setVirtualAccount({ hasAccount: false, currency: currencyLower })
          }
        }
        } else {
          // We have data from database, no need to fetch from API
          // Using cached data from database, skipping API call
        }

        // Fetch liquidation address (preferred) or wallet address (fallback) from API
        // BUT skip if we already have wallet/liquidation data loaded
        if (hasStablecoinData || liquidationAddress || (walletAddress && hasWalletInDb)) {
          // Wallet/liquidation address data already loaded, skip
        } else {
          const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
          const stablecoinCurrency = currencyLower === 'usd' ? 'usdc' : 'eurc'
          
          // Try to fetch liquidation address first
          if (!liquidationAddress) {
            try {
              const liquidationAddr = await bridgeService.getLiquidationAddress(stablecoinCurrency, 'solana')
              if (liquidationAddr.hasAddress && liquidationAddr.address) {
                setLiquidationAddress(liquidationAddr.address)
                if (liquidationAddr.memo) {
                  setLiquidationMemo(liquidationAddr.memo)
                }
                dataLoadedRef.current = true
              } else {
                // Liquidation address doesn't exist, try to create it
                console.log('[ReceiveMoney] Liquidation address not found, attempting to create...')
                try {
                  const created = await bridgeService.createLiquidationAddress(stablecoinCurrency, 'solana')
                  if (created.hasAddress && created.address) {
                    setLiquidationAddress(created.address)
                    if (created.memo) {
                      setLiquidationMemo(created.memo)
                    }
                    dataLoadedRef.current = true
                  }
                } catch (createError) {
                  console.error('Error creating liquidation address:', createError)
                  // Fall back to wallet address if liquidation address creation fails
                }
              }
            } catch (liquidationError) {
              console.error('Error fetching liquidation address:', liquidationError)
              // Fall back to wallet address
            }
          }
          
          // Fallback: Fetch wallet address from API only if liquidation address is not available
          if (!liquidationAddress && !walletAddress && !hasWalletInDb) {
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
                dataLoadedRef.current = true
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
        } // Close the else block for wallet/liquidation fetching
      } catch (error) {
        console.error('Error fetching account data:', error)
      } finally {
        setLoading(false)
      }
    }
  
  // Load initial data from database immediately (synchronous-like, no API calls)
  useEffect(() => {
    // Skip if data is already loaded (prevents refetching on every focus/remount)
    if (dataLoadedRef.current) {
      console.log('[ReceiveMoney] ⏭️ Data already loaded, skipping loadInitialData completely')
      setInitialCheckComplete(true) // Ensure this is set so UI doesn't show "in progress"
      setDataLoadedFromCache(true) // Mark as loaded so UI shows immediately
      return
    }
    
    // Prevent multiple simultaneous loads
    if (initialLoadInProgressRef.current) {
      console.log('[ReceiveMoney] ⏸️ Initial load already in progress, skipping...')
      return
    }
    
    // Don't set initialCheckComplete yet - wait until we've checked for data

    const loadInitialData = async (force: boolean = false): Promise<boolean> => {
      // Define cache helpers inside this function to ensure they're in scope
      const getCachedDataLocal = async <T,>(key: string): Promise<{ data: T; timestamp: number } | null> => {
        try {
          const cached = await AsyncStorage.getItem(key)
          if (!cached) return null
          return JSON.parse(cached)
        } catch {
          return null
        }
      }
      
      const setCachedDataLocal = async <T,>(key: string, data: T): Promise<void> => {
        try {
          await AsyncStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now(),
          }))
        } catch (error) {
          console.warn(`[ReceiveMoney] Error caching ${key}:`, error)
        }
      }
      
      const isStaleLocal = (timestamp: number | undefined, ttl: number): boolean => {
        if (!timestamp) return true
        return Date.now() - timestamp > ttl
      }
      initialLoadInProgressRef.current = true
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) {
          setInitialCheckComplete(true)
          initialLoadInProgressRef.current = false
          return false
        }

        const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
        const CACHE_KEY_ACCOUNT = `easner_virtual_account_${userId}_${currencyLower}`
        const CACHE_KEY_WALLET = `easner_wallet_${userId}_${currencyLower}`
        let foundAccountData = false
        
        // Try to load from cache first (stale-while-revalidate pattern)
        if (!force) {
          const cachedAccount = await getCachedDataLocal<any>(CACHE_KEY_ACCOUNT)
          if (cachedAccount && !isStaleLocal(cachedAccount.timestamp, CACHE_TTL)) {
            // Cache is fresh - use it immediately
            foundAccountData = true
            setHasAccountInDb(true)
            setVirtualAccount(cachedAccount.data)
            setDataLoadedFromCache(true)
            setInitialCheckComplete(true)
            dataLoadedRef.current = true
          } else if (cachedAccount) {
            // Cache is stale - show it immediately, then refresh in background
            foundAccountData = true
            setHasAccountInDb(true)
            setVirtualAccount(cachedAccount.data)
            setDataLoadedFromCache(true)
            setInitialCheckComplete(true)
            dataLoadedRef.current = true
          }
          
          const cachedWallet = await getCachedDataLocal<any>(CACHE_KEY_WALLET)
          if (cachedWallet && !isStaleLocal(cachedWallet.timestamp, CACHE_TTL)) {
            // Cache is fresh - use it immediately
            if (cachedWallet.data.liquidationAddress) {
              setLiquidationAddress(cachedWallet.data.liquidationAddress)
              setLiquidationMemo(cachedWallet.data.liquidationMemo)
            } else if (cachedWallet.data.walletAddress) {
              setWalletAddress(cachedWallet.data.walletAddress)
              setHasWalletInDb(true)
            }
            dataLoadedRef.current = true
          } else if (cachedWallet) {
            // Cache is stale - show it immediately, then refresh in background
            if (cachedWallet.data.liquidationAddress) {
              setLiquidationAddress(cachedWallet.data.liquidationAddress)
              setLiquidationMemo(cachedWallet.data.liquidationMemo)
            } else if (cachedWallet.data.walletAddress) {
              setWalletAddress(cachedWallet.data.walletAddress)
              setHasWalletInDb(true)
            }
          }
          
          // If we have fresh cache, return early (no need to fetch from DB)
          if (cachedAccount && !isStaleLocal(cachedAccount.timestamp, CACHE_TTL)) {
            initialLoadInProgressRef.current = false
            return foundAccountData
          }
        }
        
        // Load account data from database (either no cache or force refresh)
        const { data: userProfileData } = await supabase
          .from('users')
          .select('bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id')
          .eq('id', userId)
          .single()

        if (userProfileData) {
          // Load virtual account from database
          const accountId = currencyLower === 'usd' 
            ? userProfileData.bridge_usd_virtual_account_id 
            : userProfileData.bridge_eur_virtual_account_id
          
          if (accountId) {
            const { data: account } = await supabase
              .from('bridge_virtual_accounts')
              .select('account_number, routing_number, iban, bic, bank_name, bank_address, account_holder_name')
              .eq('bridge_virtual_account_id', accountId)
              .single()
            
            if (account) {
              // Set all state immediately - React batches these updates automatically
              const accountData = {
                hasAccount: true,
                currency: currencyLower,
                accountNumber: account.account_number,
                routingNumber: account.routing_number,
                iban: account.iban,
                bic: account.bic,
                bankName: account.bank_name,
                bankAddress: account.bank_address,
                accountHolderName: account.account_holder_name,
              }
              foundAccountData = true
              setHasAccountInDb(true)
              setVirtualAccount(accountData)
              setDataLoadedFromCache(true)
              setInitialCheckComplete(true)
              dataLoadedRef.current = true
              // Cache the account data
              await setCachedDataLocal(CACHE_KEY_ACCOUNT, accountData)
            } else {
              // No account data found
              setInitialCheckComplete(true)
            }
          } else {
            // No account ID
            setInitialCheckComplete(true)
          }

          // Load liquidation address from database (preferred) or wallet address (fallback)
          if (userProfileData.bridge_wallet_id) {
            const stablecoinCurrency = currencyLower === 'usd' ? 'usdc' : 'eurc'
            
            // Load wallet with liquidation address fields
            const { data: wallet } = await supabase
              .from('bridge_wallets')
              .select('address, usdc_liquidation_address, usdc_liquidation_memo, eurc_liquidation_address, eurc_liquidation_memo')
              .eq('bridge_wallet_id', userProfileData.bridge_wallet_id)
              .single()
            
            if (wallet) {
              // Try liquidation address first (preferred)
              const liquidationAddr = stablecoinCurrency === 'usdc' 
                ? wallet.usdc_liquidation_address 
                : wallet.eurc_liquidation_address
              const liquidationMemo = stablecoinCurrency === 'usdc'
                ? wallet.usdc_liquidation_memo
                : wallet.eurc_liquidation_memo
              
              if (liquidationAddr) {
                setLiquidationAddress(liquidationAddr)
                setLiquidationMemo(liquidationMemo)
                dataLoadedRef.current = true
                // Cache the wallet data
                await setCachedDataLocal(CACHE_KEY_WALLET, {
                  liquidationAddress: liquidationAddr,
                  liquidationMemo: liquidationMemo,
                })
              } else if (wallet.address) {
                // Fallback to wallet address if liquidation address not found
                setWalletAddress(wallet.address)
                setHasWalletInDb(true)
                // Cache the wallet data
                await setCachedDataLocal(CACHE_KEY_WALLET, {
                  walletAddress: wallet.address,
                })
              }
            }
          }
        } else {
          // No user profile data
          setInitialCheckComplete(true)
        }
        
        return foundAccountData
      } catch (error) {
        console.error('Error loading initial data:', error)
        setInitialCheckComplete(true) // Mark as complete even on error
        return false
      } finally {
        initialLoadInProgressRef.current = false
      }
    }

    // Only reset and reload if currency actually changed
    if (prevCurrencyRef.current !== currency) {
      const wasCurrencyChange = prevCurrencyRef.current !== null
      prevCurrencyRef.current = currency
      // Only reset dataLoadedRef if currency actually changed (not on initial mount)
      if (wasCurrencyChange) {
        dataLoadedRef.current = false
        initialLoadInProgressRef.current = false
      }
      
      // Reset state when currency changes to prevent showing wrong data
      if (wasCurrencyChange) {
        setVirtualAccount(null)
        setHasAccountInDb(false)
      }
      
      // Only load if we don't already have data loaded for this currency
      if (!dataLoadedRef.current) {
        loadInitialData(false).then((foundData) => {
        // Only fetch from API if we didn't find data in database
        if (!foundData) {
          console.log('[ReceiveMoney] No data found in database, fetching from API...')
          // Small delay to ensure state is set before fetching
          setTimeout(() => {
            // Double-check we still don't have data before fetching
            if (!dataLoadedRef.current && !hasAccountData) {
              fetchAccountData(false)
            } else {
              console.log('[ReceiveMoney] ⏭️ Data appeared after initial load, skipping API fetch')
            }
          }, 50)
        } else {
          // Data loaded from database, skipping API fetch
        }
        })
      } else {
        console.log('[ReceiveMoney] ⏭️ Data already loaded for this currency, skipping loadInitialData')
      }
    }
  }, [currency])
  
  // Automatically create accounts when KYC is approved but accounts don't exist
  useEffect(() => {
    const autoCreateAccounts = async () => {
      // Only trigger if KYC is approved
      if (kycStatus !== 'approved') {
        accountCreationTriggeredRef.current = false
        return
      }
      
      // Check if accounts already exist
      if (accountReady || walletReady) {
        accountCreationTriggeredRef.current = false
        return
      }
      
      // Prevent multiple triggers
      if (accountCreationTriggeredRef.current) return
      
      // Check database to see if accounts exist
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        
        const { data: userProfileData } = await supabase
          .from('users')
          .select('bridge_wallet_id, bridge_usd_virtual_account_id, bridge_eur_virtual_account_id, bridge_kyc_status')
          .eq('id', session.user.id)
          .single()
        
        if (userProfileData) {
          const currencyLower = currency.toLowerCase() as 'usd' | 'eur'
          const accountId = currencyLower === 'usd' 
            ? userProfileData.bridge_usd_virtual_account_id 
            : userProfileData.bridge_eur_virtual_account_id
          
          // If accounts don't exist, trigger sync-status which will create them
          if (!userProfileData.bridge_wallet_id || !accountId) {
            accountCreationTriggeredRef.current = true
            console.log('[RECEIVE-MONEY] KYC approved but accounts missing, triggering sync-status to create accounts...')
            try {
              const syncResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/sync-status`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              })
              
              if (syncResponse.ok) {
                console.log('[RECEIVE-MONEY] ✅ Sync-status completed, accounts should be created')
                // Reset refs to allow fetching new data after account creation
                dataLoadedRef.current = false
                initialLoadInProgressRef.current = false
                // Refresh account data after a short delay to allow account creation
                setTimeout(() => {
                  if (!dataLoadedRef.current) {
                    fetchAccountData(false)
                  }
                }, 3000)
              }
            } catch (syncError) {
              console.error('[RECEIVE-MONEY] Error triggering sync-status:', syncError)
              accountCreationTriggeredRef.current = false // Allow retry on error
            }
          }
        }
      } catch (error) {
        console.error('[RECEIVE-MONEY] Error checking accounts for auto-creation:', error)
        accountCreationTriggeredRef.current = false // Allow retry on error
      }
    }
    
    // Only run when KYC status changes to approved
    autoCreateAccounts()
  }, [kycStatus, currency, accountReady, walletReady])
  
  // Refresh data when screen comes into focus (only if data hasn't been loaded yet)
  useFocusEffect(
    React.useCallback(() => {
      // Skip refresh completely if data has already been loaded
      // This prevents unnecessary database queries when navigating back to the screen
      if (dataLoadedRef.current) {
        console.log('[ReceiveMoney] Data already loaded, skipping focus refresh completely')
        return
      }
      
      // Data not loaded yet - the currency useEffect will handle loading it
      // Don't do anything here to avoid duplicate fetches
    }, [])
  )
  
  // Set default tab based on currency support
  useEffect(() => {
    if (!supportsStablecoins) {
      setActiveTab('bank')
    }
  }, [supportsStablecoins])

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

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      if (activeTab === 'bank' && bankAccountDetails) {
        // Format bank account details for sharing
        const currencyName = currency === 'USD' ? 'US' : 'EUR'
        let shareText = `Your ${currencyName} Bank Account Details\n\n`
        
        if (bankAccountDetails.accountName) {
          shareText += `Account Name: ${bankAccountDetails.accountName}\n`
        }
        
        if (currency === 'USD') {
          if (bankAccountDetails.accountNumber) {
            shareText += `Account Number: ${bankAccountDetails.accountNumber}\n`
          }
          if (bankAccountDetails.routingNumber) {
            shareText += `Routing Number: ${bankAccountDetails.routingNumber}\n`
          }
        } else {
          if (bankAccountDetails.iban) {
            shareText += `IBAN: ${bankAccountDetails.iban}\n`
          }
          if (bankAccountDetails.swiftBic) {
            shareText += `SWIFT/BIC: ${bankAccountDetails.swiftBic}\n`
          }
        }
        
        if (bankAccountDetails.bankName) {
          shareText += `Bank Name: ${bankAccountDetails.bankName}\n`
        }
        if (bankAccountDetails.bankAddress) {
          shareText += `Bank Address: ${bankAccountDetails.bankAddress}\n`
        }
        
        await Share.share({
          message: shareText,
          title: `${currencyName} Bank Account Details`,
        })
      } else if (activeTab === 'stablecoin' && stablecoinData.address) {
        // Format stablecoin details for sharing
        const stablecoinName = currency.toLowerCase() === 'usd' ? 'USDC' : 'EURC'
        const networkTicker = stablecoinData.network === 'Solana' ? 'SOL' : stablecoinData.network.toUpperCase()
        const networkName = stablecoinData.network
        let shareText = `Your Stablecoin ${stablecoinName} Details\n\n`
        
        shareText += `Network: ${networkTicker} • ${networkName}\n`
        shareText += `Address: ${stablecoinData.address}\n`
        
        if (stablecoinData.memo) {
          shareText += `Memo (Required): ${stablecoinData.memo}\n`
        }
        
        await Share.share({
          message: shareText,
          title: `${stablecoinName} Details`,
        })
      }
    } catch (error: any) {
      // User cancelled or error occurred - silently fail
      if (error.message !== 'User did not share') {
        console.error('Error sharing:', error)
      }
    }
  }

  // Get bank account details from Bridge virtual account (memoized to prevent unnecessary recalculations)
  const bankAccountDetails = useMemo(() => {
    // Account exists, return real data from Bridge
    // Show data if we have it, regardless of KYC status (KYC status only affects "in progress" message)
    // Check virtualAccount directly - if it exists and has data, return it
    if (virtualAccount && (virtualAccount.hasAccount || virtualAccount.accountNumber || virtualAccount.iban || hasAccountInDb)) {
      // Map all fields that Bridge provides
      if (currency === 'USD') {
        const details = {
          accountName: virtualAccount.accountHolderName, // bank_beneficiary_name from Bridge
          accountNumber: virtualAccount.accountNumber,
          routingNumber: virtualAccount.routingNumber, // Bridge provides this for USD
          iban: undefined, // Not for USD
          swiftBic: undefined, // Not for USD
          bankName: virtualAccount.bankName,
          bankAddress: virtualAccount.bankAddress,
        }
        // Only log once when data is first loaded (not on every render)
        if (dataLoadedFromCache || initialCheckComplete) {
          // Log removed to prevent spam - data is already validated
        }
        return details
      } else {
        // EUR account
        return {
          accountName: virtualAccount.accountHolderName,
          accountNumber: undefined, // Not for EUR
          routingNumber: undefined, // Not for EUR
          iban: virtualAccount.iban, // Bridge provides this for EUR
          swiftBic: virtualAccount.bic, // Bridge returns 'bic' for EUR accounts
          bankName: virtualAccount.bankName,
          bankAddress: undefined, // Not for EUR
        }
      }
    }
    
    // Account not ready or virtualAccount is null - return empty
    return null
  }, [virtualAccount, currency, hasAccountInDb, dataLoadedFromCache, initialCheckComplete])

  // Get stablecoin address (prefer liquidation address, fallback to wallet address)
  const getStablecoinAddress = () => {
    // Use liquidation address if available, otherwise fall back to wallet address
    const address = liquidationAddress || walletAddress || ''
    const memo = liquidationMemo || walletMemo || undefined
    
    return {
      address: walletReady ? address : '',
      network: 'Solana',
      supportedStablecoins: currency === 'USD' 
        ? ['USDC'] 
        : ['EURC'],
      memo,
      isLiquidationAddress: !!liquidationAddress, // Track if this is a liquidation address
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
              // Only fetch if data is not already loaded
              if (!dataLoadedRef.current) {
                fetchAccountData(false)
              } else {
                // Data already loaded, skip
              }
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
        <View style={styles.header}>
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
        </View>

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
                {currency === 'USD' ? 'US Bank Account' : 'EU Bank Account'}
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
                Stablecoin
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
          <View style={styles.content}>
            {activeTab === 'bank' ? (
              <>
                {/* Show account details immediately if we have data */}
                {hasAccountData && bankAccountDetails ? (
                  /* Show account details when we have account data */
                  <>
                    {/* Bank Account Details */}
                    <View style={styles.section}>
                      {/* Display all fields that Bridge provides */}
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
                        
                        {/* Bank Address - Bridge provides this for USD */}
                        {currency === 'USD' && bankAccountDetails.bankAddress && (
                          renderCopyableField('Bank Address', bankAccountDetails.bankAddress, 'bankAddress')
                        )}
                      </>
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={handleShare}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="share-outline" size={20} color={colors.primary.main} />
                      <Text style={styles.shareButtonText}>Share Account Details</Text>
                    </TouchableOpacity>

                    {/* Payment Instructions */}
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                      {currency === 'USD' ? (
                        <Text style={styles.instructionsText}>
                          • Only send ACH or domestic US Wire{'\n'}
                          • SWIFT is NOT supported{'\n'}
                          • Receive USD from your own bank app or any business{'\n'}
                          • Non-US residents: P2P payments must be under $4,000{'\n'}
                          • Unlimited transactions for US residents{'\n'}
                          • Processing time: within 12 - 48 hours
                        </Text>
                      ) : (
                        <Text style={styles.instructionsText}>
                          1. Share these bank account details with the sender{'\n'}
                          2. The sender should transfer {currency} to the account above{'\n'}
                          3. Include your name or reference in the transfer memo/note{'\n'}
                          4. Funds will be credited to your {getCurrencyName(currency)} wallet once received{'\n'}
                          5. Processing time: 1-3 business days
                        </Text>
                      )}
                    </View>
                  </>
                ) : initialCheckComplete ? (
                  /* Show KYC notice only when:
                     - We've completed initial check AND
                     - No account data exists
                  */
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
                        : !kycStatus
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
                    {accountCreationError && (
                      <Text style={styles.errorText}>{accountCreationError}</Text>
                    )}
                  </View>
                ) : null}
              </>
            ) : (
              <>
                {/* Show wallet details immediately if we have data */}
                {hasStablecoinData && stablecoinData.address ? (
                  /* Show wallet details when we have wallet data */
                  <>
                    {/* Stablecoin Details */}
                    <View style={styles.section}>
                      {/* QR Code - First */}
                      {stablecoinData.address && (
                        <View style={styles.qrSection}>
                          <View style={styles.qrContainer}>
                            <QRCode
                              value={stablecoinData.address}
                              size={200}
                              color={colors.text.primary}
                              backgroundColor={colors.background.primary}
                            />
                          </View>
                          <Text style={styles.qrHint}>Scan to send {stablecoinData.supportedStablecoins.join(' or ')}</Text>
                        </View>
                      )}

                      {/* Network field - formatted as ticker (left) and full name (right end) */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Network</Text>
                        <View style={styles.fieldValueContainer}>
                          <View style={styles.networkValueContainer}>
                            <Text style={styles.networkTicker}>SOL</Text>
                            <View style={styles.networkNameContainer}>
                              <Text style={styles.networkName}>Solana</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Address */}
                      {stablecoinData.address && (
                        renderCopyableField(
                          stablecoinData.isLiquidationAddress 
                            ? (currency.toLowerCase() === 'usd' ? 'USDC Address' : 'EURC Address')
                            : 'Wallet Address',
                          stablecoinData.address,
                          'liquidationAddress'
                        )
                      )}
                      
                      {/* Memo */}
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
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={handleShare}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="share-outline" size={20} color={colors.primary.main} />
                      <Text style={styles.shareButtonText}>
                        Share {currency.toLowerCase() === 'usd' ? 'USDC' : 'EURC'} Details
                      </Text>
                    </TouchableOpacity>

                    {/* Instructions */}
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                      {currency.toLowerCase() === 'usd' ? (
                        <Text style={styles.instructionsText}>
                          • Only send USDC on Solana to this address{'\n'}
                          • Sending unsupported assets will be lost{'\n'}
                          • Ensure amount is above 1 USDC{'\n'}
                          • Processing time: within seconds
                        </Text>
                      ) : (
                        <Text style={styles.instructionsText}>
                          • Only send EURC on Solana to this address{'\n'}
                          • Sending unsupported assets will be lost{'\n'}
                          • Ensure amount is above 1 EURC{'\n'}
                          • Processing time: within seconds
                        </Text>
                      )}
                    </View>
                  </>
                ) : initialCheckComplete ? (
                  /* Show KYC notice only when:
                     - We've completed initial check AND
                     - No stablecoin address data exists
                  */
                  <View style={styles.kycNoticeContainer}>
                    <View style={styles.kycNoticeIconContainer}>
                      <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary.main} />
                    </View>
                    <Text style={styles.kycNoticeTitle}>
                      {kycStatus === 'approved' 
                        ? `${currency.toUpperCase()} Address Setup in Progress` 
                        : kycStatus === 'in_review'
                        ? 'Verification in Review'
                        : `Complete Verification for ${currency.toLowerCase() === 'usd' ? 'USDC' : 'EURC'} address`}
                    </Text>
                    <Text style={styles.kycNoticeText}>
                      {kycStatus === 'in_review'
                        ? 'Your verification is currently being reviewed. Once approved, your wallet information will appear here automatically.'
                        : !kycStatus
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
                    {kycStatus === 'approved' && !hasStablecoinData && (
                      <Text style={[styles.kycNoticeText, { marginTop: spacing[2], fontSize: 12 }]}>
                        Your {currency.toLowerCase() === 'usd' ? 'USDC' : 'EURC'} address is being created automatically. Please wait a moment and refresh the screen.
                      </Text>
                    )}
                    {accountCreationError && (
                      <Text style={styles.errorText}>{accountCreationError}</Text>
                    )}
                  </View>
                ) : null}
              </>
            )}
          </View>
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  shareButtonText: {
    ...textStyles.bodyMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
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
  networkValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  networkTicker: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    fontVariant: ['tabular-nums'],
  },
  networkNameContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  networkName: {
    ...textStyles.bodyLarge,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
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
