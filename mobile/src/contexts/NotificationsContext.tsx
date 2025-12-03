import React, { createContext, useContext, useState, useEffect } from 'react'
import { pushNotificationService } from '../lib/pushNotificationService'
import * as Notifications from 'expo-notifications'
import { colors } from '../theme'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  time: string
  read: boolean
  icon: string
  color: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Notification) => void
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Helper function to convert push notification to app notification
function convertPushNotificationToAppNotification(
  notification: Notifications.Notification
): Notification {
  const data = notification.request.content.data || {}
  const title = notification.request.content.title || 'Notification'
  const body = notification.request.content.body || ''
  
  // Determine icon and color based on notification type
  let icon = 'bell'
  let color = colors.text.primary
  let type = data.type || 'general'

  if (type.includes('transaction_sent') || type.includes('sent')) {
    icon = 'arrow-up-right'
    color = colors.text.primary
  } else if (type.includes('transaction_received') || type.includes('received')) {
    icon = 'arrow-down-left'
    color = colors.primary.main
  } else if (type.includes('approved')) {
    icon = 'check-circle'
    color = colors.success.main
  } else if (type.includes('failed') || type.includes('denied')) {
    icon = 'x-circle'
    color = colors.error.main
  } else if (type.includes('security') || type.includes('alert')) {
    icon = 'alert-circle'
    color = colors.warning.main
  } else if (type.includes('card')) {
    icon = 'credit-card'
    color = colors.text.primary
  }

  // Format time
  const now = new Date()
  const notificationTime = new Date(notification.date)
  const diffMs = now.getTime() - notificationTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let time = 'Just now'
  if (diffMins > 0 && diffMins < 60) {
    time = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else if (diffHours > 0 && diffHours < 24) {
    time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays > 0 && diffDays < 7) {
    time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    time = notificationTime.toLocaleDateString()
  }

  return {
    id: notification.request.identifier || `notif-${Date.now()}`,
    type,
    title,
    message: body,
    time,
    read: false,
    icon,
    color,
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter(n => !n.read).length

  // Update badge count when unread count changes
  useEffect(() => {
    pushNotificationService.setBadgeCount(unreadCount).catch(console.error)
  }, [unreadCount])

  // Listen for push notifications
  useEffect(() => {
    const subscription = pushNotificationService.addNotificationReceivedListener(
      async (notification) => {
        const appNotification = convertPushNotificationToAppNotification(notification)
        setNotifications(prev => [appNotification, ...prev])
      }
    )

    return () => {
      pushNotificationService.removeNotificationSubscription(subscription)
    }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }

  const refreshNotifications = async () => {
    // TODO: Fetch notifications from backend API
    // const response = await apiClient.get('/notifications')
    // setNotifications(response.data)
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        setNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

