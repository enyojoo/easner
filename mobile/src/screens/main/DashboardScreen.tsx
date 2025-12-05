import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Monitor, 
  Apple, 
  ShoppingBag, 
  ArrowRight,
  Check
} from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationsContext'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'
import { bridgeService } from '../../lib/bridgeService'
import { useEffect } from 'react'
import { useFocusRefreshAll } from '../../hooks/useFocusRefresh'
import { useUserData } from '../../contexts/UserDataContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'received',
    name: 'Elise',
    amount: 300.00,
    currency: 'USD',
    date: 'Today, 5:32 PM',
    icon: 'inbox',
  },
  {
    id: '2',
    type: 'sent',
    name: 'Apple',
    amount: 1250.00,
    currency: 'USD',
    date: 'Today, 2:40 PM',
    icon: 'monitor',
  },
  {
    id: '3',
    type: 'sent',
    name: 'Lidl',
    amount: 124.10,
    currency: 'EUR',
    date: 'Yesterday, 6:51 PM',
    icon: 'shopping',
  },
  {
    id: '4',
    type: 'sent',
    name: 'Deron',
    amount: 50.00,
    currency: 'USD',
    date: 'Yesterday, 11:20 AM',
    icon: 'outbox',
  },
  {
    id: '5',
    type: 'received',
    name: 'Maria',
    amount: 500.00,
    currency: 'EUR',
    date: '2 days ago, 10:15 AM',
    icon: 'inbox',
  },
]

