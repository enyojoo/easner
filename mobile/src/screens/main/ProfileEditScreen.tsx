import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { userService, UserProfileData, UserStats } from '../../lib/userService'
import { getCountryFlag } from '../../utils/flagUtils'

function ProfileEditContent({ navigation }: NavigationProps) {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { transactions, currencies, exchangeRates } = useUserData()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    baseCurrency: 'NGN',
  })
  const [editProfileData, setEditProfileData] = useState(profileData)

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
      await userService.updateProfile(user.id, {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
        baseCurrency: editProfileData.baseCurrency,
      })

      setProfileData(editProfileData)

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

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Your Profile</Text>
            <Text style={styles.subtitle}>Manage your personal information</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Profile Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={handleEditProfile} style={styles.editButtonContainer}>
                  <Ionicons name="pencil-outline" size={16} color="#007ACC" />
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
                    false
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
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
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
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
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
  },
  cancelButton: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButton: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007ACC',
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  profileContent: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabelEdit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 8,
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
    marginTop: 4,
  },
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

export default function ProfileEditScreen(props: NavigationProps) {
  return <ProfileEditContent {...props} />
}





