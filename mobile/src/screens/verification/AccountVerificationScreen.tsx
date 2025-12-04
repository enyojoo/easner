import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useFocusEffect } from '@react-navigation/native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import { bridgeService } from '../../lib/bridgeService'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

function AccountVerificationContent({ navigation }: NavigationProps) {
  const { userProfile, refreshUserProfile } = useAuth()
  const insets = useSafeAreaInsets()
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  
  // TOS state
  const [tosLink, setTosLink] = useState<string | null>(null)
  const [tosLinkId, setTosLinkId] = useState<string | null>(null)
  const [tosSigned, setTosSigned] = useState(false)
  const [tosSignedAgreementId, setTosSignedAgreementId] = useState<string | null>(null)
  const [showTosModal, setShowTosModal] = useState(false)
  const [loadingTos, setLoadingTos] = useState(false)
  const [checkingTosStatus, setCheckingTosStatus] = useState(false)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)
  
  // Ref to track if we've already processed TOS acceptance via postMessage
  const tosProcessedRef = useRef(false)
  // Ref to prevent duplicate loadTOSStatus calls
  const loadingTosStatusRef = useRef(false)

  // KYC Link state
  const [kycLink, setKycLink] = useState<string | null>(null)
  const [kycTosLink, setKycTosLink] = useState<string | null>(null)
  const [kycLinkId, setKycLinkId] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [tosStatus, setTosStatus] = useState<string | null>(null)
  const [showKycModal, setShowKycModal] = useState(false)
  const [loadingKyc, setLoadingKyc] = useState(false)
  const [currentKycFlow, setCurrentKycFlow] = useState<'kyc' | 'tos'>('kyc')
  const [kycCompleted, setKycCompleted] = useState(false)
  const [tosCompleted, setTosCompleted] = useState(false)
  const kycProcessedRef = useRef(false)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading, headerAnim, contentAnim])

  // Refresh user profile when screen comes into focus
  // This ensures we get the latest status from database (updated by webhooks)
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ACCOUNT-VERIFICATION] Screen focused, refreshing user profile')
      if (refreshUserProfile && userProfile?.id) {
        refreshUserProfile()
      }
    }, [userProfile?.id]) // Only depend on userProfile.id, not refreshUserProfile function
  )

  // Fetch Bridge customer status on mount and when userProfile changes
  // This ensures we always have the latest status from Bridge
  useEffect(() => {
    const fetchBridgeStatus = async () => {
      if (!userProfile?.id) return
      
      // If we have a customer_id, fetch latest status from Bridge
      // Note: We rely on webhooks to update bridge_kyc_status in the database
      // This effect only syncs if there's a mismatch (should be rare)
      if (userProfile?.bridge_customer_id) {
        try {
          console.log('[BRIDGE-STATUS] Fetching latest Bridge customer status for:', userProfile.bridge_customer_id)
          const customerStatus = await bridgeService.getCustomerStatus()
          
          if (customerStatus && customerStatus.kycStatus) {
            // Only update if status is different (to avoid unnecessary updates)
            if (customerStatus.kycStatus !== userProfile?.bridge_kyc_status) {
              // Update user profile with latest status from Bridge
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  bridge_kyc_status: customerStatus.kycStatus,
                  bridge_kyc_rejection_reasons: customerStatus.rejectionReasons,
                  bridge_endorsements: customerStatus.endorsements,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userProfile.id)
              
              if (updateError) {
                console.error('[BRIDGE-STATUS] Error updating status:', updateError)
              } else {
                console.log('[BRIDGE-STATUS] Updated Bridge KYC status from Bridge API:', customerStatus.kycStatus)
                
                // Refresh user profile to get updated status
                if (refreshUserProfile) {
                  await refreshUserProfile()
                }
              }
            } else {
              console.log('[BRIDGE-STATUS] Status unchanged, no update needed')
            }
          }
        } catch (error: any) {
          console.warn('[BRIDGE-STATUS] Could not fetch Bridge customer status:', error.message)
          // Don't block the UI, just log the warning
          // Status from database will be used instead
        }
      }
    }
    
    fetchBridgeStatus()
  }, [userProfile?.bridge_customer_id, userProfile?.id]) // Removed refreshUserProfile from deps to prevent loops

  useEffect(() => {
    if (!userProfile?.id) return

    const loadSubmissions = async () => {
      try {
        // Check cache first
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        
        if (cached) {
          const { value, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minute cache
            setSubmissions(value || [])
            setLoading(false)
            // Fetch in background
            fetchSubmissions()
            return
          }
        }

        await fetchSubmissions()
      } catch (error) {
        console.error('Error loading submissions:', error)
        setLoading(false)
      }
    }

    const fetchSubmissions = async () => {
      try {
        const data = await kycService.getByUserId(userProfile.id)
        setSubmissions(data || [])
        
        // Update cache
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value: data || [],
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [userProfile?.id])

  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")

  // Check if Bridge KYC is approved
  const bridgeKycApproved = userProfile?.bridge_kyc_status === 'approved'
  const bridgeKycInReview = userProfile?.bridge_kyc_status === 'under_review'
  const bridgeKycRejected = userProfile?.bridge_kyc_status === 'rejected'
  
  // If Bridge KYC is approved, use Bridge data (submissions synced from Bridge)
  // Otherwise, use traditional submissions
  const bothCompleted = bridgeKycApproved || (
    identitySubmission?.status === "approved" && 
    addressSubmission?.status === "approved"
  )
  
  // TOS should appear when Bridge KYC is approved OR both traditional submissions are submitted
  const bothSubmitted = bridgeKycApproved || (
    identitySubmission && 
    addressSubmission &&
    identitySubmission.status && 
    addressSubmission.status &&
    identitySubmission.status !== 'rejected' &&
    addressSubmission.status !== 'rejected'
  )
  
  // Check if submissions are from Bridge (have metadata.source === 'bridge_kyc_widget')
  const identityFromBridge = identitySubmission?.metadata?.source === 'bridge_kyc_widget'
  const addressFromBridge = addressSubmission?.metadata?.source === 'bridge_kyc_widget'

  // Load TOS status only if bridge_signed_agreement_id is empty
  // Database is source of truth - if bridge_signed_agreement_id exists, TOS is signed
  useEffect(() => {
    if (!bothSubmitted || !userProfile?.email || !userProfile?.id) return

    // Prevent duplicate calls
    if (loadingTosStatusRef.current) {
      return
    }

    // Check if TOS is already signed in database (source of truth)
    const bridgeSignedAgreementId = userProfile?.bridge_signed_agreement_id || userProfile?.profile?.bridge_signed_agreement_id
    
    if (bridgeSignedAgreementId) {
      // TOS is already signed - set state and don't fetch
      console.log('[TOS-LOAD] TOS already signed (from userProfile), skipping fetch')
      setTosSigned(true)
      setTosSignedAgreementId(bridgeSignedAgreementId)
      // Update cache to match
      const linkId = userProfile?.bridge_customer_id ? `customer-${userProfile.bridge_customer_id}` : null
      updateTosStatusInCache(true, bridgeSignedAgreementId, linkId)
      return
    }

    // Only load TOS status if bridge_signed_agreement_id is empty
    loadTOSStatus()
  }, [bothSubmitted, userProfile?.email, userProfile?.id, userProfile?.bridge_signed_agreement_id])

  const updateTosStatusInCache = async (signed: boolean, agreementId: string | null = null, linkId: string | null = null) => {
    if (!userProfile?.id) return
    
    try {
      const CACHE_KEY = `easner_tos_status_${userProfile.id}`
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        tosSigned: signed,
        tosSignedAgreementId: agreementId,
        tosLinkId: linkId || tosLinkId,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error updating TOS cache:', error)
    }
  }

  const loadTOSStatus = async () => {
    if (!userProfile?.email || !userProfile?.id) return
    
    // Prevent duplicate calls
    if (loadingTosStatusRef.current) {
      return
    }
    
    loadingTosStatusRef.current = true
    
    try {
      // First, check cache for immediate UI update (like identity/address verification)
      const CACHE_KEY = `easner_tos_status_${userProfile.id}`
      const cached = await AsyncStorage.getItem(CACHE_KEY)
      let cachedData: any = null
      let useCache = false
      
      if (cached) {
        try {
          cachedData = JSON.parse(cached)
          const { tosSigned: cachedTosSigned, tosSignedAgreementId: cachedAgreementId, tosLinkId: cachedTosLinkId, timestamp } = cachedData
          const cacheAge = Date.now() - timestamp
          
          if (cacheAge < 5 * 60 * 1000) { // 5 minute cache
            // Show cached value immediately for instant UI
            setTosSigned(cachedTosSigned)
            if (cachedAgreementId) {
              setTosSignedAgreementId(cachedAgreementId)
            }
            if (cachedTosLinkId) {
              setTosLinkId(cachedTosLinkId)
            }
            
            // If cache is fresh and TOS is signed, use cache and fetch in background silently
            if (cachedTosSigned) {
              useCache = true
              // Fetch fresh data in background (silently, no logs)
              fetchTOSStatusFromDatabase(true)
              loadingTosStatusRef.current = false
              return
            }
            // If TOS is not signed, continue to check database for updates
          } else {
            // Cache expired, clear it
            await AsyncStorage.removeItem(CACHE_KEY)
          }
        } catch (e) {
          console.warn('[TOS-LOAD] Error parsing cache, clearing...', e)
          await AsyncStorage.removeItem(CACHE_KEY)
        }
      }
      
      // Cache is expired or TOS is not signed - fetch from database
      await fetchTOSStatusFromDatabase(false)
    } catch (error: any) {
      console.error('[TOS-LOAD] Error loading TOS status:', error)
      setTosSigned(false)
    } finally {
      loadingTosStatusRef.current = false
    }
  }

  const fetchTOSStatusFromDatabase = async (silent: boolean = false) => {
    if (!userProfile?.id) return
    
    try {
      // Check database for persistent TOS status (source of truth)
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('bridge_customer_id, bridge_signed_agreement_id')
        .eq('id', userProfile.id)
        .single()
      
      if (dbError) {
        if (!silent) {
          console.error('[TOS-LOAD] Error fetching from database:', dbError)
        }
        return
      }
      
      // If we have signed_agreement_id in database, TOS is signed - stop here
      if (userData?.bridge_signed_agreement_id) {
        if (!silent) {
          console.log('[TOS-LOAD] ✅ TOS signed (from database) - updating state')
        }
        setTosSigned(true)
        setTosSignedAgreementId(userData.bridge_signed_agreement_id)
        
        // Set tosLinkId for consistency
        const linkId = userData.bridge_customer_id ? `customer-${userData.bridge_customer_id}` : null
        if (linkId) {
          setTosLinkId(linkId)
        }
        
        // Update cache with database value (ensures cache matches database)
        await updateTosStatusInCache(true, userData.bridge_signed_agreement_id, linkId)
        
        // Don't fetch TOS link from Bridge API - not needed if already signed
        return
      }
      
      // If database says TOS is NOT signed, update state to false
      if (userData && !userData.bridge_signed_agreement_id) {
        if (!silent) {
          console.log('[TOS-LOAD] ❌ TOS not signed (from database) - updating state')
        }
        setTosSigned(false)
        setTosSignedAgreementId(null)
        // Update cache to match database
        await updateTosStatusInCache(false, null, null)
      }
      
      // Only fetch from Bridge API if bridge_signed_agreement_id is empty
      // This should be rare - only if Bridge requires TOS again
      // First try to get TOS link (for cases where customer doesn't exist yet or needs new TOS)
      try {
        const response = await bridgeService.getTOSLink(userProfile.email!, 'individual')
        const link = response.tosLink
        const linkId = response.tosLinkId
        
        if (link && link.trim() !== '') {
          setTosLink(link)
          setTosLinkId(linkId)
          
          // Only check Bridge API status if we have a customer_id (to avoid unnecessary calls)
          if (userData?.bridge_customer_id && linkId) {
            try {
              const status = await bridgeService.checkTOSStatus(linkId)
              if (status.signed) {
                setTosSigned(true)
                setTosSignedAgreementId(status.signedAgreementId || null)
                
                // Update cache
                await updateTosStatusInCache(true, status.signedAgreementId || null, linkId)
                
                // Store in database for persistence
                if (status.signedAgreementId) {
                  await storeSignedAgreementId(status.signedAgreementId)
                }
              } else {
                setTosSigned(false)
                await updateTosStatusInCache(false, null, linkId)
              }
            } catch (statusError: any) {
              // If status check fails, just set TOS as not signed
              // The link is available for the user to sign
              setTosSigned(false)
              if (!silent) {
                console.warn('[TOS-LOAD] Could not check TOS status from Bridge:', statusError.message)
              }
            }
          }
        } else if ((response as any).alreadyAccepted) {
          // Bridge says TOS is already accepted but we don't have it in database
          // This shouldn't happen, but handle it gracefully
          setTosSigned(true)
          setTosLinkId(linkId)
          await updateTosStatusInCache(true, null, linkId)
        } else {
          setTosSigned(false)
          if (linkId) {
            await updateTosStatusInCache(false, null, linkId)
          }
        }
      } catch (tosLinkError: any) {
        // If TOS link creation fails, log but don't fail completely
        if (!silent) {
          console.warn('[TOS-LOAD] Could not get TOS link:', tosLinkError.message)
        }
        // Don't set tosSigned to false here - database is source of truth
      }
    } catch (error: any) {
      if (!silent) {
        console.error('[TOS-LOAD] Error fetching TOS status from database:', error)
      }
    }
  }
  
  const storeSignedAgreementId = async (signedAgreementId: string) => {
    if (!userProfile?.id) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ bridge_signed_agreement_id: signedAgreementId })
        .eq('id', userProfile?.id)
      
      if (error) {
        console.error('Error storing signed_agreement_id:', error)
      } else {
        console.log('Stored signed_agreement_id in database:', signedAgreementId)
        
        // Immediately update UI state (don't wait for cache)
        setTosSigned(true)
        setTosSignedAgreementId(signedAgreementId)
        
        // Update cache to keep it in sync
        await updateTosStatusInCache(true, signedAgreementId, tosLinkId)
        
        // Force refresh TOS status to ensure everything is in sync
        // Use a small delay to ensure database write is complete
        setTimeout(() => {
          if (bothSubmitted && userProfile?.email) {
            loadingTosStatusRef.current = false // Reset ref to allow refresh
            loadTOSStatus()
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error storing signed_agreement_id:', error)
    }
  }

  const handleOpenTOS = async () => {
    if (!userProfile?.email) return
    
    // FIRST: Check if TOS is already signed - if so, don't try to create a new link
    if (tosSigned || userProfile.bridge_signed_agreement_id) {
      console.log('[TOS-OPEN] TOS already signed, skipping link generation')
      Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
      return
    }
    
    // Reset the processed flag when opening TOS modal
    tosProcessedRef.current = false
    console.log('[TOS-OPEN] Opening TOS modal, reset processed flag')
    
    setLoadingTos(true)
    try {
      if (!tosLink || !tosLinkId) {
        // Before trying to create TOS link, check database one more time
        const { data: userData } = await supabase
          .from('users')
          .select('bridge_signed_agreement_id, bridge_customer_id')
          .eq('id', userProfile.id)
          .single()
        
        // If TOS is already signed, don't try to create a link
        if (userData?.bridge_signed_agreement_id) {
          console.log('[TOS-OPEN] TOS already signed in database, skipping link generation')
          setTosSigned(true)
          setTosSignedAgreementId(userData.bridge_signed_agreement_id)
          setLoadingTos(false)
          Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
          return
        }
        
        // If customer exists, try to get TOS link from customer object first (avoids 401)
        if (userData?.bridge_customer_id) {
          try {
            const customer = await bridgeService.getCustomer(userData.bridge_customer_id)
            const customerTosLink = (customer as any).tos_link
            const hasAcceptedTOS = (customer as any).has_accepted_terms_of_service === true
            
            if (hasAcceptedTOS) {
              console.log('[TOS-OPEN] Customer already accepted TOS')
              setTosSigned(true)
              setLoadingTos(false)
              Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
              return
            }
            
            if (customerTosLink) {
              console.log('[TOS-OPEN] Using TOS link from customer object')
              setTosLink(customerTosLink)
              setTosLinkId(`customer-${userData.bridge_customer_id}`)
              setShowTosModal(true)
              setLoadingTos(false)
              return
            }
          } catch (customerError: any) {
            console.warn('[TOS-OPEN] Could not get customer TOS link:', customerError.message)
            // Fall through to try creating new TOS link
          }
        }
        
        // Last resort: Try to create new TOS link (this is where 401 happens)
        console.log('[TOS-OPEN] Attempting to create new TOS link...')
        try {
        const response = await bridgeService.getTOSLink(userProfile.email, 'individual')
        const link = response.tosLink
        const linkId = response.tosLinkId
        
        setTosLink(link)
        setTosLinkId(linkId)
        
        if (!link) {
          Alert.alert(
            'TOS Link Not Available',
            'Unable to load Terms of Service. Please try again or contact support.'
          )
          setLoadingTos(false)
          return
        }
        
        setShowTosModal(true)
        } catch (tosLinkError: any) {
          // If TOS link creation fails (especially 401), check if TOS is already accepted
          console.warn('[TOS-OPEN] TOS link creation failed:', tosLinkError.message)
          
          // If it's a 401 error, it might mean TOS is already accepted or API key doesn't have permission
          // Check customer status one more time
          if (userData?.bridge_customer_id) {
            try {
              const customer = await bridgeService.getCustomer(userData.bridge_customer_id)
              const hasAcceptedTOS = (customer as any).has_accepted_terms_of_service === true
              
              if (hasAcceptedTOS) {
                console.log('[TOS-OPEN] Customer already has TOS accepted (checked after 401 error)')
                setTosSigned(true)
                setLoadingTos(false)
                Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
                return
              }
            } catch (customerCheckError: any) {
              console.warn('[TOS-OPEN] Could not verify customer TOS status:', customerCheckError.message)
            }
          }
          
          // If we can't verify TOS status, show a helpful error
          // But first, check database one more time to be absolutely sure
          try {
            const { data: finalCheck } = await supabase
            .from('users')
            .select('bridge_signed_agreement_id')
              .eq('id', userProfile.id)
            .single()
          
            if (finalCheck?.bridge_signed_agreement_id) {
              console.log('[TOS-OPEN] TOS confirmed signed in database after 401 error')
            setTosSigned(true)
              setTosSignedAgreementId(finalCheck.bridge_signed_agreement_id)
            setLoadingTos(false)
              Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
            return
          }
          } catch (dbError: any) {
            console.warn('[TOS-OPEN] Could not verify TOS in database:', dbError.message)
          }
          
          // If we still can't confirm TOS is accepted, show error
          const errorMessage = tosLinkError.message || 'Failed to load terms of service'
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            Alert.alert(
              'TOS Link Unavailable',
              'Unable to create Terms of Service link. This may be because:\n\n• TOS is already accepted\n• Bridge API key permission issue\n\nIf TOS is already accepted, you can ignore this error.'
            )
          } else {
            Alert.alert(
              'Error Loading TOS',
              `Unable to load Terms of Service: ${errorMessage}\n\nIf TOS is already accepted, you can ignore this error.`
            )
          }
          setLoadingTos(false)
          return
        }
      } else {
        // We have tosLink and tosLinkId - just open the modal
        // Don't check database here - state is managed by loadTOSStatus
        if (!tosLink) {
          Alert.alert(
            'TOS Link Not Available',
            'Terms of Service link is not available. Please try again or contact support.'
          )
          setLoadingTos(false)
          return
        }
        setShowTosModal(true)
      }
    } catch (error: any) {
      console.error('Error opening TOS:', error)
      const errorMessage = error.message || 'Failed to load terms of service'
      Alert.alert(
        'Error Loading TOS',
        `${errorMessage}\n\nPlease try again or contact support if the issue persists.`
      )
      // Don't update state on error - let loadTOSStatus handle state management
    } finally {
      setLoadingTos(false)
    }
  }

  const handleTOSModalClose = () => {
    setShowTosModal(false)
    
    // If we already processed TOS via postMessage, don't start polling
    if (tosProcessedRef.current) {
      console.log('[TOS-MODAL] Modal closed but TOS already processed via postMessage, skipping polling')
      return
    }
    
    // Always start polling when modal closes - user may have accepted TOS
    // Give Bridge a moment to process the acceptance (Bridge may take a few seconds to update)
    setTimeout(() => {
      if (tosLinkId && !tosProcessedRef.current) {
        console.log('[TOS-MODAL] Modal closed - starting polling with tosLinkId:', tosLinkId)
        pollTOSStatus()
      } else {
        console.warn('[TOS-MODAL] Modal closed but no tosLinkId available or already processed, reloading TOS status')
        // Try to reload TOS status in case it was accepted
        if (bothSubmitted && userProfile?.email) {
          loadTOSStatus()
        }
      }
    }, 3000) // Wait 3 seconds for Bridge to process TOS acceptance
  }

  const handleOpenKYC = async () => {
    if (!userProfile?.email) {
      Alert.alert('Missing Information', 'Please complete your profile information before starting KYC verification.')
      return
    }
    
    setLoadingKyc(true)
    kycProcessedRef.current = false
    setCurrentKycFlow('kyc')
    setKycCompleted(false)
    setTosCompleted(false)
    
    try {
      // Always fetch and store latest Bridge customer status before opening KYC
      // This ensures we have the current status even if database is outdated
      if (userProfile?.bridge_customer_id) {
        try {
          console.log('[KYC-OPEN] Fetching latest Bridge customer status for:', userProfile.bridge_customer_id)
          const customerStatus = await bridgeService.getCustomerStatus()
          if (customerStatus && customerStatus.kycStatus) {
            // Always update database with latest status from Bridge
            const { error: updateError } = await supabase
              .from('users')
              .update({
                bridge_kyc_status: customerStatus.kycStatus,
                bridge_kyc_rejection_reasons: customerStatus.rejectionReasons || [],
                bridge_endorsements: customerStatus.endorsements || [],
                updated_at: new Date().toISOString(),
              })
              .eq('id', userProfile.id)
            
            if (updateError) {
              console.error('[KYC-OPEN] Error updating status:', updateError)
            } else {
              console.log('[KYC-OPEN] Updated Bridge KYC status from Bridge API:', customerStatus.kycStatus)
              
              // Refresh user profile to get updated status immediately
              if (refreshUserProfile) {
                await refreshUserProfile()
              }
            }
          }
        } catch (statusError: any) {
          console.warn('[KYC-OPEN] Could not fetch Bridge customer status:', statusError.message)
          // Continue with KYC link creation even if status fetch fails
        }
      } else {
        // No customer_id yet, but try to check if Bridge has a customer for this email
        // This handles the case where customer_id wasn't stored properly
        try {
          console.log('[KYC-OPEN] No bridge_customer_id, checking Bridge API for existing customer...')
          const customerStatus = await bridgeService.getCustomerStatus()
          if (customerStatus && customerStatus.customerId) {
            // Found a customer! Store it in the database
            console.log('[KYC-OPEN] Found customer in Bridge:', customerStatus.customerId)
            const { error: updateError } = await supabase
              .from('users')
              .update({
                bridge_customer_id: customerStatus.customerId,
                bridge_kyc_status: customerStatus.kycStatus || 'not_started',
                bridge_kyc_rejection_reasons: customerStatus.rejectionReasons || [],
                bridge_endorsements: customerStatus.endorsements || [],
                updated_at: new Date().toISOString(),
              })
              .eq('id', userProfile.id)
            
            if (updateError) {
              console.error('[KYC-OPEN] Error storing customer_id:', updateError)
            } else {
              console.log('[KYC-OPEN] Stored bridge_customer_id and status:', customerStatus.kycStatus)
              
              // Refresh user profile to get updated status
              if (refreshUserProfile) {
                await refreshUserProfile()
              }
            }
          }
        } catch (checkError: any) {
          console.log('[KYC-OPEN] No existing customer found in Bridge (this is expected for new users)')
          // This is expected for new users, continue with KYC link creation
        }
      }
      
      // Construct full name from available fields, with fallback to email
      // Note: first_name and last_name are set in Profile Screen (More → Profile → Edit)
      // They are NOT set in Identity Verification screen
      const firstName = userProfile?.profile?.first_name || userProfile?.first_name || ''
      const lastName = userProfile?.profile?.last_name || userProfile?.last_name || ''
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : userProfile.email.split('@')[0] // Use email username as fallback
      
      let response
      try {
        response = await bridgeService.getKycLink(fullName, userProfile.email, 'individual')
      } catch (error: any) {
        // Handle case where Bridge returns existing KYC link in error
        if (error.message && error.message.includes('kyc link has already been created')) {
          console.log('[KYC-OPEN] KYC link already exists, Bridge should include it in response')
          // The error might contain the existing link - check if we can extract it
          // If not, try to get it via customer lookup
          if (userProfile?.bridge_customer_id) {
            try {
              const kycLinkData = await bridgeService.getKycLink(userProfile.bridge_customer_id)
              response = {
                kyc_link: kycLinkData.kyc_link,
                tos_link: null,
                kyc_link_id: `customer-${userProfile.bridge_customer_id}`,
                kyc_status: userProfile.bridge_kyc_status || 'not_started',
                tos_status: 'pending',
                customer_id: userProfile.bridge_customer_id,
              }
            } catch (linkError: any) {
              throw new Error(`KYC link already exists. Please check your email or contact support.`)
            }
          } else {
            throw new Error(`KYC link already exists for this email. Please check your email or contact support.`)
          }
        } else {
          throw error
        }
      }
      
      setKycLink(response.kyc_link)
      setKycTosLink(response.tos_link || null)
      setKycLinkId(response.kyc_link_id || null)
      setKycStatus(response.kyc_status || 'not_started')
      setTosStatus(response.tos_status || 'pending')
      
      // If customer_id is returned, store it in database and fetch current status from Bridge
      if (response.customer_id && userProfile?.id) {
        try {
          // First, store customer_id immediately
          const { error: storeError } = await supabase
            .from('users')
            .update({ 
              bridge_customer_id: response.customer_id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProfile.id)
          
          if (storeError) {
            console.error('[KYC-OPEN] Error storing customer_id:', storeError)
          } else {
            console.log('[KYC-OPEN] Stored bridge_customer_id:', response.customer_id)
          }
          
          // Now fetch the latest status from Bridge to ensure we have current data
          // This handles cases where database has old/missing status
          try {
            console.log('[KYC-OPEN] Fetching latest customer status from Bridge...')
            const customerStatus = await bridgeService.getCustomerStatus()
            
            if (customerStatus && customerStatus.kycStatus) {
              // Update with latest status from Bridge
              const { error: statusError } = await supabase
                .from('users')
                .update({
                  bridge_kyc_status: customerStatus.kycStatus,
                  bridge_kyc_rejection_reasons: customerStatus.rejectionReasons || [],
                  bridge_endorsements: customerStatus.endorsements || [],
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userProfile.id)
              
              if (statusError) {
                console.error('[KYC-OPEN] Error updating status:', statusError)
              } else {
                console.log('[KYC-OPEN] Updated status from Bridge:', customerStatus.kycStatus)
              }
            } else {
              // Fallback: use status from response if Bridge fetch failed
              if (response.kyc_status) {
                const { error: fallbackError } = await supabase
                  .from('users')
                  .update({
                    bridge_kyc_status: response.kyc_status,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', userProfile.id)
                
                if (fallbackError) {
                  console.error('[KYC-OPEN] Error storing fallback status:', fallbackError)
                }
              }
            }
          } catch (statusError: any) {
            console.warn('[KYC-OPEN] Could not fetch status from Bridge:', statusError.message)
            // Fallback: use status from response
            if (response.kyc_status) {
              await supabase
                .from('users')
                .update({
                  bridge_kyc_status: response.kyc_status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userProfile.id)
            }
          }
          
          // Refresh user profile to get updated status immediately
          if (refreshUserProfile) {
            await refreshUserProfile()
          }
        } catch (error: any) {
          console.error('[KYC-OPEN] Error storing customer data:', error)
          // Don't block the flow
        }
      }
      
      if (!response.kyc_link) {
        Alert.alert(
          'KYC Link Not Available',
          'Unable to load KYC verification. Please try again or contact support.'
        )
        setLoadingKyc(false)
        return
      }
      
      setShowKycModal(true)
    } catch (error: any) {
      console.error('Error opening KYC:', error)
      Alert.alert(
        'Error Loading KYC',
        `${error.message || 'Failed to load KYC verification'}\n\nPlease try again or contact support if the issue persists.`
      )
    } finally {
      setLoadingKyc(false)
    }
  }

  const handleKycModalClose = () => {
    setShowKycModal(false)
    
    // If both flows are completed, refresh user profile
    if (kycCompleted && tosCompleted) {
      console.log('[KYC-MODAL] Both KYC and TOS completed, refreshing user profile')
      // Refresh user profile to get updated KYC status
      setTimeout(() => {
        // Trigger a refresh of the user profile
        // This will be handled by the parent component or context
      }, 2000)
    }
  }

  const buildKycIframeUrl = (link: string): string => {
    // Replace /verify with /widget and add iframe-origin parameter
    const widgetUrl = link.replace('/verify', '/widget')
    // Use the API base URL as the origin (for React Native, we use the API URL)
    const origin = process.env.EXPO_PUBLIC_API_URL || 'https://www.easner.com'
    // Check if URL already has query parameters
    const separator = widgetUrl.includes('?') ? '&' : '?'
    return `${widgetUrl}${separator}iframe-origin=${encodeURIComponent(origin)}`
  }

  const pollTOSStatus = async () => {
    if (!tosLinkId || checkingTosStatus || tosProcessedRef.current) {
      console.log(`[TOS-POLL] Skipping poll - tosLinkId: ${!!tosLinkId}, checkingTosStatus: ${checkingTosStatus}, alreadyProcessed: ${tosProcessedRef.current}`)
      return
    }
    
    setCheckingTosStatus(true)
    const maxAttempts = 60 // 60 attempts = 2 minutes (2 seconds per attempt)
    let attempts = 0
    
    const checkStatus = async () => {
      try {
        console.log(`[TOS-POLL] Checking TOS status (attempt ${attempts + 1}/${maxAttempts}) with tosLinkId: ${tosLinkId}`)
        const status = await bridgeService.checkTOSStatus(tosLinkId!)
        console.log(`[TOS-POLL] TOS status response:`, { signed: status.signed, hasAgreementId: !!status.signedAgreementId })
        
        if (status.signed && status.signedAgreementId) {
          console.log(`[TOS-POLL] TOS accepted! signed_agreement_id: ${status.signedAgreementId.substring(0, 8)}...`)
          
          // Store signed_agreement_id first
          await storeSignedAgreementId(status.signedAgreementId)
          
          // Update UI
          setTosSigned(true)
          setTosSignedAgreementId(status.signedAgreementId)
          setCheckingTosStatus(false)
          
          // Update cache immediately
          await updateTosStatusInCache(true, status.signedAgreementId, tosLinkId)
          
          console.log(`[TOS-POLL] ✅ TOS signed_agreement_id stored in database`)
          
          // Check if Bridge customer exists before trying to update
          const { data: userData } = await supabase
            .from('users')
            .select('bridge_customer_id')
            .eq('id', userProfile?.id)
            .single()
          
          if (userData?.bridge_customer_id) {
            // Customer exists - update it with signed_agreement_id
            // Accepting TOS via hosted link doesn't automatically update the customer
            // We must call PUT /v0/customers/{customerID} with the signed_agreement_id
            try {
              console.log(`[TOS-POLL] Customer exists, updating with signed_agreement_id...`)
              const updateResult = await bridgeService.updateCustomerTOS(status.signedAgreementId)
              console.log(`[TOS-POLL] Customer updated successfully. hasAcceptedTOS: ${updateResult.hasAcceptedTOS}`)
            } catch (updateError: any) {
              console.error(`[TOS-POLL] ⚠️ Error updating customer TOS (customer exists):`, updateError.message)
              // Non-critical error - TOS is already stored
            }
          } else {
            // Customer doesn't exist yet - this is expected if KYC is still in_review
            // The admin will create the customer via "Send to Bridge" button
            console.log(`[TOS-POLL] ℹ️ Customer doesn't exist yet. TOS signed_agreement_id stored. Admin will create customer via "Send to Bridge".`)
            
            // Don't try to create customer here - admin must approve KYC first
            // The old code tried to create customer automatically, but that's not correct
            // because KYC might still be in_review
          }
          
          return
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000) // Check every 2 seconds
        } else {
          setCheckingTosStatus(false)
          console.log(`[TOS-POLL] Polling stopped after ${maxAttempts} attempts. TOS may still be processing.`)
          // Show alert to user that they may need to wait or refresh
          Alert.alert(
            'TOS Status',
            'Terms of Service acceptance is still being processed. Please wait a moment and refresh the screen, or try again later.',
            [
              {
                text: 'Refresh Now',
                onPress: () => {
                  if (bothSubmitted && userProfile?.email) {
                    loadTOSStatus()
                  }
                }
              },
              { text: 'OK', style: 'cancel' }
            ]
          )
        }
      } catch (error: any) {
        console.error('[TOS-POLL] Error checking TOS status:', error)
        setCheckingTosStatus(false)
        // Don't stop polling on error - might be temporary network issue
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000)
        }
      }
    }
    
    checkStatus()
  }

  const createBridgeCustomer = async (signedAgreementId: string) => {
    if (creatingCustomer) return // Prevent duplicate calls
    
    setCreatingCustomer(true)
    setCustomerError(null)
    
    try {
      await bridgeService.createCustomerWithKyc({
        signedAgreementId,
        needsUSD: true,
        needsEUR: true,
      })
      
      Alert.alert(
        'Success',
        'Account setup in progress. You will receive USD and EUR account details once your verification is approved.'
      )
      
      // Refresh submissions to show updated status
      if (userProfile?.id) {
        const data = await kycService.getByUserId(userProfile.id)
        setSubmissions(data || [])
      }
    } catch (error: any) {
      console.error('Error creating Bridge customer:', error)
      setCustomerError(error.message || 'Failed to create Bridge account')
      Alert.alert(
        'Account Setup Error',
        error.message || 'Failed to create your Bridge account. Please try again later.'
      )
    } finally {
      setCreatingCustomer(false)
    }
  }

  const getStatusBadge = (status: string | undefined, bridgeStatus?: string | undefined) => {
    // Always use bridge_kyc_status from Supabase (updated via webhooks)
    // The status parameter should be userProfile?.bridge_kyc_status
    const displayStatus = status
    
    if (!displayStatus) {
      return (
        <View style={styles.badgeGray}>
          <Text style={styles.badgeTextGray}>Not started</Text>
        </View>
      )
    }

    switch (displayStatus) {
      case "approved":
        return (
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeTextGreen}>Done</Text>
          </View>
        )
      case "in_review":
      case "under_review":
        return (
          <View style={styles.badgeYellow}>
            <Text style={styles.badgeTextYellow}>In review</Text>
          </View>
        )
      case "rejected":
        return (
          <View style={styles.badgeRed}>
            <Text style={styles.badgeTextRed}>Rejected</Text>
          </View>
        )
      case "incomplete":
        return (
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>Incomplete</Text>
          </View>
        )
      case "not_started":
        return (
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>Not started</Text>
          </View>
        )
      default:
        return (
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>Pending</Text>
          </View>
        )
    }
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing[5] }}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Header - Matching Send Flow */}
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
              <Text style={styles.title}>Account Verification</Text>
              <Text style={styles.subtitle}>Complete your KYC verification</Text>
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
            {/* Info Message */}
            {!bridgeKycApproved && (
              <View style={styles.infoCard}>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
                  <Text style={styles.infoText}>
                    {bridgeKycRejected 
                      ? (userProfile?.bridge_kyc_rejection_reasons 
                          ? (Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                              ? `${userProfile.bridge_kyc_rejection_reasons.join(", ")}. Please complete account verification again to receive your account details.`
                              : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                              ? `${userProfile.bridge_kyc_rejection_reasons}. Please complete account verification again to receive your account details.`
                              : 'Please complete account verification again to receive your account details.')
                          : 'Please complete account verification again to receive your account details.')
                      : bridgeKycInReview
                      ? 'Your KYC verification is under review. Please check your email for updates.'
                      : 'Please complete account verification and accept Terms of Service to proceed.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Cards Container */}
            <View style={styles.cardsContainer}>
              {/* Bridge KYC Link Card - Show only if KYC is NOT approved */}
              {!bridgeKycApproved && (
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    await handleOpenKYC()
                  }}
                  activeOpacity={0.7}
                  disabled={loadingKyc}
                >
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.cardLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary.main} />
                        </View>
                        <Text style={styles.cardTitle}>Identity Verification</Text>
                        <Text style={styles.cardDescription}>
                          Verify your identity to activate your account.
                        </Text>
                      </View>
                      <View style={styles.cardRight}>
                        {loadingKyc ? (
                          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[3] }}>
                            <View style={{ width: 70, alignItems: 'center' }}>
                              <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} style={{ opacity: 0 }} />
                          </View>
                        ) : (
                          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[3] }}>
                            {(() => {
                              // Debug: Log the bridge_kyc_status value
                              const bridgeKycStatus = userProfile?.bridge_kyc_status || userProfile?.profile?.bridge_kyc_status || 'not_started'
                              console.log('[KYC-CARD] Bridge KYC Status:', {
                                topLevel: userProfile?.bridge_kyc_status,
                                profile: userProfile?.profile?.bridge_kyc_status,
                                final: bridgeKycStatus,
                                userProfileId: userProfile?.id
                              })
                              return getStatusBadge(bridgeKycStatus, bridgeKycStatus)
                            })()}
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                          </View>
                        )}
                      </View>
                    </View>
                    {/* Status Notices */}
                    {bridgeKycInReview && (
                      <View style={styles.infoCard}>
                        <View style={styles.infoBox}>
                          <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                          <Text style={styles.infoText}>
                            Your verification is under review. We will provide an update soonest. Please check your email for updates.
                          </Text>
                        </View>
                      </View>
                    )}
                    {bridgeKycRejected && userProfile?.bridge_kyc_rejection_reasons && (
                      <View style={styles.infoCard}>
                        <View style={styles.infoBox}>
                          <Ionicons name="alert-circle-outline" size={20} color={colors.error.main} />
                          <Text style={styles.infoText}>
                            {Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                              ? userProfile.bridge_kyc_rejection_reasons.join(", ")
                              : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                              ? userProfile.bridge_kyc_rejection_reasons
                              : 'Your verification was not approved.'} Please complete account verification again to receive your account details.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {/* Identity Verification Card - Show only if Bridge KYC is approved */}
              {bridgeKycApproved && (
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    // Navigate to read-only view if data is from Bridge
                    if (identityFromBridge) {
                      // Show read-only view with Bridge data
                      navigation.navigate('IdentityVerification', { readOnly: true, fromBridge: true })
                    } else {
                      navigation.navigate('IdentityVerification')
                    }
                  }}
                  activeOpacity={0.7}
                >
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="person-outline" size={24} color={colors.primary.main} />
                      </View>
                      <Text style={styles.cardTitle}>Identity verification</Text>
                      <Text style={styles.cardDescription}>
                        Your ID verification information.
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      {getStatusBadge('approved', userProfile?.bridge_kyc_status)}
                      <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </View>
                  </View>
                  {/* Status Notices */}
                  {userProfile?.bridge_customer_id && userProfile?.bridge_kyc_status === 'under_review' && (
                    <View style={styles.infoCard}>
                      <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                        <Text style={styles.infoText}>
                          Your verification is under review. We will provide an update soonest. Please check your email for updates.
                        </Text>
                      </View>
                    </View>
                  )}
                  {userProfile?.bridge_customer_id && userProfile?.bridge_kyc_status === 'rejected' && userProfile?.bridge_kyc_rejection_reasons && (
                    <View style={styles.infoCard}>
                      <View style={styles.infoBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={colors.error.main} />
                        <Text style={styles.infoText}>
                          {Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                            ? `${userProfile.bridge_kyc_rejection_reasons.join(", ")}. `
                            : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                            ? `${userProfile.bridge_kyc_rejection_reasons}. `
                            : ''}Please complete account verification again to receive your account details.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              )}

              {/* Address Information Card - Show only if Bridge KYC is approved */}
              {bridgeKycApproved && (
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    // Navigate to read-only view if data is from Bridge
                    if (addressFromBridge) {
                      // Show read-only view with Bridge data
                      navigation.navigate('AddressVerification', { readOnly: true, fromBridge: true })
                    } else {
                      navigation.navigate('AddressVerification')
                    }
                  }}
                  activeOpacity={0.7}
                >
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="location-outline" size={24} color={colors.primary.main} />
                      </View>
                      <Text style={styles.cardTitle}>Address information</Text>
                      <Text style={styles.cardDescription}>
                        Your home address and document.
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      {getStatusBadge('approved', userProfile?.bridge_kyc_status)}
                      <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </View>
                  </View>
                  {/* Status Notices */}
                  {userProfile?.bridge_customer_id && userProfile?.bridge_kyc_status === 'under_review' && (
                    <View style={styles.infoCard}>
                      <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                        <Text style={styles.infoText}>
                          Your verification is under review. We will provide an update soonest. Please check your email for updates.
                        </Text>
                      </View>
                    </View>
                  )}
                  {userProfile?.bridge_customer_id && userProfile?.bridge_kyc_status === 'rejected' && userProfile?.bridge_kyc_rejection_reasons && (
                    <View style={styles.infoCard}>
                      <View style={styles.infoBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={colors.error.main} />
                        <Text style={styles.infoText}>
                          {Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                            ? `${userProfile.bridge_kyc_rejection_reasons.join(", ")}. `
                            : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                            ? `${userProfile.bridge_kyc_rejection_reasons}. `
                            : ''}Please complete account verification again to receive your account details.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              )}

              {/* Bridge TOS Acceptance Card - Show only if bridge_signed_agreement_id is empty */}
              {!tosSigned && !userProfile?.bridge_signed_agreement_id && !userProfile?.profile?.bridge_signed_agreement_id && (
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    if (!tosLink) {
                      // TOS link not loaded yet - try to generate it
                      console.log('TOS link not available, attempting to generate...')
                      try {
                        await handleOpenTOS() // This will try to generate TOS link
                      } catch (error: any) {
                        Alert.alert(
                          'TOS Link Error',
                          `Unable to generate Terms of Service link: ${error.message || 'Unknown error'}. Please try again or contact support.`
                        )
                      }
                    } else {
                      await handleOpenTOS()
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={loadingTos || checkingTosStatus || creatingCustomer}
                >
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.cardLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons name="document-text-outline" size={24} color={colors.primary.main} />
                        </View>
                        <Text style={styles.cardTitle}>Partner Terms of Service</Text>
                        <Text style={styles.cardDescription}>
                          Accept terms to complete account setup.
                        </Text>
                      </View>
                      <View style={styles.cardRight}>
                        {loadingTos || checkingTosStatus || creatingCustomer ? (
                          <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                          <>
                            {getStatusBadge('pending')}
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

            </View>

            {/* TOS WebView Modal */}
            <Modal
              visible={showTosModal}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={handleTOSModalClose}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={handleTOSModalClose}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalTitle, { color: colors.primary.main }]}>Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Partner Terms of Service</Text>
                </View>
                {tosLink && (
                  <WebView
                    source={{ uri: tosLink }}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onNavigationStateChange={(navState) => {
                      // Check if user navigated away (might indicate acceptance)
                      // Bridge TOS pages typically redirect after acceptance
                      console.log('[TOS-WEBVIEW] Navigation changed:', {
                        url: navState.url,
                        originalUrl: tosLink,
                        loading: navState.loading,
                        canGoBack: navState.canGoBack
                      })
                      
                      // If URL changed and page finished loading, user might have accepted TOS
                      if (navState.url !== tosLink && !navState.loading) {
                        console.log('[TOS-WEBVIEW] URL changed - user may have accepted TOS, will start polling when modal closes')
                        // Don't start polling here - wait for modal to close
                        // The handleTOSModalClose will start polling
                      }
                    }}
                    onShouldStartLoadWithRequest={(request) => {
                      // Allow navigation to proceed
                      console.log('[TOS-WEBVIEW] Should start load:', request.url)
                      return true
                    }}
                    onMessage={async (event) => {
                      // Handle messages from WebView if Bridge sends any
                      console.log('[TOS-WEBVIEW] 📨 Message received from WebView:', {
                        data: event.nativeEvent.data,
                        type: typeof event.nativeEvent.data,
                        alreadyProcessed: tosProcessedRef.current
                      })
                      
                      // Prevent duplicate processing
                      if (tosProcessedRef.current) {
                        console.log('[TOS-WEBVIEW] ⚠️ Message already processed, ignoring')
                        return
                      }
                      
                      try {
                        const messageData = event.nativeEvent.data
                        let data: any
                        
                        // Try to parse as JSON
                        if (typeof messageData === 'string') {
                          data = JSON.parse(messageData)
                        } else {
                          data = messageData
                        }
                        
                        console.log('[TOS-WEBVIEW] 📋 Parsed message data:', data)
                        
                        if (data && data.signedAgreementId) {
                          const signedAgreementId = data.signedAgreementId
                          console.log(`[TOS-WEBVIEW] ✅ Received signedAgreementId from WebView: ${signedAgreementId.substring(0, 8)}...`)
                          
                          // Mark as processed to prevent duplicate handling
                          tosProcessedRef.current = true
                          
                          // Stop any ongoing polling
                          setCheckingTosStatus(false)
                          
                          // Store signed_agreement_id first
                          await storeSignedAgreementId(signedAgreementId)
                          
                          // Update UI immediately
                          setTosSigned(true)
                          setTosSignedAgreementId(signedAgreementId)
                          
                          // Update cache immediately
                          await updateTosStatusInCache(true, signedAgreementId, tosLinkId)
                          
                          console.log(`[TOS-WEBVIEW] ✅ TOS signed_agreement_id stored in database`)
                          
                          // Check if Bridge customer exists before trying to update
                          const { data: userData } = await supabase
                            .from('users')
                            .select('bridge_customer_id')
                            .eq('id', userProfile?.id)
                            .single()
                          
                          if (userData?.bridge_customer_id) {
                            // Customer exists - update it with signed_agreement_id
                            try {
                              console.log(`[TOS-WEBVIEW] 🔄 Customer exists, updating with signed_agreement_id: ${signedAgreementId.substring(0, 8)}...`)
                              const updateResult = await bridgeService.updateCustomerTOS(signedAgreementId)
                              console.log(`[TOS-WEBVIEW] ✅ Customer updated successfully. Response:`, {
                                success: updateResult.success,
                                hasAcceptedTOS: updateResult.hasAcceptedTOS,
                                customerId: updateResult.customerId
                              })
                              
                              // Show success message
                              Alert.alert(
                                'Terms Accepted',
                                'Your Terms of Service have been accepted successfully. You can now create your accounts.',
                                [{ 
                                  text: 'OK',
                                  onPress: () => {
                                    setShowTosModal(false)
                                  }
                                }]
                              )
                              return
                            } catch (updateError: any) {
                              console.error(`[TOS-WEBVIEW] ⚠️ Error updating customer TOS (customer exists):`, updateError.message)
                              // Non-critical error - TOS is already stored, just show warning
                              Alert.alert(
                                'Terms Accepted',
                                'Your Terms of Service have been accepted. There was an issue updating your Bridge account, but this will be resolved when your account is set up.',
                                [{ 
                                  text: 'OK',
                                  onPress: () => {
                                    setShowTosModal(false)
                                  }
                                }]
                              )
                              return
                            }
                          } else {
                            // Customer doesn't exist yet - this is expected if KYC is still in_review
                            // The admin will create the customer via "Send to Bridge" button
                            console.log(`[TOS-WEBVIEW] ℹ️ Customer doesn't exist yet. TOS signed_agreement_id stored. Admin will create customer via "Send to Bridge".`)
                            
                            // Show success message
                            Alert.alert(
                              'Terms Accepted',
                              'Your Terms of Service have been accepted successfully. Your account will be set up after your identity verification is approved.',
                              [{ 
                                text: 'OK',
                                onPress: () => {
                                  setShowTosModal(false)
                                }
                              }]
                            )
                            return
                          }
                        } else {
                          console.log('[TOS-WEBVIEW] ⚠️ Message received but no signedAgreementId found:', data)
                        }
                      } catch (parseError: any) {
                        // Not JSON or parsing failed - that's OK, might be a different message
                        console.log('[TOS-WEBVIEW] ⚠️ Could not parse message as JSON:', {
                          error: parseError.message,
                          data: event.nativeEvent.data
                        })
                      }
                    }}
                  />
                )}
              </View>
            </Modal>

            {/* KYC WebView Modal */}
            <Modal
              visible={showKycModal}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={handleKycModalClose}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={handleKycModalClose}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalTitle, { color: colors.primary.main }]}>Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {currentKycFlow === 'kyc' ? 'Account Verification' : 'Partner Terms of Service'}
                  </Text>
                </View>
                {currentKycFlow === 'kyc' && kycLink && (
                  <WebView
                    source={{ uri: buildKycIframeUrl(kycLink) }}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onMessage={async (event) => {
                      console.log('[KYC-WEBVIEW] 📨 Message received from WebView:', {
                        data: event.nativeEvent.data,
                        type: typeof event.nativeEvent.data,
                        alreadyProcessed: kycProcessedRef.current
                      })
                      
                      if (kycProcessedRef.current) {
                        console.log('[KYC-WEBVIEW] ⚠️ Message already processed, ignoring')
                        return
                      }
                      
                      try {
                        const messageData = event.nativeEvent.data
                        let data: any
                        
                        if (typeof messageData === 'string') {
                          data = JSON.parse(messageData)
                        } else {
                          data = messageData
                        }
                        
                        console.log('[KYC-WEBVIEW] 📋 Parsed message data:', data)
                        
                        // Handle KYC completion
                        if (data && (data.kycCompleted || data.status === 'completed' || data.kyc_status === 'approved' || data.kyc_status === 'under_review')) {
                          console.log('[KYC-WEBVIEW] ✅ KYC completed')
                          kycProcessedRef.current = true
                          setKycCompleted(true)
                          setKycStatus(data.kyc_status || 'approved')
                          
                          // Sync KYC data from Bridge to our database
                          if (data.customer_id && userProfile?.id) {
                            try {
                              console.log('[KYC-WEBVIEW] Syncing KYC data from Bridge to database...')
                              const { data: { session } } = await supabase.auth.getSession()
                              if (session) {
                                await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/bridge/sync-kyc`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`,
                                  },
                                  body: JSON.stringify({
                                    customer_id: data.customer_id,
                                    user_id: userProfile.id,
                                  }),
                                })
                                console.log('[KYC-WEBVIEW] ✅ KYC data synced to database')
                              }
                            } catch (syncError: any) {
                              console.error('[KYC-WEBVIEW] Error syncing KYC data:', syncError)
                              // Don't block the flow - data will be synced via webhook
                            }
                          }
                          
                          // If TOS link is available, switch to TOS flow
                          if (kycTosLink && !tosCompleted) {
                            console.log('[KYC-WEBVIEW] 🔄 Switching to TOS flow')
                            setCurrentKycFlow('tos')
                            kycProcessedRef.current = false // Reset for TOS flow
                          } else {
                            // Both flows completed
                            Alert.alert(
                              'Verification Complete',
                              'Your KYC verification has been completed successfully.',
                              [{ 
                                text: 'OK',
                                onPress: () => {
                                  handleKycModalClose()
                                }
                              }]
                            )
                          }
                        }
                        
                        // Handle TOS completion
                        if (data && (data.tosCompleted || data.signedAgreementId)) {
                          console.log('[KYC-WEBVIEW] ✅ TOS completed')
                          kycProcessedRef.current = true
                          setTosCompleted(true)
                          setTosStatus('approved')
                          
                          if (data.signedAgreementId && userProfile?.id) {
                            // Store signed_agreement_id
                            await supabase
                              .from('users')
                              .update({ bridge_signed_agreement_id: data.signedAgreementId })
                              .eq('id', userProfile.id)
                          }
                          
                          // Both flows completed
                          Alert.alert(
                            'Verification Complete',
                            'Your KYC and Terms of Service have been completed successfully.',
                            [{ 
                              text: 'OK',
                              onPress: () => {
                                handleKycModalClose()
                              }
                            }]
                          )
                        }
                      } catch (error: any) {
                        console.error('[KYC-WEBVIEW] Error processing message:', error)
                      }
                    }}
                    onNavigationStateChange={(navState) => {
                      console.log('[KYC-WEBVIEW] Navigation changed:', {
                        url: navState.url,
                        loading: navState.loading,
                      })
                    }}
                  />
                )}
                {currentKycFlow === 'tos' && kycTosLink && (
                  <WebView
                    source={{ uri: kycTosLink }}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onMessage={async (event) => {
                      console.log('[KYC-TOS-WEBVIEW] 📨 Message received from WebView:', {
                        data: event.nativeEvent.data,
                      })
                      
                      if (kycProcessedRef.current && tosCompleted) {
                        return
                      }
                      
                      try {
                        const messageData = event.nativeEvent.data
                        let data: any
                        
                        if (typeof messageData === 'string') {
                          data = JSON.parse(messageData)
                        } else {
                          data = messageData
                        }
                        
                        if (data && data.signedAgreementId) {
                          console.log('[KYC-TOS-WEBVIEW] ✅ TOS completed')
                          kycProcessedRef.current = true
                          setTosCompleted(true)
                          setTosStatus('approved')
                          
                          if (userProfile?.id) {
                            await supabase
                              .from('users')
                              .update({ bridge_signed_agreement_id: data.signedAgreementId })
                              .eq('id', userProfile.id)
                          }
                          
                          Alert.alert(
                            'Verification Complete',
                            'Your KYC and Terms of Service have been completed successfully.',
                            [{ 
                              text: 'OK',
                              onPress: () => {
                                handleKycModalClose()
                              }
                            }]
                          )
                        }
                      } catch (error: any) {
                        console.error('[KYC-TOS-WEBVIEW] Error processing message:', error)
                      }
                    }}
                    onNavigationStateChange={(navState) => {
                      console.log('[KYC-TOS-WEBVIEW] Navigation changed:', {
                        url: navState.url,
                        loading: navState.loading,
                      })
                    }}
                  />
                )}
              </View>
            </Modal>
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
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
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing[5],
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.primary.main,
    flex: 1,
  },
  cardsContainer: {
    gap: spacing[4],
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[3],
  },
  cardContent: {
    padding: spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    marginRight: spacing[4],
    minWidth: 0, // Prevent flex from causing layout shifts
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardTitle: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  cardDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    width: 100, // Fixed width to prevent layout shift between spinner and badge+chevron
    justifyContent: 'flex-end',
    flexShrink: 0, // Prevent shrinking
  },
  badgeGreen: {
    backgroundColor: colors.success.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    minWidth: 70, // Fixed minimum width to prevent layout shifts
    alignItems: 'center',
  },
  badgeTextGreen: {
    ...textStyles.labelSmall,
    fontWeight: '500',
    color: colors.success.dark,
  },
  badgeYellow: {
    backgroundColor: colors.warning.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    minWidth: 70, // Fixed minimum width to prevent layout shifts
    alignItems: 'center',
  },
  badgeTextYellow: {
    ...textStyles.labelSmall,
    fontWeight: '500',
    color: colors.warning.dark,
  },
  badgeRed: {
    backgroundColor: colors.error.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    minWidth: 70, // Fixed minimum width to prevent layout shifts
    alignItems: 'center',
  },
  badgeTextRed: {
    ...textStyles.labelSmall,
    fontWeight: '500',
    color: colors.error.dark,
  },
  badgeGray: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    minWidth: 70, // Fixed minimum width to prevent layout shifts
    alignItems: 'center',
  },
  badgeTextGray: {
    ...textStyles.labelSmall,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
  },
})

export default function AccountVerificationScreen(props: NavigationProps) {
  return <AccountVerificationContent {...props} />
}





