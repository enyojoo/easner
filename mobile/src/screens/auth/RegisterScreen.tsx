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
  Linking,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { NavigationProps } from '../../types'
import BrandLogo from '../../components/BrandLogo'
import { analytics } from '../../lib/analytics'
import { colors, shadows, textStyles, borderRadius, spacing } from '../../theme'
import { GradientCard, HapticButton } from '../../components/premium'

export default function RegisterScreen({ navigation }: NavigationProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { signUp } = useAuth()
  const insets = useSafeAreaInsets()

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current
  const formAnim = useRef(new Animated.Value(0)).current

  // Run entrance animations
  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerAnim, formAnim])

  // Track screen view
  useEffect(() => {
    analytics.trackScreenView('Register')
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTermsPress = () => {
    Linking.openURL('https://www.easner.com/terms')
  }

  const handlePrivacyPress = () => {
    Linking.openURL('https://www.easner.com/privacy')
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return false
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long')
      return false
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)
    const { error: signUpError } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      base_currency: 'USD',
    })

    if (signUpError) {
      setLoading(false)
      Alert.alert('Registration Failed', signUpError.message || 'An error occurred during registration')
      return
    }

    setLoading(false)
    
    // Show success message and navigate to login
    Alert.alert(
      'Registration Successful',
      'Please check your email to verify your account. After verification, you can sign in to start sending money.',
      [{ text: 'OK', onPress: () => {
        // Navigate to login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      }}]
    )
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom, spacing[5]) }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  })
                }]
              }
            ]}
          >
            <BrandLogo size="lg" style={styles.logo} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>To send money with Ease</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formAnim,
                transform: [{
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    placeholder="First name"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    placeholder="Last name"
                    placeholderTextColor={colors.text.secondary}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Create a password"
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    passwordRules="minlength: 6;"
                    importantForAutofill="yes"
                    underlineColorAndroid="transparent"
                    selectionColor={colors.primary.main}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setShowPassword(!showPassword)
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    passwordRules="minlength: 6;"
                    importantForAutofill="yes"
                    underlineColorAndroid="transparent"
                    selectionColor={colors.primary.main}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setShowConfirmPassword(!showConfirmPassword)
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setAcceptTerms(!acceptTerms)
                  }}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && (
                      <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink} onPress={handleTermsPress}>Terms</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink} onPress={handlePrivacyPress}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>

              <HapticButton
                title={loading ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                disabled={loading || !acceptTerms}
                loading={loading}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            </View>
          </Animated.View>

          <View style={[styles.footer, { marginTop: spacing[3] }]}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
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
    padding: spacing[5],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[5],
    marginTop: spacing[6],
  },
  logo: {
    marginBottom: spacing[3],
  },
  title: {
    ...textStyles.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.bodyLarge,
    color: colors.text.secondary,
  },
  formContainer: {
    marginBottom: spacing[4],
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  halfWidth: {
    flex: 1,
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
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: colors.text.primary,
    minHeight: 20,
  },
  eyeButton: {
    padding: spacing[3],
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    marginTop: spacing[1],
  },
  checkboxContainer: {
    padding: spacing[1],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: spacing[2],
  },
  termsText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  button: {
    marginBottom: 0,
  },
  buttonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  footerLink: {
    ...textStyles.bodySmall,
    color: colors.primary.main,
    fontWeight: '600',
  },
})
