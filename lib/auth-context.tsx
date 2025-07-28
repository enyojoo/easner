"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to fetch from users table first
      const { data: userProfile, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userProfile && !userError) {
        setUserProfile(userProfile)
        setIsAdmin(false)
        return
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
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    return { user: data.user, error: null }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Starting sign up process...", { email, userData })

      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log("Auth signup result:", { authData, authError })

      if (authError) {
        console.error("Auth signup error:", authError)
        return { user: null, error: authError }
      }

      // If auth user was created successfully, create the profile
      if (authData.user) {
        console.log("Creating user profile for:", authData.user.id)

        const profileData = {
          id: authData.user.id,
          email: authData.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || null,
          base_currency: userData.baseCurrency || "NGN",
          country: userData.country || null,
          status: "active",
          verification_status: "pending",
        }

        console.log("Profile data to insert:", profileData)

        const { data: profileResult, error: profileError } = await supabase
          .from("users")
          .insert(profileData)
          .select()
          .single()

        console.log("Profile creation result:", { profileResult, profileError })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
          // Return the error so we can handle it in the UI
          return { user: null, error: { message: `Profile creation failed: ${profileError.message}` } }
        }

        console.log("User profile created successfully:", profileResult)
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { user: null, error: { message: "An unexpected error occurred during registration" } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setIsAdmin(false)
    router.push("/")
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
