/**
 * PIN Authentication Service
 * Handles PIN storage, validation, and session management
 * Integrates with Supabase for server-side PIN hash storage (mobile app only)
 */

import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import bcrypt from 'bcryptjs'
import * as Crypto from 'expo-crypto'
import { supabase } from './supabase'

// Set up bcrypt random fallback for React Native
// bcryptjs needs a random number generator, and React Native doesn't have WebCryptoAPI
bcrypt.setRandomFallback((len: number) => {
  // Use expo-crypto to generate random bytes
  // getRandomBytes returns a Uint8Array, convert to regular array
  const randomBytes = Crypto.getRandomBytes(len)
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(randomBytes[i])
  }
  return arr
})

// SecureStore keys cannot contain '@' - use alphanumeric, '.', '-', '_' only
const PIN_KEY = 'easner_user_pin'
const PIN_SETUP_KEY = '@easner_pin_setup_completed'
const PIN_PROMPT_DISMISSED_KEY = '@easner_pin_prompt_dismissed'
const FIRST_LOGIN_KEY = '@easner_first_login_after_verification'
const SESSION_LAST_ACTIVE_KEY = '@easner_session_last_active'
const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes in milliseconds
const MAX_PIN_ATTEMPTS = 5
const PIN_ATTEMPTS_KEY = '@easner_pin_attempts'
const PIN_LOCKED_UNTIL_KEY = '@easner_pin_locked_until'

export interface PinAuthResult {
  success: boolean
  error?: string
  locked?: boolean
  lockedUntil?: number
}

/**
 * Set up PIN for the first time
 * Stores hashed PIN in Supabase and caches locally for offline support
 */
export async function setupPin(pin: string, userId?: string): Promise<PinAuthResult> {
  try {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return { success: false, error: 'PIN must be 6 digits' }
    }

    // Hash the PIN using bcrypt (bcryptjs is synchronous, but we wrap in Promise for consistency)
    const saltRounds = 10
    const pinHash = await new Promise<string>((resolve, reject) => {
      try {
        const hash = bcrypt.hashSync(pin, saltRounds)
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    })

    // Get current user if not provided
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }
      currentUserId = user.id
    }

    // Store PIN hash locally FIRST for instant access
    await SecureStore.setItemAsync(PIN_KEY, pinHash)
    await AsyncStorage.setItem(PIN_SETUP_KEY, 'true')
    
    // Store PIN hash in Supabase (non-blocking - don't wait for it)
    // This allows instant return while Supabase syncs in background
    ;(async () => {
      try {
        const { error } = await supabase
          .from('users')
          .update({ pin_hash: pinHash })
          .eq('id', currentUserId)
        
        if (error) {
          console.error('Error storing PIN hash in Supabase (non-critical):', error)
        }
      } catch (error) {
        console.error('Error storing PIN hash in Supabase (non-critical):', error)
        // Don't fail - local cache is already set, Supabase will sync later
      }
    })()
    
    // Return success immediately - don't wait for Supabase
    return { success: true }
  } catch (error) {
    console.error('Error setting up PIN:', error)
    return { success: false, error: 'Failed to set up PIN' }
  }
}

/**
 * Verify PIN
 * Checks against Supabase hash first, falls back to local cache for offline support
 */
