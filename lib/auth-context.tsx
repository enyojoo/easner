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

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      // Try to fetch from users table first
      const { data: userProfile, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userProfile && !userError) {
        console.log("Found user profile:", userProfile)
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
        console.log("Found admin profile:", adminProfile)
        setUserProfile(adminProfile)
        setIsAdmin(true)
        return adminProfile
      }

      console.log("No profile found, creating basic profile")
      // Create a basic profile if none exists
      const basicProfile: UserProfile = {
        id: userId,
        email: userEmail,
        name: userEmail.split("@")[0],
      }
      setUserProfile(basicProfile)
      setIsAdmin(false)
      return basicProfile
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Create basic profile on error
      const basicProfile: UserProfile = {
        id: userId,
        email: userEmail,
        name: userEmail.split("@")[0],
      }
      setUserProfile(basicProfile)
      setIsAdmin(false)
      return basicProfile
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email || "")
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session check:", !!session?.user)

        if (mounted) {
          if (session?.user) {
            console.log("Found existing session, setting user")
            setUser(session.user)
            await fetchUserProfile(session.user.id, session.user.email || "")
          } else {
            console.log("No existing session")
            setUser(null)
            setUserProfile(null)
            setIsAdmin(false)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state change:", event, !!session?.user)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, updating state")
        setUser(session.user)
        await fetchUserProfile(session.user.id, session.user.email || "")
        setLoading(false)
      } else if (event === "SIGNED_OUT" || !session) {
        console.log("User signed out, clearing state")
        setUser(null)
        setUserProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting sign in process...")
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in response:", { user: !!data.user, session: !!data.session, error: error?.message })

      if (error) {
        setLoading(false)
        return { error }
      }

      if (data.user && data.session) {
        console.log("Sign in successful, setting user state")
        setUser(data.user)
        await fetchUserProfile(data.user.id, data.user.email || "")
        setLoading(false)
        return { error: null }
      }

      setLoading(false)
      return { error: new Error("No user data returned") }
    } catch (error) {
      console.error("Sign in error:", error)
      setLoading(false)
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
      console.log("Signing out...")
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
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
