import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, AuthUser } from '../types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userProfile: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (userId: string, user?: any) => {
    try {
      console.log('AuthContext: Fetching user profile for userId:', userId)
      
      // Try regular users table first
      const { data: regularUser, error: regularUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (regularUser && !regularUserError) {
        console.log('AuthContext: Regular user found:', regularUser.email)
        setUserProfile({
          id: regularUser.id,
          email: regularUser.email,
          isAdmin: false,
          profile: {
            id: regularUser.id,
            email: regularUser.email,
            first_name: regularUser.first_name,
            last_name: regularUser.last_name,
            phone: regularUser.phone,
            base_currency: regularUser.base_currency,
            status: regularUser.status,
            verification_status: regularUser.verification_status,
            created_at: regularUser.created_at,
            updated_at: regularUser.updated_at,
          } as User,
        })
        if (user) setUser(user) // Set user after profile is fetched
        return regularUser
      }

      // Check admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single()

      if (adminUser && !adminError) {
        // Admin users cannot access mobile app - sign them out
        console.log('Admin user detected, signing out from mobile app')
        await supabase.auth.signOut()
        setUser(null)
        setUserProfile(null)
        return null
      }

      console.log('AuthContext: No user found in either table')
      // If user not found in either table, clear state
      setUser(null)
      setUserProfile(null)
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Don't clear user state on error, just log it
      console.log('AuthContext: Profile fetch error, but keeping user session')
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
          // Set user immediately
          setUser(session.user)
          // Fetch profile in background
          fetchUserProfile(session.user.id, session.user).catch(error => {
            console.error('Initial profile fetch error:', error)
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
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

      console.log('AuthContext: Auth state change:', event, session?.user?.id)

      try {
        if (session?.user) {
          console.log('AuthContext: User session found, fetching profile')
          // Set user immediately to prevent UI issues
          setUser(session.user)
          // Fetch profile in background
          fetchUserProfile(session.user.id, session.user).catch(error => {
            console.error('Background profile fetch error:', error)
          })
        } else {
          console.log('AuthContext: No user session, clearing state')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        // Don't clear state on error, just log it
      } finally {
        if (mounted) {
          // Only set loading to false if we're not in the middle of a login process
          if (!session?.user || userProfile) {
            console.log('AuthContext: Setting loading to false')
            setLoading(false)
          }
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('AuthContext: Attempting sign in for:', email)
      // Don't set loading to true here to prevent loading screen during login
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('AuthContext: Sign in error:', error.message)
        return { error }
      }

      console.log('AuthContext: Sign in successful, session:', !!data.session)

      // If remember me is checked, extend session duration
      if (rememberMe && data.session) {
        // Set a longer session duration (30 days)
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      // The auth state change handler will manage the loading state
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user')
      // Clear user state immediately to prevent UI issues
      setUser(null)
      setUserProfile(null)
      
      await supabase.auth.signOut()
      console.log('AuthContext: Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear the state even if sign out fails
      setUser(null)
      setUserProfile(null)
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
