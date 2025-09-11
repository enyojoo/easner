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
import ScreenWrapper from '../../components/ScreenWrapper'
import { supabase } from '../../lib/supabase'
import { NavigationProps } from '../../types'
import BrandLogo from '../../components/BrandLogo'
import { analytics } from '../../lib/analytics'

export default function ForgotPasswordScreen({ navigation }: NavigationProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(TextInput | null)[]>([])

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('ForgotPassword')
  }, [])

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
    // Handle paste - if value is longer than 1 character, it's likely a paste
    if (value.length > 1) {
      // Extract only digits from the pasted value
      const digits = value.replace(/\D/g, '').slice(0, 6)
      
      if (digits.length === 6) {
        // Fill all boxes with the pasted digits
        const newOtp = digits.split('')
        setOtp(newOtp)
        
        // Focus the last box
        setTimeout(() => {
          otpRefs.current[5]?.focus()
        }, 0)
        return
      } else if (digits.length > 0) {
        // Partial paste - fill available boxes
        const newOtp = [...otp]
        for (let i = 0; i < Math.min(digits.length, 6); i++) {
          newOtp[i] = digits[i]
        }
        setOtp(newOtp)
        
        // Focus the next empty box or the last filled box
        const nextIndex = Math.min(digits.length, 5)
        setTimeout(() => {
          otpRefs.current[nextIndex]?.focus()
        }, 0)
        return
      }
    }

    // Handle single character input
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      // Use setTimeout to ensure the state update has completed
      setTimeout(() => {
        otpRefs.current[index + 1]?.focus()
      }, 0)
    }
  }

  const handleOtpKeyPress = (index: number, e: any) => {
    // Handle backspace to move to previous input
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
      console.log('Sending OTP verification request for email:', email, 'OTP:', otpCode)
      
      // Use the same API endpoint as the web version
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

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError('Invalid or expired verification code')
        return
      }

      // Try to parse JSON response
      let data
      try {
        const responseText = await response.text()
        console.log('Response text:', responseText)
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        setError('Invalid response from server. Please try again.')
        return
      }

      if (data.resetToken) {
        // Store reset token and navigate to reset password screen
        navigation.navigate('ResetPassword', { 
          email: email,
          resetToken: data.resetToken 
        })
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
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
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
              <BrandLogo size="lg" style={styles.logo} />
              <Text style={styles.title}>
                {step === 'email' ? 'Forgot Password?' : 'Enter Verification Code'}
              </Text>
          <Text style={styles.subtitle}>
                {step === 'email'
                  ? 'Enter your email for verification code'
                  : `We've sent a 6-digit code to ${email}`}
          </Text>
        </View>

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

        <View style={styles.form}>
              {step === 'email' ? (
                <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
                      editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleEmailSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter 6-digit code</Text>
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
                          contextMenuHidden={false}
                        />
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleOtpSubmit}
                    disabled={loading || otp.join('').length !== 6}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.resendContainer}>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      style={styles.resendButton}
                    >
                      <Text style={[styles.resendText, (resendCooldown > 0 || loading) && styles.resendTextDisabled]}>
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
                  </View>
                </>
              )}
        </View>

        <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => {
                  if (step === 'otp') {
                    setStep('email')
                    setOtp(['', '', '', '', '', ''])
                    setError('')
                    setMessage('')
                    // Clear any existing intervals
                    setResendCooldown(0)
                  } else {
                    // Use reset to go back to the root of the auth stack
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    })
                  }
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>
                  {step === 'otp' ? 'Change Email' : 'Back to Sign In'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.signUpContainer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#007ACC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#007ACC',
  },
  resendTextDisabled: {
    color: '#9ca3af',
  },
  footer: {
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#007ACC',
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#007ACC',
    fontWeight: '600',
  },
})
