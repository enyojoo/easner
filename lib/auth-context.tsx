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
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        return { user: null, error: authError }
      }

      // If auth user was created successfully, create the profile
      if (authData.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || null,
          base_currency: userData.baseCurrency || "NGN",
          country: userData.country || null,
          status: "active",
          verification_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
          // Don't return error here as auth user was created successfully
          // The profile will be created on next login attempt or can be handled separately
        }
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { user: null, error }
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
