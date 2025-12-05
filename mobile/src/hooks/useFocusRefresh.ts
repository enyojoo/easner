import React, { useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useUserData } from '../contexts/UserDataContext'

/**
 * Hook to refresh data when screen comes into focus
 * Only refreshes if data is stale (> 5 minutes old by default)
 * 
 * @param refreshFn - Function to call for refresh
 * @param staleThreshold - Time in milliseconds before data is considered stale (default: 5 minutes)
 * @param force - If true, always refresh regardless of staleness
 */
export function useFocusRefresh(
  refreshFn: () => Promise<void>,
  staleThreshold: number = 5 * 60 * 1000, // 5 minutes default
  force: boolean = false
) {
  const lastRefreshTime = useRef<number>(0)

  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now()
      const timeSinceLastRefresh = now - lastRefreshTime.current
      
      // Refresh if forced, or if data is stale
      if (force || timeSinceLastRefresh > staleThreshold) {
        lastRefreshTime.current = now
        refreshFn().catch(error => {
          console.warn('Focus refresh error:', error)
        })
      }
    }, [refreshFn, staleThreshold, force])
  )
}

/**
 * Hook to refresh all user data when screen comes into focus
 * Uses the UserDataContext's refreshStaleData for optimal performance
 */
export function useFocusRefreshAll(force: boolean = false) {
  const { refreshStaleData } = useUserData()
  useFocusRefresh(() => refreshStaleData(), 5 * 60 * 1000, force)
}

