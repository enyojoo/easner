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
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
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
import { supabase } from '../../lib/supabase'

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
    easetag: '',
    dateOfBirth: '',
  })
  const [editProfileData, setEditProfileData] = useState(profileData)
  const [checkingEasetag, setCheckingEasetag] = useState(false)
  const [easetagAvailable, setEasetagAvailable] = useState<boolean | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Initialize with existing date or default to 25 years ago
    if (userProfile?.profile?.date_of_birth) {
      return new Date(userProfile.profile.date_of_birth)
    }
    const date = new Date()
    date.setFullYear(date.getFullYear() - 25)
    return date
  })

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
      const dob = userProfile.profile.date_of_birth || ''
      const data = {
        firstName: userProfile.profile.first_name || '',
        middleName: userProfile.profile.middle_name || '',
        lastName: userProfile.profile.last_name || '',
        email: userProfile.profile.email || '',
        phone: userProfile.profile.phone || '',
        easetag: userProfile.profile.easetag || '',
        dateOfBirth: dob,
      }
      setProfileData(data)
      setEditProfileData(data)
      if (dob) {
        setSelectedDate(new Date(dob))
      } else {
        // Default to 25 years ago if no date
        const date = new Date()
        date.setFullYear(date.getFullYear() - 25)
        setSelectedDate(date)
      }
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

    // Validate easetag if provided
    if (editProfileData.easetag && easetagAvailable === false) {
      Alert.alert('Error', 'Easetag is not available. Please choose a different one.')
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
        easetag: editProfileData.easetag,
        dateOfBirth: editProfileData.dateOfBirth,
      })

      // Update profileData with the response from the server to ensure consistency
      const updatedProfileData = {
        ...editProfileData,
        dateOfBirth: editProfileData.dateOfBirth, // Keep the formatted date we just set
      }
      setProfileData(updatedProfileData)

      if (refreshUserProfile) {
        await refreshUserProfile()
      }

      setIsEditing(false)
      setEasetagAvailable(null)
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
    setEasetagAvailable(null)
    if (easetagCheckTimeout.current) {
      clearTimeout(easetagCheckTimeout.current)
    }
  }

  // Check easetag availability
  const checkEasetagAvailability = async (easetag: string) => {
    if (!easetag || easetag === profileData.easetag) {
      setEasetagAvailable(null)
      return
    }

    setCheckingEasetag(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const cleanTag = easetag.replace(/^@/, "").toLowerCase()
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(
        `${apiUrl}/api/username/check?easetag=${encodeURIComponent(cleanTag)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setEasetagAvailable(data.available && data.valid)
      } else {
        setEasetagAvailable(false)
      }
    } catch (error) {
      console.error('Error checking easetag:', error)
      setEasetagAvailable(false)
    } finally {
      setCheckingEasetag(false)
    }
  }

  // Debounce easetag check
  const easetagCheckTimeout = useRef<NodeJS.Timeout | null>(null)
  const handleEasetagChange = (text: string) => {
    // Remove @ if user types it, we'll add it in display
    const cleanText = text.replace(/^@/, "")
    setEditProfileData(prev => ({ ...prev, easetag: cleanText }))
    
    // Clear previous timeout
    if (easetagCheckTimeout.current) {
      clearTimeout(easetagCheckTimeout.current)
    }

    // Check availability after 500ms delay
    if (cleanText.length >= 3) {
      easetagCheckTimeout.current = setTimeout(() => {
        checkEasetagAvailability(cleanText)
      }, 500)
    } else {
      setEasetagAvailable(null)
    }
  }

  // Helper function to format date as YYYY-MM-DD using local timezone
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
      if (event.type === 'set' && date) {
        setSelectedDate(date)
        const dateString = formatDateToISO(date) // Use local timezone
        setEditProfileData(prev => ({ ...prev, dateOfBirth: dateString }))
      }
    } else {
      // iOS - update date as user scrolls
      if (date) {
        setSelectedDate(date)
      }
    }
  }

  const handleDatePickerConfirm = () => {
    // iOS only - called when user taps "Done"
    if (selectedDate) {
      const dateString = formatDateToISO(selectedDate) // Use local timezone
      setEditProfileData(prev => ({ ...prev, dateOfBirth: dateString }))
    }
    setShowDatePicker(false)
  }

  const handleDatePickerCancel = () => {
    // iOS only - restore original date if cancelled
    if (editProfileData.dateOfBirth) {
      setSelectedDate(new Date(editProfileData.dateOfBirth))
    }
    setShowDatePicker(false)
  }

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const handleDeleteAccount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // TODO: Implement delete account API call
    Alert.alert('Info', 'Delete account functionality will be implemented')
    setShowDeleteDialog(false)
  }

  const renderProfileField = (label: string, value: string, onChangeText: (text: string) => void, disabled: boolean = false) => {
    // In edit mode, show TextInput unless the field is explicitly disabled
    const showInput = isEditing && !disabled
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>
          {label}
        </Text>
        {showInput ? (
          <TextInput
            style={styles.fieldInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            editable={true}
            autoCapitalize="words"
          />
        ) : (
          <Text style={[styles.fieldValue, disabled && { color: colors.text.tertiary }]}>
            {value || 'Not set'}
          </Text>
        )}
      </View>
    )
  }

  const renderDateOfBirthField = () => (
    <View style={styles.fieldContainer}>
      <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>Date of Birth</Text>
      {isEditing ? (
        <>
          <TouchableOpacity
            style={[styles.fieldInput, styles.dateInputContainer]}
            onPress={() => {
              // Initialize selectedDate with current value when opening picker
              if (editProfileData.dateOfBirth) {
                setSelectedDate(new Date(editProfileData.dateOfBirth))
              }
              setShowDatePicker(true)
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dateInputText,
              !editProfileData.dateOfBirth && { color: colors.text.tertiary }
            ]}>
              {editProfileData.dateOfBirth 
                ? formatDateOfBirth(editProfileData.dateOfBirth)
                : 'Select date of birth'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
          
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              animationType="slide"
              transparent={true}
              onRequestClose={handleDatePickerCancel}
            >
              <View style={styles.dateModalOverlay}>
                <View style={[styles.dateModalContent, { paddingBottom: insets.bottom }]}>
                  <View style={styles.dateModalHeader}>
                    <TouchableOpacity
                      style={styles.dateCancelButton}
                      onPress={handleDatePickerCancel}
                    >
                      <Text style={styles.dateCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.dateModalTitle}>Select Date of Birth</Text>
                    <TouchableOpacity
                      style={styles.dateConfirmButtonHeader}
                      onPress={handleDatePickerConfirm}
                    >
                      <Text style={styles.dateConfirmButtonTextHeader}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      textColor={colors.text.primary}
                      style={styles.datePicker}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )
          )}
        </>
      ) : (
        <Text style={styles.fieldValue}>
          {formatDateOfBirth(profileData.dateOfBirth)}
        </Text>
      )}
    </View>
  )

  const renderEasetagField = () => (
    <View style={styles.fieldContainer}>
      <View style={styles.easetagLabelContainer}>
        <Text style={isEditing ? styles.fieldLabelEdit : styles.fieldLabel}>Easetag</Text>
        {isEditing && editProfileData.easetag && !checkingEasetag && (
          <View style={styles.easetagStatusContainer}>
            {easetagAvailable === true && (
              <>
                <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
                <Text style={[styles.easetagStatusTextInline, { color: colors.success.main }]}>
                  Available
                </Text>
              </>
            )}
            {easetagAvailable === false && (
              <>
                <Ionicons name="close-circle" size={16} color={colors.error.main} />
                <Text style={[styles.easetagStatusTextInline, { color: colors.error.main }]}>
                  Taken
                </Text>
              </>
            )}
            {easetagAvailable === null && editProfileData.easetag.length < 3 && (
              <Text style={[styles.easetagStatusTextInline, { color: colors.text.tertiary }]}>
                Min 3 chars
              </Text>
            )}
          </View>
        )}
      </View>
      {isEditing ? (
        <View>
          <View style={styles.easetagInputContainer}>
            <Text style={styles.easetagPrefix}>@</Text>
            <TextInput
              style={styles.easetagInput}
              value={editProfileData.easetag}
              onChangeText={handleEasetagChange}
              placeholder="youreasetag"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              maxLength={20}
            />
            {checkingEasetag && (
              <View style={styles.easetagSpinnerContainer}>
                <ActivityIndicator size="small" color={colors.text.tertiary} />
              </View>
            )}
          </View>
          <Text style={[styles.fieldDescription, { color: colors.text.tertiary }]}>
            People can send you money for free using your Easetag.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.fieldValue}>
            {profileData.easetag ? `@${profileData.easetag}` : 'Not set'}
          </Text>
          <Text style={[styles.fieldDescription, { color: colors.text.tertiary }]}>
            People can send you money for free using your Easetag.
          </Text>
        </>
      )}
    </View>
  )


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
                      (text) => setEditProfileData(prev => ({ ...prev, firstName: text }))
                    )}
                    {renderProfileField(
                      'Middle Name',
                      editProfileData.middleName,
                      (text) => setEditProfileData(prev => ({ ...prev, middleName: text }))
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
                      true // Email should not be editable
                    )}
                    {renderProfileField(
                      'Phone Number',
                      editProfileData.phone,
                      (text) => setEditProfileData(prev => ({ ...prev, phone: text }))
                    )}
                    {renderDateOfBirthField()}
                    {renderEasetagField()}
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
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Date of Birth</Text>
                      <Text style={styles.fieldValue}>{formatDateOfBirth(profileData.dateOfBirth)}</Text>
                    </View>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Easetag</Text>
                      <Text style={styles.fieldValue}>
                        {profileData.easetag ? `@${profileData.easetag}` : 'Not set'}
                      </Text>
                      <Text style={[styles.fieldDescription, { color: colors.text.tertiary }]}>
                        People can send you money for free using your Easetag.
                      </Text>
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
    marginBottom: spacing[2],
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
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  profileContent: {
    gap: spacing[2],
  },
  fieldContainer: {
    marginBottom: spacing[2],
  },
  fieldLabel: {
    ...textStyles.labelSmall,
    color: colors.text.secondary,
    marginBottom: spacing[0.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabelEdit: {
    ...textStyles.labelSmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.xl,
    padding: spacing[2],
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    fontFamily: 'Outfit-Regular',
  },
  fieldValue: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    paddingVertical: spacing[1],
    fontWeight: '500',
  },
  fieldDescription: {
    ...textStyles.bodySmall,
    marginTop: spacing[1],
  },
  easetagLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  easetagStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  easetagStatusTextInline: {
    ...textStyles.bodySmall,
    fontSize: 11,
    fontWeight: '500',
  },
  easetagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  easetagPrefix: {
    ...textStyles.bodyLarge,
    color: colors.text.secondary,
    paddingLeft: spacing[3],
    paddingRight: spacing[1],
    fontWeight: '500',
  },
  easetagInput: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingRight: spacing[3],
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
  },
  easetagSpinnerContainer: {
    paddingRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    flex: 1,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: spacing[4],
    width: '100%',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
    width: '100%',
  },
  datePickerWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  dateModalTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dateCancelButton: {
    padding: spacing[1],
  },
  dateCancelButtonText: {
    ...textStyles.labelMedium,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  dateConfirmButtonHeader: {
    padding: spacing[1],
  },
  dateConfirmButtonTextHeader: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontWeight: '600',
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