export async function verifyPin(pin: string, userId?: string): Promise<PinAuthResult> {
  try {
    // Check if PIN is locked
    const lockedUntil = await AsyncStorage.getItem(PIN_LOCKED_UNTIL_KEY)
    if (lockedUntil) {
      const lockedUntilTime = parseInt(lockedUntil, 10)
      if (Date.now() < lockedUntilTime) {
        const minutesLeft = Math.ceil((lockedUntilTime - Date.now()) / 60000)
        return {
          success: false,
          locked: true,
          lockedUntil: lockedUntilTime,
          error: `PIN is locked. Try again in ${minutesLeft} minute(s)`,
        }
      } else {
        // Lock expired, clear it
        await AsyncStorage.removeItem(PIN_LOCKED_UNTIL_KEY)
        await AsyncStorage.removeItem(PIN_ATTEMPTS_KEY)
      }
    }

    // Get current user if not provided
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }
      currentUserId = user.id
    }

    let isValid = false
    let pinHash: string | null = null

    // Check local cache FIRST - this is the fastest path (instant verification)
    // SecureStore is fast (~1-5ms) compared to Supabase network call (~500-2000ms)
    const localHash = await SecureStore.getItemAsync(PIN_KEY)
    
    if (localHash) {
      // Check if local hash is bcrypt hash or old plain text PIN
      if (localHash.startsWith('$2a$') || localHash.startsWith('$2b$') || localHash.startsWith('$2y$')) {
        // It's a bcrypt hash - verify immediately (synchronous, instant)
        isValid = bcrypt.compareSync(pin, localHash)
        if (isValid) {
          pinHash = localHash
          // Return success IMMEDIATELY - don't wait for anything else
          // All background operations happen after return
          updateSessionActivity() // Non-blocking
          AsyncStorage.removeItem(PIN_ATTEMPTS_KEY).catch(() => {})
          AsyncStorage.removeItem(PIN_LOCKED_UNTIL_KEY).catch(() => {})
          
          return { success: true }
        }
      } else {
        // Legacy plain text PIN (for migration)
        isValid = localHash === pin
        if (isValid && currentUserId) {
          // Migrate to hashed format (non-blocking)
          const newHash = bcrypt.hashSync(pin, 10)
          SecureStore.setItemAsync(PIN_KEY, newHash).catch(() => {})
          pinHash = newHash
          // Update Supabase in background (non-blocking)
          supabase
            .from('users')
            .update({ pin_hash: newHash })
            .eq('id', currentUserId)
            .catch(() => {})
          
          // Return success immediately
          updateSessionActivity() // Non-blocking
          AsyncStorage.removeItem(PIN_ATTEMPTS_KEY).catch(() => {})
          AsyncStorage.removeItem(PIN_LOCKED_UNTIL_KEY).catch(() => {})
          
          return { success: true }
        }
      }
    }

    // If local verification failed or no local hash, try Supabase
    // But only if we haven't verified yet (for sync/validation)
    if (!isValid) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('pin_hash')
          .eq('id', currentUserId)
          .single()

        if (!error && data?.pin_hash) {
          pinHash = data.pin_hash
          // Verify against Supabase hash
          isValid = bcrypt.compareSync(pin, pinHash)
          
          // If valid, update local cache for next time
          if (isValid) {
            SecureStore.setItemAsync(PIN_KEY, pinHash).catch(() => {})
          }
        } else if (!localHash) {
          // No hash found anywhere
          return { success: false, error: 'PIN not set up' }
        }
      } catch (supabaseError) {
        // If Supabase fails and we have no local hash, return error
        if (!localHash) {
          return { success: false, error: 'PIN verification failed. Please try again.' }
        }
        // Otherwise, local verification result stands
      }
    }

    // If we get here, local cache verification failed or no local cache
    // Fall through to Supabase check (slower path, but only if local cache fails)
    if (isValid) {
      // Return success IMMEDIATELY - don't wait for any async operations
      // All cleanup happens in background (fire and forget)
      updateSessionActivity() // Non-blocking - writes to AsyncStorage in background
      AsyncStorage.removeItem(PIN_ATTEMPTS_KEY).catch(() => {})
      AsyncStorage.removeItem(PIN_LOCKED_UNTIL_KEY).catch(() => {})
      
      return { success: true }
    } else {
      // Increment failed attempts
      const attempts = await getFailedAttempts()
      const newAttempts = attempts + 1
      await AsyncStorage.setItem(PIN_ATTEMPTS_KEY, newAttempts.toString())

      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        // Lock PIN for 15 minutes
        const lockUntil = Date.now() + 15 * 60 * 1000
        await AsyncStorage.setItem(PIN_LOCKED_UNTIL_KEY, lockUntil.toString())
        return {
          success: false,
          locked: true,
          lockedUntil: lockUntil,
          error: 'Too many failed attempts. PIN is locked for 15 minutes.',
        }
      }

      const remaining = MAX_PIN_ATTEMPTS - newAttempts
      return {
        success: false,
        error: `Incorrect PIN. ${remaining} attempt(s) remaining.`,
      }
    }
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return { success: false, error: 'Failed to verify PIN' }
  }
}

