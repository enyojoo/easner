import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { 
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Grid3x3,
  Hash,
  Apple,
  Car,
  TrendingUp,
  UtensilsCrossed,
  Backpack,
  Heart,
  Receipt,
} from 'lucide-react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'

// Mock data
const MOCK_EXPENSES = {
  amount: 8318.27,
  currency: 'USD',
}

const MOCK_TRANSACTION_COUNT = 66
const MOCK_CATEGORIES_COUNT = 8
const MOCK_TAGS_COUNT = 3

const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Groceries',
    icon: Apple,
    transactions: 18,
    amount: 3410.49,
    percentage: 41,
    color: colors.primary.main,
  },
  {
    id: '2',
    name: 'Car',
    icon: Car,
    transactions: 12,
    amount: 1580.47,
    percentage: 19,
    color: colors.primary.main,
  },
  {
    id: '3',
    name: 'Investments',
    icon: TrendingUp,
    transactions: 2,
    amount: 831.82,
    percentage: 10,
    color: colors.primary.main,
  },
  {
    id: '4',
    name: 'Restaurants',
    icon: UtensilsCrossed,
    transactions: 6,
    amount: 665.46,
    percentage: 8,
    color: colors.primary.main,
  },
  {
    id: '5',
    name: 'Travels',
    icon: Backpack,
    transactions: 3,
    amount: 582.27,
    percentage: 7,
    color: colors.primary.main,
  },
  {
    id: '6',
    name: 'Beauty & Health',
    icon: Heart,
    transactions: 3,
    amount: 499.09,
    percentage: 6,
    color: colors.primary.main,
  },
  {
    id: '7',
    name: 'Bills',
    icon: Receipt,
    transactions: 3,
    amount: 415.91,
    percentage: 5,
    color: colors.primary.main,
  },
]

function AnalyticsContent({ navigation }: NavigationProps) {
  const insets = useSafeAreaInsets()

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const renderCard = (type: 'income' | 'expenses') => {
    const isIncome = type === 'income'
    const data = isIncome ? MOCK_INCOME : MOCK_EXPENSES
    const Icon = isIncome ? ArrowDownLeft : ArrowUpRight
    const iconColor = isIncome ? '#10b981' : '#ef4444'
    const bgColor = isIncome ? '#d1fae5' : '#fee2e2'

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.cardIconContainer, { backgroundColor: bgColor }]}>
              <Icon size={24} color={iconColor} strokeWidth={2} />
            </View>
            <Text style={styles.cardLabel}>{isIncome ? 'Incomes' : 'Expenses'}</Text>
          </View>
          <Text style={styles.cardAmount}>
            {isIncome ? '' : '-'} {formatCurrency(data.amount, data.currency)}
          </Text>
        </View>
      </View>
    )
  }

  const renderCategoryItem = ({ item }: { item: typeof MOCK_CATEGORIES[0] }) => {
    const Icon = item.icon

    return (
      <View style={styles.categoryItem}>
        <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon size={20} color={item.color} strokeWidth={2} />
        </View>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryTransactions}>
              {item.transactions} transaction{item.transactions !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.categoryAmount}>
              - {formatCurrency(item.amount, 'USD')}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing[5] }}
          showsVerticalScrollIndicator={false}
        >
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
              <Text style={styles.title}>Expense Insights</Text>
              <Text style={styles.dateRange}>1 July - 31 July 2025</Text>
            </View>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // TODO: Open date picker
              }}
              activeOpacity={0.7}
            >
              <Calendar size={20} color={colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Expenses Card */}
          <View style={styles.cardContainer}>
            {renderCard('expenses')}
          </View>

          {/* Categories List */}
          <View style={styles.categoriesSection}>
            <FlatList
              data={MOCK_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
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
  scrollContainer: {
    flex: 1,
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
  dateRange: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    padding: spacing[5],
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  cardAmount: {
    ...textStyles.headlineMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
  },
  categoriesSection: {
    marginHorizontal: spacing[5],
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  categoryName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryPercentage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTransactions: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  categoryAmount: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 52,
  },
})

export default function AnalyticsScreen(props: NavigationProps) {
  return <AnalyticsContent {...props} />
}

