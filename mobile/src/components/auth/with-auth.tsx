import React, { useEffect } from 'react'
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

  // If auth is required but user is not logged in, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !user) {
    return null // Don't show loading spinner, just return null
  }

  return React.cloneElement(children as React.ReactElement, props)
}

export default WithAuth
