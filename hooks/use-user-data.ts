"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const initialData = userDataStore.getData()
  const initialLoading = !initialData || initialData.lastUpdated === 0 || !userDataStore.checkDataFreshness()
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // Memoize the refresh functions to prevent unnecessary re-renders
  const refreshRecipients = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.refreshRecipients(userProfile.id)
    }
  }, [userProfile?.id])

  const refreshTransactions = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.refreshTransactions(userProfile.id)
    }
  }, [userProfile?.id])

  const forceRefresh = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.forceRefresh(userProfile.id)
    }
  }, [userProfile?.id])

  useEffect(() => {
    mountedRef.current = true

    if (!userProfile?.id) return

    const initializeData = async () => {
      if (!mountedRef.current) return

      // Check if data is already fresh - if so, don't show loading state
      const existingData = userDataStore.getData()
      const hasData = existingData && existingData.lastUpdated > 0
      const isDataFresh = userDataStore.checkDataFreshness()

      // Only show loading if we don't have fresh data
      // This prevents flickering when navigating to the dashboard with cached data
      if (!hasData || !isDataFresh) {
        setLoading(true)
      }
      setError(null)
      
      try {
        // Initialize will return immediately if data is fresh, preventing unnecessary loading
        await userDataStore.initialize(userProfile.id)
        if (mountedRef.current) {
          const newData = userDataStore.getData()
          // Only update if data actually changed
          setData((prevData) => {
            if (JSON.stringify(prevData) === JSON.stringify(newData)) {
              return prevData
            }
            return newData
          })
        }
      } catch (err) {
        console.error("Failed to initialize user data:", err)
        if (mountedRef.current) {
          // Only set error if we don't have existing data to fall back to
          if (!hasData) {
            setError("Failed to load data. Please try again.")
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeData()

    const unsubscribe = userDataStore.subscribe(() => {
      if (mountedRef.current) {
        const newData = userDataStore.getData()
        // Only update state if data actually changed to prevent unnecessary re-renders
        setData((prevData) => {
          if (JSON.stringify(prevData) === JSON.stringify(newData)) {
            return prevData
          }
          return newData
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [userProfile?.id])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      userDataStore.cleanup()
    }
  }, [])

  return {
    transactions: data.transactions,
    recipients: data.recipients,
    currencies: data.currencies,
    exchangeRates: data.exchangeRates,
    loading,
    error,
    refreshRecipients,
    refreshTransactions,
    forceRefresh,
  }
}
