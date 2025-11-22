import React, { useState, useEffect } from 'react'
import { View, Platform, TouchableOpacity, Text } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import MoreScreen from '../screens/main/MoreScreen'
import ProfileEditScreen from '../screens/main/ProfileEditScreen'
import SupportScreen from '../screens/main/SupportScreen'
import CardScreen from '../screens/main/CardScreen'

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

// Verification Screens
import AccountVerificationScreen from '../screens/verification/AccountVerificationScreen'
import IdentityVerificationScreen from '../screens/verification/IdentityVerificationScreen'
import AddressVerificationScreen from '../screens/verification/AddressVerificationScreen'

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
  const insets = useSafeAreaInsets()
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'android' ? 70 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'android' ? 10 : Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#007ACC',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'normal' as const,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Card" 
        component={CardScreen}
        options={{
          tabBarLabel: 'Card',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="card-outline" 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ReceiveMoney" 
        component={ReceiveMoneyScreen}
        options={({ route }) => ({
          tabBarButton: () => null, // Hide from tab bar but keep in tabs for navigation
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === 'android' ? 70 : 65 + insets.bottom,
            paddingBottom: Platform.OS === 'android' ? 10 : Math.max(insets.bottom, 8),
            paddingTop: 8,
            display: 'flex', // Ensure tab bar is always visible
          },
        })}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="ellipsis-horizontal-outline" 
              size={20} 
              color={color} 
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
        name="IdentityVerification" 
        component={IdentityVerificationScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="AddressVerification" 
        component={AddressVerificationScreen}
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
        component={SupportScreen}
        options={{ 
          headerShown: false,
          ...getTransitionConfig(),
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={SupportScreen}
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
