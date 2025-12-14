import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { 
  PieChart,
  ArrowDownLeft, 
  ArrowUpRight, 
  Monitor,
  Apple,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import ScreenWrapper from '../../components/ScreenWrapper'
import { ShimmerLoader } from '../../components/premium'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

// Mock card transactions - in production, this would come from an API
const MOCK_CARD_TRANSACTIONS = [
  {
    id: '1',
    merchant: 'Apple',
    amount: 1250.00,
    currency: 'USD',
    date: 'Today, 2:40 PM',
    icon: 'monitor',
    status: 'approved',
  },
  {
    id: '2',
    merchant: 'Lidl',
    amount: 124.10,
    currency: 'USD',
    date: 'Yesterday, 6:51 PM',
    icon: 'apple',
    status: 'denied',
  },
  {
    id: '3',
    merchant: 'Amazon',
    amount: 89.50,
    currency: 'USD',
    date: '2 days ago, 10:15 AM',
    icon: 'monitor',
    status: 'reversed',
  },
  {
    id: '4',
    merchant: 'Starbucks',
    amount: 5.75,
    currency: 'USD',
    date: '3 days ago, 8:30 AM',
    icon: 'apple',
    status: 'approved',
  },
  {
    id: '5',
    merchant: 'Uber',
    amount: 32.50,
    currency: 'USD',
    date: '4 days ago, 6:15 PM',
    icon: 'monitor',
    status: 'approved',
  },
  {
    id: '6',
    merchant: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    date: '5 days ago, 12:00 PM',
    icon: 'monitor',
    status: 'approved',
  },
  {
    id: '7',
    merchant: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    date: '6 days ago, 9:45 AM',
    icon: 'apple',
    status: 'approved',
  },
  {
    id: '8',
    merchant: 'Target',
    amount: 156.78,
    currency: 'USD',
    date: '1 week ago, 3:20 PM',
    icon: 'monitor',
    status: 'approved',
  },
]

// Transaction Item Component
function TransactionItem({ 
  item, 
  isLast,
  onPress,
  formatAmount,
  getTransactionIcon,
  getStatusColor,
}: { 
  item: typeof MOCK_CARD_TRANSACTIONS[0]
  isLast: boolean
  onPress: () => void
  formatAmount: (amount: number, currency: string) => string
  getTransactionIcon: (iconType: string) => React.ReactNode
  getStatusColor: (status: string) => { text: string }
}) {
  return (
    <TouchableOpacity
      style={[styles.transactionItem, isLast && styles.transactionItemLast]}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.7}
    >
      <View style={styles.transactionIconBox}>
        {getTransactionIcon(item.icon)}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>{item.merchant}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={styles.transactionAmount}>
          - {formatAmount(item.amount, item.currency)}
        </Text>
        <Text style={[styles.transactionStatusText, { color: getStatusColor(item.status).text }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

// Loading Skeleton - Frame Only
function TransactionsSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ShimmerLoader 
          key={i}
          width="100%" 
          height={72} 
          borderRadius={borderRadius.md}
          style={{ marginBottom: spacing[2] }}
        />
      ))}
    </View>
  )
}

export default function TransactionCardScreen({ navigation }: NavigationProps) {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [transactions, setTransactions] = useState(MOCK_CARD_TRANSACTIONS)

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getTransactionIcon = (iconType: string) => {
    switch (iconType) {
      case 'monitor':
        return <Monitor size={16} color={colors.primary.main} strokeWidth={2.5} />
      case 'apple':
        return <Apple size={16} color={colors.primary.main} strokeWidth={2.5} />
      default:
        return <Monitor size={16} color={colors.primary.main} strokeWidth={2.5} />
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencySymbol = currency === 'USD' ? '$' : '€'
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { text: colors.success.main }
      case 'denied':
        return { text: colors.error.main }
      case 'reversed':
        return { text: colors.warning.main }
      default:
        return { text: colors.text.secondary }
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.merchant.toLowerCase().includes(searchLower) ||
      transaction.id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
            <Text style={styles.title}>Card Transactions</Text>
            <Text style={styles.subtitle}>All card activity</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by merchant or ID..."
              placeholderTextColor={colors.neutral[400]}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Transactions List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary.main}
            />
          }
        >
          <View style={styles.transactionsContainer}>
            {loading ? (
              <TransactionsSkeleton />
            ) : filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="receipt-outline" size={48} color={colors.neutral[400]} />
                </View>
                <Text style={styles.emptyTitle}>No transactions found</Text>
                <Text style={styles.emptyText}>
                  {searchTerm 
                    ? 'Try adjusting your search' 
                    : 'No card transactions yet'
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.listContent}>
                {filteredTransactions.map((item, index) => {
                  const isLast = index === filteredTransactions.length - 1
                  
                  return (
                    <TransactionItem
                      key={item.id}
                      item={item}
                      isLast={isLast}
                      onPress={() => {
                        navigation.navigate('TransactionDetails', { 
                          transactionId: item.id,
                          fromScreen: 'TransactionCard'
                        })
                      }}
                      formatAmount={formatAmount}
                      getTransactionIcon={getTransactionIcon}
                      getStatusColor={getStatusColor}
                    />
                  )
                })}
              </View>
            )}
          </View>
        </ScrollView>
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
    gap: spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[5],
  },
  transactionsContainer: {
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },
  listContent: {
    paddingHorizontal: spacing[5],
  },
  skeletonContainer: {
    paddingHorizontal: spacing[5],
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    marginBottom: spacing[1],
  },
  transactionDate: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    gap: spacing[0.5],
  },
  transactionAmount: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionStatusText: {
    ...textStyles.bodySmall,
    fontFamily: 'Outfit-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[5],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
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
    textAlign: 'center',
  },
})

