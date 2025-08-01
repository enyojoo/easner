"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "../utils/currencyFormatter"

interface User {
  id: number
  name: string
  total_volume?: number
  base_currency: string
}

const useAdminData = () => {
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    // Simulate fetching users data from an API
    const response = await fetch("/api/users")
    const data = await response.json()

    const processedUsers = data.map((user) => ({
      ...user,
      total_volume: user.total_volume || 0,
      formatted_volume: formatCurrency(user.total_volume || 0, user.base_currency),
    }))

    setUsers(processedUsers)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
  }
}

export default useAdminData
