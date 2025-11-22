import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps, KYCSubmission } from '../../types'
import { kycService } from '../../lib/kycService'
import AsyncStorage from '@react-native-async-storage/async-storage'

function AccountVerificationContent({ navigation }: NavigationProps) {
  const { userProfile } = useAuth()
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userProfile?.id) return

    const loadSubmissions = async () => {
      try {
        // Check cache first
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        const cached = await AsyncStorage.getItem(CACHE_KEY)
        
        if (cached) {
          const { value, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minute cache
            setSubmissions(value || [])
            setLoading(false)
            // Fetch in background
            fetchSubmissions()
            return
          }
        }

        await fetchSubmissions()
      } catch (error) {
        console.error('Error loading submissions:', error)
        setLoading(false)
      }
    }

    const fetchSubmissions = async () => {
      try {
        const data = await kycService.getByUserId(userProfile.id)
        setSubmissions(data || [])
        
        // Update cache
        const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          value: data || [],
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [userProfile?.id])

  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")

  const bothCompleted = 
    identitySubmission?.status === "approved" && 
    addressSubmission?.status === "approved"

  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <View style={styles.badgeGray}>
          <Text style={styles.badgeTextGray}>Not started</Text>
        </View>
      )
    }

    switch (status) {
      case "approved":
        return (
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeTextGreen}>Done</Text>
          </View>
        )
      case "in_review":
        return (
          <View style={styles.badgeYellow}>
            <Text style={styles.badgeTextYellow}>In review</Text>
          </View>
        )
      case "rejected":
        return (
          <View style={styles.badgeRed}>
            <Text style={styles.badgeTextRed}>Rejected</Text>
          </View>
        )
      default:
        return (
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>Pending</Text>
          </View>
        )
    }
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007ACC" />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Account Verification</Text>
        </View>

        {/* Info Message */}
        {!bothCompleted && (
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Please complete KYC Identity and Address information for compliance.
              </Text>
            </View>
          </View>
        )}

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {/* Identity Verification Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('IdentityVerification')}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={24} color="#007ACC" />
                </View>
                <Text style={styles.cardTitle}>Identity verification</Text>
                <Text style={styles.cardDescription}>
                  Your ID document and ID verification information.
                </Text>
              </View>
              <View style={styles.cardRight}>
                {getStatusBadge(identitySubmission?.status)}
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Address Information Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AddressVerification')}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location-outline" size={24} color="#007ACC" />
                </View>
                <Text style={styles.cardTitle}>Address information</Text>
                <Text style={styles.cardDescription}>
                  Your home address and utility bill document.
                </Text>
              </View>
              <View style={styles.cardRight}>
                {getStatusBadge(addressSubmission?.status)}
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
  },
  cardsContainer: {
    padding: 20,
    gap: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextGreen: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextYellow: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextRed: {
    fontSize: 12,
    fontWeight: '500',
    color: '#991b1b',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextGray: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
})

export default function AccountVerificationScreen(props: NavigationProps) {
  return <AccountVerificationContent {...props} />
}





