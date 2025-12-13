import React, { useState, useEffect, useCallback } from 'react'
import { View, Platform, TouchableOpacity, Text, AppState, AppStateStatus, StyleSheet } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { House, CreditCard, ChartSpline, Grip } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../contexts/AuthContext'
import { colors, shadows, textStyles, borderRadius, spacing } from '../theme'
import { 
  isPinSetup, 
  isSessionValid, 
  shouldUsePin, 
  updateSessionActivity,
  isFirstLoginAfterVerification,
  isPinPromptDismissed,
  dismissPinPrompt,
  clearSessionActivity,
} from '../lib/pinAuth'

// Onboarding Screen
import OnboardingScreen from '../screens/onboarding/OnboardingScreen'

// Auth Screens
import AuthScreen from '../screens/auth/AuthScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'
import PinSetupScreen from '../screens/auth/PinSetupScreen'
import PinEntryScreen from '../screens/auth/PinEntryScreen'

// Components
import PinSetupPrompt from '../components/PinSetupPrompt'

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen'
import RecipientsScreen from '../screens/main/RecipientsScreen'
import TransactionsScreen from '../screens/main/TransactionsScreen'
import ExpenseInsightsScreen from '../screens/main/ExpenseInsightsScreen'
import MoreScreen from '../screens/main/MoreScreen'
import ProfileEditScreen from '../screens/main/ProfileEditScreen'
import SupportScreen from '../screens/main/SupportScreen'
import CardScreen from '../screens/main/CardScreen'
import TransactionCardScreen from '../screens/main/TransactionCardScreen'
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen'
import NotificationsScreen from '../screens/main/NotificationsScreen'
import InAppNotificationsScreen from '../screens/main/InAppNotificationsScreen'

// Transaction Screens
import TransactionDetailsScreen from '../screens/transactions/TransactionDetailsScreen'
import BridgeTransactionDetailsScreen from '../screens/transactions/BridgeTransactionDetailsScreen'

// Send Money Flow Screens
import SendAmountScreen from '../screens/send/SendAmountScreen'
import SelectRecentRecipientScreen from '../screens/send/SelectRecentRecipientScreen'
import SelectRecipientScreen from '../screens/send/SelectRecipientScreen'
import PaymentMethodScreen from '../screens/send/PaymentMethodScreen'
import ConfirmationScreen from '../screens/send/ConfirmationScreen'
import SendTransactionDetailsScreen from '../screens/send/SendTransactionDetailsScreen'
import OpenBankingScreen from '../screens/send/OpenBankingScreen'
import VirtualBankAccountScreen from '../screens/send/VirtualBankAccountScreen'
import MobileMoneyScreen from '../screens/send/MobileMoneyScreen'

// Receive Money Flow Screens
import ReceiveMoneyScreen from '../screens/receive/ReceiveMoneyScreen'
import ReceiveTransactionDetailsScreen from '../screens/receive/ReceiveTransactionDetailsScreen'

// Verification Screens
import AccountVerificationScreen from '../screens/verification/AccountVerificationScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Custom transition configurations for smooth, platform-appropriate animations
const getTransitionConfig = () => {
  if (Platform.OS === 'ios') {
    return {
      ...TransitionPresets.SlideFromRightIOS,
      gestureEnabled: true,
      gestureDirection: 'horizontal' as const,
      gestureResponseDistance: 30, // More responsive
      gestureVelocityImpact: 0.5, // More sensitive
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 180, // Faster - was 250ms
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 150, // Faster - was 250ms
            useNativeDriver: true,
          },
        },
      },
    }
  } else {
    // Android - Modern slide up to open, slide out to close
    return {
      gestureEnabled: false, // Disable gestures on Android
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 200, // Faster - was 300ms
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 180, // Faster - was 300ms
            useNativeDriver: true,
          },
        },
      },
      cardStyleInterpolator: ({ current, layouts }: any) => ({
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0], // Slide up from bottom
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 0.8, 1], // Fade in as it slides up
            extrapolate: 'clamp',
          }),
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1], // Subtle overlay
            extrapolate: 'clamp',
          }),
        },
      }),
    }
  }
}

