import { supabase } from "./supabase"
import { getMaxLoginAttempts, getAccountLockoutDuration } from "./security-settings"

interface LoginAttempt {
  email: string
  attempts: number
  lastAttempt: string
  lockedUntil?: string
}

const LOGIN_ATTEMPTS_KEY = "login_attempts"

export async function recordLoginAttempt(email: string, success: boolean): Promise<{ 
  canAttempt: boolean; 
  remainingAttempts: number; 
  lockedUntil?: string 
}> {
  try {
    const maxAttempts = await getMaxLoginAttempts()
    const lockoutDuration = await getAccountLockoutDuration()
    
    // Get current attempts from localStorage
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    const attempts: LoginAttempt[] = stored ? JSON.parse(stored) : []
    
    // Find existing attempt record for this email
    let attemptRecord = attempts.find(a => a.email === email)
    
    if (!attemptRecord) {
      attemptRecord = {
        email,
        attempts: 0,
        lastAttempt: new Date().toISOString()
      }
      attempts.push(attemptRecord)
    }
    
    if (success) {
      // Reset attempts on successful login
      attemptRecord.attempts = 0
      attemptRecord.lockedUntil = undefined
    } else {
      // Increment failed attempts
      attemptRecord.attempts += 1
      attemptRecord.lastAttempt = new Date().toISOString()
      
      // Check if we should lock the account
      if (attemptRecord.attempts >= maxAttempts) {
        const lockoutUntil = new Date()
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + lockoutDuration)
        attemptRecord.lockedUntil = lockoutUntil.toISOString()
      }
    }
    
    // Save back to localStorage
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts))
    
    // Check if account is locked
    if (attemptRecord.lockedUntil) {
      const lockoutTime = new Date(attemptRecord.lockedUntil)
      const now = new Date()
      
      if (now < lockoutTime) {
        return {
          canAttempt: false,
          remainingAttempts: 0,
          lockedUntil: attemptRecord.lockedUntil
        }
      } else {
        // Lockout expired, reset attempts
        attemptRecord.attempts = 0
        attemptRecord.lockedUntil = undefined
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts))
      }
    }
    
    return {
      canAttempt: true,
      remainingAttempts: Math.max(0, maxAttempts - attemptRecord.attempts)
    }
  } catch (error) {
    console.error("Error recording login attempt:", error)
    // On error, allow the attempt
    return {
      canAttempt: true,
      remainingAttempts: 999
    }
  }
}

export function clearLoginAttempts(email: string): void {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (!stored) return
    
    const attempts: LoginAttempt[] = JSON.parse(stored)
    const filtered = attempts.filter(a => a.email !== email)
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error clearing login attempts:", error)
  }
}

export function getLoginAttempts(email: string): LoginAttempt | null {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (!stored) return null
    
    const attempts: LoginAttempt[] = JSON.parse(stored)
    return attempts.find(a => a.email === email) || null
  } catch (error) {
    console.error("Error getting login attempts:", error)
    return null
  }
}
