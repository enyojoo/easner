import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  RefreshControl,
  Modal,
  Animated,
  Image,
  ScrollView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, Search } from 'lucide-react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { useToast } from '../../components/ToastProvider'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Recipient } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { recipientService, RecipientData } from '../../lib/recipientService'
import { useAuth } from '../../contexts/AuthContext'
import { analytics } from '../../lib/analytics'
import { getAccountTypeConfigFromCurrency, formatFieldValue } from '../../lib/currencyAccountTypes'
import { validateRequired, validateAccountNumber, validateIBAN } from '../../utils/validators'
import { formatIBAN, formatSortCode, formatRoutingNumber, formatAccountNumber } from '../../utils/formatters'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

// Helper function to get flag image source for currency
const getFlagImageSource = (currency: string) => {
  const flagMap: Record<string, any> = {
    'USD': require('../../../assets/flags/us.png'),
    'EUR': require('../../../assets/flags/eu.png'),
    'GBP': require('../../../assets/flags/gb.png'),
    'NGN': require('../../../assets/flags/ng.png'),
    'KES': require('../../../assets/flags/ke.png'),
    'GHS': require('../../../assets/flags/gh.png'),
    'RUB': require('../../../assets/flags/ru.png'),
  }
  return flagMap[currency] || require('../../../assets/flags/us.png') // Default to USD
}

function RecipientsContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const { recipients, loading, refreshRecipients, currencies } = useUserData()
  const insets = useSafeAreaInsets()
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [showEditRecipient, setShowEditRecipient] = useState(false)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearchTerm, setCurrencySearchTerm] = useState('')
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
  const [newRecipient, setNewRecipient] = useState({
    fullName: '',
    accountNumber: '',
    bankName: '',
    currency: 'NGN',
    routingNumber: '',
    sortCode: '',
    iban: '',
    swiftBic: '',
  })

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Recipients')
  }, [])

  useEffect(() => {
    refreshRecipients()
  }, [])
  
  // Reset form after edit modal closes (for smooth animation)
  useEffect(() => {
    if (!showEditRecipient && editingRecipient) {
      // Modal just closed, reset form after animation completes
      const timer = setTimeout(() => {
        setEditingRecipient(null)
        resetForm()
      }, 300) // Wait for fade animation (typically 200-300ms)
      return () => clearTimeout(timer)
    }
  }, [showEditRecipient, editingRecipient])

  const filteredRecipients = recipients.filter(recipient =>
    recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshRecipients()
    setRefreshing(false)
  }

  const getInitials = (name: string) => {
    const names = name.trim().split(' ').filter(name => name.length > 0)
    if (names.length === 0) return '??'
    if (names.length === 1) return names[0][0].toUpperCase()
    return names.slice(0, 2).map(name => name[0]).join('').toUpperCase()
  }

  const filteredCurrencies = currencies.filter(currency => {
    if (currencySearchTerm) {
      return (
        currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
      )
    }
    return true
  })

  const handleAddRecipient = async () => {
    if (!userProfile?.id) {
      showError('User not authenticated')
      return
    }

    if (!isFormValid()) {
      showError('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await recipientService.create(userProfile.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        currency: newRecipient.currency,
        routingNumber: newRecipient.routingNumber || undefined,
        sortCode: newRecipient.sortCode || undefined,
        iban: newRecipient.iban || undefined,
        swiftBic: newRecipient.swiftBic || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()
      setError('')

      // Reset form and close modal
      resetForm()
      setShowAddRecipient(false)
      Alert.alert('Success', 'Recipient added successfully')
    } catch (error) {
      console.error('Error adding recipient:', error)
      setError('Failed to add recipient')
      showError('Failed to add recipient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient)
    setNewRecipient({
      fullName: recipient.full_name,
      accountNumber: recipient.account_number || '',
      bankName: recipient.bank_name,
      currency: recipient.currency,
      routingNumber: recipient.routing_number || '',
      sortCode: recipient.sort_code || '',
      iban: recipient.iban || '',
      swiftBic: recipient.swift_bic || '',
    })
    setShowEditRecipient(true)
  }

  const handleUpdateRecipient = async () => {
    if (!editingRecipient) return

    if (!isFormValid()) {
      showError('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await recipientService.update(editingRecipient.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        routingNumber: newRecipient.routingNumber || undefined,
        sortCode: newRecipient.sortCode || undefined,
        iban: newRecipient.iban || undefined,
        swiftBic: newRecipient.swiftBic || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()
      setError('')

      // Close modal first, form reset handled by useEffect after animation
      setShowEditRecipient(false)
      showSuccess('Recipient updated successfully')
    } catch (error) {
      console.error('Error updating recipient:', error)
      setError('Failed to update recipient')
      showError('Failed to update recipient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const { showSuccess, showError } = useToast()
  const [deleteConfirmation, setDeleteConfirmation] = useState<Recipient | null>(null)

  const handleDeleteRecipient = (recipient: Recipient) => {
    setDeleteConfirmation(recipient)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return
    try {
      setDeletingId(deleteConfirmation.id)
      await recipientService.delete(deleteConfirmation.id)
      await refreshRecipients()
      showSuccess('Recipient deleted successfully')
    } catch (error: any) {
      console.error('Error deleting recipient:', error)
      const errorMessage = error.message?.includes('linked to a transaction')
        ? 'Failed to delete - linked to a transaction'
        : 'Failed to delete recipient'
      showError(errorMessage)
    } finally {
      setDeletingId('')
      setDeleteConfirmation(null)
    }
  }

  // Map snake_case field names from config to camelCase form field names
  const mapFieldName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      account_name: "fullName",
      routing_number: "routingNumber",
      account_number: "accountNumber",
      bank_name: "bankName",
      sort_code: "sortCode",
      iban: "iban",
      swift_bic: "swiftBic",
    }
    return fieldMap[fieldName] || fieldName
  }

  const isFormValid = () => {
    if (!newRecipient.fullName || !newRecipient.bankName || !newRecipient.currency) return false

    const accountConfig = getAccountTypeConfigFromCurrency(newRecipient.currency)
    const requiredFields = accountConfig.requiredFields

    for (const field of requiredFields) {
      const formFieldName = mapFieldName(field)
      const fieldValue = newRecipient[formFieldName as keyof typeof newRecipient]
      if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
        return false
      }
    }

    return true
  }

  const resetForm = () => {
    setNewRecipient({
      fullName: '',
      accountNumber: '',
      bankName: '',
      currency: 'NGN',
      routingNumber: '',
      sortCode: '',
      iban: '',
      swiftBic: '',
    })
    setError('')
    setFieldErrors({})
  }

  // Validate a single field
  const validateField = (fieldName: string, value: string) => {
    const accountConfig = newRecipient.currency
      ? getAccountTypeConfigFromCurrency(newRecipient.currency)
      : null

    if (!accountConfig) {
      return { isValid: true }
    }

    const mapFieldName = (fieldName: string): string => {
      const fieldMap: Record<string, string> = {
        account_name: "fullName",
        routing_number: "routingNumber",
        account_number: "accountNumber",
        bank_name: "bankName",
        sort_code: "sortCode",
        iban: "iban",
        swift_bic: "swiftBic",
      }
      return fieldMap[fieldName] || fieldName
    }

    // Check if field is required
    const configFieldName = Object.entries(accountConfig.fieldLabels).find(
      ([_, label]) => mapFieldName(_) === fieldName
    )?.[0]

    if (configFieldName && accountConfig.requiredFields.includes(configFieldName)) {
      const result = validateRequired(value, accountConfig.fieldLabels[configFieldName])
      if (!result.isValid) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: result.error || '' }))
        return result
      }
    }

    // Field-specific validation
    if (fieldName === 'routingNumber' && value) {
      const digits = value.replace(/\D/g, "")
      if (digits.length !== 9) {
        const error = "Routing number must be 9 digits"
        setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
        return { isValid: false, error }
      }
    }

    if (fieldName === 'sortCode' && value) {
      const digits = value.replace(/\D/g, "")
      if (digits.length !== 6) {
        const error = "Sort code must be 6 digits"
        setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
        return { isValid: false, error }
      }
    }

    if (fieldName === 'iban' && value) {
      const result = validateIBAN(value)
      if (!result.isValid) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: result.error || '' }))
        return result
      }
    }

    if (fieldName === 'accountNumber' && value && accountConfig.accountType === 'us') {
      const result = validateAccountNumber(value, 8)
      if (!result.isValid) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: result.error || '' }))
        return result
      }
    }

    // Clear error if validation passes
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
    return { isValid: true }
  }

  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      activeOpacity={0.7}
    >
      <View style={styles.recipientRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientAvatarText}>
              {getInitials(item.full_name)}
            </Text>
          </View>
          {/* Flag badge on bottom edge of avatar */}
          <View style={styles.avatarFlagBadge}>
            <View style={styles.flagContainer}>
              <Image 
                source={getFlagImageSource(item.currency)}
                style={styles.flagImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{item.full_name}</Text>
          <Text style={styles.recipientBank}>{item.bank_name}</Text>
          <Text style={styles.recipientAccount}>
            {item.iban || item.account_number || ''}
          </Text>
        </View>
        
        <View style={styles.recipientActions}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              handleEditRecipient(item)
            }}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, styles.actionIconDelete]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              handleDeleteRecipient(item)
            }}
            disabled={deletingId === item.id}
            activeOpacity={0.7}
          >
            {deletingId === item.id ? (
              <Ionicons name="hourglass-outline" size={18} color={colors.error.main} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={colors.error.main} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
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
        <Text style={styles.title}>Recipients</Text>
        <Text style={styles.subtitle}>Manage your saved recipients</Text>
      </View>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Search Bar */}
          <Animated.View 
            style={[
              styles.searchContainer,
              {
                opacity: contentAnim,
                transform: [{
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.searchWrapper}>
              <Search size={18} color={colors.text.secondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search recipients..."
                placeholderTextColor={colors.text.secondary}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Add New Recipient Button */}
          <Animated.View
            style={[
              {
                opacity: contentAnim,
                transform: [{
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                resetForm()
                setShowAddRecipient(true)
              }}
              activeOpacity={0.7}
            >
              <View style={styles.addButtonIcon}>
                <Plus size={18} color={colors.primary.main} strokeWidth={2.5} />
              </View>
              <Text style={styles.addButtonText}>Add new recipient</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Recipients List - No Grouping */}
          <Animated.View
            style={[
              styles.recipientsContainer,
              {
                opacity: contentAnim,
                transform: [{
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            {filteredRecipients.length > 0 ? (
              <FlatList
                data={filteredRecipients}
                renderItem={renderRecipient}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
                getItemLayout={(data, index) => ({
                  length: 100, // Approximate item height
                  offset: 100 * index,
                  index,
                })}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="people-outline" size={48} color={colors.text.secondary} />
                </View>
                <Text style={styles.emptyTitle}>No recipients found</Text>
                <Text style={styles.emptyText}>Add a new recipient to get started</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>

      {/* Add Recipient Modal */}
      <Modal
        visible={showAddRecipient}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowAddRecipient(false)
          resetForm()
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowAddRecipient(false)
              resetForm()
            }}
          />
          <View style={[styles.modalContainer, { 
            maxHeight: '90%',
            paddingBottom: Math.max(insets.bottom, 20),
          }]} 
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => {}}
        >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipient</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddRecipient(false)
                  resetForm()
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              <View style={styles.currencySelectorWrapper}>
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => {
                    setShowCurrencyDropdown(!showCurrencyDropdown)
                    setCurrencySearchTerm('')
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.currencySelectorContent}>
                    <Text style={styles.currencyFlag}>{getCountryFlag(newRecipient.currency)}</Text>
                    <Text style={styles.currencySelectorText}>
                      {newRecipient.currency} - {currencies.find(c => c.code === newRecipient.currency)?.name || 'Select Currency'}
                    </Text>
                    <Ionicons 
                      name={showCurrencyDropdown ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#6b7280" 
                    />
                  </View>
                </TouchableOpacity>
                
                {showCurrencyDropdown && (
                  <View style={styles.currencyDropdown}>
                    <View style={styles.currencyDropdownSearch}>
                      <Ionicons name="search" size={18} color={colors.neutral[400]} />
                      <TextInput
                        style={styles.currencyDropdownSearchInput}
                        placeholder="Search currencies..."
                        placeholderTextColor={colors.neutral[400]}
                        value={currencySearchTerm}
                        onChangeText={setCurrencySearchTerm}
                      />
                    </View>
                    <ScrollView 
                      style={styles.currencyDropdownList}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredCurrencies.map((item) => (
                        <TouchableOpacity
                          key={item.code}
                          style={[
                            styles.currencyDropdownItem,
                            newRecipient.currency === item.code && styles.currencyDropdownItemSelected
                          ]}
                          onPress={async () => {
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setNewRecipient(prev => ({ ...prev, currency: item.code }))
                            setShowCurrencyDropdown(false)
                            setCurrencySearchTerm('')
                          }}
                        >
                          <Text style={styles.currencyFlag}>{getCountryFlag(item.code)}</Text>
                          <View style={styles.currencyInfo}>
                            <Text style={styles.currencyCode}>{item.code}</Text>
                            <Text style={styles.currencyName}>{item.name}</Text>
                          </View>
                          <Text style={styles.currencySymbol}>{item.symbol}</Text>
                          {newRecipient.currency === item.code && (
                            <Ionicons name="checkmark" size={18} color={colors.primary.main} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              <View>
                <TextInput
                  style={[styles.modalInput, fieldErrors.fullName && styles.modalInputError]}
                  value={newRecipient.fullName}
                  onChangeText={(text) => {
                    setNewRecipient(prev => ({ ...prev, fullName: text }))
                    validateField('fullName', text)
                  }}
                  onBlur={() => validateField('fullName', newRecipient.fullName)}
                  placeholder="Account Name *"
                  editable={!isSubmitting}
                />
                {fieldErrors.fullName && (
                  <Text style={styles.errorText}>{fieldErrors.fullName}</Text>
                )}
              </View>

              {(() => {
                const accountConfig = newRecipient.currency
                  ? getAccountTypeConfigFromCurrency(newRecipient.currency)
                  : null

                if (!accountConfig) {
                  return (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>Please select a currency first to see the required fields</Text>
                    </View>
                  )
                }

                return (
                  <>
                    {/* Bank Name - Always required */}
                    <View>
                      <TextInput
                        style={[styles.modalInput, fieldErrors.bankName && styles.modalInputError]}
                        value={newRecipient.bankName}
                        onChangeText={(text) => {
                          setNewRecipient(prev => ({ ...prev, bankName: text }))
                          validateField('bankName', text)
                        }}
                        onBlur={() => validateField('bankName', newRecipient.bankName)}
                        placeholder={`${accountConfig.fieldLabels.bank_name} *`}
                        editable={!isSubmitting}
                      />
                      {fieldErrors.bankName && (
                        <Text style={styles.errorText}>{fieldErrors.bankName}</Text>
                      )}
                    </View>

                    {/* US Account Fields */}
                    {accountConfig.accountType === "us" && (
                      <>
                        <View>
                          <TextInput
                            style={[styles.modalInput, fieldErrors.routingNumber && styles.modalInputError]}
                            value={newRecipient.routingNumber}
                            onChangeText={(text) => {
                              const formatted = formatRoutingNumber(text)
                              setNewRecipient(prev => ({ ...prev, routingNumber: formatted }))
                              validateField('routingNumber', formatted)
                            }}
                            onBlur={() => validateField('routingNumber', newRecipient.routingNumber)}
                            placeholder={`${accountConfig.fieldLabels.routing_number} *`}
                            keyboardType="numeric"
                            maxLength={9}
                            editable={!isSubmitting}
                          />
                          {fieldErrors.routingNumber && (
                            <Text style={styles.errorText}>{fieldErrors.routingNumber}</Text>
                          )}
                        </View>
                        <View>
                          <TextInput
                            style={[styles.modalInput, fieldErrors.accountNumber && styles.modalInputError]}
                            value={newRecipient.accountNumber}
                            onChangeText={(text) => {
                              const formatted = formatAccountNumber(text)
                              setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                              validateField('accountNumber', formatted)
                            }}
                            onBlur={() => validateField('accountNumber', newRecipient.accountNumber)}
                            placeholder={`${accountConfig.fieldLabels.account_number} *`}
                            editable={!isSubmitting}
                          />
                          {fieldErrors.accountNumber && (
                            <Text style={styles.errorText}>{fieldErrors.accountNumber}</Text>
                          )}
                        </View>
                      </>
                    )}

                    {/* UK Account Fields */}
                    {accountConfig.accountType === "uk" && (
                      <>
                        <View style={styles.twoColumnRow}>
                          <View style={styles.halfInput}>
                            <TextInput
                              style={[styles.modalInput, fieldErrors.sortCode && styles.modalInputError]}
                              value={newRecipient.sortCode}
                              onChangeText={(text) => {
                                const formatted = formatSortCode(text)
                                setNewRecipient(prev => ({ ...prev, sortCode: formatted }))
                                validateField('sortCode', formatted.replace(/-/g, ''))
                              }}
                              onBlur={() => validateField('sortCode', newRecipient.sortCode.replace(/-/g, ''))}
                              placeholder={`${accountConfig.fieldLabels.sort_code} *`}
                              keyboardType="numeric"
                              maxLength={8}
                              editable={!isSubmitting}
                            />
                            {fieldErrors.sortCode && (
                              <Text style={styles.errorText}>{fieldErrors.sortCode}</Text>
                            )}
                          </View>
                          <View style={styles.halfInput}>
                            <TextInput
                              style={[styles.modalInput, fieldErrors.accountNumber && styles.modalInputError]}
                              value={newRecipient.accountNumber}
                              onChangeText={(text) => {
                                const formatted = formatAccountNumber(text)
                                setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                                validateField('accountNumber', formatted)
                              }}
                              onBlur={() => validateField('accountNumber', newRecipient.accountNumber)}
                              placeholder={`${accountConfig.fieldLabels.account_number} *`}
                              editable={!isSubmitting}
                            />
                            {fieldErrors.accountNumber && (
                              <Text style={styles.errorText}>{fieldErrors.accountNumber}</Text>
                            )}
                          </View>
                        </View>
                        <View>
                          <TextInput
                            style={[styles.modalInput, fieldErrors.iban && styles.modalInputError]}
                            value={newRecipient.iban}
                            onChangeText={(text) => {
                              const formatted = formatIBAN(text)
                              setNewRecipient(prev => ({ ...prev, iban: formatted }))
                              validateField('iban', formatted)
                            }}
                            onBlur={() => validateField('iban', newRecipient.iban)}
                            placeholder={accountConfig.fieldLabels.iban}
                            editable={!isSubmitting}
                          />
                          {fieldErrors.iban && (
                            <Text style={styles.errorText}>{fieldErrors.iban}</Text>
                          )}
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* EURO Account Fields */}
                    {accountConfig.accountType === "euro" && (
                      <>
                        <View>
                          <TextInput
                            style={[styles.modalInput, fieldErrors.iban && styles.modalInputError]}
                            value={newRecipient.iban}
                            onChangeText={(text) => {
                              const formatted = formatIBAN(text)
                              setNewRecipient(prev => ({ ...prev, iban: formatted }))
                              validateField('iban', formatted)
                            }}
                            onBlur={() => validateField('iban', newRecipient.iban)}
                            placeholder={`${accountConfig.fieldLabels.iban} *`}
                            editable={!isSubmitting}
                          />
                          {fieldErrors.iban && (
                            <Text style={styles.errorText}>{fieldErrors.iban}</Text>
                          )}
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* Generic Account Fields */}
                    {accountConfig.accountType === "generic" && (
                      <View>
                        <TextInput
                          style={[styles.modalInput, fieldErrors.accountNumber && styles.modalInputError]}
                          value={newRecipient.accountNumber}
                          onChangeText={(text) => {
                            const formatted = formatAccountNumber(text)
                            setNewRecipient(prev => ({ ...prev, accountNumber: formatted }))
                            validateField('accountNumber', formatted)
                          }}
                          onBlur={() => validateField('accountNumber', newRecipient.accountNumber)}
                          placeholder={`${accountConfig.fieldLabels.account_number} *`}
                          editable={!isSubmitting}
                        />
                        {fieldErrors.accountNumber && (
                          <Text style={styles.errorText}>{fieldErrors.accountNumber}</Text>
                        )}
                      </View>
                    )}
                  </>
                )
              })()}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddRecipient(false)
                    setError('')
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, (isSubmitting || !isFormValid()) && styles.disabledButton]}
                  onPress={handleAddRecipient}
                  disabled={isSubmitting || !isFormValid()}
                >
                  <Text style={styles.saveButtonText}>
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Recipient Modal */}
      <Modal
        visible={showEditRecipient}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowEditRecipient(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowEditRecipient(false)
            }}
          />
          <View style={[styles.modalContainer, { 
            maxHeight: '90%',
            paddingBottom: Math.max(insets.bottom, 20),
          }]} 
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => {}}
        >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Recipient</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditRecipient(false)
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              <View style={styles.currencySelectorWrapper}>
                <TouchableOpacity
                  style={[styles.currencySelector, styles.disabledSelector]}
                  disabled={true}
                >
                  <View style={styles.currencySelectorContent}>
                    <Text style={styles.currencyFlag}>{getCountryFlag(newRecipient.currency)}</Text>
                    <Text style={styles.currencySelectorText}>
                      {newRecipient.currency} - {currencies.find(c => c.code === newRecipient.currency)?.name || 'Select Currency'}
                    </Text>
                    <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.modalInput}
                value={newRecipient.fullName}
                onChangeText={(text) => setNewRecipient(prev => ({ ...prev, fullName: text }))}
                placeholder="Account Name *"
                editable={!isSubmitting}
              />

              {(() => {
                const accountConfig = newRecipient.currency
                  ? getAccountTypeConfigFromCurrency(newRecipient.currency)
                  : null

                if (!accountConfig) {
                  return (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>Please select a currency first to see the required fields</Text>
                    </View>
                  )
                }

                return (
                  <>
                    {/* Bank Name - Always required */}
                    <TextInput
                      style={styles.modalInput}
                      value={newRecipient.bankName}
                      onChangeText={(text) => setNewRecipient(prev => ({ ...prev, bankName: text }))}
                      placeholder={`${accountConfig.fieldLabels.bank_name} *`}
                      editable={!isSubmitting}
                    />

                    {/* US Account Fields */}
                    {accountConfig.accountType === "us" && (
                      <>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.routingNumber}
                          onChangeText={(text) => {
                            const value = text.replace(/\D/g, "").slice(0, 9)
                            setNewRecipient(prev => ({ ...prev, routingNumber: value }))
                          }}
                          placeholder={`${accountConfig.fieldLabels.routing_number} *`}
                          keyboardType="numeric"
                          maxLength={9}
                          editable={!isSubmitting}
                        />
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.accountNumber}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, accountNumber: text }))}
                          placeholder={`${accountConfig.fieldLabels.account_number} *`}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* UK Account Fields */}
                    {accountConfig.accountType === "uk" && (
                      <>
                        <View style={styles.twoColumnRow}>
                          <TextInput
                            style={[styles.modalInput, styles.halfInput]}
                            value={newRecipient.sortCode}
                            onChangeText={(text) => {
                              const value = text.replace(/\D/g, "").slice(0, 6)
                              setNewRecipient(prev => ({ ...prev, sortCode: value }))
                            }}
                            placeholder={`${accountConfig.fieldLabels.sort_code} *`}
                            keyboardType="numeric"
                            maxLength={6}
                            editable={!isSubmitting}
                          />
                          <TextInput
                            style={[styles.modalInput, styles.halfInput]}
                            value={newRecipient.accountNumber}
                            onChangeText={(text) => setNewRecipient(prev => ({ ...prev, accountNumber: text }))}
                            placeholder={`${accountConfig.fieldLabels.account_number} *`}
                            editable={!isSubmitting}
                          />
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.iban}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, iban: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.iban}
                          editable={!isSubmitting}
                        />
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* EURO Account Fields */}
                    {accountConfig.accountType === "euro" && (
                      <>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.iban}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, iban: text.toUpperCase() }))}
                          placeholder={`${accountConfig.fieldLabels.iban} *`}
                          editable={!isSubmitting}
                        />
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          editable={!isSubmitting}
                        />
                      </>
                    )}

                    {/* Generic Account Fields */}
                    {accountConfig.accountType === "generic" && (
                      <TextInput
                        style={styles.modalInput}
                        value={newRecipient.accountNumber}
                        onChangeText={(text) => setNewRecipient(prev => ({ ...prev, accountNumber: text }))}
                        placeholder={`${accountConfig.fieldLabels.account_number} *`}
                        editable={!isSubmitting}
                      />
                    )}
                  </>
                )
              })()}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditRecipient(false)
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, (isSubmitting || !isFormValid()) && styles.disabledButton]}
                  onPress={handleUpdateRecipient}
                  disabled={isSubmitting || !isFormValid()}
                >
                  <Text style={styles.saveButtonText}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={deleteConfirmation !== null}
        title="Delete Recipient"
        message={`Are you sure you want to delete ${deleteConfirmation?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    flex: 1,
    padding: spacing[5],
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  searchInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  addButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  recipientsContainer: {
    paddingHorizontal: spacing[5],
  },
  scrollView: {
    flex: 1,
  },
  recipientItem: {
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientAvatarText: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '700',
  },
  avatarFlagBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  flagContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  flagImage: {
    width: 20,
    height: 20,
  },
  recipientInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  recipientName: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2,
  },
  recipientBank: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  recipientAccount: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontFamily: 'Outfit-Regular',
    marginTop: 2,
  },
  recipientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconDelete: {
    backgroundColor: colors.error.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    gap: spacing[2],
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
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
  modalScrollView: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: spacing[4],
    flexGrow: 1,
  },
  modalContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.frame.border,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    backgroundColor: colors.frame.background,
    fontFamily: 'Outfit-Regular',
  },
  modalInputError: {
    borderColor: colors.error.main,
    borderWidth: 1.5,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    marginTop: -spacing[2],
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    fontFamily: 'Outfit-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  saveButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  // Currency Selector Styles
  currencySelectorWrapper: {
    marginBottom: spacing[4],
    zIndex: 1000,
  },
  currencySelector: {
    borderWidth: 1,
    borderColor: colors.frame.border,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    backgroundColor: colors.frame.background,
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelectorText: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  currencyDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing[1],
    borderWidth: 1,
    borderColor: colors.frame.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    maxHeight: 220,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  currencyDropdownSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[2],
  },
  currencyDropdownSearchInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    paddingVertical: spacing[1],
  },
  currencyDropdownList: {
    maxHeight: 180,
  },
  currencyDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[2],
  },
  currencyDropdownItemSelected: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyFlag: {
    fontSize: 16,
  },
  // Currency Picker Modal Styles
  currencyModalSearchContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  currencyModalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  currencyModalSearchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  currencyCode: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  currencyName: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0],
  },
  currencySymbol: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.error.background,
    borderColor: colors.error.light,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledSelector: {
    opacity: 0.6,
  },
  infoBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
})

// Export RecipientsScreen directly (authentication handled at navigator level)
export default function RecipientsScreen(props: NavigationProps) {
  return <RecipientsContent {...props} />
}
