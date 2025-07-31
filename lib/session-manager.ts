import { supabase } from "./supabase"

class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null
  private readonly INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 60 minutes
  private lastActivity: number = Date.now()

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeActivityTracking()
      this.startInactivityTimer()
    }
  }

  private initializeActivityTracking() {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    events.forEach((event) => {
      document.addEventListener(event, this.resetInactivityTimer.bind(this), true)
    })
  }

  private resetInactivityTimer() {
    this.lastActivity = Date.now()

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    this.startInactivityTimer()
  }

  private startInactivityTimer() {
    this.inactivityTimer = setTimeout(async () => {
      await this.handleSessionExpiry()
    }, this.INACTIVITY_TIMEOUT)
  }

  private async handleSessionExpiry() {
    try {
      // Check if user is still authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Sign out the user
        await supabase.auth.signOut()

        // Clear any stored data
        sessionStorage.clear()
        localStorage.clear()

        // Show session expired message and redirect
        alert("Your session has expired due to inactivity. Please log in again.")
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error handling session expiry:", error)
    }
  }

  public cleanup() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      document.removeEventListener(event, this.resetInactivityTimer.bind(this), true)
    })
  }

  public isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.INACTIVITY_TIMEOUT
  }
}

export const sessionManager = new SessionManager()
