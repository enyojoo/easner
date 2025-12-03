import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigationProps } from '../../types'
import { colors, textStyles, borderRadius, spacing } from '../../theme'
import { verifyPin, getPinLockTimeRemaining, updateSessionActivity } from '../../lib/pinAuth'
import { useAuth } from '../../contexts/AuthContext'

export default function PinEntryScreen({ navigation: navigationProp }: NavigationProps) {
  const { user, userProfile, signOut } = useAuth()
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locked, setLocked] = useState(false)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const shakeAnim = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()


  useEffect(() => {
    checkLockStatus()
    const interval = setInterval(checkLockStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  const checkLockStatus = async () => {
    const remaining = await getPinLockTimeRemaining()
    if (remaining > 0) {
      setLocked(true)
      setLockedUntil(Date.now() + remaining)
    } else {
      setLocked(false)
      setLockedUntil(null)
    }
  }

  const handleNumberPress = (num: string) => {
    if (loading || locked) return
    
    const filledCount = pin.filter(d => d !== '').length
    
    if (filledCount >= 6) return

    setError('')
    const newPin = [...pin]
    newPin[filledCount] = num
    setPin(newPin)
    
    if (filledCount === 5) {
      // All 6 digits entered, verify
      setTimeout(() => {
        handleVerifyPin(newPin.join(''))
      }, 300)
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleBackspace = () => {
    if (loading || locked) return
    
    const filledCount = pin.filter(d => d !== '').length
    
    if (filledCount === 0) return

    setError('')
    const newPin = [...pin]
    newPin[filledCount - 1] = ''
    setPin(newPin)
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleVerifyPin = async (pinString?: string) => {
    const pinToVerify = pinString || pin.join('')
    
    if (pinToVerify.length !== 6) {
      return
    }

    setLoading(true)
    setError('') // Clear any previous errors
    
    // Verify PIN - this is now instant (local cache check)
    const result = await verifyPin(pinToVerify, user?.id)

    if (result.success) {
      // PIN verified successfully - trigger navigation IMMEDIATELY
      // No delays, no waiting - instant like email/password login
      try {
        const triggerPinCheck = (global as any).triggerPinCheck
        if (triggerPinCheck) {
          triggerPinCheck() // Directly sets sessionValid=true for instant navigation
        }
      } catch (error) {
        // Fallback: polling will catch it
      }
      
      // Haptic feedback (non-blocking, fire and forget)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      
      // Navigation happens immediately via triggerPinCheck
      // Loading state will clear when screen changes
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setError(result.error || 'Incorrect PIN')
      setLocked(result.locked || false)
      setLockedUntil(result.lockedUntil || null)

      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start()

      // Clear PIN on error
      setPin(['', '', '', '', '', ''])
      setLoading(false) // Only set loading to false on error
    }
  }

  const handleForgotPin = () => {
    Alert.alert(
      'Forgot PIN?',
      'You will need to login with your email and password to reset your PIN.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          onPress: async () => {
            // Sign out to go to login page
            await signOut()
          },
        },
      ]
    )
  }

  const formatLockTime = (lockedUntil: number) => {
    const remaining = Math.ceil((lockedUntil - Date.now()) / 60000)
    return `${remaining} minute(s)`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getUserName = () => {
    // Check userProfile first (most up-to-date), then fallback to user object
    return userProfile?.profile?.first_name || user?.first_name || ''
  }

  const filledCount = pin.filter(d => d !== '').length

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header - Help Icon */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleForgotPin}
            activeOpacity={0.7}
          >
            <View style={styles.headerButtonCircle}>
              <Ionicons name="help-circle-outline" size={20} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}{getUserName() ? ',' : ''}
            </Text>
            {getUserName() ? (
              <Text style={styles.greetingName}>
                {getUserName()}!
              </Text>
            ) : (
              <Text style={styles.greetingName}>!</Text>
            )}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* PIN Dots - Light gray circles */}
          <Animated.View
            style={[
              styles.pinDotsContainer,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {pin.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  digit !== '' && styles.pinDotFilled,
                  error && styles.pinDotError,
                  locked && styles.pinDotDisabled,
                ]}
              />
            ))}
          </Animated.View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {locked && lockedUntil
              ? `PIN is locked. Try again in ${formatLockTime(lockedUntil)}`
              : 'Enter your 6-digit PIN to access your account'}
          </Text>

          {/* Loading Indicator */}
          {loading && !error && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          )}

          {/* Numeric Keypad - 3x3 grid + 0 and backspace */}
          <View style={styles.keypadContainer}>
            {/* Numbers 1-9 in 3x3 grid */}
            <View style={styles.keypadGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.keypadButton}
                  onPress={() => handleNumberPress(num.toString())}
                  onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  activeOpacity={0.6}
                  disabled={loading || locked}
                >
                  <Text style={styles.keypadButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom row: 0 in center, backspace on right */}
            <View style={styles.keypadBottomRow}>
              <View style={styles.keypadButtonSpacer} />
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => handleNumberPress('0')}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.6}
                disabled={loading || locked}
              >
                <Text style={styles.keypadButtonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={handleBackspace}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.6}
                disabled={loading || locked || filledCount === 0}
              >
                <Ionicons 
                  name="backspace" 
                  size={24} 
                  color={filledCount === 0 ? colors.text.secondary : colors.text.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Text */}
          <TouchableOpacity
            style={styles.logoutLink}
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                      // Call signOut to properly clear session
                      // AppNavigator will automatically show onboarding screen after logout
                      await signOut()
                    },
                  },
                ]
              )
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>
              Not your account? <Text style={styles.logoutLinkText}>Log out</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  headerSpacer: {
    flex: 1,
  },
  headerButton: {
    padding: spacing[1],
  },
  headerButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.frame.background,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    justifyContent: 'space-between',
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  greeting: {
    fontSize: 32,
    lineHeight: 40,
    color: colors.text.primary,
    fontFamily: 'Outfit-Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  greetingName: {
    fontSize: 32,
    lineHeight: 40,
    color: colors.text.primary,
    fontFamily: 'Outfit-Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  pinDotFilled: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  pinDotError: {
    borderColor: colors.error.main,
  },
  pinDotDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  keypadContainer: {
    width: '100%',
    marginBottom: spacing[8],
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[5],
    marginBottom: spacing[4],
  },
  keypadButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadButtonText: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.text.primary,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '600',
  },
  keypadBottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[5],
    paddingHorizontal: spacing[5],
  },
  keypadButtonSpacer: {
    width: 80,
  },
  logoutLink: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  logoutText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    fontFamily: 'Outfit-Regular',
  },
  logoutLinkText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
    textDecorationLine: 'underline',
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '600',
  },
})
