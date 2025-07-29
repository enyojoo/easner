"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { userService } from "./database"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  base_currency: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const SESSION_KEY = "novapay_session"
const SESSION_EXPIRY_KEY = "novapay_session_expiry"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if session is expired
  const isSessionExpired = () => {
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiry) return true
    return Date.now() > Number.parseInt(expiry)
  }

  // Set session expiry
  const setSessionExpiry = () => {
    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString())
  }

  // Clear session
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  }

  // Check session expiry every minute
  useEffect(() => {
    const checkSession = () => {
      if (user && isSessionExpired()) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [user])

  const refreshUserProfile = async () => {
    if (!user) return

    try {
      const profile = await userService.getProfile(user.id)
      setUserProfile(profile)
    } catch (error) {
      console.error("Error refreshing user profile:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        setSessionExpiry()
        localStorage.setItem(SESSION_KEY, "active")

        // Fetch user profile
        const profile = await userService.getProfile(data.user.id)
        setUserProfile(profile)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create user profile
        await userService.createProfile(data.user.id, {
          email,
          firstName,
          lastName,
          phone: "",
          baseCurrency: "NGN",
        })

        setUser(data.user)
        setSessionExpiry()
        localStorage.setItem(SESSION_KEY, "active")

        // Fetch user profile
        const profile = await userService.getProfile(data.user.id)
        setUserProfile(profile)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      clearSession()
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if session is expired
        if (isSessionExpired()) {
          clearSession()
          setLoading(false)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          setSessionExpiry() // Refresh session expiry
          localStorage.setItem(SESSION_KEY, "active")

          // Fetch user profile
          const profile = await userService.getProfile(session.user.id)
          setUserProfile(profile)
        } else {
          clearSession()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        setUserProfile(null)
        clearSession()
      } else if (session?.user) {
        setUser(session.user)
        setSessionExpiry()
        localStorage.setItem(SESSION_KEY, "active")

        try {
          const profile = await userService.getProfile(session.user.id)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
