import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUserData } from '../../contexts/UserDataContext'
import BottomButton from '../../components/BottomButton'
import { NavigationProps, Recipient, Currency } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { recipientService, RecipientData } from '../../lib/recipientService'
import { useAuth } from '../../contexts/AuthContext'
import { analytics } from '../../lib/analytics'
import { getAccountTypeConfigFromCurrency, formatFieldValue } from '../../lib/currencyAccountTypes'

export default function SelectRecipientScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { recipients, refreshRecipients, currencies } = useUserData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [newRecipient, setNewRecipient] = useState({
    fullName: '',
    accountNumber: '',
    bankName: '',
    phoneNumber: '',
    routingNumber: '',
    sortCode: '',
    iban: '',
    swiftBic: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { sendAmount, sendCurrency, receiveAmount, receiveCurrency, exchangeRate, fee, feeType } = route.params || {}

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('SelectRecipient')
  }, [])

  useEffect(() => {
    refreshRecipients()
  }, [])


  // Helper function to get initials from full name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ').filter(name => name.length > 0)
    if (names.length === 0) return '??'
    if (names.length === 1) return names[0][0].toUpperCase()
    return names
      .slice(0, 2) // Take first two names
      .map(name => name[0])
      .join('')
      .toUpperCase()
  }

  // Helper function to render flag
  const renderFlag = (currencyCode: string) => {
    const flag = getCountryFlag(currencyCode)
    return (
      <Text style={styles.flagEmoji}>{flag}</Text>
    )
  }

  const filteredRecipients = recipients.filter(recipient =>
    (recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.account_number.includes(searchTerm)) &&
    recipient.currency === receiveCurrency
  )

  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
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
    if (!newRecipient.fullName || !receiveCurrency) return false

    const accountConfig = getAccountTypeConfigFromCurrency(receiveCurrency)
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

  const handleAddRecipient = async () => {
    if (!userProfile?.id) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const newRecipientData = await recipientService.create(userProfile.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        currency: receiveCurrency,
        routingNumber: newRecipient.routingNumber || undefined,
        sortCode: newRecipient.sortCode || undefined,
        iban: newRecipient.iban || undefined,
        swiftBic: newRecipient.swiftBic || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()

      // Select the new recipient
      handleSelectRecipient(newRecipientData)

      // Clear form and close modal
      setNewRecipient({ 
        fullName: '', 
        accountNumber: '', 
        bankName: '', 
        phoneNumber: '',
        routingNumber: '',
        sortCode: '',
        iban: '',
        swiftBic: '',
      })
      setShowAddRecipient(false)
      
      Alert.alert('Success', 'Recipient added successfully')
    } catch (error) {
      console.error('Error adding recipient:', error)
      setError('Failed to add recipient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (!selectedRecipient) {
      Alert.alert('Error', 'Please select a recipient')
      return
    }

    navigation.navigate('PaymentMethod', {
      sendAmount,
      sendCurrency,
      receiveAmount,
      receiveCurrency,
      exchangeRate,
      fee,
      feeType,
      recipient: selectedRecipient,
    })
  }


  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={[
        styles.recipientItem,
        selectedRecipient?.id === item.id && styles.selectedRecipient
      ]}
      onPress={() => handleSelectRecipient(item)}
    >
      <View style={styles.recipientContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
          </View>
          <View style={styles.flagContainer}>
            {renderFlag(item.currency)}
          </View>
        </View>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{item.full_name}</Text>
          {(() => {
            const accountConfig = getAccountTypeConfigFromCurrency(item.currency)
            const accountType = accountConfig.accountType
            const accountIdentifier = accountType === "euro" && item.iban 
              ? formatFieldValue(accountType, "iban", item.iban)
              : item.account_number

            return (
              <View>
                {accountIdentifier ? (
                  <Text style={styles.recipientAccount}>{accountIdentifier}</Text>
                ) : null}
                <Text style={styles.recipientBank}>{item.bank_name}</Text>
              </View>
            )
          })()}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Recipient</Text>
          <Text style={styles.subtitle}>Choose who you're sending money to</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search recipients..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Add New Recipient Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddRecipient(true)}
        >
          <Text style={styles.addButtonText}>+ Add New Recipient</Text>
        </TouchableOpacity>

        {/* Recipients List */}
        <FlatList
          data={filteredRecipients}
          renderItem={renderRecipient}
          keyExtractor={(item) => item.id}
          style={styles.recipientsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recipients found</Text>
              <Text style={styles.emptySubtext}>Add a new recipient to get started</Text>
            </View>
          }
        />
      </View>

      {/* Add Recipient Modal */}
      {showAddRecipient && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Recipient</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.currencyDisplay}>
              <Text style={styles.currencyLabel}>Currency</Text>
              <View style={styles.currencyDisplayContent}>
                <Text style={styles.currencyFlag}>{getCountryFlag(receiveCurrency)}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{receiveCurrency}</Text>
                </View>
                <Text style={styles.autoSelectedText}>Auto-selected</Text>
              </View>
            </View>
            
            <TextInput
              style={styles.modalInput}
              value={newRecipient.fullName}
              onChangeText={(text) => setNewRecipient(prev => ({ ...prev, fullName: text }))}
              placeholder="Account Name *"
              editable={!isSubmitting}
            />

            {(() => {
              const accountConfig = receiveCurrency
                ? getAccountTypeConfigFromCurrency(receiveCurrency)
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
                  setShowAddRecipient(false)
                  setError('')
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
        </View>
      )}


      {/* Bottom Button */}
      {selectedRecipient && (
        <BottomButton
          title="Continue"
          onPress={handleContinue}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#007ACC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recipientsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipientItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  selectedRecipient: {
    borderColor: '#007ACC',
    backgroundColor: '#f0f9ff',
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  flagContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 14,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipientBank: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  recipientAccount: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#007ACC',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  currencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  currencyText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  currencyDisplay: {
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  currencyDisplayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  autoSelectedText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
})
