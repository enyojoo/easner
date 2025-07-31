import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export class SessionManager {
  private static inactivityTimeout = 60 * 60 * 1000 // 60 minutes

  static async getSession() {
    try {
      const cookieStore = cookies()
      const supabase = createServerComponentClient({ cookies: () => cookieStore })

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        return null
      }

      return session
    } catch (error) {
      console.error("Session validation error:", error)
      return null
    }
  }

  static async isValidSession(): Promise<boolean> {
    const session = await this.getSession()
    return session !== null
  }

  static async destroySession(): Promise<void> {
    try {
      const cookieStore = cookies()
      const supabase = createServerComponentClient({ cookies: () => cookieStore })
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error destroying session:", error)
    }
  }
}
