import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom storage implementation using Expo SecureStore with size optimization
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.warn('SecureStore getItem error:', error)
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Check if value exceeds 2048 bytes and compress if needed
      const byteSize = new Blob([value]).size
      if (byteSize > 2048) {
        console.warn(`Storage value for ${key} is ${byteSize} bytes, which exceeds SecureStore limit`)
        
        // For auth sessions, we can store only essential data
        if (key.includes('auth-token')) {
          try {
            const sessionData = JSON.parse(value)
            // Store only essential session data to reduce size
            const compressedSession = {
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token,
              expires_at: sessionData.expires_at,
              token_type: sessionData.token_type,
              user: {
                id: sessionData.user?.id,
                email: sessionData.user?.email,
                aud: sessionData.user?.aud,
                role: sessionData.user?.role,
                created_at: sessionData.user?.created_at,
                updated_at: sessionData.user?.updated_at,
                // Remove large metadata objects
              }
            }
            const compressedValue = JSON.stringify(compressedSession)
            const compressedSize = new Blob([compressedValue]).size
            
            if (compressedSize <= 2048) {
              await SecureStore.setItemAsync(key, compressedValue)
              return
            } else {
              console.warn(`Compressed session still too large: ${compressedSize} bytes`)
            }
          } catch (parseError) {
            console.warn('Failed to parse session data for compression:', parseError)
          }
        }
      }
      
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.warn('SecureStore setItem error:', error)
      // Fallback: try to store a minimal version
      if (key.includes('auth-token')) {
        try {
          const minimalSession = JSON.stringify({
            access_token: 'stored_externally',
            refresh_token: 'stored_externally',
            expires_at: Date.now() + 3600000, // 1 hour from now
            token_type: 'bearer'
          })
          await SecureStore.setItemAsync(key, minimalSession)
        } catch (fallbackError) {
          console.error('Failed to store even minimal session:', fallbackError)
        }
      }
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.warn('SecureStore removeItem error:', error)
    }
  },
}

// Client-side Supabase client (singleton pattern)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Better session detection for RLS
  },
  global: {
    headers: {
      'X-Client-Info': 'easner-mobile-app'
    }
  }
})

// Auth helper functions
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
