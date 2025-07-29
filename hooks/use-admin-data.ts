"use client"

import { useState, useEffect } from "react"
import { adminDataStore } from "@/lib/admin-data-store"

export function useAdminData() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setError(null)
        const adminData = await adminDataStore.getData()
        if (mounted) {
          setData(adminData)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load data")
          setLoading(false)
        }
      }
    }

    loadData()

    // Subscribe to data updates
    const unsubscribe = adminDataStore.subscribe(() => {
      if (mounted) {
        adminDataStore
          .getData()
          .then((adminData) => {
            setData(adminData)
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to load data")
          })
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return { data, loading, error }
}
