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
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps } from '../../types'
import { analytics } from '../../lib/analytics'
import { colors, textStyles, borderRadius, spacing, shadows } from '../../theme'

type AuthMode = 'login' | 'signup'

const FROM_ONBOARDING_KEY = '@easner_from_onboarding'

export default function AuthScreen({ navigation }: NavigationProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBackArrow, setShowBackArrow] = useState(false)
  const { signIn, signUp } = useAuth()
  const insets = useSafeAreaInsets()

  // Check if user came from onboarding
  useEffect(() => {
    const checkFromOnboarding = async () => {
      try {
        const fromOnboarding = await AsyncStorage.getItem(FROM_ONBOARDING_KEY)
        if (fromOnboarding === 'true') {
          setShowBackArrow(true)
        }
      } catch (error) {
        console.error('Error checking from onboarding:', error)
      }
    }
    checkFromOnboarding()
  }, [])

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView(mode === 'login' ? 'Login' : 'Register')
  }, [mode])

  const handleModeChange = async (newMode: AuthMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMode(newMode)
    // Clear form when switching modes
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      // Clear the from onboarding flag
      await AsyncStorage.removeItem(FROM_ONBOARDING_KEY)
      // Reset onboarding status so user can see onboarding again
      await AsyncStorage.removeItem('@easner_onboarding_completed')
      // Trigger AppNavigator to immediately re-check onboarding status
      if ((global as any).triggerOnboardingCheck) {
        ;(global as any).triggerOnboardingCheck()
      }
      // The AppNavigator will automatically switch back to OnboardingStack
    } catch (error) {
      console.error('Error going back to onboarding:', error)
    }
  }

  const handleHelp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Navigate to help/support screen
    // For now, just show an alert
    Alert.alert('Help', 'Need assistance? Contact support at support@easner.com')
  }

  const validateForm = () => {
    if (mode === 'login') {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields')
        return false
      }
      return true
    } else {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address')
        return false
      }
      return true
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password, false)
        
        if (error) {
          Alert.alert('Login Failed', error.message || 'Invalid credentials')
        }
        // Success handled by auth state change
      } else {
        const { error: signUpError } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          base_currency: 'USD',
        })

        if (signUpError) {
          Alert.alert('Registration Failed', signUpError.message || 'An error occurred during registration')
        } else {
          Alert.alert(
            'Registration Successful',
            'Please check your email to verify your account. After verification, you can sign in.',
            [{ text: 'OK', onPress: () => setMode('login') }]
          )
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // TODO: Implement Apple login
    Alert.alert('Coming Soon', 'Apple login will be available soon')
  }

  const handleGoogleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // TODO: Implement Google login
    Alert.alert('Coming Soon', 'Google login will be available soon')
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
            {showBackArrow ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <View />
            )}
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

          {/* Segmented Control */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, mode === 'login' && styles.segmentActive]}
              onPress={() => handleModeChange('login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, mode === 'signup' && styles.segmentActive]}
              onPress={() => handleModeChange('signup')}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your Easner account'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
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

            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
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
            )}

            {mode === 'login' && (
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate('ForgotPassword')
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
              </Text>
            </TouchableOpacity>

            {/* Social Login Section */}
            <View style={styles.socialSection}>
              <Text style={styles.socialDividerText}>or continue with</Text>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleLogin}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-apple" size={20} color={colors.text.primary} />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-google" size={20} color={colors.text.primary} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: 'space-between',
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.frame.background,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
    padding: spacing[1],
    marginBottom: spacing[6],
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing[5],
  },
  segment: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.background.primary,
    borderWidth: 0.5,
    borderColor: colors.frame.border,
  },
  segmentText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
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
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    ...textStyles.bodyMedium,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
  },
  passwordInput: {
    flex: 1,
    padding: spacing[3],
    ...textStyles.bodyMedium,
    color: colors.text.primary,
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
  forgotPasswordLink: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    marginBottom: spacing[5],
  },
  forgotPasswordText: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    textDecorationLine: 'underline',
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
  socialSection: {
    marginTop: spacing[4],
  },
  socialDividerText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.primary,
  },
  socialButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
})

