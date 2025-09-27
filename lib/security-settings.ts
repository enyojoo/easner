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
    console.error("Error fetching security settings:", error)
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

export function clearSecuritySettingsCache() {
  cachedSettings = null
  lastFetch = 0
}

// Password validation utility
export async function validatePassword(password: string): Promise<{ valid: boolean; error?: string }> {
  const settings = await getSecuritySettings()
  
  if (password.length < settings.passwordMinLength) {
    return {
      valid: false,
      error: `Password must be at least ${settings.passwordMinLength} characters long`
    }
  }

  return { valid: true }
}

// Session timeout utility
export async function getSessionTimeout(): Promise<number> {
  const settings = await getSecuritySettings()
  return settings.sessionTimeout
}

// Login attempts utility
export async function getMaxLoginAttempts(): Promise<number> {
  const settings = await getSecuritySettings()
  return settings.maxLoginAttempts
}

// Account lockout utility
export async function getAccountLockoutDuration(): Promise<number> {
  const settings = await getSecuritySettings()
  return settings.accountLockoutDuration
}