// Specialized transition configuration for send money flow
const getSendFlowTransitionConfig = () => {
  if (Platform.OS === 'ios') {
    return {
      gestureEnabled: true,
      gestureDirection: 'horizontal' as const,
      gestureResponseDistance: 60,
      gestureVelocityImpact: 0.4,
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 300,
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 300,
            useNativeDriver: true,
          },
        },
      },
      cardStyleInterpolator: ({ current, layouts }: any) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 0.05, 1],
              outputRange: [0, 1, 1],
              extrapolate: 'clamp',
            }),
          },
          overlayStyle: {
            opacity: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
              extrapolate: 'clamp',
            }),
          },
        }
      },
    }
  } else {
    // Android - Simple slide in/out for send money flow
    return {
      gestureEnabled: false, // Disable gestures on Android
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 300, // Faster - was 300ms
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 300, // Faster - was 300ms
            useNativeDriver: true,
          },
        },
      },
      cardStyleInterpolator: ({ current, layouts }: any) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width * 0.3, 0], // Simple slide in from right
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.9, 1], // Simple fade in
            extrapolate: 'clamp',
          }),
        },
      }),
    }
  }
}

function OnboardingStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
      />
    </Stack.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...getTransitionConfig()
      }}
    >
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{
          gestureEnabled: true, // Allow swipe back when coming from onboarding
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="PinSetup" 
        component={PinSetupScreen}
        options={{
          ...getTransitionConfig(),
        }}
        initialParams={{ mandatory: false }}
      />
      <Stack.Screen 
        name="PinEntry" 
        component={PinEntryScreen}
        options={{
          ...getTransitionConfig(),
        }}
      />
    </Stack.Navigator>
  )
}