/**
 * Check if PIN is set up
 * Checks Supabase first, then local cache
 */
export async function isPinSetup(userId?: string): Promise<boolean> {
  try {
    // Get current user if not provided
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Fallback to local check if no user
        const setup = await AsyncStorage.getItem(PIN_SETUP_KEY)
        return setup === 'true'
      }
      currentUserId = user.id
    }

    // Check Supabase first - this is the source of truth
    try {
      const { data, error } = await supabase
        .from('users')
        .select('pin_hash')
        .eq('id', currentUserId)
        .single()

      if (!error && data) {
        if (data.pin_hash) {
          // PIN exists in Supabase, update local cache
          await AsyncStorage.setItem(PIN_SETUP_KEY, 'true')
          // Also cache the hash locally for offline support
          const localHash = await SecureStore.getItemAsync(PIN_KEY)
          if (localHash !== data.pin_hash) {
            await SecureStore.setItemAsync(PIN_KEY, data.pin_hash)
          }
          return true
        } else {
          // User exists but NO PIN hash in Supabase - PIN is NOT set up
          // CRITICAL: Clear local cache to ensure consistency
          // This handles the case where user logged out (PIN cleared from Supabase) but local cache still has it
          await AsyncStorage.removeItem(PIN_SETUP_KEY)
          await SecureStore.deleteItemAsync(PIN_KEY).catch(() => {})
          console.log('isPinSetup: No PIN in Supabase, cleared local cache, returning false')
          return false
        }
      } else if (error) {
        // Supabase query failed - log error but don't fall back to local cache
        // This ensures we don't use stale local data
        console.error('isPinSetup: Supabase query error:', error)
        // If Supabase query fails, we can't trust local cache - return false
        // This is safer than using potentially stale local data
        return false
      }
    } catch (supabaseError) {
      // Supabase query exception - don't use local cache
      console.error('isPinSetup: Supabase exception:', supabaseError)
      return false
    }

    // If we get here, Supabase returned no data and no error - PIN not set up
    return false
  } catch (error) {
    console.error('isPinSetup: Error checking PIN setup:', error)
    return false
  }
}

/**
 * Get failed PIN attempts
 */
async function getFailedAttempts(): Promise<number> {
  try {
    const attempts = await AsyncStorage.getItem(PIN_ATTEMPTS_KEY)
    return attempts ? parseInt(attempts, 10) : 0
  } catch (error) {
    return 0
  }
}

/**
 * Update session last active timestamp
 */
export async function updateSessionActivity(): Promise<void> {
  try {
    const timestamp = Date.now().toString()
    // Write immediately but don't await - fire and forget for instant response
    AsyncStorage.setItem(SESSION_LAST_ACTIVE_KEY, timestamp).catch(() => {})
  } catch (error) {
    // Ignore errors - non-critical operation
  }
}

/**
 * Clear session activity (when app goes to background)
 * This ensures PIN is required when app is reopened
 */
export async function clearSessionActivity(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_LAST_ACTIVE_KEY)
  } catch (error) {
    console.error('Error clearing session activity:', error)
  }
}

/**
 * Check if session is still valid (not timed out)
 * This is used to determine if we need to refresh the Supabase session
 * Note: PIN authentication works regardless of session timeout
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const lastActive = await AsyncStorage.getItem(SESSION_LAST_ACTIVE_KEY)
    if (!lastActive) {
      return false
    }

    const lastActiveTime = parseInt(lastActive, 10)
    const timeSinceLastActive = Date.now() - lastActiveTime
    const isValid = timeSinceLastActive < SESSION_TIMEOUT_MS
    
    // Removed verbose logging - only log errors
    return isValid
  } catch (error) {
    console.error('isSessionValid: Error:', error)
    return false
  }
}

/**
 * Check if user should use PIN (PIN is set up and user hasn't logged out)
 * This is separate from session validity - PIN works even after session timeout
 */
