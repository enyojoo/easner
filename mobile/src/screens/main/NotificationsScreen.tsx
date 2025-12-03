import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

export default function NotificationsScreen({ navigation }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    transactions: true,
    security: true,
    marketing: false,
  })

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
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

  const handleToggle = async (key: keyof typeof notifications) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    // TODO: Save notification preferences to backend
  }

  const renderToggleItem = (
    key: keyof typeof notifications,
    title: string,
    description: string,
    isLast: boolean = false
  ) => (
    <View style={[styles.toggleItem, !isLast && styles.toggleItemBorder]}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={notifications[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: '#d1d5db', true: colors.primary.main }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d1d5db"
      />
    </View>
  )

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing[5] }}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Header - Matching Send Flow */}
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
              <Text style={styles.subtitle}>Manage your notification preferences</Text>
            </View>
          </Animated.View>

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
            {/* Notification Channels */}
            <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notification Channels</Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'email',
                'Email Notifications',
                'Receive notifications via email'
              )}
              {renderToggleItem(
                'push',
                'Push Notifications',
                'Receive push notifications'
              )}
              {renderToggleItem(
                'sms',
                'SMS Notifications',
                'Receive notifications via SMS',
                true
              )}
            </View>
          </View>

          {/* Notification Types */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'transactions',
                'Transaction Updates',
                'Get notified about transaction status changes'
              )}
              {renderToggleItem(
                'security',
                'Security Alerts',
                'Receive important security notifications'
              )}
              {renderToggleItem(
                'marketing',
                'Marketing Updates',
                'Receive updates about new features and promotions',
                true
              )}
            </View>
          </View>
          </Animated.View>
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
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing[5],
    gap: spacing[4],
  },
  sectionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    marginBottom: spacing[4],
    paddingBottom: spacing[2],
  },
  sectionTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[3],
  },
  sectionContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  toggleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  toggleTitle: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Medium',
    marginBottom: spacing[1],
  },
  toggleDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
})

