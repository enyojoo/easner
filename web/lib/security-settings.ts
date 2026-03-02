import { supabase } from "./supabase"

export interface SecuritySettings {
  sessionTimeout: number
  passwordMinLength: number
  maxLoginAttempts: number
  accountLockoutDuration: number
}

let cachedSettings: SecuritySettings | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const now = Date.now()
  
  // Return cached settings if still valid
  if (cachedSettings && (now - lastFetch) < CACHE_DURATION) {
    return cachedSettings
  }

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [
        "session_timeout",
        "password_min_length",
        "max_login_attempts",
        "account_lockout_duration"
      ])

    if (error) {
      console.error("Error loading security settings:", error)
      // Return default settings on error
      return getDefaultSecuritySettings()
    }

    const settings = data?.reduce((acc, setting) => {
      acc[setting.key] = parseInt(setting.value) || 0
      return acc
    }, {} as any) || {}

    const securitySettings: SecuritySettings = {
      sessionTimeout: settings.session_timeout || 30,
      passwordMinLength: settings.password_min_length || 8,
      maxLoginAttempts: settings.max_login_attempts || 5,
      accountLockoutDuration: settings.account_lockout_duration || 15,
    }

    // Cache the settings
    cachedSettings = securitySettings
    lastFetch = now

    return securitySettings
  } catch (error) {
    console.error("Error loading security settings:", error)
    return getDefaultSecuritySettings()
  }
}

export function getDefaultSecuritySettings(): SecuritySettings {
  return {
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
  }
}

export function validatePassword(password: string, minLength?: number): { valid: boolean; error?: string } {
  const settings = minLength !== undefined ? { passwordMinLength: minLength } : cachedSettings || getDefaultSecuritySettings()
  
  if (password.length < settings.passwordMinLength) {
    return {
      valid: false,
      error: `Password must be at least ${settings.passwordMinLength} characters long`
    }
  }

  return { valid: true }
}

export function clearSecuritySettingsCache() {
  cachedSettings = null
  lastFetch = 0
}
