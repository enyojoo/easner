import React, { useState, useEffect, useRef } from 'react'
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

export default function ResetPasswordScreen({ navigation, route }: NavigationProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const insets = useSafeAreaInsets()

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('ResetPassword')
  }, [])

  useEffect(() => {
    const { email, resetToken } = route.params || {}
    
    if (email && resetToken) {
      setIsValidSession(true)
    } else {
      Alert.alert('Error', 'Invalid or expired reset link', [
        { text: 'OK', onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          })
        }}
      ])
    }
  }, [route.params])

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('Auth')
  }

  const handleHelp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert('Help', 'Need assistance? Contact support at support@easner.com')
  }

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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
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
      <View style={styles.container}>
        <View style={[styles.content, { 
          paddingTop: insets.top + spacing[4],
          paddingBottom: Math.max(insets.bottom, spacing[5]) 
        }]}>
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
            <Text style={styles.title}>Validating Reset Link</Text>
            <Text style={styles.subtitle}>
              Please wait while we validate your reset link...
            </Text>
        </View>
      </View>
    )
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
            <Text style={styles.title}>Reset Password</Text>

          {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                    activeOpacity={0.7}
                  >
                  <View style={styles.eyeButtonCircle}>
                    <Ionicons
                      name={passwordVisible ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.text.secondary}
                    />
                  </View>
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
                    placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    activeOpacity={0.7}
                  >
                  <View style={styles.eyeButtonCircle}>
                    <Ionicons
                      name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.text.secondary}
                    />
                  </View>
                  </TouchableOpacity>
                </View>
              </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
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
    ...textStyles.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  eyeButton: {
    padding: spacing[2],
  },
  eyeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
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
})
