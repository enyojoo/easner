import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
  Alert,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, Search } from 'lucide-react-native'
import { NavigationProps, Recipient } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUserData } from '../../contexts/UserDataContext'
import { recipientService } from '../../lib/recipientService'
import { useAuth } from '../../contexts/AuthContext'
import { getCountryFlag } from '../../utils/flagUtils'
import { getAccountTypeConfigFromCurrency } from '../../lib/currencyAccountTypes'

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

export default function SelectRecipientScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const { userProfile } = useAuth()
  const { recipients, refreshRecipients, currencies } = useUserData()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearchTerm, setCurrencySearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
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
  
  // Get pre-selected recipient ID from route params
  const preSelectedRecipientId = (route.params as any)?.selectedRecipientId as string | undefined
  
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    preSelectedRecipientId 
      ? recipients.find(r => r.id === preSelectedRecipientId) || null
      : null
  )

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

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

  // Update selected recipient when recipients change
  useEffect(() => {
    if (preSelectedRecipientId) {
      const recipient = recipients.find(r => r.id === preSelectedRecipientId)
      if (recipient) {
        setSelectedRecipient(recipient)
      }
    }
  }, [recipients, preSelectedRecipientId])

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ').filter(name => name.length > 0)
    if (names.length === 0) return '??'
    if (names.length === 1) return names[0][0].toUpperCase()
    return names.slice(0, 2).map(name => name[0]).join('').toUpperCase()
  }

  // Filter recipients by search term (no grouping)
  const filteredRecipients = recipients.filter(recipient =>
    recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipient.account_number && recipient.account_number.includes(searchTerm)) ||
    (recipient.iban && recipient.iban.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSelectRecipient = async (recipient: Recipient) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedRecipient(recipient)
    
    // Navigate back to SendAmountScreen with selected recipient
    // Using navigate instead of replace for smoother transition
    navigation.navigate('SendAmount' as never, { recipient } as never)
  }

  const handleAddNewRecipient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    resetForm()
    setShowAddRecipient(true)
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

      await refreshRecipients()
      setError('')
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

  const filteredCurrencies = currencies.filter(currency => {
    if (currencySearchTerm) {
      return (
        currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
      )
    }
    return true
  })

  const renderRecipient = ({ item }: { item: Recipient }) => {
    const isSelected = selectedRecipient?.id === item.id

    return (
      <TouchableOpacity
        style={[styles.recipientItem, isSelected && styles.recipientItemSelected]}
        onPress={() => handleSelectRecipient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.recipientRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.recipientAvatar, isSelected && styles.recipientAvatarSelected]}>
              <Text style={[styles.recipientAvatarText, isSelected && styles.recipientAvatarTextSelected]}>
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
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <View style={styles.checkboxInner} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Header */}
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
              onPress={() => {
                // Always go back to SendAmount screen when in send money flow
                navigation.navigate('SendAmount' as never)
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Recipients</Text>
              <Text style={styles.subtitle}>Send to a previous or new recipient</Text>
            </View>
          </Animated.View>

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
              onPress={handleAddNewRecipient}
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
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setShowAddRecipient(false)
              resetForm()
            }}
          />
          <View 
            style={[styles.modalContainer, { 
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
              
              <TextInput
                style={styles.modalInput}
                value={newRecipient.fullName}
                onChangeText={(text) => setNewRecipient(prev => ({ ...prev, fullName: text }))}
                placeholder="Account Name *"
                placeholderTextColor={colors.text.secondary}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
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
                      placeholderTextColor={colors.text.secondary}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
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
                          placeholderTextColor={colors.text.secondary}
                          keyboardType="numeric"
                          maxLength={9}
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
                          editable={!isSubmitting}
                        />
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.accountNumber}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, accountNumber: text }))}
                          placeholder={`${accountConfig.fieldLabels.account_number} *`}
                          placeholderTextColor={colors.text.secondary}
                          keyboardType="numeric"
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
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
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="numeric"
                            maxLength={6}
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            editable={!isSubmitting}
                          />
                          <TextInput
                            style={[styles.modalInput, styles.halfInput]}
                            value={newRecipient.accountNumber}
                            onChangeText={(text) => setNewRecipient(prev => ({ ...prev, accountNumber: text }))}
                            placeholder={`${accountConfig.fieldLabels.account_number} *`}
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="numeric"
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            editable={!isSubmitting}
                          />
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.iban}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, iban: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.iban}
                          placeholderTextColor={colors.text.secondary}
                          autoCapitalize="characters"
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
                          editable={!isSubmitting}
                        />
                        <TextInput
                          style={styles.modalInput}
                          value={newRecipient.swiftBic}
                          onChangeText={(text) => setNewRecipient(prev => ({ ...prev, swiftBic: text.toUpperCase() }))}
                          placeholder={accountConfig.fieldLabels.swift_bic}
                          placeholderTextColor={colors.text.secondary}
                          autoCapitalize="characters"
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
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
                        placeholderTextColor={colors.text.secondary}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
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
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
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
  searchContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  searchInput: {
    flex: 1,
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    gap: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
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
  recipientItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  recipientItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '05',
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
  recipientAvatarSelected: {
    backgroundColor: colors.primary.main,
  },
  recipientAvatarText: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '700',
  },
  recipientAvatarTextSelected: {
    color: colors.text.inverse,
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
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
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
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  emptyTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
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
    paddingBottom: spacing[8],
    flexGrow: 1,
  },
  modalContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing[4],
    backgroundColor: '#F9F9F9',
    fontFamily: 'Outfit-Regular',
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
    backgroundColor: '#F9F9F9',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
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
  disabledButton: {
    opacity: 0.6,
  },
  currencySelectorWrapper: {
    marginBottom: spacing[4],
    zIndex: 1000,
  },
  currencySelector: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    backgroundColor: '#F9F9F9',
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
    fontFamily: 'Outfit-Regular',
  },
  currencyDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing[1],
    borderWidth: 1,
    borderColor: '#E2E2E2',
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
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
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
  currencyInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  currencyCode: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  currencyName: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0],
    fontFamily: 'Outfit-Regular',
  },
  currencySymbol: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
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
  infoBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
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
})
