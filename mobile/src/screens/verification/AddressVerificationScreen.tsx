import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import { countryService, Country, getCountryFlag } from '../../lib/countryService'
import AsyncStorage from '@react-native-async-storage/async-storage'

function AddressVerificationContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const [submission, setSubmission] = useState<KYCSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [address, setAddress] = useState('')
  const [selectedDocumentType, setSelectedDocumentType] = useState<'utility_bill' | 'bank_statement' | ''>('')
  const [addressFile, setAddressFile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showDocumentTypePicker, setShowDocumentTypePicker] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

  const documentTypes = [
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'bank_statement', label: 'Bank Statement' },
  ]

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
              setAddress(addressSubmission.address || '')
              setSelectedDocumentType((addressSubmission.document_type as 'utility_bill' | 'bank_statement') || '')
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
          setAddress(addressSubmission.address || '')
          setSelectedDocumentType((addressSubmission.document_type as 'utility_bill' | 'bank_statement') || '')
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
    } catch (error) {
      console.error('Error selecting file:', error)
      setUploadError('Failed to select file')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCountry || !address || !selectedDocumentType || !addressFile || !userProfile?.id) {
      setUploadError('Please fill in all fields and upload a file')
      return
    }

    if (submission && (submission.status === "in_review" || submission.status === "approved")) {
      setUploadError('Your address verification is already under review or approved. You cannot upload a new document.')
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const newSubmission = await kycService.createAddressSubmission(userProfile.id, {
        country_code: selectedCountry,
        address: address,
        document_type: selectedDocumentType as 'utility_bill' | 'bank_statement',
        address_document_file: addressFile,
      })

      setSubmission(newSubmission)
      setAddressFile(null)

      const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
      const cached = await AsyncStorage.getItem(CACHE_KEY)
      let submissions: KYCSubmission[] = []
      if (cached) {
        const { value } = JSON.parse(cached)
        submissions = value || []
      }
      const existingIndex = submissions.findIndex(s => s.type === "address")
      if (existingIndex >= 0) {
        submissions[existingIndex] = newSubmission
      } else {
        submissions.push(newSubmission)
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
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

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
          <Text style={styles.title}>Address Verification</Text>
        </View>

        <View style={styles.content}>
          {submission ? (
            // Record view
            <View style={styles.recordContainer}>
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
                     submission.document_type === 'bank_statement' ? 'Bank Statement' : '-'}
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
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Your KYC address information is in review. We will provide an update account soonest. Please check your email for updates.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Form view
            <View style={styles.formContainer}>
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

              <View style={styles.formField}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your full address"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Document Type</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowDocumentTypePicker(true)}
                >
                  <Text style={[styles.selectText, !selectedDocumentType && styles.selectPlaceholder]}>
                    {selectedDocumentType
                      ? documentTypes.find(dt => dt.value === selectedDocumentType)?.label
                      : 'Select document type'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Address Document</Text>
                <TouchableOpacity
                  style={[styles.uploadButton, addressFile && styles.uploadButtonSuccess]}
                  onPress={handleFileSelect}
                >
                  <Ionicons
                    name={addressFile ? "checkmark-circle" : "cloud-upload"}
                    size={24}
                    color={addressFile ? "#10b981" : "#6b7280"}
                  />
                  <Text style={[styles.uploadText, addressFile && styles.uploadTextSuccess]}>
                    {addressFile ? addressFile.name : 'Upload Document'}
                  </Text>
                </TouchableOpacity>
              </View>

              {uploadError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{uploadError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item.code)
                    setShowCountryPicker(false)
                    setCountrySearch('')
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag_emoji}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Document Type Picker Modal */}
      <Modal
        visible={showDocumentTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDocumentTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <TouchableOpacity onPress={() => setShowDocumentTypePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={documentTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedDocumentType(item.value as 'utility_bill' | 'bank_statement')
                    setShowDocumentTypePicker(false)
                  }}
                >
                  <Text style={styles.countryName}>{item.label}</Text>
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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  recordContainer: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 20,
    gap: 16,
  },
  recordField: {
    gap: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
  },
  formContainer: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  selectPlaceholder: {
    color: '#9ca3af',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  uploadButtonSuccess: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
  },
  uploadTextSuccess: {
    color: '#10b981',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  submitButton: {
    backgroundColor: '#007ACC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTextGreen: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTextYellow: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTextRed: {
    fontSize: 12,
    fontWeight: '500',
    color: '#991b1b',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTextGray: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginBottom: 0,
    fontSize: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryName: {
    fontSize: 16,
    color: '#111827',
  },
})

export default function AddressVerificationScreen(props: NavigationProps) {
  return <AddressVerificationContent {...props} />
}





