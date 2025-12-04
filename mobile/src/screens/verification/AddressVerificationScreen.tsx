import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import { countryService, Country, getCountryFlag } from '../../lib/countryService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { HapticButton } from '../../components/premium'
import { getAddressFormat } from '../../lib/addressFormats'
import { getDocumentTypesForCountry, AddressDocumentType } from '../../lib/addressDocumentTypes'

function AddressVerificationContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const insets = useSafeAreaInsets()
  const [submission, setSubmission] = useState<KYCSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  // Structured address fields
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [selectedDocumentType, setSelectedDocumentType] = useState<AddressDocumentType | ''>('')
  const [addressFile, setAddressFile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showDocumentTypePicker, setShowDocumentTypePicker] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

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

  // Get document types based on selected country
  const documentTypes = selectedCountry ? getDocumentTypesForCountry(selectedCountry) : []
  
  // Get address format for selected country
  const addressFormat = selectedCountry ? getAddressFormat(selectedCountry) : null

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    if (!userProfile?.id) return

    const loadSubmission = async () => {
      try {
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        
        if (cached) {
          const { value, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            const submissions = value as KYCSubmission[]
            const addressSubmission = submissions.find(s => s.type === "address")
            if (addressSubmission) {
              setSubmission(addressSubmission)
              setSelectedCountry(addressSubmission.country_code || '')
              // Parse structured address from metadata or free text
              if (addressSubmission.metadata?.address) {
                const addr = addressSubmission.metadata.address
                setAddressLine1(addr.line1 || '')
                setAddressLine2(addr.line2 || '')
                setCity(addr.city || '')
                setState(addr.state || '')
                setPostalCode(addr.postalCode || '')
              } else if (addressSubmission.address) {
                // Fallback: try to parse free text (basic parsing)
                setAddressLine1(addressSubmission.address)
              }
              setSelectedDocumentType((addressSubmission.document_type as AddressDocumentType) || '')
              setLoading(false)
              fetchSubmission()
              return
            }
          }
        }

        await fetchSubmission()
      } catch (error) {
        console.error('Error loading submission:', error)
        setLoading(false)
      }
    }

    const fetchSubmission = async () => {
      try {
        const submissions = await kycService.getByUserId(userProfile.id)
        const addressSubmission = submissions.find(s => s.type === "address")
        if (addressSubmission) {
          setSubmission(addressSubmission)
          setSelectedCountry(addressSubmission.country_code || '')
          // Parse structured address from metadata or free text
          if (addressSubmission.metadata?.address) {
            const addr = addressSubmission.metadata.address
            setAddressLine1(addr.line1 || '')
            setAddressLine2(addr.line2 || '')
            setCity(addr.city || '')
            setState(addr.state || '')
            setPostalCode(addr.postalCode || '')
          } else if (addressSubmission.address) {
            // Fallback: try to parse free text (basic parsing)
            setAddressLine1(addressSubmission.address)
          }
          setSelectedDocumentType((addressSubmission.document_type as AddressDocumentType) || '')
        }
        
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value: submissions,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching submission:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmission()
  }, [userProfile?.id])

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll()
      setCountries(data)
    } catch (error) {
      console.error('Error loading countries:', error)
    }
  }

  const handleFileSelect = async () => {
    try {
      // Request permissions for iOS
      if (Platform.OS === 'ios') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant photo library access to select images')
          return
        }
      }

      // Show action sheet to choose between camera, photos, or files
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Select Proof of Address',
          'Choose how you want to select your document',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Take Photo', 
              onPress: async () => {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                })
                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0]
                  const file = {
                    uri: asset.uri,
                    name: `address_proof_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setAddressFile(file)
                  setUploadError(null)
                }
              }
            },
            { 
              text: 'Choose from Photos', 
              onPress: async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                })
                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0]
                  const file = {
                    uri: asset.uri,
                    name: `address_proof_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setAddressFile(file)
                  setUploadError(null)
                }
              }
            },
            { 
              text: 'Browse Files', 
              onPress: async () => {
      const result = await DocumentPicker.getDocumentAsync({
                  type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0]
        if (file.size && file.size > 10 * 1024 * 1024) {
          setUploadError('File size must be less than 10MB')
          return
        }
        setAddressFile(file)
        setUploadError(null)
                }
              }
            },
          ]
        )
      } else {
        // Android: Use document picker with image types (allows selecting from Photos/Gallery)
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        })
        if (!result.canceled && result.assets[0]) {
          const file = result.assets[0]
          if (file.size && file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB')
            return
          }
          setAddressFile(file)
          setUploadError(null)
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      setUploadError('Failed to select file')
    }
  }

  // Validation: Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return !!(
      selectedCountry &&
      addressLine1 &&
      city &&
      postalCode &&
      selectedDocumentType &&
      addressFile
    )
  }, [selectedCountry, addressLine1, city, postalCode, selectedDocumentType, addressFile])

  const handleSubmit = async () => {
    if (!selectedCountry) {
      setUploadError('Please select a country')
      return
    }
    
    if (!addressLine1 || !city || !postalCode) {
      setUploadError('Please fill in all required address fields (Street Address, City, Postal Code)')
      return
    }
    
    if (!selectedDocumentType || !addressFile || !userProfile?.id) {
      setUploadError('Please select a document type and upload a file')
      return
    }

    if (submission && (submission.status === "in_review" || submission.status === "approved")) {
      setUploadError('Your address verification is already under review or approved. You cannot upload a new document.')
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      // Build structured address
      const structuredAddress = {
        line1: addressLine1,
        line2: addressLine2 || undefined,
        city: city,
        state: addressFormat?.state ? state : undefined,
        postalCode: postalCode,
        country: selectedCountry,
      }
      
      // Store as free text for backward compatibility, and structured in metadata
      const addressText = [addressLine1, addressLine2, city, state, postalCode]
        .filter(Boolean)
        .join(', ')
      
      const newSubmission = await kycService.createAddressSubmission(userProfile.id, {
        country_code: selectedCountry,
        address: addressText, // Free text for backward compatibility
        document_type: selectedDocumentType as AddressDocumentType,
        address_document_file: addressFile,
        metadata: {
          address: structuredAddress, // Store structured address in metadata
        },
      })

      setSubmission(newSubmission)
      setAddressFile(null)

      // Update cache - sanitize submission to remove any non-serializable data
      const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
      const cached = await AsyncStorage.getItem(CACHE_KEY)
      let submissions: KYCSubmission[] = []
      if (cached) {
        const { value } = JSON.parse(cached)
        submissions = value || []
      }
      
      // Create a sanitized version of the submission for caching (remove any file references)
      const sanitizedSubmission: KYCSubmission = {
        id: newSubmission.id,
        user_id: newSubmission.user_id,
        type: newSubmission.type,
        status: newSubmission.status,
        country_code: newSubmission.country_code,
        full_name: newSubmission.full_name,
        date_of_birth: newSubmission.date_of_birth,
        id_type: newSubmission.id_type,
        id_document_url: newSubmission.id_document_url,
        id_document_filename: newSubmission.id_document_filename,
        document_type: newSubmission.document_type,
        address: newSubmission.address,
        address_document_url: newSubmission.address_document_url,
        address_document_filename: newSubmission.address_document_filename,
        reviewed_by: newSubmission.reviewed_by,
        reviewed_at: newSubmission.reviewed_at,
        rejection_reason: newSubmission.rejection_reason,
        // Sanitize metadata - remove any file objects or non-serializable data
        metadata: (() => {
          if (!newSubmission.metadata) return null
          try {
            return JSON.parse(JSON.stringify(newSubmission.metadata))
          } catch {
            // If metadata can't be serialized, return a safe copy without file references
            const safeMetadata: any = {}
            for (const key in newSubmission.metadata) {
              const value = newSubmission.metadata[key]
              // Only include primitive values and serializable objects
              if (value !== null && typeof value !== 'object' && typeof value !== 'function') {
                safeMetadata[key] = value
              } else if (typeof value === 'object' && !(value instanceof File || value instanceof Blob)) {
                try {
                  JSON.stringify(value)
                  safeMetadata[key] = value
                } catch {
                  // Skip non-serializable objects
                }
              }
            }
            return safeMetadata
          }
        })(),
        created_at: newSubmission.created_at,
        updated_at: newSubmission.updated_at,
      }
      
      const existingIndex = submissions.findIndex(s => s.type === "address")
      if (existingIndex >= 0) {
        submissions[existingIndex] = sanitizedSubmission
      } else {
        submissions.push(sanitizedSubmission)
      }
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        value: submissions,
        timestamp: Date.now()
      }))

      Alert.alert('Success', 'Address verification submitted successfully')
    } catch (error: any) {
      console.error('Error uploading address document:', error)
      setUploadError(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeTextGreen}>Done</Text>
          </View>
        )
      case "in_review":
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
      default:
        return (
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>Pending</Text>
          </View>
        )
    }
  }

  const selectedCountryData = countries.find(c => c.code === selectedCountry)
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  if (loading && !submission) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
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
              <Text style={styles.title}>Address Verification</Text>
              <Text style={styles.subtitle}>Verify your address with a document</Text>
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
            {submission ? (
              <>
                {/* Record view */}
                <View style={styles.recordCard}>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Country</Text>
                    <Text style={styles.recordValue}>
                      {selectedCountryData
                        ? `${selectedCountryData.flag_emoji} ${selectedCountryData.name}`
                        : submission.country_code || '-'}
                    </Text>
                  </View>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Address</Text>
                    <Text style={styles.recordValue}>{submission.address || '-'}</Text>
                  </View>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Document Type</Text>
                    <Text style={styles.recordValue}>
                      {submission.document_type === 'utility_bill' ? 'Utility Bill' : 
                       submission.document_type === 'bank_statement' ? 'Bank Statement' :
                       submission.document_type === 'lease_agreement' ? 'Residential Lease Agreement' : '-'}
                    </Text>
                  </View>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Document</Text>
                    <Text style={styles.recordValue}>
                      {submission.address_document_filename || '-'}
                    </Text>
                  </View>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Status</Text>
                    <View style={styles.recordValue}>
                      {getStatusBadge(submission.status)}
                    </View>
                  </View>
                </View>

                {submission.status === "in_review" && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                      <Text style={styles.infoText}>
                        Your KYC address information is in review. We will provide an update account soonest. Please check your email for updates.
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              // Form view
              <View style={styles.formCard}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Country</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setShowCountryPicker(true)
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !selectedCountry && styles.selectPlaceholder]}>
                      {selectedCountryData
                        ? `${selectedCountryData.flag_emoji} ${selectedCountryData.name}`
                        : 'Select your country'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Standard Address Fields - shown alongside country picker */}
                <View style={styles.formField}>
                  <Text style={styles.label}>Street Address</Text>
                  <TextInput
                    style={styles.input}
                    value={addressLine1}
                    onChangeText={setAddressLine1}
                    placeholder="Enter street address"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Apartment, Suite, etc. (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={addressLine2}
                    onChangeText={setAddressLine2}
                    placeholder="Apartment, suite, unit, etc."
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter city"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>State/Province</Text>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="Enter state or province (if applicable)"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="Enter postal code"
                    placeholderTextColor={colors.text.secondary}
                    keyboardType="default"
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                {/* Document Type and Upload - only show after country is selected */}
                {selectedCountry && documentTypes.length > 0 && (
                  <>
                <View style={styles.formField}>
                  <Text style={styles.label}>Document Type</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setShowDocumentTypePicker(true)
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !selectedDocumentType && styles.selectPlaceholder]}>
                      {selectedDocumentType
                        ? documentTypes.find(dt => dt.value === selectedDocumentType)?.label
                        : 'Select document type'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Address Document</Text>
                  <TouchableOpacity
                    style={[styles.uploadButton, addressFile && styles.uploadButtonSuccess]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      handleFileSelect()
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={addressFile ? "checkmark-circle" : "cloud-upload"}
                      size={24}
                      color={addressFile ? colors.success.main : colors.text.secondary}
                    />
                    <Text style={[styles.uploadText, addressFile && styles.uploadTextSuccess]}>
                      {addressFile ? addressFile.name : 'Upload Document'}
                    </Text>
                  </TouchableOpacity>
                </View>
                  </>
                )}

                {uploadError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{uploadError}</Text>
                  </View>
                )}

                <HapticButton
                  title={uploading ? "Submitting..." : "Submit"}
                  onPress={handleSubmit}
                  disabled={uploading || !isFormValid}
                  style={styles.submitButton}
                  textStyle={styles.submitButtonText}
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCountryPicker(false)
          setCountrySearch('') // Clear search when closing
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowCountryPicker(false)
              setCountrySearch('') // Clear search when closing
            }}
          />
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowCountryPicker(false)
                  setCountrySearch('') // Clear search when closing
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item.code)
                    setShowCountryPicker(false)
                    setCountrySearch('') // Clear search when selecting
                    // Reset document type when country changes
                    setSelectedDocumentType('')
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag_emoji}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No countries found</Text>
                </View>
              }
              style={styles.occupationList}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Document Type Picker Modal */}
      <Modal
        visible={showDocumentTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDocumentTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowDocumentTypePicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <TouchableOpacity 
                onPress={() => setShowDocumentTypePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedCountry ? getDocumentTypesForCountry(selectedCountry) : []}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedDocumentType(item.value as AddressDocumentType)
                    setShowDocumentTypePicker(false)
                  }}
                >
                  <Text style={styles.countryName}>{item.label}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: spacing[4] }}
            />
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
  recordCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[4],
    padding: spacing[5],
  },
  recordField: {
    gap: spacing[1],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
  },
  recordLabel: {
    ...textStyles.labelSmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
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
    color: colors.warning.main,
    flex: 1,
  },
  formCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[5],
  },
  formField: {
    gap: spacing[2],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
  },
  label: {
    ...textStyles.bodySmall,
    fontWeight: '500',
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.bodyMedium,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    fontSize: 13,
    minHeight: 48,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing[3],
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    backgroundColor: colors.background.primary,
  },
  selectText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  selectPlaceholder: {
    color: colors.text.secondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    backgroundColor: colors.background.primary,
  },
  uploadButtonSuccess: {
    borderColor: colors.success.main,
    backgroundColor: colors.success.background,
  },
  uploadText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  uploadTextSuccess: {
    color: colors.success.main,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: colors.error.background,
    borderWidth: 1,
    borderColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
  },
  submitButton: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
  },
  submitButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  badgeGreen: {
    backgroundColor: colors.success.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
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
    alignSelf: 'flex-start',
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
    alignSelf: 'flex-start',
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
    alignSelf: 'flex-start',
  },
  badgeTextGray: {
    ...textStyles.labelSmall,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    maxHeight: '70%',
    paddingTop: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentLarge: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    height: '90%',
    paddingTop: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  searchInputContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    ...textStyles.bodyMedium,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[3],
  },
  countryFlag: {
    fontSize: 20,
  },
  countryName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  occupationList: {
    flex: 1,
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
})

export default function AddressVerificationScreen(props: NavigationProps) {
  return <AddressVerificationContent {...props} />
}





