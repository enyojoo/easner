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

  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    try {
      // Reduced timeout to 5 seconds for faster failure
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000),
      )

      const profilePromise = (async (): Promise<UserProfile | null> => {
        // Try to fetch from users table first with a more specific query
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name, phone, country, created_at")
          .eq("id", userId)
          .single()

        if (userProfile && !userError) {
          setUserProfile(userProfile)
          setIsAdmin(false)
          return userProfile
        }

        // If not found in users, check admin_users table
        const { data: adminProfile, error: adminError } = await supabase
          .from("admin_users")
          .select("id, email, first_name, last_name, phone, created_at")
          .eq("id", userId)
          .single()

        if (adminProfile && !adminError) {
          setUserProfile(adminProfile)
          setIsAdmin(true)
          return adminProfile
        }

        // If no profile found and this is the first attempt, retry once
        if (retryCount === 0) {
          console.warn("Profile not found, retrying...")
          return await fetchUserProfile(userId, 1)
        }

        return null
      })()

      return await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null
    } catch (error) {
      // If it's a timeout and we haven't retried, try once more
      if (error instanceof Error && error.message === "Profile fetch timeout" && retryCount === 0) {
        console.warn("Profile fetch timed out, retrying...")
        return await fetchUserProfile(userId, 1)
      }
      
      console.error("Error fetching user profile:", error)
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

        if (mounted && session?.user) {
          setUser(session.user)
          // Try to fetch profile, but don't block loading if it fails
          try {
            await fetchUserProfile(session.user.id)
          } catch (profileError) {
            console.warn("Profile fetch failed during initial load:", profileError)
            // Continue without profile - user can still use the app
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        if (mounted) {
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

      try {
        if (session?.user) {
          setUser(session.user)
          // Try to fetch profile, but don't block auth state change if it fails
          try {
            await fetchUserProfile(session.user.id)
          } catch (profileError) {
            console.warn("Profile fetch failed during auth state change:", profileError)
            // Continue without profile - user is still authenticated
          }
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
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
