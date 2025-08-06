"use client"

import { useState, useEffect } from "react"

interface AdminData {
  users: any[]
  transactions: any[]
  currencies: any[]
  exchangeRates: any[]
  baseCurrency: string
  stats: {
    totalUsers: number
    activeUsers: number
    verifiedUsers: number
    totalTransactions: number
    totalVolume: number
    pendingTransactions: number
  }
  recentActivity: any[]
  currencyPairs: any[]
  lastUpdated: number
}

export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/data', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newData = await response.json()
      setData(newData)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error, refetch: fetchData }
}
