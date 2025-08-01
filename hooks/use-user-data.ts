"use client"

import { useState, useEffect, useCallback } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const [data, setData] = useState(userDataStore.getData())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize the refresh functions to prevent unnecessary re-renders
  const refreshRecipients = useCallback(() => {
    if (userProfile?.id) {
      return userDataStore.refreshRecipients(userProfile.id)
    }
  }, [userProfile?.id])

  const refreshTransactions = useCallback(() => {
    if (userProfile?.id) {
      return userDataStore.refreshTransactions(userProfile.id)
    }
  }, [userProfile?.id])

  const getFreshData = useCallback(() => {
    if (userProfile?.id) {
      return userDataStore.getFreshData(userProfile.id)
    }
  }, [userProfile?.id])

  useEffect(() => {
    if (!userProfile?.id) return

    const initializeData = async () => {
      setLoading(true)
      setError(null)
      try {
        await userDataStore.initialize(userProfile.id)
        setData(userDataStore.getData())
      } catch (err) {
        console.error("Failed to initialize user data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    const unsubscribe = userDataStore.subscribe(() => {
      setData(userDataStore.getData())
    })

    return () => {
      unsubscribe()
    }
  }, [userProfile?.id])

  useEffect(() => {
    return () => {
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
    getFreshData,
  }
}
