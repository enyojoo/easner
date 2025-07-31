"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"

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
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 60 minutes

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

  const handleSessionExpiry = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)

      if (typeof window !== "undefined") {
        sessionStorage.clear()
        localStorage.clear()
        alert("Your session has expired due to inactivity. Please log in again.")
        router.push("/")
      }
    } catch (error) {
      console.error("Error handling session expiry:", error)
    }
  }

  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    const timer = setTimeout(handleSessionExpiry, INACTIVITY_TIMEOUT)
    setInactivityTimer(timer)
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

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

  const signOut = async () => {
    try {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        setInactivityTimer(null)
      }

      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)

      if (typeof window !== "undefined") {
        sessionStorage.clear()
        localStorage.clear()
      }

      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
          resetInactivityTimer()
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
          resetInactivityTimer()
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
          if (inactivityTimer) {
            clearTimeout(inactivityTimer)
            setInactivityTimer(null)
          }
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    // Activity tracking
    const handleActivity = () => {
      if (user) {
        resetInactivityTimer()
      }
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      subscription.unsubscribe()
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [user, inactivityTimer])

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
