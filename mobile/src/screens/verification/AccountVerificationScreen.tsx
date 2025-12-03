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
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import { bridgeService } from '../../lib/bridgeService'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

function AccountVerificationContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
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

  const bothCompleted = 
    identitySubmission?.status === "approved" && 
    addressSubmission?.status === "approved"
  
  // TOS should appear when both are submitted (status: pending, in_review, or approved)
  const bothSubmitted = 
    identitySubmission && 
    addressSubmission &&
    identitySubmission.status && 
    addressSubmission.status &&
    identitySubmission.status !== 'rejected' &&
    addressSubmission.status !== 'rejected'

  // Load TOS status when both are submitted (only once, like identity/address verification)
  useEffect(() => {
    if (!bothSubmitted || !userProfile?.email || !userProfile?.id) return

    // Prevent duplicate calls
    if (loadingTosStatusRef.current) {
      return
    }

    // Load TOS status (will check cache first, then fetch if needed)
    loadTOSStatus()
  }, [bothSubmitted, userProfile?.email, userProfile?.id])

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
      
      // If we have signed_agreement_id in database, TOS is signed
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
        
        // Get TOS link for display (non-blocking, in background)
        bridgeService.getTOSLink(userProfile.email!, 'individual')
          .then(response => {
            if (response.tosLink) {
              setTosLink(response.tosLink)
            }
          })
          .catch(() => {
            // Ignore errors - we already have the status from database
          })
        
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
      
      // If no signed_agreement_id in database, check Bridge API (but only if we have a customer)
      if (userData?.bridge_customer_id) {
        try {
          const tosLinkId = `customer-${userData.bridge_customer_id}`
          const status = await bridgeService.checkTOSStatus(tosLinkId)
          
          if (status.signed) {
            setTosSigned(true)
            setTosSignedAgreementId(status.signedAgreementId || null)
            setTosLinkId(tosLinkId)
            
            // Update cache
            await updateTosStatusInCache(true, status.signedAgreementId || null, tosLinkId)
            
            // Store in database for persistence
            if (status.signedAgreementId) {
              await storeSignedAgreementId(status.signedAgreementId)
            }
            
            // Get TOS link for display
            const response = await bridgeService.getTOSLink(userProfile.email!, 'individual')
            if (response.tosLink) {
              setTosLink(response.tosLink)
            }
            
            return
          } else {
            setTosSigned(false)
            // Update cache with false status
            await updateTosStatusInCache(false, null, tosLinkId)
          }
        } catch (customerError: any) {
          if (!silent) {
          console.warn('[TOS-LOAD] Could not check customer TOS status:', customerError.message)
          }
          setTosSigned(false)
        }
      }
      
      // Fallback: Get TOS link (for cases where customer doesn't exist yet)
      // Only try this if TOS is not already signed (to avoid unnecessary API calls)
      if (!userData?.bridge_signed_agreement_id) {
        try {
          const response = await bridgeService.getTOSLink(userProfile.email!, 'individual')
      const link = response.tosLink
      const linkId = response.tosLinkId
      
      if (link && link.trim() !== '') {
        setTosLink(link)
        setTosLinkId(linkId)
        
        // Check if already signed via TOS link
        if (linkId) {
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
                // Update cache with false status
                await updateTosStatusInCache(false, null, linkId)
          }
        }
      } else if ((response as any).alreadyAccepted) {
        setTosSigned(true)
        setTosLinkId(linkId)
            // Update cache
            await updateTosStatusInCache(true, null, linkId)
      } else {
        setTosSigned(false)
            // Update cache with false status
            if (linkId) {
              await updateTosStatusInCache(false, null, linkId)
            }
          }
        } catch (tosLinkError: any) {
          // If TOS link creation fails (e.g., 401), log but don't fail completely
          // TOS might already be accepted, so this is not critical
          if (!silent) {
          console.warn('[TOS-LOAD] Could not get TOS link (this is OK if TOS is already accepted):', tosLinkError.message)
          }
          // Don't set tosSigned to false here - database is source of truth
        }
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
        'Your Bridge account is being set up. You will receive USD and EUR account details once your verification is approved.'
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
    // Use Bridge status if available, otherwise use local status
    const displayStatus = bridgeStatus || status
    
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
            {/* Only show if both are not completed AND neither is in review */}
            {!bothCompleted && 
             identitySubmission?.status !== 'in_review' && 
             addressSubmission?.status !== 'in_review' && (
              <View style={styles.infoCard}>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
                  <Text style={styles.infoText}>
                    Please complete KYC Identity and Address information for compliance.
                  </Text>
                </View>
              </View>
            )}

            {/* Cards Container */}
            <View style={styles.cardsContainer}>
              {/* Identity Verification Card */}
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('IdentityVerification')
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
                      {getStatusBadge(identitySubmission?.status, userProfile?.bridge_kyc_status)}
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
                          Your verification was not approved. {Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                            ? `Reason: ${userProfile.bridge_kyc_rejection_reasons.join(", ")}. `
                            : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                            ? `Reason: ${userProfile.bridge_kyc_rejection_reasons}. `
                            : ''}Please complete identity verification again to receive your account details.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Address Information Card */}
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('AddressVerification')
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
                      {getStatusBadge(addressSubmission?.status, userProfile?.bridge_kyc_status)}
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
                          Your verification was not approved. {Array.isArray(userProfile.bridge_kyc_rejection_reasons) 
                            ? `Reason: ${userProfile.bridge_kyc_rejection_reasons.join(", ")}. `
                            : typeof userProfile.bridge_kyc_rejection_reasons === 'string'
                            ? `Reason: ${userProfile.bridge_kyc_rejection_reasons}. `
                            : ''}Please complete identity verification again to receive your account details.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Bridge TOS Acceptance Card - Show when both identity and address are submitted */}
              {bothSubmitted && (
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    if (tosSigned) {
                      Alert.alert('Terms Accepted', 'You have already accepted the partner terms of service.')
                    } else if (!tosLink) {
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
                            {getStatusBadge(tosSigned ? 'approved' : 'pending')}
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
                  <Text style={styles.modalTitle}>Partner Terms of Service</Text>
                  <TouchableOpacity
                    onPress={handleTOSModalClose}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                  </TouchableOpacity>
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
  },
  badgeGreen: {
    backgroundColor: colors.success.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
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





