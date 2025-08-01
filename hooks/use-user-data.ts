"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const [data, setData] = useState(userDataStore.getData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs to prevent stale closures
  const userIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  // Update ref when userProfile changes
  useEffect(() => {
    userIdRef.current = userProfile?.id || null
  }, [userProfile?.id])

  // Subscribe to data store changes
  useEffect(() => {
    const unsubscribe = userDataStore.subscribe(() => {
      if (mountedRef.current) {
        setData(userDataStore.getData())
        setLoading(false)
        setError(null)
      }
    })

    return unsubscribe
  }, [])

  // Initialize data when user changes
  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      const userId = userProfile?.id
      if (!userId) {
        if (mounted) {
          setLoading(false)
          setData(userDataStore.getData())
        }
        return
      }

      try {
        if (mounted) {
          setLoading(true)
          setError(null)
        }

        await userDataStore.initialize(userId)

        if (mounted) {
          setData(userDataStore.getData())
          setLoading(false)
        }
      } catch (error) {
        console.error("Error initializing user data:", error)
        if (mounted) {
          setError("Failed to load data")
          setLoading(false)
        }
      }
    }

    initializeData()

    return () => {
      mounted = false
    }
  }, [userProfile?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refreshRecipients = useCallback(async () => {
    const userId = userIdRef.current
    if (userId) {
      await userDataStore.refreshRecipients(userId)
    }
  }, [])

  const refreshTransactions = useCallback(async () => {
    const userId = userIdRef.current
    if (userId) {
      await userDataStore.refreshTransactions(userId)
    }
  }, [])

  const forceRefresh = useCallback(async () => {
    const userId = userIdRef.current
    if (userId) {
      setLoading(true)
      try {
        await userDataStore.getFreshData(userId)
        setData(userDataStore.getData())
        setError(null)
      } catch (error) {
        console.error("Error force refreshing data:", error)
        setError("Failed to refresh data")
      } finally {
        setLoading(false)
      }
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
    lastUpdated: data.lastUpdated,
  }
}
