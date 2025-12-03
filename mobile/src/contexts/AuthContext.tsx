import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { User, AuthUser } from '../types'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { analytics } from '../lib/analytics'
import { clearPinAuth, updateSessionActivity, markFirstLoginAfterVerification } from '../lib/pinAuth'

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
          // Set user immediately (map Supabase user to our User type)
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            phone: session.user.phone || undefined,
            base_currency: session.user.user_metadata?.base_currency || 'NGN',
            status: 'active',
            verification_status: session.user.email_confirmed_at ? 'verified' : 'pending',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          }
          setUser(mappedUser)
          // Fetch profile in background
          fetchUserProfile(session.user.id, mappedUser).catch(error => {
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
          // Set user immediately to prevent UI issues (map Supabase user to our User type)
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            phone: session.user.phone || undefined,
            base_currency: session.user.user_metadata?.base_currency || 'NGN',
            status: 'active',
            verification_status: session.user.email_confirmed_at ? 'verified' : 'pending',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          }
          setUser(mappedUser)
          // Fetch profile in background
          fetchUserProfile(session.user.id, mappedUser).catch(error => {
            console.error('Background profile fetch error:', error)
          })
        } else {
          // No user session - clear state immediately
          // This happens when user logs out via signOut() or session expires
          setUser(null)
          setUserProfile(null)
          setLoading(false) // Ensure loading is false so AppNavigator doesn't wait
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        // Don't clear state on error, just log it
      } finally {
        if (mounted) {
          // Set loading to false when there's no session (user logged out)
          // This ensures AppNavigator doesn't wait for loading state
          if (!session?.user) {
            setLoading(false)
          } else if (userProfile) {
            // User is logged in and profile is loaded
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

      // Track successful sign in
      analytics.trackSignIn('email', {
        rememberMe,
        userId: data.user?.id
      })

      // Don't mark first login here - only mark after PIN is set up
      // This way, users with active sessions are treated as existing users

      // Don't update session activity here - it should only be updated after PIN verification
      // This ensures the flow is: Login → PIN Entry → Main App
      // If we update here, session becomes valid immediately and skips PIN entry

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
      
      // Track sign out
      analytics.trackSignOut()
      
      // Clear PIN auth data on logout
      await clearPinAuth()
      
      // Clear from onboarding flag so back arrow doesn't show after logout
      await AsyncStorage.removeItem('@easner_from_onboarding')
      
      // Clear onboarding completion flag so user goes to onboarding screen on logout
      await AsyncStorage.removeItem('@easner_onboarding_completed')
      
      // Clear user state IMMEDIATELY and synchronously to trigger navigation
      // This must happen FIRST before anything else to ensure AppNavigator responds immediately
      setUser(null)
      setUserProfile(null)
      setLoading(false) // Also set loading to false to ensure AppNavigator doesn't wait
      
      // Sign out from Supabase (this will trigger onAuthStateChange which also sets user to null)
      // Do this AFTER setting user to null so navigation happens first
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



