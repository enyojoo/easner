import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/contexts/AuthContext'
import { UserDataProvider } from './src/contexts/UserDataContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  console.log('App.tsx: App component rendering')
  
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <UserDataProvider>
              <NavigationContainer
                theme={{
                  colors: {
                    primary: '#007ACC',
                    background: '#ffffff',
                    card: '#ffffff',
                    text: '#1f2937',
                    border: '#e5e7eb',
                    notification: '#ef4444',
                  },
                }}
              >
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </UserDataProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  } catch (error) {
    console.error('App.tsx: Error in App component:', error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading app: {String(error)}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
})