"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { getSecuritySettings } from "./security-settings"

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
  const [sessionTimeout, setSessionTimeout] = useState(30) // Default 30 minutes
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchUserProfile = async (userId: string, user?: any) => {
    try {
      // Check if this is an admin user by looking at the user metadata
      const isAdminUser = user?.user_metadata?.isAdmin || user?.isAdmin || false

      if (isAdminUser) {
        // For admin users, create profile from user metadata
        const adminProfile = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.phone || '',
          base_currency: user.user_metadata?.base_currency || 'NGN',
          status: 'active',
          verification_status: 'verified',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
          role: 'super_admin'
        }
        
        setUserProfile(adminProfile)
        setIsAdmin(true)
        setUser(user)
        return adminProfile
      }

      // For regular users, try to fetch from users table with a shorter timeout
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (userProfile && !userError) {
        setUserProfile(userProfile)
        setIsAdmin(false)
        setUser(user)
        return userProfile
      }

      // If not found in users table and not admin, return null
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Don't fail completely, just return null and let the auth flow continue
      return null
    }
  }

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }, [user])

  // Load security settings and set up session timeout
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getSecuritySettings()
        setSessionTimeout(settings.sessionTimeout)
      } catch (error) {
        console.error("Error loading security settings:", error)
      }
    }
    loadSecuritySettings()
  }, [])

  // Session timeout check
  useEffect(() => {
    if (!user) return

    const checkSessionTimeout = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const timeoutMs = sessionTimeout * 60 * 1000 // Convert minutes to milliseconds

      if (timeSinceLastActivity > timeoutMs) {
        console.log("Session timeout reached, signing out user")
        signOut()
      }
    }

    const interval = setInterval(checkSessionTimeout, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [user, lastActivity, sessionTimeout])

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())
    
    // Listen for user activity
    document.addEventListener('mousedown', updateActivity)
    document.addEventListener('keypress', updateActivity)
    document.addEventListener('scroll', updateActivity)
    document.addEventListener('touchstart', updateActivity)

    return () => {
      document.removeEventListener('mousedown', updateActivity)
      document.removeEventListener('keypress', updateActivity)
      document.removeEventListener('scroll', updateActivity)
      document.removeEventListener('touchstart', updateActivity)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted && session?.user) {
          await fetchUserProfile(session.user.id, session.user)
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
          // Set user immediately to prevent loading issues
          setUser(session.user)
          setLastActivity(Date.now()) // Reset activity timer on login
          // Then fetch profile asynchronously
          fetchUserProfile(session.user.id, session.user).catch(error => {
            console.error("Error fetching profile after auth change:", error)
          })
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

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      // If remember me is checked, extend session duration
      if (rememberMe && data.session) {
        // Set a longer session duration (30 days)
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      // The auth state change listener will handle setting user and profile
      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            base_currency: userData.baseCurrency || "USD",
          },
        },
      })

      if (error) {
        // Check if it's a duplicate email error
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          return { error: { message: "An account with this email already exists. Please sign in instead." } }
        }
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error }
    }
  }

  const signOut = useCallback(async () => {
    try {
      // Clear all data immediately
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      setLoading(false)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Force clear state even if signOut fails
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserProfile,
    isAdmin,
  }), [user, userProfile, loading, signIn, signUp, signOut, refreshUserProfile, isAdmin])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
