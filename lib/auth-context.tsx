"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  base_currency: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error loading user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error loading user profile:", error)
      return null
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user?.id) {
      const profile = await loadUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // Set auth cookies for middleware
  const setAuthCookies = (session: any) => {
    if (session?.access_token) {
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`
    }
    if (session?.refresh_token) {
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; secure; samesite=strict`
    }
  }

  // Clear auth cookies
  const clearAuthCookies = () => {
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)

          // Load user profile
          const profile = await loadUserProfile(session.user.id)
          setUserProfile(profile)

          // Set auth cookies for middleware
          setAuthCookies(session)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        // Load user profile
        const profile = await loadUserProfile(session.user.id)
        setUserProfile(profile)

        // Set auth cookies for middleware
        setAuthCookies(session)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserProfile(null)

        // Clear auth cookies
        clearAuthCookies()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user && data.session) {
        setUser(data.user)

        // Load user profile
        const profile = await loadUserProfile(data.user.id)
        setUserProfile(profile)

        // Set auth cookies for middleware
        setAuthCookies(data.session)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          base_currency: userData.baseCurrency || "NGN",
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
          return { error: profileError }
        }

        setUser(data.user)

        // Load user profile
        const profile = await loadUserProfile(data.user.id)
        setUserProfile(profile)

        // Set auth cookies for middleware if session exists
        if (data.session) {
          setAuthCookies(data.session)
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)

      // Clear auth cookies
      clearAuthCookies()

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
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
