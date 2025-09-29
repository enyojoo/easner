"use client"

import { useState, useEffect } from "react"
import { adminDataStore } from "@/lib/admin-data-store"
import { useAuth } from "@/lib/auth-context"

export function useAdminData() {
  const { userProfile, isAdmin } = useAuth()
  const [data, setData] = useState<any>(adminDataStore.getData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Only initialize if user is admin and authenticated
    if (isAdmin && userProfile) {
      const initializeData = async () => {
        try {
          setLoading(true)
          setError(null)
          await adminDataStore.initializeWhenReady()
          if (mounted) {
            setData(adminDataStore.getData())
            setLoading(false)
          }
        } catch (err) {
          console.error("Failed to initialize admin data:", err)
          if (mounted) {
            setError("Failed to load admin data")
            setLoading(false)
          }
        }
      }

      initializeData()
    } else {
      setLoading(false)
    }

    // Subscribe to data updates
    const unsubscribe = adminDataStore.subscribe(() => {
      if (mounted) {
        const newData = adminDataStore.getData()
        if (newData) {
          setData(newData)
          setLoading(false)
          setError(null)
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [isAdmin, userProfile])

  return { data, loading, error }
}
