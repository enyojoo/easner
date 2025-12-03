import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import * as DocumentPicker from 'expo-document-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

interface MockRecipient {
  id: string
  full_name: string
  account_number: string
  currency: string
  bank_name: string
}

export default function VirtualBankAccountScreen({ navigation, route }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const { transactionId, sendAmount, receiveAmount, sendCurrency, receiveCurrency, recipient, paymentMethod } = route.params || {}
  
  // Get currency-specific bank details
  const getBankDetails = () => {
    const baseDetails = {
      accountName: 'Easner Payments',
      accountNumber: '',
      routingNumber: undefined as string | undefined,
      iban: undefined as string | undefined,
      swiftBic: undefined as string | undefined,
      bankName: '',
      reference: transactionId,
    }

    switch (sendCurrency) {
      case 'USD':
        return {
          ...baseDetails,
          accountNumber: '1234567890',
          routingNumber: '123456789',
          swiftBic: 'BRIDGEUS33',
          bankName: 'Bridge Bank',
        }
      case 'EUR':
        return {
          ...baseDetails,
          accountNumber: '9876543210',
          iban: 'GB82WEST12345698765432',
          swiftBic: 'BRIDGEGB33',
          bankName: 'Bridge Bank Europe',
        }
      case 'KES':
        return {
          ...baseDetails,
          accountNumber: 'KES123456789',
          bankName: 'Kenya Commercial Bank',
        }
      case 'GHS':
        return {
          ...baseDetails,
          accountNumber: 'GHS987654321',
          bankName: 'Ghana Commercial Bank',
        }
      case 'RUB':
        return {
          ...baseDetails,
          accountNumber: 'RUB456789123',
          bankName: 'Sberbank',
        }
      case 'NGN':
        return {
          ...baseDetails,
          accountNumber: 'NGN789123456',
          bankName: 'Access Bank',
        }
      default:
        return {
          ...baseDetails,
          accountNumber: '1234567890',
          bankName: 'Bridge Bank',
        }
    }
  }

  const virtualAccountDetails = getBankDetails()

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
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

  // Auto-confirm simulation (would be replaced with actual payment detection)
  useEffect(() => {
    // Simulate auto-confirmation after 5 seconds (for demo)
    // In production, this would be triggered by webhook/polling
    const timer = setTimeout(() => {
      // Auto-confirm would happen here if payment is detected
      // For now, we'll let user manually confirm
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number, currency: string): string => {
    const symbol = currency === 'USD' ? '$' 
      : currency === 'EUR' ? '€' 
      : currency === 'NGN' ? '₦' 
      : currency === 'KES' ? 'KSh' 
      : currency === 'GHS' ? '₵' 
      : currency === 'RUB' ? '₽' 
      : currency === 'GBP' ? '£' 
      : ''
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
      Alert.alert('Error', 'Failed to upload receipt. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveReceipt = () => {
    setUploadedFile(null)
    setUploadError(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleConfirmPayment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPaymentConfirmed(true)
    
    // TODO: Upload receipt file if provided
    // if (uploadedFile) {
    //   // Upload receipt to backend
    // }
    
    // Navigate to transaction tracking
    setTimeout(() => {
      navigation.navigate('SendTransactionDetails' as never, {
        transactionId: transactionId,
        sendAmount,
        sendCurrency,
        receiveCurrency,
        recipient: recipient as MockRecipient,
        paymentMethod: 'virtualBank',
        receiptFile: uploadedFile,
      } as never)
    }, 500)
  }

  const renderCopyableField = (label: string, value: string, key: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.fieldValueContainer}
        onPress={() => handleCopy(value, key)}
        activeOpacity={0.7}
      >
        <Text style={styles.fieldValue}>{value}</Text>
        <View style={styles.copyButton}>
          {copiedStates[key] ? (
            <Ionicons name="checkmark" size={18} color={colors.primary.main} />
          ) : (
            <Ionicons name="copy-outline" size={18} color={colors.text.secondary} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
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
            <Text style={styles.title}>Bank Transfer</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
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
            {/* Payment Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Send to Recipient</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>You Send:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(sendAmount || 0, sendCurrency || 'USD')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient Gets:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(receiveAmount || sendAmount || 0, receiveCurrency || 'EUR')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient:</Text>
                <Text style={styles.summaryValue}>
                  {(recipient as MockRecipient)?.full_name || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method:</Text>
                <Text style={styles.summaryValue}>
                  {paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Virtual Bank Account'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transaction ID:</Text>
                <TouchableOpacity
                  style={styles.summaryValueRow}
                  onPress={() => handleCopy(transactionId || '', 'transactionId')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.summaryValue}>{transactionId || 'N/A'}</Text>
                  <Ionicons 
                    name={copiedStates.transactionId ? "checkmark" : "copy-outline"} 
                    size={16} 
                    color={copiedStates.transactionId ? colors.success.main : colors.text.secondary} 
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Virtual Account Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>One-time Bank Account Details</Text>
              
              {renderCopyableField('Account Name', virtualAccountDetails.accountName, 'accountName')}
              {renderCopyableField('Account Number', virtualAccountDetails.accountNumber, 'accountNumber')}
              
              {virtualAccountDetails.routingNumber && (
                renderCopyableField('Routing Number', virtualAccountDetails.routingNumber, 'routingNumber')
              )}
              
              {virtualAccountDetails.iban && (
                renderCopyableField('IBAN', virtualAccountDetails.iban, 'iban')
              )}
              
              {virtualAccountDetails.swiftBic && (
                renderCopyableField('SWIFT/BIC', virtualAccountDetails.swiftBic, 'swiftBic')
              )}
              
              {renderCopyableField('Bank Name', virtualAccountDetails.bankName, 'bankName')}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Payment Instructions</Text>
              <Text style={styles.instructionsText}>
                1. Transfer {formatCurrency(sendAmount || 0, sendCurrency || 'USD')} to the account details above{'\n'}
                2. Use the transaction ID above as transfer reference.{'\n'}
                3. Recipient will receive {formatCurrency(receiveAmount || sendAmount || 0, receiveCurrency || 'EUR')}{'\n'}
                4. Payment will be automatically confirmed once received{'\n'}
                5. Upload your transfer receipt (optional){'\n'}
                6. Click "I've paid" after completing the transfer
              </Text>
            </View>

            {/* Receipt Upload Section */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>Upload Transfer Receipt (Optional)</Text>
              
              {uploadedFile ? (
                <View style={styles.receiptPreviewContainer}>
                  <View style={styles.receiptPreview}>
                    {uploadedFile.mimeType?.startsWith('image/') ? (
                      <Image 
                        source={{ uri: uploadedFile.uri }} 
                        style={styles.receiptPreviewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.receiptPreviewIcon}>
                        <Ionicons name="document-text" size={32} color={colors.primary.main} />
                      </View>
                    )}
                    <View style={styles.receiptPreviewInfo}>
                      <Text style={styles.receiptPreviewName} numberOfLines={1}>
                        {uploadedFile.name || 'Receipt'}
                      </Text>
                      {uploadedFile.size && (
                        <Text style={styles.receiptPreviewSize}>
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.receiptRemoveButton}
                      onPress={handleRemoveReceipt}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.receiptUploadButton}
                  onPress={handleUploadReceipt}
                  disabled={isUploading}
                  activeOpacity={0.7}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color={colors.primary.main} />
                      <Text style={styles.receiptUploadButtonText}>Upload Receipt</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              
              {uploadError && (
                <Text style={styles.receiptError}>{uploadError}</Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Action Button */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPayment}
            activeOpacity={0.8}
            disabled={paymentConfirmed}
          >
            <LinearGradient
              colors={paymentConfirmed 
                ? [colors.neutral[400], colors.neutral[400]] 
                : colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>
                {paymentConfirmed ? 'Processing...' : "I've paid"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  summaryContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  summaryTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  summaryValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
  },
  fieldContainer: {
    marginBottom: spacing[3],
  },
  fieldLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginBottom: spacing[0.5],
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  fieldValue: {
    flex: 1,
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  instructionsContainer: {
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 0.5,
    borderColor: colors.primary.main + '30',
  },
  instructionsTitle: {
    ...textStyles.titleMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[2],
  },
  instructionsText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    backgroundColor: colors.background.primary,
  },
  confirmButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    ...textStyles.titleLarge,
    color: colors.text.inverse,
    fontFamily: 'Outfit-SemiBold',
  },
  receiptSection: {
    marginBottom: spacing[5],
  },
  receiptSectionTitle: {
    ...textStyles.titleMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: spacing[3],
  },
  receiptUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    gap: spacing[2],
  },
  receiptUploadButtonText: {
    ...textStyles.bodyLarge,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  receiptPreviewContainer: {
    marginTop: spacing[2],
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    gap: spacing[3],
  },
  receiptPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  receiptPreviewIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPreviewInfo: {
    flex: 1,
  },
  receiptPreviewName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    marginBottom: spacing[0.5],
  },
  receiptPreviewSize: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  receiptRemoveButton: {
    padding: spacing[1],
  },
  receiptError: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    fontFamily: 'Outfit-Regular',
    marginTop: spacing[2],
  },
})

