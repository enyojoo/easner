"use client"

import { useState, useEffect, useRef } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile } = useAuth()
  const [data, setData] = useState(userDataStore.getData())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef<boolean>(false)

  useEffect(() => {
    if (!userProfile?.id || initRef.current) return

    const initializeData = async () => {
      setLoading(true)
      setError(null)
      try {
        await userDataStore.initialize(userProfile.id)
        setData(userDataStore.getData())
        initRef.current = true
      } catch (err) {
        console.error("Failed to initialize user data:", err)
        setError("Failed to load data")
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
    paymentMethods: data.paymentMethods,
    loading,
    error,
    refreshRecipients: () => userProfile?.id && userDataStore.refreshRecipients(userProfile.id),
    refreshTransactions: () => userProfile?.id && userDataStore.refreshTransactions(userProfile.id),
    addOptimisticTransaction: (transaction: any) => userDataStore.addOptimisticTransaction(transaction),
    updateTransactionStatus: (transactionId: string, status: string) =>
      userDataStore.updateTransactionStatus(transactionId, status),
  }
}
