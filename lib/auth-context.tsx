"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache for profile data
let profileCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false for instant load
  const router = useRouter()

  useEffect(() => {
    // Get initial session without loading state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)

        // Set session cookies for middleware
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax; secure`
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; secure`
      } else {
        setProfile(null)
        profileCache = null

        // Clear session cookies
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    // Check cache first
    if (profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
      setProfile(profileCache.data)
      return
    }

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error

      // Cache the profile data
      profileCache = {
        data,
        timestamp: Date.now(),
      }

      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      profileCache = null

      // Clear cookies
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
