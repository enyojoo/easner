import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

function MoreContent({ navigation }: NavigationProps) {
  const { userProfile, signOut } = useAuth()
  const insets = useSafeAreaInsets()
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([])
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [loadingPrivacy, setLoadingPrivacy] = useState(true)
  const [loadingTerms, setLoadingTerms] = useState(true)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
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

  // Refresh KYC submissions when screen comes into focus
  useEffect(() => {
    if (!userProfile?.id) return

    const fetchSubmissions = async () => {
      try {
        const submissions = await kycService.getByUserId(userProfile.id)
        setKycSubmissions(submissions || [])
        
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value: submissions || [],
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching submissions:', error)
      }
    }

    const loadKycSubmissions = async () => {
      try {
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        
        if (cached) {
          const { value, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setKycSubmissions(value || [])
            // Always fetch fresh data in background
            fetchSubmissions()
            return
          }
        }

        await fetchSubmissions()
      } catch (error) {
        console.error('Error loading KYC submissions:', error)
      }
    }

    loadKycSubmissions()
    
    // Set up focus listener to refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSubmissions()
    })

    return unsubscribe
  }, [userProfile?.id, navigation])

  const getVerificationStatus = (): "verified" | "pending" => {
    const identitySubmission = kycSubmissions.find(s => s.type === "identity")
    const addressSubmission = kycSubmissions.find(s => s.type === "address")

    if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
      return "verified"
    }

    return "pending"
  }

  const verificationStatus = getVerificationStatus()

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      Alert.alert('Error', 'Failed to sign out')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  const handlePrivacy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowPrivacyModal(true)
  }

  const handleTerms = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowTermsModal(true)
  }

  const renderMenuItem = (
    title: string,
    onPress: () => void,
    rightComponent?: React.ReactNode,
    isDestructive: boolean = false,
    isLast: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.menuItemText, isDestructive && styles.destructiveText]}>
        {title}
      </Text>
      <View style={styles.menuItemRight}>
        {rightComponent}
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      </View>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Premium Header - Matching Card/Transaction */}
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
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Manage your account information</Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing[5] }}
          showsVerticalScrollIndicator={false}
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
          {/* Account Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              {renderMenuItem(
                'Your Profile',
                () => navigation.navigate('ProfileEdit'),
                undefined,
                false,
                false
              )}
              {renderMenuItem(
                'Account Verification',
                () => navigation.navigate('AccountVerification'),
                verificationStatus === "verified" ? (
                  <View style={styles.badgeGreen}>
                    <Text style={styles.badgeTextGreen}>Verified</Text>
                  </View>
                ) : (
                  <View style={styles.badgeYellow}>
                    <Text style={styles.badgeTextYellow}>Take action</Text>
                  </View>
                ),
                false,
                false
              )}
              {renderMenuItem(
                'Change Password',
                () => navigation.navigate('ChangePassword'),
                undefined,
                false,
                false
              )}
              {renderMenuItem(
                'Notifications',
                () => navigation.navigate('Notifications'),
                undefined,
                false,
                false
              )}
              {renderMenuItem(
                'Recipients',
                () => navigation.navigate('Recipients'),
                undefined,
                false,
                true
              )}
            </View>
          </View>

          {/* App Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.sectionContent}>
              {renderMenuItem(
                'Support',
                () => navigation.navigate('Support'),
                undefined,
                false,
                false
              )}
              {renderMenuItem(
                'Privacy Policy',
                handlePrivacy,
                undefined,
                false,
                false
              )}
              {renderMenuItem(
                'Terms of Service',
                handleTerms,
                undefined,
                false,
                true
              )}
            </View>
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowLogoutDialog(true)
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error.main} />
              <Text style={styles.signOutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
          </Animated.View>
        </ScrollView>
      </View>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={showLogoutDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutDialog(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy WebView Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowPrivacyModal(false)
          setLoadingPrivacy(true) // Reset loading state when modal closes
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity
              onPress={() => {
                setShowPrivacyModal(false)
                setLoadingPrivacy(true) // Reset loading state when modal closes
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {loadingPrivacy && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          )}
          <WebView
            source={{ uri: 'https://www.easner.com/privacy' }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={() => setLoadingPrivacy(true)}
            onLoadEnd={() => setLoadingPrivacy(false)}
            onError={() => setLoadingPrivacy(false)}
          />
        </View>
      </Modal>

      {/* Terms of Service WebView Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowTermsModal(false)
          setLoadingTerms(true) // Reset loading state when modal closes
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity
              onPress={() => {
                setShowTermsModal(false)
                setLoadingTerms(true) // Reset loading state when modal closes
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {loadingTerms && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          )}
          <WebView
            source={{ uri: 'https://www.easner.com/terms' }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={() => setLoadingTerms(true)}
            onLoadEnd={() => setLoadingTerms(false)}
            onError={() => setLoadingTerms(false)}
          />
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing[5],
    gap: spacing[4],
  },
  sectionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[4],
    paddingBottom: spacing[2],
  },
  sectionTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[3],
  },
  sectionContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  destructiveText: {
    color: colors.error.main,
  },
  badgeGreen: {
    backgroundColor: colors.success.background,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  badgeTextGreen: {
    ...textStyles.labelSmall,
    color: colors.success.dark,
    fontWeight: '600',
  },
  badgeYellow: {
    backgroundColor: colors.warning.background,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  badgeTextYellow: {
    ...textStyles.labelSmall,
    color: colors.warning.dark,
    fontWeight: '600',
  },
  signOutContainer: {
    paddingTop: spacing[3],
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  signOutText: {
    ...textStyles.bodyMedium,
    color: colors.error.main,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
  },
  versionText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  modalTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  modalDescription: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  modalButtonConfirm: {
    backgroundColor: colors.error.main,
  },
  modalButtonTextCancel: {
    ...textStyles.bodyMedium,
    fontWeight: '500',
    color: colors.text.primary,
  },
  modalButtonTextConfirm: {
    ...textStyles.bodyMedium,
    fontWeight: '500',
    color: colors.text.inverse,
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    zIndex: 1,
  },
})

export default function MoreScreen(props: NavigationProps) {
  return <MoreContent {...props} />
}

