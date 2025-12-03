import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { NavigationProps } from '../../types'
import { analytics } from '../../lib/analytics'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'

export default function SupportScreen({ navigation }: NavigationProps) {
  const insets = useSafeAreaInsets()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
  useEffect(() => {
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

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Support')
  }, [])

  const handleEmailSupport = () => {
    const email = 'support@easner.com'
    const subject = 'Support Request'
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`)
  }

  const handleOpenTelegram = () => {
    Linking.openURL('https://t.me/enyosam')
  }

  const toggleFAQ = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }



  const faqItems = [
    {
      question: 'How do I send money?',
      answer: 'To send money, tap the "Send Money" button on your dashboard, enter the amount and select currencies, choose a recipient, make payment using the displayed method, and confirm your transaction.'
    },
    {
      question: 'What are the fees?',
      answer: 'We charge absolutely no fees on any transaction. Send money worldwide completely free with Easner.'
    },
    {
      question: 'How long does it take?',
      answer: 'All transactions are completed within 5 minutes or less, ensuring your money reaches its destination quickly and efficiently.'
    }
  ]

  const renderFAQItem = (item: { question: string; answer: string }, index: number) => {
    const isLast = index === faqItems.length - 1
    return (
      <View key={index} style={[styles.faqItem, isLast && styles.faqItemLast]}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => toggleFAQ(index)}
        >
        <Text style={styles.faqQuestion}>{item.question}</Text>
          <Text style={styles.faqToggle}>{expandedFAQ === index ? '−' : '+'}</Text>
        </TouchableOpacity>
        {expandedFAQ === index && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </View>
    )
  }

  const renderContactButton = (title: string, subtitle: string, onPress: () => void, icon: string, isLast: boolean = false) => (
    <TouchableOpacity
      style={[styles.contactButton, isLast && styles.contactButtonLast]}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.contactIcon}>{icon}</Text>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
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
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>We're here to help you</Text>
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
      {/* Contact Options */}
            <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        {renderContactButton(
          'Email Support',
          'support@easner.com',
          handleEmailSupport,
          '📧',
          false
        )}
        {renderContactButton(
                'Telegram Chat',
                'Chat with us on Telegram',
                handleOpenTelegram,
          '💬',
          true
        )}
            </View>

      {/* FAQ Section */}
            <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map(renderFAQItem)}
            </View>

      {/* Support Hours */}
            <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Support Hours</Text>
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursText}>All week from 8 am to 11pm GMT+3</Text>
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
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  contactButtonLast: {
    borderBottomWidth: 0,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: spacing[4],
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...textStyles.bodyMedium,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing[0],
  },
  contactSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
  },
  sendButton: {
    backgroundColor: '#007ACC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    paddingHorizontal: spacing[5],
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  faqQuestion: {
    ...textStyles.bodyMedium,
    fontFamily: 'Outfit-Medium',
    color: colors.text.primary,
    flex: 1,
    paddingRight: spacing[4],
  },
  faqToggle: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '300',
  },
  faqAnswer: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    paddingBottom: spacing[4],
    paddingLeft: spacing[5],
    paddingRight: spacing[5],
  },
  hoursContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
  },
  hoursText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontFamily: 'Outfit-Regular',
  },
  timezoneText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  emergencyContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  emergencyText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 12,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
