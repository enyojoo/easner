"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const [data, setData] = useState(userDataStore.getData())
  const [loading, setLoading] = useState(false)
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

      setLoading(true)
      setError(null)
      try {
        await userDataStore.initialize(userProfile.id)
        if (mountedRef.current) {
          setData(userDataStore.getData())
        }
      } catch (err) {
        console.error("Failed to initialize user data:", err)
        if (mountedRef.current) {
          setError("Failed to load data. Please try again.")
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
        setData(userDataStore.getData())
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
