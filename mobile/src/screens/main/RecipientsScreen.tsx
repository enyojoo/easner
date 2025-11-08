import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, Recipient } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { recipientService, RecipientData } from '../../lib/recipientService'
import { useAuth } from '../../contexts/AuthContext'
import { analytics } from '../../lib/analytics'
import { getAccountTypeConfigFromCurrency, formatFieldValue } from '../../lib/currencyAccountTypes'

function RecipientsContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const { recipients, loading, refreshRecipients, currencies } = useUserData()
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [showEditRecipient, setShowEditRecipient] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to render flag
  const renderFlag = (currencyCode: string) => {
    const flag = getCountryFlag(currencyCode)
    return (
      <Text style={styles.flagEmoji}>{flag}</Text>
    )
  }

  const renderCurrencyPicker = () => (
    <Modal
      visible={showCurrencyPicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.currencyModalContainer}>
        <View style={styles.currencyModalHeader}>
          <Text style={styles.currencyModalTitle}>Select Currency</Text>
          <TouchableOpacity
            onPress={() => setShowCurrencyPicker(false)}
            style={styles.currencyCloseButton}
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
                setNewRecipient(prev => ({ ...prev, currency: item.code }))
                setShowCurrencyPicker(false)
              }}
            >
              <Text style={styles.currencyFlag}>{getCountryFlag(item.code)}</Text>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>{item.code}</Text>
                <Text style={styles.currencyName}>{item.name}</Text>
              </View>
              <Text style={styles.currencySymbol}>{item.symbol}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  )


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
      Alert.alert('Error', 'Failed to add recipient')
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
      Alert.alert('Error', 'Please fill in all required fields')
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

      // Reset form and close modal
      setEditingRecipient(null)
      resetForm()
      setShowEditRecipient(false)
      Alert.alert('Success', 'Recipient updated successfully')
    } catch (error) {
      console.error('Error updating recipient:', error)
      setError('Failed to update recipient')
      Alert.alert('Error', 'Failed to update recipient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecipient = (recipient: Recipient) => {
    Alert.alert(
      'Delete Recipient',
      `Are you sure you want to delete ${recipient.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(recipient.id)
              await recipientService.delete(recipient.id)
              await refreshRecipients()
              Alert.alert('Success', 'Recipient deleted successfully')
            } catch (error: any) {
              console.error('Error deleting recipient:', error)
              const errorMessage = error.message?.includes('linked to a transaction')
                ? 'Failed to delete - linked to a transaction'
                : 'Failed to delete recipient'
              Alert.alert('Error', errorMessage)
            } finally {
              setDeletingId(null)
            }
          }
        }
      ]
    )
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
  }

  const renderRecipient = ({ item }: { item: Recipient }) => (
    <View style={styles.recipientCard}>
      <View style={styles.recipientLeft}>
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
      <View style={styles.recipientActions}>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={() => handleEditRecipient(item)}
          disabled={isSubmitting}
        >
          <Ionicons name="pencil-outline" size={20} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={() => handleDeleteRecipient(item)}
          disabled={deletingId === item.id}
        >
          {deletingId === item.id ? (
            <Ionicons name="hourglass-outline" size={20} color="#dc2626" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <ScreenWrapper>
      <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipients</Text>
        <Text style={styles.subtitle}>Manage your saved recipients</Text>
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
        onPress={() => {
          resetForm()
          setShowAddRecipient(true)
        }}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recipients found</Text>
            <Text style={styles.emptySubtext}>Add a new recipient to get started</Text>
          </View>
        }
      />

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
            
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <View style={styles.currencySelectorContent}>
                <Text style={styles.currencyFlag}>{getCountryFlag(newRecipient.currency)}</Text>
                <Text style={styles.currencySelectorText}>
                  {newRecipient.currency} - {currencies.find(c => c.code === newRecipient.currency)?.name || 'Select Currency'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </View>
            </TouchableOpacity>
            
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

      {/* Edit Recipient Modal */}
      {showEditRecipient && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Recipient</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
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
                  setEditingRecipient(null)
                  resetForm()
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
        </View>
      )}

      {/* Currency Picker Modal */}
      {renderCurrencyPicker()}
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  recipientCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0f2fe',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  recipientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
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
  // Currency Selector Styles
  currencySelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  currencyFlag: {
    fontSize: 16,
  },
  // Currency Picker Modal Styles
  currencyModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
  },
  currencyCloseButton: {
    padding: 4,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledSelector: {
    opacity: 0.6,
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

// Export RecipientsScreen directly (authentication handled at navigator level)
export default function RecipientsScreen(props: NavigationProps) {
  return <RecipientsContent {...props} />
}
