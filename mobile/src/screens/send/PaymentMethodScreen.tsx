import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Clipboard,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import * as DocumentPicker from 'expo-document-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../contexts/AuthContext'
import { useBalance } from '../../contexts/BalanceContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, PaymentMethod } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { analytics } from '../../lib/analytics'
import { transactionService } from '../../lib/transactionService'
import { getAccountTypeConfigFromCurrency, formatFieldValue } from '../../lib/currencyAccountTypes'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

export default function PaymentMethodScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { paymentMethods, refreshPaymentMethods, currencies, refreshTransactions } = useUserData()
  const { updateBalanceOptimistically } = useBalance()
  const insets = useSafeAreaInsets()
  const [transactionId, setTransactionId] = useState('')
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const { sendAmount, sendCurrency, receiveAmount, receiveCurrency, exchangeRate, fee, feeType, recipient } = route.params || {}

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
    analytics.trackScreenView('PaymentMethod')
  }, [])

  useEffect(() => {
    refreshPaymentMethods()
    setTransactionId(generateTransactionId())
  }, [])

  const getPaymentMethodsForCurrency = (currency: string) => {
    return paymentMethods.filter(method => 
      method.currency === currency && method.status === 'active'
    )
  }

  const getDefaultPaymentMethod = (currency: string) => {
    const methods = getPaymentMethodsForCurrency(currency)
    return methods.find((pm) => pm.is_default) || methods[0]
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await Clipboard.setString(text)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard')
    }
  }

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true)
      setUploadError(null)
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        setUploadedFile(result.assets[0])
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      setUploadError('Failed to upload receipt. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleContinue = async () => {
    if (!userProfile?.id || !recipient?.id) {
      Alert.alert('Error', 'User or recipient information missing')
      return
    }

    const defaultMethod = getDefaultPaymentMethod(sendCurrency)
    if (!defaultMethod) {
      Alert.alert('Error', 'No payment method available for this currency')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsCreatingTransaction(true)
    
    try {
      const transaction = await transactionService.create({
        userId: userProfile.id,
        recipientId: recipient.id,
        sendAmount: Number.parseFloat(sendAmount),
      sendCurrency,
        receiveAmount: Number.parseFloat(receiveAmount),
      receiveCurrency,
        exchangeRate: Number.parseFloat(exchangeRate?.rate || '0'),
        feeAmount: Number.parseFloat(fee || '0'),
      feeType,
        totalAmount: Number.parseFloat(sendAmount) + Number.parseFloat(fee),
        transactionId: transactionId,
      })

      // Optimistic balance update (like Revolut/CashApp - immediate UI feedback)
      if (sendCurrency === 'USD' || sendCurrency === 'EUR') {
        const totalAmount = Number.parseFloat(sendAmount) + Number.parseFloat(fee || '0')
        updateBalanceOptimistically(sendCurrency as 'USD' | 'EUR', totalAmount)
      }

      if (uploadedFile && !isUploading) {
          console.log('Receipt upload would happen here:', uploadedFile)
      }

      await refreshTransactions()
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      navigation.navigate('SendTransactionDetails', { 
        transactionId: transaction.transaction_id 
      })
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Error', error.message || 'Failed to create transaction. Please try again.')
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const defaultMethod = getDefaultPaymentMethod(sendCurrency)
  const paymentMethodsForCurrency = getPaymentMethodsForCurrency(sendCurrency)

  const renderCopyableField = (label: string, value: string, key: string) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.fieldValueContainer}
        onPress={() => handleCopy(value, key)}
        activeOpacity={0.7}
      >
        <Text style={styles.fieldValue}>{value}</Text>
        <View style={[styles.copyIcon, copiedStates[key] && styles.copyIconSuccess]}>
          <Ionicons 
            name={copiedStates[key] ? "checkmark" : "copy-outline"} 
            size={14} 
            color={copiedStates[key] ? colors.success.main : colors.primary.main} 
          />
        </View>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <Text style={styles.title}>Make Payment</Text>
          <Text style={styles.subtitle}>Transfer funds to complete</Text>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }}
        >
          {/* Amount Summary Card */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryHeader}>
                <Text style={{ fontSize: 28 }}>{getCountryFlag(sendCurrency)}</Text>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Total to Transfer</Text>
                  <Text style={styles.summaryAmount}>
                    {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
              </Text>
                  {fee > 0 && (
                    <Text style={styles.summaryBreakdown}>
                      {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + {formatCurrency(fee, sendCurrency)} fee
              </Text>
                  )}
                </View>
            </View>
            </LinearGradient>
          </View>

          {/* Transaction ID in Payment Summary */}
          {transactionId && (
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={colors.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryHeader}>
                  <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>Transaction ID</Text>
                    <TouchableOpacity
                      style={styles.transactionIdRow}
                      onPress={() => handleCopy(transactionId, "transactionIdSummary")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.summaryAmount}>{transactionId}</Text>
                      <Ionicons 
                        name={copiedStates.transactionIdSummary ? "checkmark" : "copy-outline"} 
                        size={18} 
                        color={copiedStates.transactionIdSummary ? colors.success.main : 'rgba(255,255,255,0.7)'} 
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Payment Method Details */}
          {paymentMethodsForCurrency.length === 0 ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={48} color={colors.error.main} />
              <Text style={styles.errorTitle}>No Payment Methods</Text>
              <Text style={styles.errorText}>No payment methods configured for {sendCurrency}</Text>
            </View>
          ) : (
            <>
              {/* Bank Account Details */}
                {defaultMethod?.type === "bank_account" && (() => {
                  const accountConfig = sendCurrency
                    ? getAccountTypeConfigFromCurrency(sendCurrency)
                    : null
                  const accountType = accountConfig?.accountType

                  return (
                  <View style={styles.detailsCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconContainer}>
                        <Ionicons name="business" size={18} color={colors.primary.main} />
                      </View>
                      <Text style={styles.cardTitle}>{defaultMethod.name}</Text>
                    </View>

                    <View style={styles.fieldsContainer}>
                      {renderCopyableField(
                        accountConfig?.fieldLabels.account_name || "Account Name",
                        defaultMethod.account_name || "",
                        "accountName"
                      )}

                        {accountType === "us" && defaultMethod.routing_number && (
                        renderCopyableField(
                          accountConfig?.fieldLabels.routing_number || "Routing Number",
                          formatFieldValue(accountType, "routing_number", defaultMethod.routing_number),
                          "routingNumber"
                        )
                      )}

                        {accountType === "uk" && defaultMethod.sort_code && (
                        renderCopyableField(
                          accountConfig?.fieldLabels.sort_code || "Sort Code",
                          formatFieldValue(accountType, "sort_code", defaultMethod.sort_code),
                          "sortCode"
                        )
                      )}

                        {(accountType === "us" || accountType === "uk" || accountType === "generic") && defaultMethod.account_number && (
                        renderCopyableField(
                          accountConfig?.fieldLabels.account_number || "Account Number",
                          defaultMethod.account_number,
                          "accountNumber"
                        )
                      )}

                        {(accountType === "uk" || accountType === "euro") && defaultMethod.iban && (
                        renderCopyableField(
                          accountConfig?.fieldLabels.iban || "IBAN",
                          formatFieldValue(accountType, "iban", defaultMethod.iban),
                          "iban"
                        )
                      )}

                        {(accountType === "uk" || accountType === "euro") && defaultMethod.swift_bic && (
                        renderCopyableField(
                          accountConfig?.fieldLabels.swift_bic || "SWIFT/BIC",
                          defaultMethod.swift_bic,
                          "swiftBic"
                        )
                      )}

                      {renderCopyableField(
                        accountConfig?.fieldLabels.bank_name || "Bank Name",
                        defaultMethod.bank_name || "",
                        "bankName"
                      )}
                    </View>
                  </View>
                  )
                })()}

              {/* QR Code */}
                {defaultMethod?.type === "qr_code" && (
                <View style={styles.detailsCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIconContainer}>
                      <Ionicons name="qr-code" size={18} color={colors.primary.main} />
                    </View>
                    <Text style={styles.cardTitle}>{defaultMethod.name}</Text>
                  </View>
                  
                  <View style={styles.qrContainer}>
                      {defaultMethod.qr_code_data ? (
                        <Image
                          source={{ uri: defaultMethod.qr_code_data }}
                        style={styles.qrImage}
                          resizeMode="contain"
                        />
                      ) : (
                      <View style={styles.qrPlaceholder}>
                        <Ionicons name="qr-code" size={64} color={colors.neutral[400]} />
                        </View>
                      )}
                    </View>
                    {defaultMethod.instructions && (
                      <Text style={styles.qrInstructions}>{defaultMethod.instructions}</Text>
                    )}
                  </View>
                )}

              {/* Important Instructions */}
                <View style={styles.instructionsCard}>
                <View style={styles.instructionsHeader}>
                  <Ionicons name="warning" size={20} color={colors.warning.dark} />
                  <Text style={styles.instructionsTitle}>Important</Text>
                </View>
                
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <View style={styles.instructionContent}>
                    <Text style={styles.instructionText}>
                        Transfer exactly <Text style={styles.instructionBold}>
                        {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                        </Text>
                      </Text>
                      {fee > 0 && (
                        <Text style={styles.instructionSubtext}>
                          (Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee: {formatCurrency(fee, sendCurrency)})
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <View style={styles.instructionRow}>
                      <Text style={styles.instructionText}>Note Transaction ID </Text>
                      <TouchableOpacity
                        style={styles.transactionIdBadge}
                        onPress={() => handleCopy(transactionId, "transactionId")}
                      >
                        <Text style={styles.transactionIdText}>{transactionId}</Text>
                        <Ionicons 
                          name={copiedStates.transactionId ? "checkmark" : "copy-outline"} 
                          size={12} 
                          color={colors.primary.main} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>
                      Complete within <Text style={styles.instructionBold}>a few minutes</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>Upload receipt for quick verification</Text>
                  </View>

                  {defaultMethod?.type === "qr_code" && (
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>Scan QR code with your mobile banking app</Text>
                    </View>
                  )}
                </View>
        </View>

              {/* Upload Receipt */}
              <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload Receipt (Optional)</Text>
                <Text style={styles.uploadSubtitle}>Speeds up verification</Text>
          
          {uploadError && (
                  <View style={styles.uploadError}>
                    <Ionicons name="alert-circle" size={16} color={colors.error.main} />
                    <Text style={styles.uploadErrorText}>{uploadError}</Text>
                    <TouchableOpacity onPress={() => setUploadError(null)}>
                      <Ionicons name="close" size={16} color={colors.error.main} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
                  style={[styles.uploadButton, uploadedFile && styles.uploadButtonSuccess]}
            onPress={handleUploadReceipt}
            disabled={isUploading}
                  activeOpacity={0.7}
          >
              <Ionicons 
                    name={uploadedFile ? "checkmark-circle" : "cloud-upload-outline"} 
                    size={28} 
                    color={uploadedFile ? colors.success.main : colors.neutral[500]} 
              />
                  <Text style={[styles.uploadButtonText, uploadedFile && styles.uploadButtonTextSuccess]}>
                    {uploadedFile ? 'Receipt Uploaded' : isUploading ? 'Uploading...' : 'Tap to upload'}
              </Text>
              {uploadedFile && (
                <Text style={styles.uploadFileName}>{uploadedFile.name}</Text>
              )}
          </TouchableOpacity>
        </View>
            </>
          )}
        </Animated.View>
        </ScrollView>
        
        {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.confirmButton, isCreatingTransaction && styles.confirmButtonDisabled]}
          onPress={handleContinue}
          disabled={isCreatingTransaction}
        >
          <LinearGradient
            colors={isCreatingTransaction ? [colors.neutral[400], colors.neutral[400]] : colors.success.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            {isCreatingTransaction ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                <Text style={styles.confirmButtonText}>I've Made the Payment</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: spacing[2],
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
  },
  summaryCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  summaryGradient: {
    padding: spacing[5],
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  summaryLabel: {
    ...textStyles.labelMedium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[1],
  },
  summaryAmount: {
    ...textStyles.displaySmall,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  summaryBreakdown: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing[1],
  },
  transactionIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  errorCard: {
    backgroundColor: colors.error.background,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  errorTitle: {
    ...textStyles.titleLarge,
    color: colors.error.main,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  errorText: {
    ...textStyles.bodyMedium,
    color: colors.error.main,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
  },
  fieldsContainer: {
    gap: spacing[3],
  },
  fieldRow: {
    gap: spacing[1],
  },
  fieldLabel: {
    ...textStyles.labelMedium,
    color: colors.text.tertiary,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  fieldValue: {
    ...textStyles.titleSmall,
    color: colors.text.primary,
    flex: 1,
  },
  copyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIconSuccess: {
    backgroundColor: colors.success.background,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: borderRadius.lg,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrInstructions: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: colors.warning.background,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.warning.main + '30',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  instructionsTitle: {
    ...textStyles.titleMedium,
    color: colors.warning.dark,
  },
  instructionsList: {
    gap: spacing[3],
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  instructionBullet: {
    ...textStyles.bodyMedium,
    color: colors.warning.main,
    marginRight: spacing[2],
    marginTop: 1,
  },
  instructionContent: {
    flex: 1,
  },
  instructionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  instructionText: {
    ...textStyles.bodySmall,
    color: colors.warning.dark,
    flex: 1,
    lineHeight: 18,
  },
  instructionSubtext: {
    ...textStyles.bodySmall,
    color: colors.warning.dark,
    opacity: 0.8,
    marginTop: 2,
  },
  instructionBold: {
    fontWeight: '700',
  },
  transactionIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    gap: spacing[1],
  },
  transactionIdText: {
    ...textStyles.labelSmall,
    color: colors.primary.main,
    fontWeight: '600',
  },
  uploadCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  uploadTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  uploadSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
  },
  uploadError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.background,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  uploadErrorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    flex: 1,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  uploadButtonSuccess: {
    borderColor: colors.success.main,
    backgroundColor: colors.success.background,
  },
  uploadButtonText: {
    ...textStyles.titleSmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  uploadButtonTextSuccess: {
    color: colors.success.main,
  },
  uploadFileName: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  bottomContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    backgroundColor: colors.background.secondary,
  },
  confirmButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  confirmButtonText: {
    ...textStyles.titleMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
})
