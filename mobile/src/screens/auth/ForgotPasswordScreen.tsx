import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { NavigationProps } from '../../types'
import { analytics } from '../../lib/analytics'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'

export default function ForgotPasswordScreen({ navigation }: NavigationProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(TextInput | null)[]>([])
  const insets = useSafeAreaInsets()

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('ForgotPassword')
  }, [])

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (step === 'otp') {
      setStep('email')
      setOtp(['', '', '', '', '', ''])
      setError('')
      setMessage('')
      setResendCooldown(0)
    } else {
      navigation.navigate('Auth')
    }
  }

  const handleHelp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert('Help', 'Need assistance? Contact support at support@easner.com')
  }

  const handleEmailSubmit = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'easner://reset-password',
      })

      if (error) {
        setError(error.message)
      } else {
        setStep('otp')
        setMessage('')
        startResendCooldown()
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      
      if (digits.length === 6) {
        const newOtp = digits.split('')
        setOtp(newOtp)
        setTimeout(() => {
          otpRefs.current[5]?.focus()
        }, 0)
        return
      } else if (digits.length > 0) {
        const newOtp = [...otp]
        for (let i = 0; i < Math.min(digits.length, 6); i++) {
          newOtp[i] = digits[i]
        }
        setOtp(newOtp)
        const nextIndex = Math.min(digits.length, 5)
        setTimeout(() => {
          otpRefs.current[nextIndex]?.focus()
        }, 0)
        return
      }
    }

    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      setTimeout(() => {
        otpRefs.current[index + 1]?.focus()
      }, 0)
    }
  }

  const handleOtpKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://easnerapp.vercel.app/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        }),
      })

      if (!response.ok) {
        setError('Invalid or expired verification code')
        return
      }

      let data
      try {
        const responseText = await response.text()
        data = JSON.parse(responseText)
      } catch (parseError) {
        setError('Invalid response from server. Please try again.')
        return
      }

      if (data.resetToken) {
        navigation.navigate('ResetPassword', { 
          email: email,
          resetToken: data.resetToken 
        })
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'easner://reset-password',
      })

      if (error) {
        setError('Failed to resend code. Please try again.')
      } else {
        setMessage('New code sent to your email address.')
        startResendCooldown()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { 
            paddingTop: insets.top + spacing[4],
            paddingBottom: Math.max(insets.bottom, spacing[5]) 
          }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back and help buttons */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleHelp}
              activeOpacity={0.7}
            >
              <View style={styles.headerButtonCircle}>
                <Ionicons name="help-circle-outline" size={20} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {step === 'email' ? 'Forgot Password?' : 'Enter Verification Code'}
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text.secondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleEmailSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Enter 6-digit code</Text>
                  <Text style={styles.subtitle}>
                    We've sent a 6-digit code to {email}
                  </Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={(e) => handleOtpKeyPress(index, e)}
                        keyboardType="numeric"
                        maxLength={6}
                        editable={!loading}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, (loading || otp.join('').length !== 6) && styles.submitButtonDisabled]}
                  onPress={handleOtpSubmit}
                  disabled={loading || otp.join('').length !== 6}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={styles.resendButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, (resendCooldown > 0 || loading) && styles.resendTextDisabled]}>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
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
  headerButton: {
    padding: spacing[1],
  },
  headerSpacer: {
    flex: 1,
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
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing[5],
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  errorContainer: {
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.error.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.main,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.success.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.success.light,
  },
  messageText: {
    ...textStyles.bodySmall,
    color: colors.success.main,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing[5],
  },
  label: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    ...textStyles.bodyMedium,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  otpInput: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    textAlign: 'center',
    ...textStyles.titleMedium,
    fontWeight: '600',
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[5],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    padding: spacing[2],
  },
  resendText: {
    ...textStyles.bodySmall,
    color: colors.primary.main,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: colors.text.secondary,
  },
})
