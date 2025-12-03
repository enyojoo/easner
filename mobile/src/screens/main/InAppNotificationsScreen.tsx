import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { 
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Bell,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { useNotifications } from '../../contexts/NotificationsContext'

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'transaction_sent',
    title: 'Payment Sent',
    message: 'You sent $1,250.00 to Apple',
    time: '2 minutes ago',
    read: false,
    icon: 'arrow-up-right',
    color: colors.text.primary,
  },
  {
    id: '2',
    type: 'transaction_received',
    title: 'Payment Received',
    message: 'You received $500.00 from Maria',
    time: '1 hour ago',
    read: false,
    icon: 'arrow-down-left',
    color: colors.primary.main,
  },
  {
    id: '3',
    type: 'transaction_approved',
    title: 'Transaction Approved',
    message: 'Your payment of $89.50 to Amazon has been approved',
    time: '3 hours ago',
    read: true,
    icon: 'check-circle',
    color: colors.success.main,
  },
  {
    id: '4',
    type: 'card_transaction',
    title: 'Card Transaction',
    message: 'Card ending in 1234 used at Starbucks',
    time: '5 hours ago',
    read: true,
    icon: 'credit-card',
    color: colors.text.primary,
  },
  {
    id: '5',
    type: 'transaction_failed',
    title: 'Transaction Failed',
    message: 'Payment to Lidl was declined. Insufficient funds.',
    time: 'Yesterday',
    read: true,
    icon: 'x-circle',
    color: colors.error.main,
  },
  {
    id: '6',
    type: 'security_alert',
    title: 'Security Alert',
    message: 'New login detected from a new device',
    time: '2 days ago',
    read: true,
    icon: 'alert-circle',
    color: colors.warning.main,
  },
  {
    id: '7',
    type: 'transaction_received',
    title: 'Payment Received',
    message: 'You received €200.00 from John',
    time: '3 days ago',
    read: true,
    icon: 'arrow-down-left',
    color: colors.primary.main,
  },
  {
    id: '8',
    type: 'transaction_approved',
    title: 'Transaction Approved',
    message: 'Your payment of $32.50 to Uber has been approved',
    time: '1 week ago',
    read: true,
    icon: 'check-circle',
    color: colors.success.main,
  },
]

// Notification Item Component
function NotificationItem({ 
  item, 
  onPress,
  onMarkAsRead,
}: { 
  item: Notification
  onPress: () => void
  onMarkAsRead: () => void
}) {
  const getIcon = () => {
    const iconSize = 20
    const iconColor = item.color
    
    switch (item.icon) {
      case 'arrow-up-right':
        return <ArrowUpRight size={iconSize} color={iconColor} strokeWidth={2.5} />
      case 'arrow-down-left':
        return <ArrowDownLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
      case 'check-circle':
        return <CheckCircle size={iconSize} color={iconColor} strokeWidth={2.5} />
      case 'x-circle':
        return <XCircle size={iconSize} color={iconColor} strokeWidth={2.5} />
      case 'alert-circle':
        return <AlertCircle size={iconSize} color={iconColor} strokeWidth={2.5} />
      case 'credit-card':
        return <CreditCard size={iconSize} color={iconColor} strokeWidth={2.5} />
      default:
        return <Bell size={iconSize} color={iconColor} strokeWidth={2.5} />
    }
  }

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (!item.read) {
          onMarkAsRead()
        }
        onPress()
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIconBox}>
        {getIcon()}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function InAppNotificationsScreen({ navigation }: NavigationProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    await refreshNotifications()
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshNotifications()
    setRefreshing(false)
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    markAllAsRead()
  }

  const handleNotificationPress = (notification: Notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'transaction_sent':
      case 'transaction_received':
      case 'transaction_approved':
      case 'transaction_failed':
        navigation.navigate('TransactionDetails', { 
          transactionId: notification.id,
          fromScreen: 'InAppNotifications'
        })
        break
      case 'card_transaction':
        navigation.navigate('TransactionCard', {})
        break
      default:
        // For other types, just mark as read
        break
    }
  }

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
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
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
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Bell size={48} color={colors.neutral[400]} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsContainer}>
              {notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onPress={() => handleNotificationPress(item)}
                  onMarkAsRead={() => handleMarkAsRead(item.id)}
                />
              ))}
            </View>
          )}
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
  markAllButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  markAllText: {
    ...textStyles.labelMedium,
    color: colors.primary.main,
    fontFamily: 'Outfit-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[5],
  },
  notificationsContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: colors.frame.background,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  notificationItemUnread: {
    backgroundColor: `${colors.primary.main}08`,
    borderColor: `${colors.primary.main}20`,
  },
  notificationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
    gap: spacing[2],
  },
  notificationTitle: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    flex: 1,
  },
  notificationTitleUnread: {
    fontFamily: 'Outfit-Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  notificationMessage: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginBottom: spacing[1],
  },
  notificationTime: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontFamily: 'Outfit-Regular',
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

