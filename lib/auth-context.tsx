"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
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
  name?: string
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

      // If no profile found in either table, user might not have completed registration
      console.warn("No profile found for user:", userId)
      setUserProfile(null)
      setIsAdmin(false)
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setUserProfile(null)
      setIsAdmin(false)
      return null
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
            setUserProfile(null)
            setIsAdmin(false)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (mounted) {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state change:", event, session?.user?.id)

      try {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
        setUser(null)
        setUserProfile(null)
        setIsAdmin(false)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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

  const signOut = async () => {
    try {
      // Clear all data before signing out
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)

      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
      // Force clear state even if signOut fails
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
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
