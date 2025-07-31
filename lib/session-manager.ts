export class SessionManager {
  private static instance: SessionManager
  private lastActivity: number = Date.now()
  private sessionTimeout: number = 60 * 60 * 1000 // 60 minutes
  private timeoutId: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  updateActivity(): void {
    this.lastActivity = Date.now()
    this.resetTimeout()
  }

  private resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.handleSessionExpiry()
    }, this.sessionTimeout)
  }

  private handleSessionExpiry(): void {
    // Clear any stored session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      sessionStorage.clear()

      // Redirect to home page
      window.location.href = "/"
    }
  }

  isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.sessionTimeout
  }

  startSession(): void {
    this.lastActivity = Date.now()
    this.resetTimeout()
  }

  endSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.lastActivity = 0
  }
}
