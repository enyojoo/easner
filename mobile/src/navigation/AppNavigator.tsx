import React from 'react'
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

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Custom transition configurations for smooth, platform-appropriate animations
const getTransitionConfig = () => {
  if (Platform.OS === 'ios') {
    return {
      ...TransitionPresets.SlideFromRightIOS,
      gestureEnabled: true,
      gestureDirection: 'horizontal' as const,
      gestureResponseDistance: 50,
      gestureVelocityImpact: 0.3,
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 250,
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 250,
            useNativeDriver: true,
          },
        },
      },
    }
  } else {
    // Android Material Design transitions - disable gestures
    return {
      ...TransitionPresets.ScaleFromCenterAndroid,
      gestureEnabled: false, // Disable gestures on Android
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
    // Android uses the standard configuration - disable gestures
    return {
      ...TransitionPresets.ScaleFromCenterAndroid,
      gestureEnabled: false, // Disable gestures on Android
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
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth()

  console.log('AppNavigator: user:', !!user, 'userProfile:', !!userProfile, 'loading:', loading)

  // Show main stack if we have user (profile can load in background)
  // Show auth stack if no user
  return user ? <MainStack /> : <AuthStack />
}
