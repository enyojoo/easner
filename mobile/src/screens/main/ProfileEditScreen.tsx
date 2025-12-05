import React, { useState, useEffect, useRef } from 'react'
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
  Animated,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps } from '../../types'
import { userService, UserProfileData, UserStats } from '../../lib/userService'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

function ProfileEditContent({ navigation }: NavigationProps) {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { transactions } = useUserData()
  const insets = useSafeAreaInsets()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [editProfileData, setEditProfileData] = useState(profileData)

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

  useEffect(() => {
    if (userProfile) {
      const data = {
        firstName: userProfile.profile.first_name || '',
        middleName: userProfile.profile.middle_name || userProfile.middle_name || '',
        lastName: userProfile.profile.last_name || '',
        email: userProfile.profile.email || '',
        phone: userProfile.profile.phone || '',
      }
      setProfileData(data)
      setEditProfileData(data)
    }
  }, [userProfile])

  const handleEditProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await userService.updateProfile(user.id, {
        firstName: editProfileData.firstName,
        middleName: editProfileData.middleName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
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

  const handleCancelEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEditProfileData(profileData)
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // TODO: Implement delete account API call
    Alert.alert('Info', 'Delete account functionality will be implemented')
    setShowDeleteDialog(false)
  }

  const renderProfileField = (label: string, value: string, onChangeText: (text: string) => void, disabled: boolean = false) => {
    const isKycApproved = userProfile?.bridge_kyc_status === 'approved'
    const isEditable = isEditing && !disabled && !isKycApproved
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>
          {label}
          {isKycApproved && (label === 'First Name' || label === 'Middle Name' || label === 'Last Name') && (
            <Text style={{ fontSize: 12, color: colors.text.tertiary }}> (Verified - cannot edit)</Text>
          )}
        </Text>
        {isEditable ? (
          <TextInput
            style={styles.fieldInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            editable={true}
          />
        ) : (
          <Text style={[styles.fieldValue, (disabled || isKycApproved) && { color: colors.text.tertiary }]}>
            {value || 'Not set'}
          </Text>
        )}
      </View>
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
              <Text style={styles.title}>Your Profile</Text>
              <Text style={styles.subtitle}>Manage your personal information</Text>
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
            {/* Profile Information */}
            <View style={styles.profileCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Profile Information</Text>
                <View style={styles.buttonContainer}>
                  {!isEditing ? (
                    <TouchableOpacity 
                      onPress={handleEditProfile} 
                      style={styles.actionButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity 
                        onPress={handleCancelEdit} 
                        disabled={loading}
                        activeOpacity={0.7}
                        style={styles.actionButtonSecondary}
                      >
                        <Text style={styles.actionButtonTextSecondary}>Discard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleSaveProfile} 
                        disabled={loading}
                        activeOpacity={0.7}
                        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                      >
                        {loading ? (
                          <ActivityIndicator size={11} color={colors.text.inverse} />
                        ) : (
                          <Text style={styles.actionButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.profileContent}>
                {isEditing ? (
                  <>
                    {renderProfileField(
                      'First Name',
                      editProfileData.firstName,
                      (text) => setEditProfileData(prev => ({ ...prev, firstName: text })),
                      userProfile?.bridge_kyc_status === 'approved' // Disable if KYC approved
                    )}
                    {renderProfileField(
                      'Middle Name',
                      editProfileData.middleName,
                      (text) => setEditProfileData(prev => ({ ...prev, middleName: text })),
                      userProfile?.bridge_kyc_status === 'approved' // Disable if KYC approved
                    )}
                    {renderProfileField(
                      'Last Name',
                      editProfileData.lastName,
                      (text) => setEditProfileData(prev => ({ ...prev, lastName: text })),
                      userProfile?.bridge_kyc_status === 'approved' // Disable if KYC approved
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
                  </>
                ) : (
                  <>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>First Name</Text>
                      <Text style={styles.fieldValue}>{profileData.firstName || 'Not set'}</Text>
                    </View>
                    {profileData.middleName && (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Middle Name</Text>
                        <Text style={styles.fieldValue}>{profileData.middleName}</Text>
                      </View>
                    )}
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
                  </>
                )}
              </View>
            </View>

            {/* Delete Account Section */}
            <View style={styles.deleteSection}>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setShowDeleteDialog(true)
                }}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setShowDeleteDialog(false)
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalButtonTextConfirm}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
    height: 32,
  },
  actionButtonSecondary: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
    height: 32,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    ...textStyles.labelMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    ...textStyles.labelMedium,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  profileContent: {
    gap: spacing[4],
  },
  fieldContainer: {
    marginBottom: spacing[4],
  },
  fieldLabel: {
    ...textStyles.labelSmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabelEdit: {
    ...textStyles.labelSmall,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    fontFamily: 'Outfit-Regular',
  },
  fieldValue: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    paddingVertical: spacing[2],
    fontWeight: '500',
  },
  deleteSection: {
    marginTop: spacing[2],
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  deleteButtonText: {
    ...textStyles.labelMedium,
    color: colors.error.main,
    fontWeight: '500',
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
    marginBottom: spacing[5],
    lineHeight: 22,
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
    ...textStyles.labelMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    ...textStyles.labelMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
})

export default function ProfileEditScreen(props: NavigationProps) {
  return <ProfileEditContent {...props} />
}
