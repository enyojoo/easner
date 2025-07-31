"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { SessionManager } from "./session-manager"

interface AuthContextType {
  user: User | null
  userProfile: any
  adminProfile: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  adminProfile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileFetched, setProfileFetched] = useState<string | null>(null)

  const supabase = createClientComponentClient()
  const sessionManager = SessionManager.getInstance()

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      if (profileFetched === userId) return

      try {
        const { data: profile } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

        if (profile) {
          setUserProfile(profile)
          setProfileFetched(userId)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    },
    [supabase, profileFetched],
  )

  const fetchAdminProfile = useCallback(
    async (userId: string) => {
      if (profileFetched === `admin_${userId}`) return

      try {
        const { data: profile } = await supabase.from("admin_users").select("*").eq("id", userId).maybeSingle()

        if (profile) {
          setAdminProfile(profile)
          setProfileFetched(`admin_${userId}`)
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error)
      }
    },
    [supabase, profileFetched],
  )

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setAdminProfile(null)
      setProfileFetched(null)
      sessionManager.endSession()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [supabase, sessionManager])

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            sessionManager.startSession()

            // Check if it's an admin route to determine which profile to fetch
            const isAdminRoute = window.location.pathname.startsWith("/admin")
            if (isAdminRoute) {
              await fetchAdminProfile(session.user.id)
            } else {
              await fetchUserProfile(session.user.id)
            }
          } else {
            setUser(null)
            setUserProfile(null)
            setAdminProfile(null)
            setProfileFetched(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        sessionManager.startSession()

        const isAdminRoute = window.location.pathname.startsWith("/admin")
        if (isAdminRoute) {
          await fetchAdminProfile(session.user.id)
        } else {
          await fetchUserProfile(session.user.id)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserProfile(null)
        setAdminProfile(null)
        setProfileFetched(null)
        sessionManager.endSession()
      }

      setLoading(false)
    })

    // Activity tracking
    const handleActivity = () => {
      if (user) {
        sessionManager.updateActivity()
      }
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [supabase, sessionManager, fetchUserProfile, fetchAdminProfile, user])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        adminProfile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
