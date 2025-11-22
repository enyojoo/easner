import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import AsyncStorage from '@react-native-async-storage/async-storage'

function MoreContent({ navigation }: NavigationProps) {
  const { userProfile, signOut } = useAuth()
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([])
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!userProfile?.id) return

    const loadKycSubmissions = async () => {
      try {
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        
        if (cached) {
          const { value, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setKycSubmissions(value || [])
            // Fetch in background
            fetchSubmissions()
            return
          }
        }

        await fetchSubmissions()
      } catch (error) {
        console.error('Error loading KYC submissions:', error)
      }
    }

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

    loadKycSubmissions()
  }, [userProfile?.id])

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
    const url = 'https://www.easner.com/privacy'
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Error', 'Cannot open privacy policy URL')
    }
  }

  const handleTerms = async () => {
    const url = 'https://www.easner.com/terms'
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Error', 'Cannot open terms URL')
    }
  }

  const renderMenuItem = (
    title: string,
    onPress: () => void,
    rightComponent?: React.ReactNode,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
    >
      <Text style={[styles.menuItemText, isDestructive && styles.destructiveText]}>
        {title}
      </Text>
      <View style={styles.menuItemRight}>
        {rightComponent}
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Manage your account information</Text>
        </View>

        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              {renderMenuItem(
                'Your Profile',
                () => navigation.navigate('ProfileEdit')
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
                )
              )}
              {renderMenuItem(
                'Change Password',
                () => navigation.navigate('ChangePassword')
              )}
              {renderMenuItem(
                'Notifications',
                () => navigation.navigate('Notifications')
              )}
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.sectionContent}>
              {renderMenuItem(
                'Recipients',
                () => navigation.navigate('Recipients')
              )}
              {renderMenuItem(
                'Support',
                () => navigation.navigate('Support')
              )}
              {renderMenuItem(
                'Privacy Policy',
                handlePrivacy
              )}
              {renderMenuItem(
                'Terms of Service',
                handleTerms
              )}
            </View>
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => setShowLogoutDialog(true)}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.signOutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={showLogoutDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
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
                  <Text style={styles.modalButtonTextConfirm}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 20,
    paddingBottom: 12,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destructiveText: {
    color: '#ef4444',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextGreen: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextYellow: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  signOutContainer: {
    paddingTop: 24,
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
})

export default function MoreScreen(props: NavigationProps) {
  return <MoreContent {...props} />
}

