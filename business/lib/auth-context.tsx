"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call Column API
    const mockUser = { id: "1", email, name: email.split("@")[0] }
    setUser(mockUser)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("user", JSON.stringify(mockUser))
      } catch (error) {
        console.error("Error saving user to localStorage:", error)
      }
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - in production, this would call Column API
    const mockUser = { id: "1", email, name }
    setUser(mockUser)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("user", JSON.stringify(mockUser))
      } catch (error) {
        console.error("Error saving user to localStorage:", error)
      }
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("user")
      } catch (error) {
        console.error("Error removing user from localStorage:", error)
      }
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <AuthContext.Provider value={{ user: null, login, signup, logout, isLoading: true }}>{children}</AuthContext.Provider>
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
