import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'

interface ReceiveTransaction {
  id: string
  transaction_id: string
  stellar_transaction_hash: string
  crypto_amount: number
  crypto_currency: string
  fiat_amount: number
  fiat_currency: string
  exchange_rate: number
  status: string
  created_at: string
  confirmed_at?: string
  converted_at?: string
  deposited_at?: string
  crypto_wallet: {
    wallet_address: string
    crypto_currency: string
    recipient: {
      full_name: string
      account_number: string
      bank_name: string
    }
  }
}

function ReceiveTransactionDetailsContent({ navigation, route }: NavigationProps) {
  const { userProfile } = useAuth()
  const transactionId = route?.params?.transactionId as string
  const [transaction, setTransaction] = useState<ReceiveTransaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (transactionId) {
      loadTransaction()
    }
  }, [transactionId])

  const loadTransaction = async () => {
    try {
      setLoading(true)
      const apiBase = process.env.EXPO_PUBLIC_API_URL || ''
      const response = await fetch(`${apiBase}/api/crypto/receive/${transactionId}`)
      if (response.ok) {
        const data = await response.json()
        setTransaction(data.transaction)
      } else {
        Alert.alert('Error', 'Transaction not found')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Error loading transaction:', error)
      Alert.alert('Error', 'Failed to load transaction')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deposited':
        return '#10b981'
      case 'converted':
      case 'converting':
        return '#f59e0b'
      case 'confirmed':
        return '#007ACC'
      case 'pending':
        return '#6b7280'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStages = () => {
    if (!transaction) return []

    return [
      {
        id: 'pending',
        title: 'Waiting for Deposit',
        completed: true,
        timestamp: transaction.created_at,
      },
      {
        id: 'confirmed',
        title: 'Confirmed',
        completed: transaction.status !== 'pending',
        timestamp: transaction.confirmed_at,
      },
      {
        id: 'converting',
        title: 'Converting',
        completed: ['converting', 'converted', 'deposited'].includes(transaction.status),
        timestamp: transaction.converted_at,
      },
      {
        id: 'deposited',
        title: 'Deposited',
        completed: transaction.status === 'deposited',
        timestamp: transaction.deposited_at,
      },
    ]
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

  if (!transaction) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Transaction not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    )
  }

  const stages = getStages()
  const statusColor = getStatusColor(transaction.status)

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {transaction.transaction_id}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stellar Hash</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {transaction.stellar_transaction_hash.slice(0, 20)}...
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amounts</Text>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Stablecoin Received</Text>
            <Text style={styles.amountValue}>
              {transaction.crypto_amount} {transaction.crypto_currency}
            </Text>
          </View>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Exchange Rate</Text>
            <Text style={styles.amountValue}>
              1 {transaction.crypto_currency} = {transaction.exchange_rate.toFixed(4)}{' '}
              {transaction.fiat_currency}
            </Text>
          </View>
          <View style={[styles.amountCard, styles.fiatCard]}>
            <Text style={styles.amountLabel}>Fiat Amount</Text>
            <Text style={styles.fiatAmount}>
              {transaction.fiat_amount.toLocaleString()} {transaction.fiat_currency}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          {stages.map((stage, index) => (
            <View key={stage.id} style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                {stage.completed ? (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                ) : (
                  <Ionicons name="time-outline" size={24} color="#d1d5db" />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[styles.timelineTitle, !stage.completed && styles.timelineTitleInactive]}
                >
                  {stage.title}
                </Text>
                {stage.timestamp && (
                  <Text style={styles.timelineTime}>
                    {new Date(stage.timestamp).toLocaleString()}
                  </Text>
                )}
              </View>
              {index < stages.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    stage.completed && styles.timelineLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet & Recipient</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet Address</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {transaction.crypto_wallet?.wallet_address}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Deposit Account</Text>
            <Text style={styles.infoValue}>{transaction.crypto_wallet?.recipient?.full_name}</Text>
            <Text style={styles.infoSubtext}>
              {transaction.crypto_wallet?.recipient?.account_number}
            </Text>
            <Text style={styles.infoSubtext}>
              {transaction.crypto_wallet?.recipient?.bank_name}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  amountCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  fiatCard: {
    backgroundColor: '#ecfdf5',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  fiatAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineIcon: {
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineTitleInactive: {
    color: '#9ca3af',
  },
  timelineTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  timelineLineActive: {
    backgroundColor: '#10b981',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#007ACC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default function ReceiveTransactionDetailsScreen({ navigation, route }: NavigationProps) {
  return <ReceiveTransactionDetailsContent navigation={navigation} route={route} />
}

