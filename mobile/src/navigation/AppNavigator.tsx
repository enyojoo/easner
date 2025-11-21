import React, { useState, useEffect } from 'react'
import { View, Platform, TouchableOpacity } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen'
import RecipientsScreen from '../screens/main/RecipientsScreen'
import TransactionsScreen from '../screens/main/TransactionsScreen'
import ProfileScreen from '../screens/main/ProfileScreen'
import SupportScreen from '../screens/main/SupportScreen'

// Transaction Screens
import TransactionDetailsScreen from '../screens/transactions/TransactionDetailsScreen'

// Send Money Flow Screens
import SendAmountScreen from '../screens/send/SendAmountScreen'
import SelectRecipientScreen from '../screens/send/SelectRecipientScreen'
import PaymentMethodScreen from '../screens/send/PaymentMethodScreen'
import ConfirmationScreen from '../screens/send/ConfirmationScreen'
import SendTransactionDetailsScreen from '../screens/send/SendTransactionDetailsScreen'

// Receive Money Flow Screens
import ReceiveMoneyScreen from '../screens/receive/ReceiveMoneyScreen'
import ReceiveTransactionDetailsScreen from '../screens/receive/ReceiveTransactionDetailsScreen'

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

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...getTransitionConfig()
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: false, // Login is the root screen
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          ...getTransitionConfig(),
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
    </Stack.Navigator>
  )
}

function MainTabs() {
  const [cryptoReceiveEnabled, setCryptoReceiveEnabled] = useState(false)

  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        // Use relative path - will be resolved by the app's API base URL
        const apiBase = process.env.EXPO_PUBLIC_API_URL || ''
        const response = await fetch(`${apiBase}/api/feature-flags/crypto_receive_enabled`)
        if (response.ok) {
          const data = await response.json()
          setCryptoReceiveEnabled(data.is_enabled || false)
        }
      } catch (error) {
        console.error('Error checking feature flag:', error)
        setCryptoReceiveEnabled(false)
      }
    }
    checkFeatureFlag()
  }, [])

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'android' ? 90 : 80,
          paddingBottom: Platform.OS === 'android' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="grid-outline" 
              size={28} 
              color={focused ? '#007ACC' : '#6b7280'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="time-outline" 
              size={28} 
              color={focused ? '#007ACC' : '#6b7280'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Send"
        component={SendAmountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#007ACC',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#007ACC',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name="send" size={28} color="#ffffff" />
            </View>
          ),
        }}
      />
      {cryptoReceiveEnabled && (
        <Tab.Screen 
          name="Receive" 
          component={ReceiveMoneyScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name="download-outline" 
                size={28} 
                color={focused ? '#007ACC' : '#6b7280'} 
              />
            ),
          }}
        />
      )}
      <Tab.Screen 
        name="Recipients" 
        component={RecipientsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="people-outline" 
              size={28} 
              color={focused ? '#007ACC' : '#6b7280'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="ellipsis-horizontal-outline" 
              size={28} 
              color={focused ? '#007ACC' : '#6b7280'} 
            />
          ),
        }}
      />
    </Tab.Navigator>
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
        name="SendAmount" 
        component={SendAmountScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="SelectRecipient" 
        component={SelectRecipientScreen}
        options={{ 
          headerShown: false,
          ...getSendFlowTransitionConfig(),
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
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
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
        name="ReceiveMoney" 
        component={ReceiveMoneyScreen}
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
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth()

  console.log('AppNavigator: user:', !!user, 'userProfile:', !!userProfile, 'loading:', loading)

  // Show loading screen while checking initial authentication
  // This prevents the flash of Login screen when user has an active session
  if (loading) {
    return null // Return null instead of loading spinner for faster transition
  }

  // If user is logged in, show main app (Dashboard)
  if (user) {
    return <MainStack />
  }

  // If no user, show auth stack (Login)
  return <AuthStack />
}
