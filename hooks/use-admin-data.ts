"use client"

import { useState, useEffect } from "react"
import { adminDataStore } from "@/lib/admin-data-store"

export function useAdminData() {
  const [data, setData] = useState<any>(adminDataStore.getData())
  const [loading, setLoading] = useState(adminDataStore.isLoading())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get current data immediately
    const currentData = adminDataStore.getData()
    if (currentData && mounted) {
      setData(currentData)
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
  }, [])

  return { data, loading, error }
}
