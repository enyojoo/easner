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
import DateTimePicker from '@react-native-community/datetimepicker'
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
import { getIdTypesForCountry, getIdTypeLabel } from '../../lib/countryIdTypes'
import { isUSACountry, isEEACountry, getBridgeRequiredFields, EMPLOYMENT_STATUS_OPTIONS, EXPECTED_MONTHLY_OPTIONS, ACCOUNT_PURPOSE_OPTIONS, SOURCE_OF_FUNDS_OPTIONS, OCCUPATION_OPTIONS, getKycOptions } from '../../lib/bridgeKycHelpers'
import { countryCodeAlpha2ToAlpha3 } from '../../lib/bridgeHelpers'
import { fileToBase64 } from '../../lib/fileUtils'
import { apiGet } from '../../lib/apiClient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { HapticButton } from '../../components/premium'

function IdentityVerificationContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const insets = useSafeAreaInsets()
  const [submission, setSubmission] = useState<KYCSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [dateOfBirthDate, setDateOfBirthDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedIdType, setSelectedIdType] = useState('')
  const [identityFile, setIdentityFile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showIdTypePicker, setShowIdTypePicker] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [occupationSearch, setOccupationSearch] = useState('')
  
  // Bridge-specific fields - US
  const [ssn, setSsn] = useState('')
  const [dlNumber, setDlNumber] = useState('')
  const [dlFrontFile, setDlFrontFile] = useState<any>(null)
  const [dlBackFile, setDlBackFile] = useState<any>(null)
  
  // Bridge-specific fields - International (EEA + Other)
  const [phone, setPhone] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [expectedMonthly, setExpectedMonthly] = useState('')
  const [accountPurpose, setAccountPurpose] = useState('')
  const [sourceOfFunds, setSourceOfFunds] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [passportFrontFile, setPassportFrontFile] = useState<any>(null)
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<any>(null)
  const [nationalIdBackFile, setNationalIdBackFile] = useState<any>(null)
  
  // Bridge-specific fields - International only (non-US, non-EEA)
  const [mostRecentOccupation, setMostRecentOccupation] = useState('')
  const [actingAsIntermediary, setActingAsIntermediary] = useState('no') // Default to "no"
  
  // Bridge KYC options - all static, no API calls needed
  const kycOptions = getKycOptions()
  const occupationOptions = kycOptions.occupationCodes
  const sourceOfFundsOptions = kycOptions.sourceOfFunds
  const employmentStatusOptions = kycOptions.employmentStatus
  
  // Dropdown pickers for Bridge fields
  const [showEmploymentPicker, setShowEmploymentPicker] = useState(false)
  const [showExpectedMonthlyPicker, setShowExpectedMonthlyPicker] = useState(false)
  const [showAccountPurposePicker, setShowAccountPurposePicker] = useState(false)
  const [showSourceOfFundsPicker, setShowSourceOfFundsPicker] = useState(false)
  const [showMostRecentOccupationPicker, setShowMostRecentOccupationPicker] = useState(false)
  const [showActingAsIntermediaryPicker, setShowActingAsIntermediaryPicker] = useState(false)

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
            const identity = submissions.find(s => s.type === "identity")
            if (identity) {
              setSubmission(identity)
              setFullName(identity.full_name || '')
              const dob = identity.date_of_birth || ''
              setDateOfBirth(dob)
              // Parse date string to Date object for picker
              if (dob) {
                const parsedDate = new Date(dob)
                if (!isNaN(parsedDate.getTime())) {
                  setDateOfBirthDate(parsedDate)
                }
              }
              setSelectedCountry(identity.country_code || '')
              setSelectedIdType(identity.id_type || '')
              
              // Load metadata fields if they exist
              if (identity.metadata) {
                try {
                  const metadata = typeof identity.metadata === 'string' 
                    ? JSON.parse(identity.metadata) 
                    : identity.metadata
                  
                  if (metadata.mostRecentOccupation) {
                    setMostRecentOccupation(String(metadata.mostRecentOccupation))
                  }
                  if (metadata.actingAsIntermediary) {
                    setActingAsIntermediary(metadata.actingAsIntermediary)
                  } else {
                    setActingAsIntermediary('no')
                  }
                } catch (error) {
                  console.error('Error parsing metadata:', error)
                  setActingAsIntermediary('no')
                }
              } else {
                setActingAsIntermediary('no')
              }
              
              setLoading(false)
              // Fetch in background
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
        const identity = submissions.find(s => s.type === "identity")
        if (identity) {
          setSubmission(identity)
          setFullName(identity.full_name || '')
          const dob = identity.date_of_birth || ''
          setDateOfBirth(dob)
          // Parse date string to Date object for picker
          if (dob) {
            const parsedDate = new Date(dob)
            if (!isNaN(parsedDate.getTime())) {
              setDateOfBirthDate(parsedDate)
            }
          }
          setSelectedCountry(identity.country_code || '')
          setSelectedIdType(identity.id_type || '')
          
          // Load metadata fields if they exist
          if (identity.metadata) {
            try {
              const metadata = typeof identity.metadata === 'string' 
                ? JSON.parse(identity.metadata) 
                : identity.metadata
              
              if (metadata.mostRecentOccupation) {
                setMostRecentOccupation(String(metadata.mostRecentOccupation))
              }
              if (metadata.actingAsIntermediary) {
                setActingAsIntermediary(metadata.actingAsIntermediary)
              } else {
                // Default to "no" if not set
                setActingAsIntermediary('no')
              }
            } catch (error) {
              console.error('Error parsing metadata:', error)
            }
          } else {
            // Default actingAsIntermediary to "no" if no metadata
            setActingAsIntermediary('no')
          }
        }
        
        // Update cache
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
      // Identity verification: Show ALL countries (passport holders can be from anywhere)
      // Restrictions apply to residents (address), not passport holders
      const data = await countryService.getAllIncludingUnsupported()
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
          'Select Document',
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
                    name: `photo_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setIdentityFile(file)
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
                    name: `photo_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setIdentityFile(file)
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
        setIdentityFile(file)
        setUploadError(null)
                }
              }
            },
          ]
        )
      } else {
        // Android: Use document picker with image types
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
          setIdentityFile(file)
          setUploadError(null)
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      setUploadError('Failed to select file')
    }
  }

  const handleDlFrontSelect = async () => {
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
          'Select Driver License',
          'Choose how you want to select your driver license',
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
                    name: `dl_front_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setDlFrontFile(file)
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
                    name: `dl_front_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setDlFrontFile(file)
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
        setDlFrontFile(file)
        setUploadError(null)
                }
              }
            },
          ]
        )
      } else {
        // Android: Use document picker with image types
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
          setDlFrontFile(file)
          setUploadError(null)
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      setUploadError('Failed to select file')
    }
  }

  const handleDlBackSelect = async () => {
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
          'Select Driver License (Back)',
          'Choose how you want to select your driver license',
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
                    name: `dl_back_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setDlBackFile(file)
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
                    name: `dl_back_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setDlBackFile(file)
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
        setDlBackFile(file)
        setUploadError(null)
                }
              }
            },
          ]
        )
      } else {
        // Android: Use document picker with image types
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
          setDlBackFile(file)
          setUploadError(null)
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      setUploadError('Failed to select file')
    }
  }

  const handlePassportFrontSelect = async () => {
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
          'Select Passport',
          'Choose how you want to select your passport',
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
                    name: `passport_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setPassportFrontFile(file)
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
                    name: `passport_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: asset.fileSize || 0,
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('File size must be less than 10MB')
                    return
                  }
                  setPassportFrontFile(file)
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
        setPassportFrontFile(file)
        setUploadError(null)
      }
              }
            },
          ]
        )
      } else {
        // Android: Use document picker with image types
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
          setPassportFrontFile(file)
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
    // Always required fields
    if (!fullName || !dateOfBirth || !selectedCountry) {
      return false
    }

    // USA-specific validation
    if (isUSACountry(selectedCountry)) {
      return !!ssn
    }

    // Non-USA validation
    if (!selectedIdType || !passportNumber) {
      return false
    }

    // Check for document upload based on ID type
    if (selectedIdType === 'passport') {
      return !!passportFrontFile
    } else if (selectedIdType === 'national_id') {
      // National ID requires both front and back
      return !!nationalIdFrontFile && !!nationalIdBackFile
    } else {
      return !!identityFile
    }
  }, [fullName, dateOfBirth, selectedCountry, ssn, selectedIdType, passportNumber, passportFrontFile, nationalIdFrontFile, nationalIdBackFile, identityFile])

  const handleSubmit = async () => {
    if (!fullName || !dateOfBirth || !selectedCountry || !userProfile?.id) {
      setUploadError('Please fill in all required fields')
      return
    }

    // For USA, only SSN is required (no ID type, no document uploads)
    if (isUSACountry(selectedCountry)) {
      if (!ssn) {
        setUploadError('Please fill in Social Security Number (SSN)')
        return
      }
    } else {
      // For non-USA, ID type is required
      if (!selectedIdType) {
        setUploadError('Please select an ID type')
        return
      }
      
      // For non-USA, we need ID number and document
      if (!passportNumber) {
        setUploadError(`Please fill in ${selectedIdType === 'passport' ? 'Passport' : selectedIdType === 'national_id' ? 'National ID' : 'Identification'} Number`)
        return
      }
    }

    if (submission && (submission.status === "in_review" || submission.status === "approved")) {
      setUploadError('Your identity verification is already under review or approved. You cannot upload a new document.')
      return
    }

    // Determine document file to upload
    let documentFileToUpload: any = null
    let idTypeToStore: string
    
    if (isUSACountry(selectedCountry)) {
      // For USA, Bridge only needs SSN (no document uploads required)
      // Pass null to skip file upload entirely
      idTypeToStore = 'ssn' // Use 'ssn' to indicate USA verification method
      documentFileToUpload = null // No file upload needed for SSN
    } else {
      idTypeToStore = selectedIdType!
      // For non-USA, get the appropriate document
      if (selectedIdType === 'passport') {
        if (!passportFrontFile) {
          setUploadError('Please upload Passport Front')
          return
        }
        documentFileToUpload = passportFrontFile
      } else if (selectedIdType === 'national_id') {
        // National ID requires both front and back
        if (!nationalIdFrontFile || !nationalIdBackFile) {
          setUploadError('Please upload both National ID Front and Back')
          return
        }
        // Use front file as the main document for storage
        documentFileToUpload = nationalIdFrontFile
      } else {
        if (!identityFile) {
          setUploadError(`Please upload ${getIdTypeLabel(selectedIdType)} Document`)
          return
        }
        documentFileToUpload = identityFile
      }
    }

    setUploading(true)
    setUploadError(null)
    try {
      // Build Bridge metadata
      // For USA: Only SSN (Bridge doesn't need ID type or documents)
      // For non-USA: ID type, ID number, documents, and enhanced KYC fields
      const metadata: any = {
        bridgeCountryCode: countryCodeAlpha2ToAlpha3(selectedCountry),
      }

      if (isUSACountry(selectedCountry)) {
        // USA: Bridge only needs SSN - nothing else
        metadata.ssn = ssn
      } else {
        // Non-USA: Include ID type and related fields
        metadata.idType = selectedIdType
        // Non-US: National ID number or passport
        if (selectedIdType === 'passport') {
          metadata.passportNumber = passportNumber
          if (passportFrontFile) {
            metadata.passportFrontBase64 = await fileToBase64(passportFrontFile.uri)
          }
          // Passport only needs front (Bridge requirement)
        } else if (selectedIdType === 'national_id') {
          // National ID requires both front and back
          metadata.nationalIdNumber = passportNumber // Reusing passportNumber state
          if (nationalIdFrontFile) {
            metadata.nationalIdFrontBase64 = await fileToBase64(nationalIdFrontFile.uri)
          }
          if (nationalIdBackFile) {
            metadata.nationalIdBackBase64 = await fileToBase64(nationalIdBackFile.uri)
          }
        } else {
          // For other ID types, store as national ID number
          metadata.nationalIdNumber = passportNumber // Reusing passportNumber state
        }
        
        // Enhanced KYC fields (for EEA and international)
        if (phone) metadata.phone = phone
        if (employmentStatus) metadata.employmentStatus = employmentStatus
        if (expectedMonthly) metadata.expectedMonthly = expectedMonthly
        if (accountPurpose) metadata.accountPurpose = accountPurpose
        if (sourceOfFunds) metadata.sourceOfFunds = sourceOfFunds
        
        // International-only fields (non-US, non-EEA)
        if (!isUSACountry(selectedCountry) && !isEEACountry(selectedCountry)) {
          if (mostRecentOccupation) metadata.mostRecentOccupation = String(mostRecentOccupation)
          // Always include actingAsIntermediary (defaults to "no")
          metadata.actingAsIntermediary = actingAsIntermediary || 'no'
        }
      }

      const newSubmission = await kycService.createIdentitySubmission(userProfile.id, {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        country_code: selectedCountry,
        id_type: idTypeToStore,
        id_document_file: documentFileToUpload,
        metadata,
      })

      setSubmission(newSubmission)
      setIdentityFile(null)

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
      
      const existingIndex = submissions.findIndex(s => s.type === "identity")
      if (existingIndex >= 0) {
        submissions[existingIndex] = sanitizedSubmission
      } else {
        submissions.push(sanitizedSubmission)
      }
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        value: submissions,
        timestamp: Date.now()
      }))

      Alert.alert('Success', 'Identity verification submitted successfully')
    } catch (error: any) {
      console.error('Error uploading identity document:', error)
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
  
  // Filter occupations based on search query
  const filteredOccupations = useMemo(() => {
    if (!occupationSearch.trim()) {
      return occupationOptions
    }
    const searchLower = occupationSearch.toLowerCase()
    return occupationOptions.filter(occupation =>
      occupation.label.toLowerCase().includes(searchLower)
    )
  }, [occupationSearch, occupationOptions])

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
              <Text style={styles.title}>Identity Verification</Text>
              <Text style={styles.subtitle}>Verify your identity with your ID information</Text>
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
                  {/* Parse metadata */}
                  {(() => {
                    let metadata: any = {}
                    try {
                      metadata = typeof submission.metadata === 'string' 
                        ? JSON.parse(submission.metadata) 
                        : submission.metadata || {}
                    } catch (e) {
                      console.error('Error parsing metadata:', e)
                    }
                    
                    const isUSA = isUSACountry(submission.country_code || '')
                    const isEEA = isEEACountry(submission.country_code || '')
                    const isInternational = !isUSA && !isEEA
                    
                    return (
                      <>
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>Full Name</Text>
                          <Text style={styles.recordValue}>{submission.full_name || '-'}</Text>
                        </View>
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>Date of Birth</Text>
                          <Text style={styles.recordValue}>
                            {submission.date_of_birth ? new Date(submission.date_of_birth).toLocaleDateString() : '-'}
                          </Text>
                        </View>
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>Country</Text>
                          <Text style={styles.recordValue}>
                            {selectedCountryData ? (
                              `${selectedCountryData.flag_emoji} ${selectedCountryData.name}`
                            ) : (
                              submission.country_code || '-'
                            )}
                          </Text>
                        </View>
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>ID Type</Text>
                          <Text style={styles.recordValue}>
                            {submission.id_type ? getIdTypeLabel(submission.id_type) : '-'}
                          </Text>
                        </View>
                        
                        {/* Only show Document field if there's actually a document (not for SSN) */}
                        {submission.id_type !== 'ssn' && 
                         submission.id_document_url && 
                         submission.id_document_filename && 
                         submission.id_document_filename.trim() !== '' && (
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>Document</Text>
                          <Text style={styles.recordValue}>
                              {submission.id_document_filename}
                          </Text>
                        </View>
                        )}
                        
                        {/* USA-specific fields */}
                        {isUSA && (
                          <>
                            {metadata.ssn && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>SSN</Text>
                                <Text style={styles.recordValue}>
                                  {metadata.ssn ? `***-**-${metadata.ssn.slice(-4)}` : '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.dlNumber && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Driver's License Number</Text>
                                <Text style={styles.recordValue}>{metadata.dlNumber || '-'}</Text>
                              </View>
                            )}
                            {(metadata.dlFrontBase64 || metadata.dlBackBase64) && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Driver's License</Text>
                                <Text style={styles.recordValue}>
                                  {metadata.dlFrontBase64 ? 'Front uploaded' : ''}
                                  {metadata.dlFrontBase64 && metadata.dlBackBase64 ? ', ' : ''}
                                  {metadata.dlBackBase64 ? 'Back uploaded' : ''}
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                        
                        {/* International fields (EEA + Other) */}
                        {!isUSA && (
                          <>
                            {metadata.phone && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Phone</Text>
                                <Text style={styles.recordValue}>{metadata.phone || '-'}</Text>
                              </View>
                            )}
                            {metadata.employmentStatus && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Employment Status</Text>
                                <Text style={styles.recordValue}>
                                  {employmentStatusOptions.find(o => o.value === metadata.employmentStatus)?.label || metadata.employmentStatus || '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.expectedMonthly && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Expected Monthly Flows</Text>
                                <Text style={styles.recordValue}>
                                  {EXPECTED_MONTHLY_OPTIONS.find(o => o.value === metadata.expectedMonthly)?.label || metadata.expectedMonthly || '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.accountPurpose && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Account Purpose</Text>
                                <Text style={styles.recordValue}>
                                  {ACCOUNT_PURPOSE_OPTIONS.find(o => o.value === metadata.accountPurpose)?.label || metadata.accountPurpose || '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.sourceOfFunds && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Source of Funds</Text>
                                <Text style={styles.recordValue}>
                                  {sourceOfFundsOptions.find(o => o.value === metadata.sourceOfFunds)?.label || metadata.sourceOfFunds || '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.passportNumber && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Passport Number</Text>
                                <Text style={styles.recordValue}>{metadata.passportNumber || '-'}</Text>
                              </View>
                            )}
                            {metadata.nationalIdNumber && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>National ID Number</Text>
                                <Text style={styles.recordValue}>{metadata.nationalIdNumber || '-'}</Text>
                              </View>
                            )}
                          </>
                        )}
                        
                        {/* International-only fields (non-US, non-EEA) */}
                        {isInternational && (
                          <>
                            {metadata.mostRecentOccupation && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Occupation</Text>
                                <Text style={styles.recordValue}>
                                  {occupationOptions.find(o => String(o.value) === String(metadata.mostRecentOccupation))?.label || metadata.mostRecentOccupation || '-'}
                                </Text>
                              </View>
                            )}
                            {metadata.actingAsIntermediary !== undefined && (
                              <View style={styles.recordField}>
                                <Text style={styles.recordLabel}>Acting as Intermediary</Text>
                                <Text style={styles.recordValue}>
                                  {metadata.actingAsIntermediary === 'yes' ? 'Yes' : 'No'}
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                        
                        <View style={styles.recordField}>
                          <Text style={styles.recordLabel}>Status</Text>
                          <View style={styles.recordValue}>
                            {getStatusBadge(submission.status)}
                          </View>
                        </View>
                      </>
                    )
                  })()}
                </View>

                {submission.status === "in_review" && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                      <Text style={styles.infoText}>
                        Your KYC identity information is in review. We will provide an update account soonest. Please check your email for updates.
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              // Form view
              <View style={styles.formCard}>
              <View style={styles.formField}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name as it appears on your ID"
                  placeholderTextColor={colors.text.secondary}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    setShowDatePicker(true)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                >
                  <Text style={[styles.selectText, !dateOfBirth && styles.selectPlaceholder]}>
                    {dateOfBirth 
                      ? dateOfBirthDate 
                        ? dateOfBirthDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : dateOfBirth
                      : 'Select date of birth'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={dateOfBirth ? colors.text.primary : "#6b7280"} />
                </TouchableOpacity>
                {Platform.OS === 'ios' && showDatePicker && (
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.datePickerModalOverlay}>
                      <TouchableOpacity 
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setShowDatePicker(false)}
                      />
                      <View style={styles.datePickerModalContent}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={styles.datePickerCancelButton}
                          >
                            <Text style={styles.datePickerCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <Text style={styles.datePickerTitle}>Select Date</Text>
                          <TouchableOpacity
                            onPress={() => {
                              if (dateOfBirthDate) {
                                const formattedDate = dateOfBirthDate.toISOString().split('T')[0]
                                setDateOfBirth(formattedDate)
                              }
                              setShowDatePicker(false)
                            }}
                            style={styles.datePickerDoneButton}
                          >
                            <Text style={styles.datePickerDoneText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                          <DateTimePicker
                            value={dateOfBirthDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                              if (Platform.OS === 'android') {
                                setShowDatePicker(false)
                              }
                              if (selectedDate) {
                                setDateOfBirthDate(selectedDate)
                                const formattedDate = selectedDate.toISOString().split('T')[0]
                                setDateOfBirth(formattedDate)
                              }
                            }}
                            maximumDate={new Date()}
                            minimumDate={new Date(1900, 0, 1)}
                            textColor={colors.text.primary}
                            themeVariant="light"
                          />
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirthDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false)
                      if (selectedDate) {
                        setDateOfBirthDate(selectedDate)
                        const formattedDate = selectedDate.toISOString().split('T')[0]
                        setDateOfBirth(formattedDate)
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Country</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={[styles.selectText, !selectedCountry && styles.selectPlaceholder]}>
                    {selectedCountryData
                      ? `${selectedCountryData.flag_emoji} ${selectedCountryData.name}`
                      : 'Select your country'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Bridge-specific fields - US: Only SSN (no ID type needed) */}
              {selectedCountry && isUSACountry(selectedCountry) && (
                <View style={styles.formField}>
                  <Text style={styles.label}>Social Security Number (SSN) *</Text>
                  <TextInput
                    style={styles.input}
                    value={ssn}
                    onChangeText={setSsn}
                    placeholder="XXX-XX-XXXX"
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry
                    keyboardType="numeric"
                    autoComplete="off"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              )}

              {/* ID Type - Only for non-USA */}
              {selectedCountry && !isUSACountry(selectedCountry) && (
                <View style={styles.formField}>
                  <Text style={styles.label}>ID Type</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowIdTypePicker(true)}
                  >
                    <Text style={[styles.selectText, !selectedIdType && styles.selectPlaceholder]}>
                      {selectedIdType ? getIdTypeLabel(selectedIdType) : 'Select ID type'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Bridge-specific fields - Non-US: ID type-specific fields */}
              {selectedCountry && !isUSACountry(selectedCountry) && selectedIdType && (
                <>
                  {/* National Identity Number - required for non-US (for passport, national_id, or other) */}
              <View style={styles.formField}>
                    <Text style={styles.label}>
                      {selectedIdType === 'passport' ? 'Passport Number *' : 
                       selectedIdType === 'national_id' ? 'National ID Number *' :
                       'Identification Number *'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={passportNumber} // Reuse passportNumber state for all ID numbers
                      onChangeText={setPassportNumber}
                      placeholder={
                        selectedIdType === 'passport' ? 'Enter passport number' :
                        selectedIdType === 'national_id' ? 'Enter national ID number' :
                        'Enter identification number'
                      }
                      placeholderTextColor={colors.text.secondary}
                      autoCapitalize="characters"
                      keyboardType="default"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>
                  
                  {/* Document upload for passport */}
                  {selectedIdType === 'passport' && (
                    <View style={styles.formField}>
                      <Text style={styles.label}>Passport (Front) *</Text>
                      <TouchableOpacity
                        style={[styles.uploadButton, passportFrontFile && styles.uploadButtonSuccess]}
                        onPress={handlePassportFrontSelect}
                      >
                        <Ionicons
                          name={passportFrontFile ? "checkmark-circle" : "cloud-upload"}
                          size={24}
                          color={passportFrontFile ? "#10b981" : "#6b7280"}
                        />
                        <Text style={[styles.uploadText, passportFrontFile && styles.uploadTextSuccess]}>
                          {passportFrontFile ? passportFrontFile.name : 'Upload Passport Front'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Document upload for National ID - requires both front and back */}
                  {selectedIdType === 'national_id' && (
                    <>
                      <View style={styles.formField}>
                        <Text style={styles.label}>National ID (Front) *</Text>
                        <TouchableOpacity
                          style={[styles.uploadButton, nationalIdFrontFile && styles.uploadButtonSuccess]}
                          onPress={handleNationalIdFrontSelect}
                        >
                          <Ionicons
                            name={nationalIdFrontFile ? "checkmark-circle" : "cloud-upload"}
                            size={24}
                            color={nationalIdFrontFile ? "#10b981" : "#6b7280"}
                          />
                          <Text style={[styles.uploadText, nationalIdFrontFile && styles.uploadTextSuccess]}>
                            {nationalIdFrontFile ? nationalIdFrontFile.name : 'Upload National ID Front'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.label}>National ID (Back) *</Text>
                        <TouchableOpacity
                          style={[styles.uploadButton, nationalIdBackFile && styles.uploadButtonSuccess]}
                          onPress={handleNationalIdBackSelect}
                        >
                          <Ionicons
                            name={nationalIdBackFile ? "checkmark-circle" : "cloud-upload"}
                            size={24}
                            color={nationalIdBackFile ? "#10b981" : "#6b7280"}
                          />
                          <Text style={[styles.uploadText, nationalIdBackFile && styles.uploadTextSuccess]}>
                            {nationalIdBackFile ? nationalIdBackFile.name : 'Upload National ID Back'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
              
              {/* Enhanced KYC fields - EEA and other international (not US) */}
              {selectedCountry && !isUSACountry(selectedCountry) && (
                <>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+1234567890"
                      placeholderTextColor={colors.text.secondary}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Employment Status</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowEmploymentPicker(true)}
                    >
                      <Text style={[styles.selectText, !employmentStatus && styles.selectPlaceholder]}>
                        {employmentStatus ? employmentStatusOptions.find(o => o.value === employmentStatus)?.label : 'Select employment status'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Expected Monthly Flows</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowExpectedMonthlyPicker(true)}
                    >
                      <Text style={[styles.selectText, !expectedMonthly && styles.selectPlaceholder]}>
                        {expectedMonthly ? EXPECTED_MONTHLY_OPTIONS.find(o => o.value === expectedMonthly)?.label : 'Select expected monthly flows'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Account Purpose</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowAccountPurposePicker(true)}
                    >
                      <Text style={[styles.selectText, !accountPurpose && styles.selectPlaceholder]}>
                        {accountPurpose ? ACCOUNT_PURPOSE_OPTIONS.find(o => o.value === accountPurpose)?.label : 'Select account purpose'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Source of Funds</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowSourceOfFundsPicker(true)}
                    >
                      <Text style={[styles.selectText, !sourceOfFunds && styles.selectPlaceholder]}>
                        {sourceOfFunds ? sourceOfFundsOptions.find(o => o.value === sourceOfFunds)?.label : 'Select source of funds'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* International-only fields (non-US, non-EEA) */}
              {selectedCountry && !isUSACountry(selectedCountry) && !isEEACountry(selectedCountry) && (
                <>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Occupation</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowMostRecentOccupationPicker(true)}
                    >
                      <Text style={[styles.selectText, !mostRecentOccupation && styles.selectPlaceholder]}>
                        {mostRecentOccupation 
                          ? (occupationOptions.find(o => String(o.value) === String(mostRecentOccupation))?.label || 'Selected occupation')
                          : 'Select occupation'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Acting as Intermediary</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowActingAsIntermediaryPicker(true)}
                    >
                      <Text style={[styles.selectText, !actingAsIntermediary && styles.selectPlaceholder]}>
                        {actingAsIntermediary === 'yes' ? 'Yes' : 'No'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </>
              )}


              {/* Main ID Document Upload - Only for non-US, non-passport, non-national_id ID types (for our KYC system) */}
              {/* For passport, we use passport front upload above */}
              {/* For national_id, we use national_id front/back uploads above */}
              {selectedIdType && !isUSACountry(selectedCountry) && selectedIdType !== 'passport' && selectedIdType !== 'national_id' && (
                <View style={styles.formField}>
                  <Text style={styles.label}>{getIdTypeLabel(selectedIdType)} Document *</Text>
                <TouchableOpacity
                  style={[styles.uploadButton, identityFile && styles.uploadButtonSuccess]}
                  onPress={handleFileSelect}
                >
                  <Ionicons
                    name={identityFile ? "checkmark-circle" : "cloud-upload"}
                    size={24}
                    color={identityFile ? "#10b981" : "#6b7280"}
                  />
                  <Text style={[styles.uploadText, identityFile && styles.uploadTextSuccess]}>
                      {identityFile ? identityFile.name : `Upload ${getIdTypeLabel(selectedIdType)} Document`}
                  </Text>
                </TouchableOpacity>
              </View>
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

      {/* ID Type Picker Modal */}
      <Modal
        visible={showIdTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIdTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowIdTypePicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select ID Type</Text>
              <TouchableOpacity 
                onPress={() => setShowIdTypePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getIdTypesForCountry(selectedCountry)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedIdType(item)
                    setShowIdTypePicker(false)
                  }}
                >
                  <Text style={styles.countryName}>{getIdTypeLabel(item)}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: spacing[4] }}
            />
          </View>
        </View>
      </Modal>

      {/* Employment Status Picker Modal */}
      <Modal
        visible={showEmploymentPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmploymentPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowEmploymentPicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Employment Status</Text>
              <TouchableOpacity 
                onPress={() => setShowEmploymentPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={employmentStatusOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setEmploymentStatus(item.value)
                    setShowEmploymentPicker(false)
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

      {/* Expected Monthly Picker Modal */}
      <Modal
        visible={showExpectedMonthlyPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExpectedMonthlyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowExpectedMonthlyPicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Expected Monthly Flows</Text>
              <TouchableOpacity 
                onPress={() => setShowExpectedMonthlyPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={EXPECTED_MONTHLY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setExpectedMonthly(item.value)
                    setShowExpectedMonthlyPicker(false)
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

      {/* Account Purpose Picker Modal */}
      <Modal
        visible={showAccountPurposePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountPurposePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowAccountPurposePicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account Purpose</Text>
              <TouchableOpacity 
                onPress={() => setShowAccountPurposePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ACCOUNT_PURPOSE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setAccountPurpose(item.value)
                    setShowAccountPurposePicker(false)
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

      {/* Source of Funds Picker Modal */}
      <Modal
        visible={showSourceOfFundsPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSourceOfFundsPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowSourceOfFundsPicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Source of Funds</Text>
              <TouchableOpacity 
                onPress={() => setShowSourceOfFundsPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sourceOfFundsOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSourceOfFunds(item.value)
                    setShowSourceOfFundsPicker(false)
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

      {/* Most Recent Occupation Picker Modal */}
      <Modal
        visible={showMostRecentOccupationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowMostRecentOccupationPicker(false)
          setOccupationSearch('') // Clear search when closing
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
              setShowMostRecentOccupationPicker(false)
              setOccupationSearch('') // Clear search when closing
            }}
          />
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Occupation</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowMostRecentOccupationPicker(false)
                  setOccupationSearch('') // Clear search when closing
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search occupations..."
                value={occupationSearch}
                onChangeText={setOccupationSearch}
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <FlatList
              data={filteredOccupations}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setMostRecentOccupation(String(item.value))
                    setShowMostRecentOccupationPicker(false)
                    setOccupationSearch('') // Clear search when selecting
                  }}
                >
                  <Text style={styles.countryName}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No occupations found</Text>
                </View>
              }
              style={styles.occupationList}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Acting as Intermediary Picker Modal */}
      <Modal
        visible={showActingAsIntermediaryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActingAsIntermediaryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowActingAsIntermediaryPicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acting as Intermediary</Text>
              <TouchableOpacity 
                onPress={() => setShowActingAsIntermediaryPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ]}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setActingAsIntermediary(item.value)
                    setShowActingAsIntermediaryPicker(false)
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
  helperText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontSize: 12,
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
  occupationList: {
    flex: 1,
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
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingTop: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
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
  datePickerContainer: {
    backgroundColor: '#F9F9F9',
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  datePickerCancelButton: {
    paddingVertical: spacing[2],
  },
  datePickerCancelText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  datePickerTitle: {
    ...textStyles.headlineSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  datePickerDoneButton: {
    paddingVertical: spacing[2],
  },
  datePickerDoneText: {
    ...textStyles.bodyMedium,
    color: colors.primary.main,
    fontWeight: '600',
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

export default function IdentityVerificationScreen(props: NavigationProps) {
  return <IdentityVerificationContent {...props} />
}





