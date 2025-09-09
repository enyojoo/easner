import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Clipboard,
  Image,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import BottomButton from '../../components/BottomButton'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import { NavigationProps, PaymentMethod, Currency } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'
import { transactionService } from '../../lib/transactionService'

export default function PaymentMethodScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { paymentMethods, refreshPaymentMethods, currencies, refreshTransactions } = useUserData()
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [transactionId, setTransactionId] = useState('')
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)

  const { sendAmount, sendCurrency, receiveAmount, receiveCurrency, exchangeRate, fee, feeType, recipient } = route.params || {}

  useEffect(() => {
    refreshPaymentMethods()
    // Generate transaction ID using new ETID prefix
    setTransactionId(`ETID${Date.now()}`)
  }, [])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
        Alert.alert('Success', 'Receipt uploaded successfully')
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

    setIsCreatingTransaction(true)
    try {
      // Debug logging
      console.log('Transaction data:', {
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
      
      // Create transaction in database
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

      // Upload receipt if file was selected
      if (uploadedFile && !isUploading) {
        try {
          // Note: Receipt upload would need to be implemented in transactionService
          console.log('Receipt upload would happen here:', uploadedFile)
        } catch (uploadError) {
          console.error('Error uploading receipt:', uploadError)
          // Don't block transaction creation if receipt upload fails
        }
      }

      // Refresh transactions list
      await refreshTransactions()

      // Navigate to transaction details page
      navigation.navigate('TransactionDetails', { 
        transactionId: transaction.transaction_id 
      })
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      Alert.alert('Error', error.message || 'Failed to create transaction. Please try again.')
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const FlagComponent = ({ currencyCode, size = 20 }: { currencyCode: string, size?: number }) => {
    const flag = getCountryFlag(currencyCode)
    return <Text style={{ fontSize: size }}>{flag}</Text>
  }

  const sendCurrencyData = currencies.find((c) => c.code === sendCurrency)
  const defaultMethod = getDefaultPaymentMethod(sendCurrency)
  const paymentMethodsForCurrency = getPaymentMethodsForCurrency(sendCurrency)

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
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Make Payment</Text>
            <View style={styles.timerContainer}>
              <Ionicons name="time" size={16} color="#f59e0b" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method - Dynamic based on admin settings */}
        <View style={styles.paymentContainer}>
          <View style={styles.paymentHeader}>
            <View style={styles.currencyIcon}>
              <FlagComponent currencyCode={sendCurrency} size={16} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>
                Transfer {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
              </Text>
              <Text style={styles.paymentSubtitle}>
                {fee > 0
                  ? `Send amount: ${formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee: ${formatCurrency(fee, sendCurrency)}`
                  : "Send money to complete your transfer"}
              </Text>
            </View>
          </View>

          {/* Render payment methods based on admin configuration */}
          {paymentMethodsForCurrency.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No payment methods configured for {sendCurrency}</Text>
              <Text style={styles.errorSubtext}>Please contact support</Text>
            </View>
          ) : (
            <View style={styles.paymentDetails}>
              {/* Payment Method Details */}
              <View style={styles.methodDetails}>
                {defaultMethod?.type === "bank_account" && (
                  <View style={styles.bankAccountCard}>
                    <View style={styles.methodHeader}>
                      <Ionicons name="business" size={16} color="#6b7280" />
                      <Text style={styles.methodName}>{defaultMethod.name}</Text>
                    </View>
                    <View style={styles.accountDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Name</Text>
                        <View style={styles.detailValue}>
                          <Text style={styles.detailText}>{defaultMethod.account_name}</Text>
                          <TouchableOpacity
                            onPress={() => handleCopy(defaultMethod.account_name || "", "accountName")}
                            style={styles.copyButton}
                          >
                            {copiedStates.accountName ? (
                              <Ionicons name="checkmark" size={12} color="#10b981" />
                            ) : (
                              <Ionicons name="copy" size={12} color="#6b7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Number</Text>
                        <View style={styles.detailValue}>
                          <Text style={styles.detailText}>{defaultMethod.account_number}</Text>
                          <TouchableOpacity
                            onPress={() => handleCopy(defaultMethod.account_number || "", "accountNumber")}
                            style={styles.copyButton}
                          >
                            {copiedStates.accountNumber ? (
                              <Ionicons name="checkmark" size={12} color="#10b981" />
                            ) : (
                              <Ionicons name="copy" size={12} color="#6b7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bank Name</Text>
                        <View style={styles.detailValue}>
                          <Text style={styles.detailText}>{defaultMethod.bank_name}</Text>
                          <TouchableOpacity
                            onPress={() => handleCopy(defaultMethod.bank_name || "", "bankName")}
                            style={styles.copyButton}
                          >
                            {copiedStates.bankName ? (
                              <Ionicons name="checkmark" size={12} color="#10b981" />
                            ) : (
                              <Ionicons name="copy" size={12} color="#6b7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Transaction ID Display */}
                      <View style={[styles.detailRow, styles.transactionIdRow]}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <View style={styles.detailValue}>
                          <Text style={styles.detailText}>{transactionId}</Text>
                          <TouchableOpacity
                            onPress={() => handleCopy(transactionId, "transactionId")}
                            style={styles.copyButton}
                          >
                            {copiedStates.transactionId ? (
                              <Ionicons name="checkmark" size={12} color="#10b981" />
                            ) : (
                              <Ionicons name="copy" size={12} color="#6b7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                {defaultMethod?.type === "qr_code" && (
                  <View style={styles.qrCodeCard}>
                    <View style={styles.methodHeader}>
                      <Ionicons name="qr-code" size={16} color="#6b7280" />
                      <Text style={styles.methodName}>{defaultMethod.name}</Text>
                    </View>
                    <View style={styles.qrCodeContainer}>
                      {defaultMethod.qr_code_data ? (
                        <Image
                          source={{ uri: defaultMethod.qr_code_data }}
                          style={styles.qrCodeImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.qrCodePlaceholder}>
                          <Ionicons name="qr-code" size={48} color="#9ca3af" />
                        </View>
                      )}
                    </View>
                    {defaultMethod.instructions && (
                      <Text style={styles.qrInstructions}>{defaultMethod.instructions}</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Important Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Important Instructions</Text>
                <View style={styles.instructionsCard}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>
                      Transfer exactly{' '}
                      <Text style={styles.instructionBold}>
                        {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                      </Text>
                      {fee > 0 && (
                        <Text style={styles.instructionSubtext}>
                          {'\n'}(Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee: {formatCurrency(fee, sendCurrency)})
                        </Text>
                      )}
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>
                      Include transaction ID <Text style={styles.instructionBold}>{transactionId}</Text>
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>Complete within <Text style={styles.instructionBold}>60 minutes</Text></Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={styles.instructionText}>Upload receipt for faster processing</Text>
                  </View>
                  {defaultMethod?.type === "qr_code" && (
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>Scan QR code with your mobile banking app</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Upload Receipt Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>Upload Receipt (Optional)</Text>
          
          {uploadError && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <View style={styles.errorAlertContent}>
                <Text style={styles.errorAlertTitle}>Upload Error</Text>
                <Text style={styles.errorAlertText}>{uploadError}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setUploadError(null)}
                style={styles.dismissButton}
              >
                <Ionicons name="close" size={12} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploadedFile && styles.uploadButtonSuccess,
              uploadError && styles.uploadButtonError
            ]}
            onPress={handleUploadReceipt}
            disabled={isUploading}
          >
            <View style={styles.uploadContent}>
              <Ionicons 
                name={uploadedFile ? "checkmark-circle" : "cloud-upload"} 
                size={24} 
                color={uploadedFile ? "#10b981" : uploadError ? "#ef4444" : "#6b7280"} 
              />
              <Text style={[
                styles.uploadText,
                uploadedFile && styles.uploadTextSuccess,
                uploadError && styles.uploadTextError
              ]}>
                {uploadedFile ? 'Receipt Uploaded' : isUploading ? 'Uploading...' : 'Upload Receipt'}
              </Text>
              {uploadedFile && (
                <Text style={styles.uploadFileName}>{uploadedFile.name}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        </ScrollView>
        
        {/* Bottom Button */}
        <BottomButton
          title={isCreatingTransaction ? "Creating Transaction..." : "I've paid"}
          onPress={handleContinue}
          disabled={isCreatingTransaction}
        />
      </View>
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  paymentContainer: {
    margin: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencyFlag: {
    fontSize: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#dc2626',
  },
  paymentDetails: {
    gap: 16,
  },
  methodDetails: {
    gap: 16,
  },
  bankAccountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrCodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  accountDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIdRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  qrCodeContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrCodeImage: {
    width: 120,
    height: 120,
  },
  qrCodePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrInstructions: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionsContainer: {
    gap: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  instructionBullet: {
    fontSize: 12,
    color: '#f59e0b',
    marginRight: 8,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
    lineHeight: 16,
  },
  instructionBold: {
    fontWeight: '600',
  },
  instructionSubtext: {
    fontSize: 10,
    color: '#a16207',
  },
  uploadSection: {
    margin: 20,
    gap: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  errorAlertContent: {
    flex: 1,
    marginLeft: 8,
  },
  errorAlertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 2,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#dc2626',
  },
  dismissButton: {
    padding: 4,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  uploadButtonSuccess: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  uploadButtonError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  uploadTextSuccess: {
    color: '#10b981',
  },
  uploadTextError: {
    color: '#ef4444',
  },
  uploadFileName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
})