// Styles for active icon container (circular background highlight)
const tabBarStyles = StyleSheet.create({
  activeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

function MainTabs() {
  const insets = useSafeAreaInsets()
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary.main, // Solid blue background for navigation bar
          borderTopWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          height: 60,
          paddingBottom: Platform.OS === 'android' ? 10 : Math.max(insets.bottom, 8),
          paddingTop: spacing[2],
          paddingHorizontal: 20,
          borderRadius: 100,
          borderTopLeftRadius: 100,
          borderTopRightRadius: 100,
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
          marginHorizontal: spacing[8],
          marginBottom: spacing[2] + (Platform.OS === 'ios' ? insets.bottom : 0),
          position: 'absolute',
          overflow: 'hidden', // Ensure rounded corners are clipped
        },
        tabBarShowLabel: false, // Hide labels to match design
        tabBarActiveTintColor: colors.text.inverse, // Pure white for active
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Lighter for inactive
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: textStyles.labelSmall.fontSize,
          fontWeight: '500' as const,
          marginTop: spacing[1],
          letterSpacing: textStyles.labelSmall.letterSpacing,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 10,
        },
        tabBarIconStyle: {
          marginTop: spacing[1],
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? tabBarStyles.activeIconContainer : null}>
              <House 
                size={24} 
                color={focused ? colors.text.inverse : 'rgba(255, 255, 255, 0.6)'}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Card" 
        component={CardScreen}
        options={{
          tabBarLabel: 'Card',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? tabBarStyles.activeIconContainer : null}>
              <CreditCard 
                size={24} 
                color={focused ? colors.text.inverse : 'rgba(255, 255, 255, 0.6)'}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? tabBarStyles.activeIconContainer : null}>
              <ChartSpline 
                size={24} 
                color={focused ? colors.text.inverse : 'rgba(255, 255, 255, 0.6)'}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? tabBarStyles.activeIconContainer : null}>
              <Grip 
                size={24} 
                color={focused ? colors.text.inverse : 'rgba(255, 255, 255, 0.6)'}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function MainStackWithPinPrompt({ showPinPrompt }: { showPinPrompt: boolean }) {
  const [pinPromptVisible, setPinPromptVisible] = React.useState(false)
  const navigation = useNavigation()

  React.useEffect(() => {
    if (showPinPrompt) {
      // Small delay to ensure main app is loaded
      const timer = setTimeout(() => {
        setPinPromptVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      // Hide prompt if showPinPrompt becomes false
      setPinPromptVisible(false)
    }
  }, [showPinPrompt])

  const handlePinSetup = () => {
    setPinPromptVisible(false)
    // Navigate to PIN setup screen (in AuthStack)
    navigation.navigate('PinSetup' as never)
  }

  const handleDismissPinPrompt = async () => {
    await dismissPinPrompt()
    setPinPromptVisible(false)
  }

  return (
    <>
      <MainStack />
      <PinSetupPrompt
        visible={pinPromptVisible}
        onSetup={handlePinSetup}
        onDismiss={handleDismissPinPrompt}
      />
    </>
  )
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...getTransitionConfig()
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Disable gesture for main tabs
        }}
      />
      <Stack.Screen 
        name="PinSetup" 
        component={PinSetupScreen}
        options={{
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="SelectRecentRecipient" 
        component={SelectRecentRecipientScreen}
        options={({ navigation }) => {
          // Check if previous screen is SendAmountScreen (no transition when going back from SendAmountScreen)
          const state = navigation.getState()
          const currentIndex = state?.index ?? 0
          const previousRoute = currentIndex > 0 ? state?.routes?.[currentIndex - 1] : null
          const isFromSendAmount = previousRoute?.name === 'SendAmount'
          
          return {
            headerShown: false,
            // No animation when going back from SendAmountScreen
            ...(isFromSendAmount ? {
              transitionSpec: {
                open: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when opening (going back from SendAmountScreen)
                    useNativeDriver: true,
                  },
                },
                close: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when closing
                    useNativeDriver: true,
                  },
                },
              },
            } : getSendFlowTransitionConfig()),
          }
        }}
      />
      <Stack.Screen 
        name="SendAmount" 
        component={SendAmountScreen}
        options={({ navigation, route }) => {
          // Check route params for flags (forward navigation)
          const params = route.params as any
          const fromSelectRecipientParam = params?.fromSelectRecipient === true
          const fromSelectRecentRecipientParam = params?.fromSelectRecentRecipient === true
          
          // Check if previous screen is SelectRecentRecipientScreen or SelectRecipientScreen (backward navigation)
          const state = navigation.getState()
          const currentIndex = state?.index ?? 0
          const previousRoute = currentIndex > 0 ? state?.routes?.[currentIndex - 1] : null
          const isFromSelectRecent = previousRoute?.name === 'SelectRecentRecipient'
          const isFromSelectRecipient = previousRoute?.name === 'SelectRecipient'
          const isFromRecipientScreen = isFromSelectRecent || isFromSelectRecipient || fromSelectRecipientParam || fromSelectRecentRecipientParam
          
          return {
            headerShown: false,
            // No animation when navigating from/to SelectRecentRecipientScreen or SelectRecipientScreen (same header)
            ...(isFromRecipientScreen ? {
              transitionSpec: {
                open: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when coming from recipient screen
                    useNativeDriver: true,
                  },
                },
                close: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when going back
                    useNativeDriver: true,
                  },
                },
              },
            } : getSendFlowTransitionConfig()),
          }
        }}
      />
      <Stack.Screen 
        name="SelectRecipient" 
        component={SelectRecipientScreen}
        options={({ navigation }) => {
          // Check if previous screen is SendAmountScreen or SelectRecentRecipientScreen (no transition)
          const state = navigation.getState()
          const currentIndex = state?.index ?? 0
          const previousRoute = currentIndex > 0 ? state?.routes?.[currentIndex - 1] : null
          const isFromSendAmount = previousRoute?.name === 'SendAmount'
          const isFromSelectRecent = previousRoute?.name === 'SelectRecentRecipient'
          const shouldHaveNoTransition = isFromSendAmount || isFromSelectRecent
          
          return {
            headerShown: false,
            // No animation when navigating to/from SendAmountScreen or SelectRecentRecipientScreen
            ...(shouldHaveNoTransition ? {
              transitionSpec: {
                open: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when opening
                    useNativeDriver: true,
                  },
                },
                close: {
                  animation: 'timing' as const,
                  config: {
                    duration: 0, // Instant when closing
                    useNativeDriver: true,
                  },
                },
              },
            } : getSendFlowTransitionConfig()),
          }
        }}
      />
      <Stack.Screen 
        name="PaymentMethod" 
        component={PaymentMethodScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Confirmation" 
        component={ConfirmationScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="SendTransactionDetails" 
        component={SendTransactionDetailsScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
          gestureEnabled: false, // Disable all gestures - only allow navigation via buttons
        }}
      />
      <Stack.Screen 
        name="OpenBanking" 
        component={OpenBankingScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="VirtualBankAccount" 
        component={VirtualBankAccountScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen
        name="MobileMoney" 
        component={MobileMoneyScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ReceiveMoney" 
        component={ReceiveMoneyScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="BridgeTransactionDetails" 
        component={BridgeTransactionDetailsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Recipients" 
        component={RecipientsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Card" 
        component={CardScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="TransactionCard" 
        component={TransactionCardScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ExpenseInsights" 
        component={ExpenseInsightsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ReceiveTransactionDetails" 
        component={ReceiveTransactionDetailsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="AccountVerification" 
        component={AccountVerificationScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ProfileEdit" 
        component={ProfileEditScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="InAppNotifications" 
        component={InAppNotificationsScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
    </Stack.Navigator>
  )
}

const ONBOARDING_COMPLETED_KEY = '@easner_onboarding_completed'

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth()
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  // PIN TEMPORARILY DISABLED - keeping state variables for easy re-enable
  // const [pinSetup, setPinSetup] = useState<boolean | null>(null)
  // const [sessionValid, setSessionValid] = useState<boolean | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  // const [isNewUser, setIsNewUser] = useState<boolean | null>(null)
  // const [showPinPrompt, setShowPinPrompt] = useState(false)
  // const [justLoggedIn, setJustLoggedIn] = useState(false)
  // const [hasActiveSession, setHasActiveSession] = useState(false)
  // const [forceCheck, setForceCheck] = useState(0) // Trigger to force immediate check

  // PIN TEMPORARILY DISABLED
  // Watch for user logout - immediately reset state when user becomes null
  // useEffect(() => {
  //   if (!user) {
  //     setPinSetup(null)
  //     setSessionValid(null)
  //     setIsNewUser(null)
  //     setShowPinPrompt(false)
  //     setJustLoggedIn(false)
  //     setCheckingAuth(false)
  //   }
  // }, [user])

  // PIN TEMPORARILY DISABLED
  // Handle app state changes - clear session when app goes to background
  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState: AppStateStatus) => {
  //     if (nextAppState === 'background' || nextAppState === 'inactive') {
  //       clearSessionActivity()
  //       setSessionValid(false)
  //     }
  //   }
  //   const subscription = AppState.addEventListener('change', handleAppStateChange)
  //   return () => {
  //     subscription?.remove()
  //   }
  // }, [])

  // PIN TEMPORARILY DISABLED - Simplified auth check
  // Check onboarding status on mount - this should happen regardless of user state
  const checkOnboardingState = useCallback(async () => {
    try {
      // Check onboarding status from AsyncStorage
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
      setOnboardingCompleted(onboardingValue === 'true')
      setCheckingAuth(false)
    } catch (error) {
      console.error('Error checking onboarding state:', error)
      setCheckingAuth(false)
      // Default to false if there's an error, so onboarding shows
      setOnboardingCompleted(false)
    }
  }, []) // No dependencies - only uses stable state setters

  useEffect(() => {
    // Check onboarding status on mount
    checkOnboardingState()
  }, [checkOnboardingState]) // Run on mount and when function changes
  
  // Re-check onboarding when app comes to foreground (in case it was changed)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Re-check onboarding status when app comes to foreground
        // This ensures we detect if onboarding was completed
        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
        const isCompleted = onboardingValue === 'true'
        // Only update if it changed to avoid unnecessary re-renders
        if (isCompleted !== onboardingCompleted) {
          setOnboardingCompleted(isCompleted)
        }
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription?.remove()
    }
  }, [onboardingCompleted])
  
  // Poll for onboarding completion when showing onboarding screen
  // This ensures we detect when user completes onboarding
  useEffect(() => {
    if (onboardingCompleted === false) {
      // While onboarding is not completed, poll AsyncStorage to detect when it's completed
      const interval = setInterval(async () => {
        try {
          const onboardingValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
          if (onboardingValue === 'true') {
            setOnboardingCompleted(true)
          }
        } catch (error) {
          console.error('Error polling onboarding status:', error)
        }
      }, 500) // Check every 500ms
      
      return () => clearInterval(interval)
    }
  }, [onboardingCompleted])
  
  // Poll for onboarding reset when showing auth screen (user clicked back button)
  // This ensures we detect when user resets onboarding from auth screen
  useEffect(() => {
    if (onboardingCompleted === true && !user) {
      // While showing auth screen and onboarding is completed, poll to detect if it was reset
      const interval = setInterval(async () => {
        try {
          const onboardingValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
          if (onboardingValue !== 'true') {
            // Onboarding was reset, update state to show onboarding again
            setOnboardingCompleted(false)
          }
        } catch (error) {
          console.error('Error polling onboarding status from auth:', error)
        }
      }, 500) // Check every 500ms
      
      return () => clearInterval(interval)
    }
  }, [onboardingCompleted, user])
  
  // Expose function to trigger onboarding re-check (for AuthScreen back button)
  useEffect(() => {
    ;(global as any).triggerOnboardingCheck = () => {
      checkOnboardingState()
    }
    return () => {
      delete (global as any).triggerOnboardingCheck
    }
  }, [checkOnboardingState]) // Update when checkOnboardingState changes
  
  // Re-check onboarding when user logs out (to allow seeing onboarding again if needed)
  useEffect(() => {
    if (!user && onboardingCompleted !== null) {
      // When user logs out, re-check onboarding status
      checkOnboardingState()
    }
  }, [user, checkOnboardingState])
  
  // PIN TEMPORARILY DISABLED - All PIN-related useEffects commented out
  // Fast polling specifically for session validity check after PIN entry
  // useEffect(() => {
  //   if (!pinSetup || sessionValid === true) {
  //     return
  //   }
  //   if (sessionValid !== false) {
  //     return
  //   }
  //   const fastCheckInterval = setInterval(async () => {
  //     const isValid = await isSessionValid()
  //     if (isValid && sessionValid !== true) {
  //       setSessionValid(true)
  //     }
  //   }, 100)
  //   return () => clearInterval(fastCheckInterval)
  // }, [pinSetup, sessionValid])
  
  // Listen for PIN verification to trigger immediate check
  // React.useEffect(() => {
  //   const checkPinVerification = async () => {
  //     if (pinSetup && user && sessionValid === false) {
  //       await new Promise(resolve => setTimeout(resolve, 10))
  //       const isValid = await isSessionValid()
  //       if (isValid) {
  //         setSessionValid(true)
  //       }
  //     }
  //   }
  //   if (forceCheck > 0) {
  //     checkPinVerification()
  //   }
  // }, [forceCheck, pinSetup, user, sessionValid])
  
  // Expose trigger function globally for PIN entry/setup screens
  // React.useEffect(() => {
  //   ;(global as any).triggerPinCheck = () => {
  //     setForceCheck(prev => prev + 1)
  //     if (pinSetup) {
  //       setSessionValid(true)
  //     }
  //     if (!pinSetup) {
  //       setPinSetup(true)
  //       setSessionValid(false)
  //     }
  //   }
  //   return () => {
  //     delete (global as any).triggerPinCheck
  //   }
  // }, [pinSetup])

  // Show loading screen while checking initial onboarding status
  if (onboardingCompleted === null || checkingAuth) {
    return null // Return null instead of loading spinner for faster transition
  }

  // If onboarding not completed, show onboarding screen FIRST (before checking user)
  // This ensures new users see onboarding even if they're not logged in
  if (!onboardingCompleted) {
    return <OnboardingStack />
  }

  // After onboarding is completed, check user authentication
  // If user is logged out, show auth stack
  if (!user) {
    return <AuthStack key="auth-stack-logged-out" />
  }

  // Show loading while auth context is loading
  if (loading) {
    return null
  }

  // PIN TEMPORARILY DISABLED - Go directly to main app after login
  // If user is logged in, show main app (no PIN checks)
  if (user) {
    return <MainStack />
  }

  // Fallback: If no user, show auth stack (Login)
  // Use key to force remount
  return <AuthStack key="auth-stack-no-user" />
}

