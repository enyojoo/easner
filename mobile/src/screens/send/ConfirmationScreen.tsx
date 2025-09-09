import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useUserData } from '../../contexts/UserDataContext'
import BottomButton from '../../components/BottomButton'
import { NavigationProps, Transaction } from '../../types'
import { getCountryFlag } from '../../utils/flagUtils'

export default function ConfirmationScreen({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const { refreshTransactions } = useUserData()
  const [isProcessing, setIsProcessing] = useState(false)

  const { 
    sendAmount, 
    sendCurrency, 
    receiveAmount, 
    receiveCurrency, 
    exchangeRate, 
    fee, 
    feeType, 
    recipient, 
    paymentMethod 
  } = route.params || {}

  const handleConfirmTransaction = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    setIsProcessing(true)
    try {
      // In a real app, you would call the API to create the transaction
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate successful transaction creation
      const transactionId = `ETID${Date.now()}`
      
      Alert.alert(
        'Transaction Created',
        `Your transaction has been created successfully!\n\nTransaction ID: ${transactionId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              refreshTransactions()
              navigation.navigate('TransactionDetails', { transactionId })
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to create transaction. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
      
      <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Transfer</Text>
        <Text style={styles.subtitle}>Review your transaction details</Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Transfer Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>You're sending:</Text>
          <View style={styles.currencyValue}>
            <Text style={styles.currencyFlag}>{getCountryFlag(sendCurrency)}</Text>
            <Text style={styles.detailValue}>{formatCurrency(sendAmount, sendCurrency)}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Recipient gets:</Text>
          <View style={styles.currencyValue}>
            <Text style={styles.currencyFlag}>{getCountryFlag(receiveCurrency)}</Text>
            <Text style={styles.detailValue}>{formatCurrency(receiveAmount, receiveCurrency)}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Exchange rate:</Text>
          <Text style={styles.detailValue}>1 {sendCurrency} = {exchangeRate?.rate} {receiveCurrency}</Text>
        </View>
        
        {fee > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee ({feeType}):</Text>
            <Text style={styles.detailValue}>{formatCurrency(fee, sendCurrency)}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total amount:</Text>
          <Text style={[styles.detailValue, styles.totalAmount]}>
            {formatCurrency(sendAmount + fee, sendCurrency)}
          </Text>
        </View>
      </View>

      {/* Recipient Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Recipient Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>{recipient?.full_name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bank:</Text>
          <Text style={styles.detailValue}>{recipient?.bank_name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account:</Text>
          <Text style={styles.detailValue}>****{recipient?.account_number?.slice(-4)}</Text>
        </View>
      </View>

      {/* Payment Method Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{paymentMethod?.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{paymentMethod?.type?.replace('_', ' ').toUpperCase()}</Text>
        </View>
        
        {paymentMethod?.account_name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account:</Text>
            <Text style={styles.detailValue}>{paymentMethod.account_name}</Text>
          </View>
        )}
      </View>

      {/* Transaction Info */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Transaction Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate()}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated delivery:</Text>
          <Text style={styles.detailValue}>1-3 business days</Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By confirming this transfer, you agree to our Terms of Service and Privacy Policy. 
          This transaction is subject to our exchange rates and fees at the time of processing.
        </Text>
      </View>

      </ScrollView>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
          onPress={handleConfirmTransaction}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
          )}
        </TouchableOpacity>
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
  scrollView: {
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
  detailsContainer: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
  },
  currencyValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  currencyFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    color: '#007ACC',
  },
  termsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007ACC',
  },
  termsText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#007ACC',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
