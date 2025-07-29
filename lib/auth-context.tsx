"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  base_currency?: string
  status?: string
  verification_status?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshUserProfile: async () => {},
  isAdmin: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to fetch from users table first
      const { data: userProfile, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userProfile && !userError) {
        setUserProfile(userProfile)
        setIsAdmin(false)
        return userProfile
      }

      // If not found in users, check admin_users table
      const { data: adminProfile, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .single()

      if (adminProfile && !adminError) {
        setUserProfile(adminProfile)
        setIsAdmin(true)
        return adminProfile
      }

      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)

      // Clear any stored session data
      localStorage.removeItem("session_timestamp")

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Check session expiration (1 hour = 3600000 ms)
  const checkSessionExpiration = () => {
    const sessionTimestamp = localStorage.getItem("session_timestamp")
    if (sessionTimestamp) {
      const now = Date.now()
      const sessionTime = Number.parseInt(sessionTimestamp)
      const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds

      if (now - sessionTime > oneHour) {
        // Session expired, sign out
        signOut()
        return false
      }
    }
    return true
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Check if session is still valid
          if (checkSessionExpiration()) {
            setUser(session.user)
            await fetchUserProfile(session.user.id)
            // Update session timestamp
            localStorage.setItem("session_timestamp", Date.now().toString())
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
          // Set session timestamp on login
          localStorage.setItem("session_timestamp", Date.now().toString())
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
          localStorage.removeItem("session_timestamp")
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    // Set up session expiration check interval (check every 5 minutes)
    const sessionCheckInterval = setInterval(
      () => {
        if (user && !checkSessionExpiration()) {
          // Session expired, user will be signed out by checkSessionExpiration
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      // Set session timestamp on successful login
      localStorage.setItem("session_timestamp", Date.now().toString())

      // The auth state change listener will handle setting user and profile
      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            base_currency: userData.baseCurrency || "NGN",
          },
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
