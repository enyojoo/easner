import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProps } from '../../types'
import { analytics } from '../../lib/analytics'

export default function SupportScreen({ navigation }: NavigationProps) {
  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Support')
  }, [])

  const handleEmailSupport = () => {
    const email = 'support@easner.com'
    const subject = 'Support Request'
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`)
  }

  const handleOpenLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat functionality will be implemented')
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

  const renderFAQItem = (item: { question: string; answer: string }, index: number) => (
    <View key={index} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  )

  const renderContactButton = (title: string, subtitle: string, onPress: () => void, icon: string) => (
    <TouchableOpacity style={styles.contactButton} onPress={onPress}>
      <Text style={styles.contactIcon}>{icon}</Text>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.contactArrow}>›</Text>
    </TouchableOpacity>
  )

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
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>We're here to help you</Text>
      </View>

      {/* Contact Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        {renderContactButton(
          'Email Support',
          'support@easner.com',
          handleEmailSupport,
          '📧'
        )}
        {renderContactButton(
          'Live Chat',
          'Chat with us in real-time',
          handleOpenLiveChat,
          '💬'
        )}
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map(renderFAQItem)}
      </View>

      {/* Support Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support Hours</Text>
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursText}>All week from 8 am to 11pm GMT+3</Text>
        </View>
      </View>

    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 100,
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
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007ACC',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactArrow: {
    fontSize: 20,
    color: '#9ca3af',
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
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  hoursContainer: {
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
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
