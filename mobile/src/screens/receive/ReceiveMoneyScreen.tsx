import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'

interface CryptoWallet {
  id: string
  crypto_currency: string
  wallet_address: string
  fiat_currency: string
  status: string
  transaction_count: number
  recipient: {
    full_name: string
    account_number: string
    bank_name: string
  }
}

function ReceiveMoneyContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const [wallets, setWallets] = useState<CryptoWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [featureEnabled, setFeatureEnabled] = useState(false)

  useEffect(() => {
    checkFeatureFlag()
  }, [])

  useEffect(() => {
    if (featureEnabled) {
      loadWallets()
    }
  }, [featureEnabled])

  const checkFeatureFlag = async () => {
    try {
      const response = await fetch('/api/feature-flags/crypto_receive_enabled')
      if (response.ok) {
        const data = await response.json()
        setFeatureEnabled(data.is_enabled || false)
        if (!data.is_enabled) {
          navigation.goBack()
        }
      }
    } catch (error) {
      console.error('Error checking feature flag:', error)
      navigation.goBack()
    }
  }

  const loadWallets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crypto/wallets')
      if (response.ok) {
        const data = await response.json()
        setWallets(data.wallets || [])
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
      Alert.alert('Error', 'Failed to load wallets')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadWallets()
    setRefreshing(false)
  }

  if (!featureEnabled) {
    return null
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

  const renderWallet = ({ item }: { item: CryptoWallet }) => (
    <TouchableOpacity
      style={styles.walletCard}
      onPress={() => {
        // Navigate to wallet details or transaction list
        // For now, show alert
        Alert.alert('Wallet Details', `View transactions for ${item.crypto_currency} wallet`)
      }}
    >
      <View style={styles.walletHeader}>
        <View style={styles.walletIcon}>
          <Ionicons name="wallet-outline" size={24} color="#007ACC" />
        </View>
        <View style={styles.walletInfo}>
          <Text style={styles.walletCurrency}>{item.crypto_currency}</Text>
          <Text style={styles.walletAddress} numberOfLines={1}>
            {item.wallet_address.slice(0, 12)}...{item.wallet_address.slice(-8)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
      <View style={styles.walletFooter}>
        <Text style={styles.linkedAccount}>
          {item.recipient?.full_name} • {item.fiat_currency}
        </Text>
        <Text style={styles.transactionCount}>
          {item.transaction_count} transaction{item.transaction_count !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Receive Money</Text>
          <Text style={styles.subtitle}>Receive Money via Stablecoins to your local account</Text>
        </View>

        <FlatList
          data={wallets}
          renderItem={renderWallet}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No Wallets Yet</Text>
              <Text style={styles.emptySubtext}>Create your first wallet to start receiving stablecoins</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateWallet')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Create Your First Wallet</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={wallets.length === 0 ? styles.emptyList : styles.list}
        />

        {wallets.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => Alert.alert('Coming Soon', 'Wallet creation flow will be implemented soon')}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
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
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  linkedAccount: {
    fontSize: 14,
    color: '#374151',
  },
  transactionCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007ACC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007ACC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007ACC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default function ReceiveMoneyScreen({ navigation }: NavigationProps) {
  return <ReceiveMoneyContent navigation={navigation} />
}

