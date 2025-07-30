"use client"

import { useState, useEffect } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const [data, setData] = useState(userDataStore.getData())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userProfile?.id) return

    const initializeData = async () => {
      setLoading(true)
      try {
        await userDataStore.initialize(userProfile.id)
        setData(userDataStore.getData())
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
    refreshRecipients: () => userProfile?.id && userDataStore.refreshRecipients(userProfile.id),
    refreshTransactions: () => userProfile?.id && userDataStore.refreshTransactions(userProfile.id),
  }
}
