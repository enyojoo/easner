import React, { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'

interface WithAuthProps {
  children: React.ReactNode
  requireAuth?: boolean
  [key: string]: any // Allow any additional props to be passed through
}

const WithAuth: React.FC<WithAuthProps> = ({ children, requireAuth = true, ...props }) => {
  const { user, loading } = useAuth()
  const navigation = useNavigation()

  useEffect(() => {
    // Only redirect if we're not loading and require auth but user is not logged in
    if (!loading && requireAuth && !user) {
      console.log('WithAuth: Redirecting to login - user not authenticated')
      navigation.navigate('Login' as never)
    }
  }, [user, loading, requireAuth, navigation])

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    )
  }

  // If auth is required but user is not logged in, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007ACC" />
      </View>
    )
  }

  return React.cloneElement(children as React.ReactElement, props)
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
})

export default WithAuth