export async function shouldUsePin(userId?: string): Promise<boolean> {
  try {
    const pinSetup = await isPinSetup(userId)
    // PIN should be used if it's set up (regardless of session timeout)
    // Session timeout only affects whether we need to refresh Supabase session
    return pinSetup
  } catch (error) {
    return false
  }
}

/**
 * Mark first login after email verification
 */
export async function markFirstLoginAfterVerification(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${FIRST_LOGIN_KEY}_${userId}`, 'true')
  } catch (error) {
    console.error('Error marking first login:', error)
  }
}

/**
 * Check if this is user's first login after email verification
 */
export async function isFirstLoginAfterVerification(userId: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(`${FIRST_LOGIN_KEY}_${userId}`)
    return value !== 'true' // Returns true if NOT set (first time)
  } catch (error) {
    return false
  }
}

/**
 * Mark PIN prompt as dismissed (for existing users)
 */
export async function dismissPinPrompt(): Promise<void> {
  try {
    await AsyncStorage.setItem(PIN_PROMPT_DISMISSED_KEY, 'true')
  } catch (error) {
    console.error('Error dismissing PIN prompt:', error)
  }
}

/**
 * Check if PIN prompt has been dismissed
 */
export async function isPinPromptDismissed(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PIN_PROMPT_DISMISSED_KEY)
    return value === 'true'
  } catch (error) {
    return false
  }
}

/**
 * Clear PIN and session data (on logout)
 * Note: We don't delete PIN hash from Supabase on logout - it persists for next login
 * Only local cache is cleared
 * Session activity is cleared so user must enter PIN again after next login
 */
export async function clearPinAuth(): Promise<void> {
  try {
    // Get user ID FIRST before clearing anything
    let userId: string | null = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch (error) {
      // User might not be authenticated, continue anyway
    }
    
    // Clear PIN hash from Supabase FIRST (synchronously, await it)
    // This ensures PIN is cleared before local cache, so isPinSetup() returns false
    if (userId) {
      try {
        await supabase
          .from('users')
          .update({ pin_hash: null })
          .eq('id', userId)
        console.log('clearPinAuth: PIN hash cleared from Supabase')
      } catch (error) {
        console.error('clearPinAuth: Error clearing PIN from Supabase:', error)
        // Continue to clear local cache even if Supabase fails
      }
    }
    
    // Clear local cache
    try {
      await SecureStore.deleteItemAsync(PIN_KEY)
    } catch (secureStoreError) {
      // Ignore errors if key doesn't exist
    }
    
    // Clear AsyncStorage
    await Promise.all([
      AsyncStorage.removeItem(PIN_SETUP_KEY),
      AsyncStorage.removeItem(PIN_PROMPT_DISMISSED_KEY),
      AsyncStorage.removeItem(SESSION_LAST_ACTIVE_KEY),
      AsyncStorage.removeItem(PIN_ATTEMPTS_KEY),
      AsyncStorage.removeItem(PIN_LOCKED_UNTIL_KEY),
    ])
    
    console.log('clearPinAuth: All PIN data cleared')
  } catch (error) {
    console.error('Error clearing PIN auth:', error)
  }
}

/**
 * Get time remaining until PIN unlock
 */
export async function getPinLockTimeRemaining(): Promise<number> {
  try {
    const lockedUntil = await AsyncStorage.getItem(PIN_LOCKED_UNTIL_KEY)
    if (!lockedUntil) {
      return 0
    }

    const lockedUntilTime = parseInt(lockedUntil, 10)
    const remaining = lockedUntilTime - Date.now()
    return remaining > 0 ? remaining : 0
  } catch (error) {
    return 0
  }
}