export default function DashboardScreen({ navigation }: NavigationProps) {
  const { user, userProfile } = useAuth()
  const { unreadCount } = useNotifications()
  const { refreshStaleData, refreshing: dataRefreshing } = useUserData()
  const insets = useSafeAreaInsets()
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR'>('USD')
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [balances, setBalances] = useState({ USD: '0', EUR: '0' })
  const [loadingBalances, setLoadingBalances] = useState(true)

  // Available currencies for the dropdown (USD/EUR only)
  const availableCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: require('../../../assets/flags/us.png') },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: require('../../../assets/flags/eu.png') },
  ]

  // Fetch balances from Bridge
  const fetchBalances = async () => {
    try {
      setLoadingBalances(true)
      // Add timeout to prevent hanging
      const walletBalances = await Promise.race([
        bridgeService.getWalletBalances(),
        new Promise<{ USD: string; EUR: string }>((resolve) => 
          setTimeout(() => resolve({ USD: '0', EUR: '0' }), 10000)
        )
      ])
      setBalances(walletBalances)
    } catch (error) {
      console.error('Error fetching balances:', error)
      // Keep existing balances on error, or set to zero if first load
      if (balances.USD === '0' && balances.EUR === '0') {
        setBalances({ USD: '0', EUR: '0' })
      }
    } finally {
      setLoadingBalances(false)
    }
  }

  // Load balances on mount
  useEffect(() => {
    fetchBalances()
  }, [])

  const balance = parseFloat(balances[selectedCurrency] || '0')

  // Get user's first name for greeting - use only the first word if multiple names exist
  const getDisplayName = () => {
    const fullFirstName = userProfile?.profile?.first_name || user?.first_name || 'User'
    // Extract only the first word (e.g., "David Mark" -> "David")
    return fullFirstName.split(' ')[0]
  }
  const displayName = getDisplayName()
  
  // Get user initials for avatar
  const getInitials = () => {
    const first = userProfile?.profile?.first_name?.[0] || user?.first_name?.[0] || 'U'
    const last = userProfile?.profile?.last_name?.[0] || user?.last_name?.[0] || 'S'
    return `${first}${last}`.toUpperCase()
  }

  const handleCurrencyChange = (currency: 'USD' | 'EUR') => {
    setSelectedCurrency(currency)
    setShowCurrencyDropdown(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const getTransactionIcon = (iconType: string, isReceived: boolean) => {
    const iconColor = colors.primary.main
    
    switch (iconType) {
      case 'inbox':
  return (
          <View style={styles.transactionIconBox}>
            <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.5} />
            </View>
        )
      case 'outbox':
        return (
          <View style={styles.transactionIconBox}>
            <ArrowUpRight size={16} color={iconColor} strokeWidth={2.5} />
              </View>
        )
      case 'monitor':
        return (
          <View style={styles.transactionIconBox}>
            <Monitor size={16} color={iconColor} strokeWidth={2.5} />
            </View>
        )
      case 'shopping':
        return (
          <View style={styles.transactionIconBox}>
            <Apple size={16} color={iconColor} strokeWidth={2.5} />
          </View>
        )
      default:
        return (
          <View style={styles.transactionIconBox}>
            <ArrowUpRight size={16} color={iconColor} strokeWidth={2.5} />
        </View>
        )
    }
  }

  const formatAmount = (amount: number, isReceived: boolean, currency: 'USD' | 'EUR' = 'USD') => {
    const sign = isReceived ? '' : '- '
    const currencySymbol = currency === 'USD' ? '$' : '€'
    return `${sign}${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatBalanceDisplay = (amount: number, currency: 'USD' | 'EUR'): string => {
    const currencySymbol = currency === 'USD' ? '$' : '€'
    
    // Format as "X Million" or "X Billion" if >= 100 million
    if (amount >= 100000000) {
      // Billions
      const billions = amount / 1000000000
      if (billions >= 1) {
        return `${currencySymbol}${billions.toFixed(1)} Billion`
      }
      // Millions (100M - 999M)
      const millions = amount / 1000000
      return `${currencySymbol}${millions.toFixed(1)} Million`
    }
    
    // Show full number for amounts below 100 million
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const renderCurrencyPicker = () => {
    // Calculate approximate height: header (80) + item height (80) * number of items + padding
    const itemHeight = 80
    const headerHeight = 80
    const padding = spacing[4]
    const estimatedHeight = headerHeight + (itemHeight * availableCurrencies.length) + padding + insets.bottom

  return (
      <Modal
        visible={showCurrencyDropdown}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowCurrencyDropdown(false)
      }}
    >
      <TouchableOpacity 
          style={styles.modalOverlay}
        activeOpacity={1}
          onPress={() => setShowCurrencyDropdown(false)}
        >
          <View style={[styles.modalContainer, { 
            maxHeight: estimatedHeight,
            paddingBottom: insets.bottom,
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Balance</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCurrencyDropdown(false)
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.currencyListContainer}>
              {availableCurrencies.map((item) => {
                const balance = parseFloat(balances[item.code as 'USD' | 'EUR'] || '0')
                // Use the same formatting as the main balance display for consistency
                const balanceDisplay = balanceVisible 
                  ? formatBalanceDisplay(balance, item.code as 'USD' | 'EUR')
                  : '••••••'
                const isSelected = selectedCurrency === item.code
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemActive
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      handleCurrencyChange(item.code as 'USD' | 'EUR')
                      setShowCurrencyDropdown(false)
                    }}
                  >
                    <View style={styles.flagContainerSmall}>
                      <Image 
                        source={item.flag}
                        style={styles.flagImageSmall}
                        resizeMode="cover"
                      />
            </View>
                    <View style={styles.currencyItemInfo}>
                      <Text style={styles.currencyItemCode}>{item.code} Balance</Text>
                      <Text style={styles.currencyItemBalance}>
                        {balanceDisplay}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <View style={styles.checkboxInner} />
                      )}
            </View>
                  </TouchableOpacity>
                )
              })}
          </View>
        </View>
      </TouchableOpacity>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with Greeting and Notification */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Header Content */}
          <View style={styles.headerContent}>
            {/* User Greeting with Avatar */}
            <View style={styles.greetingContainer}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('ProfileEdit' as any)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </TouchableOpacity>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingText}>
                  Hi {displayName} 👋
                </Text>
              </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('InAppNotifications' as never)
              }}
              activeOpacity={0.7}
            >
              <Bell size={22} color={colors.primary.main} strokeWidth={2} />
              {/* Notification Badge - Show when there are unread notifications */}
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <View style={styles.notificationBadgeDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content - White Card */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || dataRefreshing} 
            onRefresh={async () => {
              setRefreshing(true)
              try {
                // Refresh all data (forced - user pulled to refresh)
                await Promise.all([
                  refreshStaleData(), // Refresh stale user data
                  fetchBalances(), // Refresh balances
                ])
              } catch (error) {
                console.error('Error refreshing dashboard:', error)
              } finally {
                setRefreshing(false)
              }
            }}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.whiteCard}>
          {/* Currency Selector with Plus Button */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                // Open dropdown immediately
                setShowCurrencyDropdown(true)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Refresh balances in background to ensure they're in sync
                fetchBalances().catch(error => {
                  console.error('Error refreshing balances:', error)
                })
              }}
              activeOpacity={0.7}
            >
              <View style={styles.flagContainer}>
                <Image 
                  source={
                    selectedCurrency === 'USD' 
                      ? require('../../../assets/flags/us.png') 
                      : require('../../../assets/flags/eu.png')
                  }
                  style={styles.flagImage}
                  resizeMode="cover"
                />
          </View>
              <Text style={styles.currencyText}>{selectedCurrency} Balance</Text>
              <ChevronDown size={16} color={colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          <TouchableOpacity
              style={styles.addFundsButtonSmall}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Navigate to add funds
              }}
            activeOpacity={0.7}
          >
              <Plus size={20} color={colors.primary.main} strokeWidth={2.5} />
          </TouchableOpacity>
      </View>

          {/* Currency Picker Modal */}
          {renderCurrencyPicker()}

          {/* Balance Display */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>
              {balanceVisible 
                ? formatBalanceDisplay(balance, selectedCurrency)
                : '••••••'}
            </Text>
            <TouchableOpacity 
              style={styles.hideBalanceButton}
              onPress={toggleBalanceVisibility}
              activeOpacity={0.7}
            >
              {balanceVisible ? (
                <EyeOff size={22} color={colors.primary.main} strokeWidth={2} />
              ) : (
                <Eye size={22} color={colors.primary.main} strokeWidth={2} />
              )}
          </TouchableOpacity>
              </View>
              
          {/* Receive and Send Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('ReceiveMoney' as never, {
                  currency: selectedCurrency,
                } as never)
              }}
              activeOpacity={0.7}
            >
              <ArrowDownLeft size={20} color={colors.primary.main} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('SendAmount' as never)
              }}
              activeOpacity={0.7}
            >
              <ArrowUpRight size={20} color={colors.primary.main} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        </View>
        
        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate('Analytics' as never)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>All</Text>
              <ArrowRight size={14} color={colors.primary.main} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        
          {/* Transaction List */}
          {MOCK_TRANSACTIONS.map((transaction) => {
            const isReceived = transaction.type === 'received'
            return (
              <TouchableOpacity
                key={transaction.id} 
                style={styles.transactionItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('TransactionDetails' as never, { transactionId: transaction.id } as never)
                }}
                activeOpacity={0.7}
              >
                {getTransactionIcon(transaction.icon, isReceived)}
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>
                    {isReceived 
                      ? `Received from ${transaction.name}` 
                      : transaction.name === 'Deron' 
                        ? `Sent to ${transaction.name}` 
                        : transaction.name}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    isReceived && styles.transactionAmountReceived
                  ]}
                >
                  {formatAmount(transaction.amount, isReceived, transaction.currency as 'USD' | 'EUR')}
                </Text>
            </TouchableOpacity>
            )
          })}
      </View>
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary, // White/light background for the page
  },
  headerWrapper: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[1],
  },
  header: {
    paddingVertical: spacing[1],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Outfit-Bold',
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100, // Space for bottom navigation bar
  },
  whiteCard: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: 0,
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.full,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    height: 40,
  },
  flagContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  flagImage: {
    width: 24,
    height: 24,
  },
  currencyText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  addFundsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addFundsButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.frame.border,
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
  currencyListContainer: {
    paddingBottom: spacing[2],
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  currencyItemActive: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2,
  },
  currencyItemBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
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
  flagContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.frame.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImageSmall: {
    width: 24,
    height: 24,
  },
  currencyOptionText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text.primary,
    fontFamily: 'Outfit-Black',
    letterSpacing: -0.5,
    flex: 1,
  },
  hideBalanceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 50,
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  actionButtonText: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionsSection: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    marginHorizontal: spacing[5],
    marginTop: spacing[3],
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  transactionsTitle: {
    ...textStyles.headingSmall,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: '#B9CAFF',
    borderRadius: borderRadius.full,
  },
  viewAllText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  transactionAmount: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  transactionAmountReceived: {
    color: colors.primary.main,
  },
})
