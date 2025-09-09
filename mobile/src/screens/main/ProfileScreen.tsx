import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { userService, UserProfileData, UserStats } from '../../lib/userService'
import { getCountryFlag } from '../../utils/flagUtils'

export default function ProfileScreen({ navigation }: NavigationProps) {
  const { user, userProfile, signOut, refreshUserProfile } = useAuth()
  const { transactions, currencies, exchangeRates } = useUserData()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalTransactions: 0,
    totalSent: 0,
    memberSince: '',
  })
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    baseCurrency: 'NGN',
  })
  const [editProfileData, setEditProfileData] = useState(profileData)

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      const data = {
        firstName: userProfile.profile.first_name || '',
        lastName: userProfile.profile.last_name || '',
        email: userProfile.profile.email || '',
        phone: userProfile.profile.phone || '',
        baseCurrency: userProfile.profile.base_currency || 'NGN',
      }
      setProfileData(data)
      setEditProfileData(data)
    }
  }, [userProfile])

  // Load user statistics
  useEffect(() => {
    if (!user || !transactions.length || !exchangeRates.length) return

    const calculateUserStats = async () => {
      const baseCurrency = userProfile?.profile.base_currency || 'NGN'
      const stats = await userService.getUserStats(user.id, transactions, exchangeRates, baseCurrency, userProfile)
      setUserStats(stats)
    }

    calculateUserStats()
  }, [user, userProfile, transactions, exchangeRates])

  const handleEditProfile = () => {
    setEditProfileData(profileData)
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    if (!editProfileData.firstName || !editProfileData.lastName) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Update profile in database
      await userService.updateProfile(user.id, {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
        baseCurrency: editProfileData.baseCurrency,
      })

      // Update local state
      setProfileData(editProfileData)

      // Refresh user profile from auth context to get updated data
      if (refreshUserProfile) {
        await refreshUserProfile()
      }

      setIsEditing(false)
      Alert.alert('Success', 'Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditProfileData(profileData)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    )
  }

  const handleSupport = () => {
    navigation.navigate('Support')
  }

  const handlePrivacy = () => {
    Linking.openURL('https://www.easner.com/privacy')
  }

  const handleTerms = () => {
    Linking.openURL('https://www.easner.com/terms')
  }

  const getSelectedCurrency = () => {
    return currencies.find((c) => c.code === profileData.baseCurrency)
  }

  const formatNumber = (num: number) => {
    // Values less than 1,000: show with decimals (e.g., 12.50)
    if (num < 1000) {
      return num.toFixed(2)
    }
    
    // Values 1,000 to 9,999: show as whole numbers (e.g., 1,000, 1,500)
    if (num < 10000) {
      return num.toLocaleString()
    }
    
    // Values 10,000 and above: apply K/M/B/T rounding
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencies.find((c) => c.code === currency)
    const formattedNumber = formatNumber(amount)
    return `${currencyInfo?.symbol || ''}${formattedNumber}`
  }

  const renderCurrencyPicker = () => (
    <Modal
      visible={showCurrencyPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCurrencyPicker(false)}
    >
      <View style={styles.currencyModalOverlay}>
        <View style={styles.currencyModalContent}>
          <View style={styles.currencyModalHeader}>
            <Text style={styles.currencyModalTitle}>Select Base Currency</Text>
            <TouchableOpacity
              style={styles.currencyCloseButton}
              onPress={() => setShowCurrencyPicker(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currencies}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.currencyItem}
                onPress={() => {
                  setEditProfileData(prev => ({ ...prev, baseCurrency: item.code }))
                  setShowCurrencyPicker(false)
                }}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyFlag}>{getCountryFlag(item.code)}</Text>
                  <View style={styles.currencyDetails}>
                    <Text style={styles.currencyCode}>{item.code}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                  </View>
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  )

  const renderProfileField = (label: string, value: string, onChangeText: (text: string) => void, editable: boolean = true) => (
    <View style={styles.fieldContainer}>
      <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          editable={editable}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
      )}
    </View>
  )

  const renderCurrencyField = () => (
    <View style={styles.fieldContainer}>
      <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>Base Currency</Text>
      {isEditing ? (
        <TouchableOpacity
          style={styles.currencySelector}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <View style={styles.currencySelectorContent}>
            <Text style={styles.currencyFlag}>{getCountryFlag(editProfileData.baseCurrency)}</Text>
            <Text style={styles.currencySelectorText}>
              {editProfileData.baseCurrency} - {currencies.find(c => c.code === editProfileData.baseCurrency)?.name || 'Select Currency'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.currencyDisplay}>
          <Text style={styles.currencyFlag}>{getCountryFlag(profileData.baseCurrency)}</Text>
          <Text style={styles.currencyText}>{profileData.baseCurrency}</Text>
      </View>
      )}
      <Text style={styles.currencyDescription}>
        Used for reporting your total sent amount
      </Text>
    </View>
  )

  const renderMenuButton = (title: string, onPress: () => void, isDestructive: boolean = false) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={[styles.menuButtonText, isDestructive && styles.destructiveText]}>
        {title}
      </Text>
      <Text style={styles.menuButtonArrow}>›</Text>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollContainer}>
      {/* Profile Header */}
      <View style={styles.header}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Manage your account information</Text>
      </View>

        <View style={styles.contentContainer}>
      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile</Text>
          {!isEditing ? (
                <TouchableOpacity onPress={handleEditProfile} style={styles.editButtonContainer}>
                  <Ionicons name="pencil-outline" size={16} color="#3b82f6" />
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
                  <TouchableOpacity onPress={handleCancelEdit} disabled={loading}>
                    <Text style={styles.cancelButton}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
                <Text style={[styles.saveButton, loading && styles.disabledButton]}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

            <View style={styles.profileContent}>
              {isEditing ? (
                <>
        {renderProfileField(
          'First Name',
                    editProfileData.firstName,
                    (text) => setEditProfileData(prev => ({ ...prev, firstName: text }))
        )}
        {renderProfileField(
          'Last Name',
                    editProfileData.lastName,
                    (text) => setEditProfileData(prev => ({ ...prev, lastName: text }))
        )}
        {renderProfileField(
          'Email',
                    editProfileData.email,
                    (text) => setEditProfileData(prev => ({ ...prev, email: text })),
          false // Email should not be editable
        )}
        {renderProfileField(
          'Phone Number',
                    editProfileData.phone,
                    (text) => setEditProfileData(prev => ({ ...prev, phone: text }))
                  )}
                  {renderCurrencyField()}
                </>
              ) : (
                <>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    <Text style={styles.fieldValue}>{profileData.firstName || 'Not set'}</Text>
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <Text style={styles.fieldValue}>{profileData.lastName || 'Not set'}</Text>
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <Text style={styles.fieldValue}>{profileData.email}</Text>
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <Text style={styles.fieldValue}>{profileData.phone || 'Not set'}</Text>
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Base Currency</Text>
                    <View style={styles.currencyDisplay}>
                      <Text style={styles.currencyFlag}>{getCountryFlag(profileData.baseCurrency)}</Text>
                      <Text style={styles.currencyText}>{profileData.baseCurrency}</Text>
                    </View>
                    <Text style={styles.currencyDescription}>
                      Used for reporting your total sent amount
                    </Text>
                  </View>
                </>
              )}
            </View>
      </View>

          {/* Status Section */}
      <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusContent}>
              <View style={styles.statusItem}>
                <View style={styles.statusLeft}>
                  <Ionicons name="mail-outline" size={16} color="#10b981" />
                  <Text style={styles.statusLabel}>Email</Text>
                </View>
                <View style={[styles.statusBadge, userProfile?.profile.verification_status === 'verified' ? styles.verifiedBadge : styles.pendingBadge]}>
                  <Text style={[styles.statusBadgeText, userProfile?.profile.verification_status === 'verified' ? styles.verifiedText : styles.pendingText]}>
                    {userProfile?.profile.verification_status === 'verified' ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusStats}>
                <View style={styles.statusStatItem}>
                  <Text style={styles.statusStatLabel}>Member since</Text>
                  <Text style={styles.statusStatValue}>{userStats.memberSince}</Text>
                </View>
                <View style={styles.statusStatItem}>
                  <Text style={styles.statusStatLabel}>Total transactions</Text>
                  <Text style={styles.statusStatValue}>{userStats.totalTransactions}</Text>
                </View>
                <View style={styles.statusStatItem}>
                  <Text style={styles.statusStatLabel}>Total sent</Text>
                  <Text style={styles.statusStatValue}>{formatCurrency(userStats.totalSent, profileData.baseCurrency)}</Text>
                </View>
              </View>
            </View>
      </View>

          {/* App Actions */}
      <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
        {renderMenuButton('Support', handleSupport)}
        {renderMenuButton('Privacy Policy', handlePrivacy)}
        {renderMenuButton('Terms of Service', handleTerms)}
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        {renderMenuButton('Sign Out', handleSignOut, true)}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
        </View>

        {/* Currency Picker Modal */}
        {renderCurrencyPicker()}
    </ScrollView>
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
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  editButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    textAlign: 'center',
  },
  disabledButton: {
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
  },
  profileContent: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabelEdit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    fontWeight: '500',
  },
  currencySelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyFlag: {
    fontSize: 16,
  },
  currencySelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  currencyText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  currencyDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusContent: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#92400e',
  },
  statusDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  statusStats: {
    gap: 12,
  },
  statusStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusStatLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusStatValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  destructiveText: {
    color: '#ef4444',
  },
  menuButtonArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // Currency Picker Modal Styles
  currencyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  currencyModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  currencyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  currencyModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  currencyCloseButton: {
    padding: 4,
  },
  currencyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
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
})
