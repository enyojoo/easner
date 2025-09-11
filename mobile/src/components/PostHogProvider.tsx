import React, { useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { initPostHog, getPostHog } from '../lib/posthog'
import { analytics } from '../lib/analytics'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    // Initialize PostHog
    initPostHog()
    
    // Track app opened
    analytics.trackAppOpened()

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        analytics.trackAppBackgrounded()
      } else if (nextAppState === 'active') {
        analytics.trackAppOpened()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [])

  return <>{children}</>
}
