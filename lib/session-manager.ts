"use client"

class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null
  private readonly INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 60 minutes
  private onExpiry?: () => void

  constructor(onExpiry?: () => void) {
    this.onExpiry = onExpiry
    this.setupActivityListeners()
  }

  private setupActivityListeners() {
    if (typeof window === "undefined") return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      this.resetTimer()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })
  }

  resetTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    this.inactivityTimer = setTimeout(() => {
      this.handleExpiry()
    }, this.INACTIVITY_TIMEOUT)
  }

  private handleExpiry() {
    if (this.onExpiry) {
      this.onExpiry()
    }
  }

  cleanup() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = null
    }
  }
}

export const sessionManager = new SessionManager()
