import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import { supabase } from '../../lib/supabase'
import { NavigationProps } from '../../types'
import BrandLogo from '../../components/BrandLogo'
import { analytics } from '../../lib/analytics'

export default function ResetPasswordScreen({ navigation, route }: NavigationProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('ResetPassword')
  }, [])

  useEffect(() => {
    // Check if we have valid reset parameters from OTP verification
    const { email, resetToken } = route.params || {}
    
    if (email && resetToken) {
      setIsValidSession(true)
    } else {
      Alert.alert('Error', 'Invalid or expired reset link', [
        { text: 'OK', onPress: () => {
          // Use reset to go back to the root of the auth stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }}
      ])
    }
  }, [route.params])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return false
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long')
      return false
    }

    return true
  }

  const handleResetPassword = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const { email, resetToken } = route.params || {}
      
      if (!email || !resetToken) {
        Alert.alert('Error', 'Invalid reset session')
        return
      }

      // Use the same API endpoint as the web version
      const response = await fetch('https://easnerapp.vercel.app/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          email: email,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert(
          'Password Updated',
          'Your password has been successfully updated',
          [{ text: 'OK', onPress: () => {
            // Use reset to go back to the root of the auth stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          }}]
        )
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      Alert.alert('Error', 'Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <ScreenWrapper>
        <View style={styles.content}>
          <View style={styles.header}>
            <BrandLogo size="lg" style={styles.logo} />
            <Text style={styles.title}>Validating Reset Link</Text>
            <Text style={styles.subtitle}>
              Please wait while we validate your reset link...
            </Text>
          </View>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={styles.content}>
        <View style={styles.header}>
          <BrandLogo size="lg" style={styles.logo} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                passwordRules="minlength: 6;"
                importantForAutofill="yes"
                underlineColorAndroid="transparent"
                selectionColor="#007ACC"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                passwordRules="minlength: 6;"
                importantForAutofill="yes"
                underlineColorAndroid="transparent"
                selectionColor="#007ACC"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => {
            // Use reset to go back to the root of the auth stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          }}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: '#1f2937',
    minHeight: 20,
  },
  eyeButton: {
    padding: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
