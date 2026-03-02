import { supabase } from "./supabase"
import { getSecuritySettings } from "./security-settings"

export interface LoginAttempt {
  id: string
  email: string
  ip_address: string
  user_agent: string
  success: boolean
  created_at: string
}

export class LoginAttemptService {
  private static async createTableIfNotExists() {
    // This would typically be done via migration, but we'll check if the table exists
    try {
      const { error } = await supabase
        .from("login_attempts")
        .select("id")
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, we need to create it
        console.warn("login_attempts table doesn't exist. Please create it via migration.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error checking login_attempts table:", error)
      return false
    }
  }

  static async recordAttempt(
    email: string, 
    success: boolean, 
    ipAddress: string = "unknown", 
    userAgent: string = "unknown"
  ): Promise<void> {
    try {
      const tableExists = await this.createTableIfNotExists()
      if (!tableExists) {
        console.warn("Cannot record login attempt - table doesn't exist")
        return
      }

      await supabase
        .from("login_attempts")
        .insert({
          email,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error("Error recording login attempt:", error)
    }
  }

  static async isAccountLocked(email: string): Promise<{ locked: boolean; remainingTime?: number }> {
    try {
      const tableExists = await this.createTableIfNotExists()
      if (!tableExists) {
        return { locked: false }
      }

      const settings = await getSecuritySettings()
      const lockoutDurationMs = settings.accountLockoutDuration * 60 * 1000
      const cutoffTime = new Date(Date.now() - lockoutDurationMs).toISOString()

      // Get failed attempts within the lockout period
      const { data: failedAttempts, error } = await supabase
        .from("login_attempts")
        .select("created_at")
        .eq("email", email)
        .eq("success", false)
        .gte("created_at", cutoffTime)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error checking login attempts:", error)
        return { locked: false }
      }

      const failedCount = failedAttempts?.length || 0
      
      if (failedCount >= settings.maxLoginAttempts) {
        // Account is locked, calculate remaining time
        const oldestFailedAttempt = failedAttempts[failedAttempts.length - 1]
        const lockoutEndTime = new Date(oldestFailedAttempt.created_at).getTime() + lockoutDurationMs
        const remainingTime = Math.max(0, lockoutEndTime - Date.now())
        
        return { 
          locked: true, 
          remainingTime: Math.ceil(remainingTime / 60000) // Convert to minutes
        }
      }

      return { locked: false }
    } catch (error) {
      console.error("Error checking account lock status:", error)
      return { locked: false }
    }
  }

  static async getRemainingAttempts(email: string): Promise<number> {
    try {
      const tableExists = await this.createTableIfNotExists()
      if (!tableExists) {
        return 5 // Default
      }

      const settings = await getSecuritySettings()
      const lockoutDurationMs = settings.accountLockoutDuration * 60 * 1000
      const cutoffTime = new Date(Date.now() - lockoutDurationMs).toISOString()

      // Get failed attempts within the lockout period
      const { data: failedAttempts, error } = await supabase
        .from("login_attempts")
        .select("created_at")
        .eq("email", email)
        .eq("success", false)
        .gte("created_at", cutoffTime)

      if (error) {
        console.error("Error getting remaining attempts:", error)
        return settings.maxLoginAttempts
      }

      const failedCount = failedAttempts?.length || 0
      return Math.max(0, settings.maxLoginAttempts - failedCount)
    } catch (error) {
      console.error("Error getting remaining attempts:", error)
      return 5 // Default
    }
  }

  static async clearFailedAttempts(email: string): Promise<void> {
    try {
      const tableExists = await this.createTableIfNotExists()
      if (!tableExists) {
        return
      }

      await supabase
        .from("login_attempts")
        .delete()
        .eq("email", email)
        .eq("success", false)
    } catch (error) {
      console.error("Error clearing failed attempts:", error)
    }
  }
}
