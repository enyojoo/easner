"use client"

import { useState, useEffect } from "react"
import { adminDataStore } from "@/lib/admin-data-store"
import { useAuth } from "@/lib/auth-context"

export function useAdminData() {
  const { userProfile, isAdmin } = useAuth()
  // Initialize with cached data if available to prevent flickering
  const initialData = adminDataStore.getData()
  const [data, setData] = useState<any>(initialData)
  const [loading, setLoading] = useState(!initialData) // Only show loading if no cached data
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Only initialize if user is admin and authenticated
    if (isAdmin && userProfile) {
      const initializeData = async () => {
        if (!mounted) return

        try {
          // Only set loading if we don't have cached data
          if (!initialData) {
            setLoading(true)
          }
          setError(null)
          // Use initializeDirect since we already know user is admin from auth context
          await adminDataStore.initializeDirect()
          if (mounted) {
            const newData = adminDataStore.getData()
            if (newData) {
              setData(newData)
            }
            setLoading(false)
          }
        } catch (err) {
          console.error("Failed to initialize admin data:", err)
          if (mounted) {
            // Set error but don't block UI - use existing data if available
            const existingData = adminDataStore.getData()
            if (existingData) {
              setData(existingData)
              setError(null)
            } else {
              setError("Failed to load admin data")
            }
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
          // Only update if data actually changed to prevent flickering
          setData((prevData: any) => {
            // Deep comparison to prevent unnecessary updates
            if (JSON.stringify(prevData) === JSON.stringify(newData)) {
              return prevData
            }
            return newData
          })
          // Only set loading to false if we have data and were previously loading
          setLoading((prevLoading) => prevLoading && newData ? false : prevLoading)
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
