// Remove the import from "next/headers"
import type { UserType } from "../data/users"

export function getServerAuthState(): { isLoggedIn: boolean; userType?: UserType; user?: any } {
  // This function should be called only on the server side
  if (typeof window !== "undefined") {
    console.error("getServerAuthState should only be called on the server side")
    return { isLoggedIn: false }
  }

  // Use a different method to access cookies on the server side
  const { cookies } = require("next/headers")
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth")

  if (authCookie) {
    try {
      const authData = JSON.parse(decodeURIComponent(authCookie.value))
      return {
        isLoggedIn: true,
        userType: authData.userType,
        user: {
          name: authData.name,
          email: authData.email,
          profileImage: authData.profileImage,
          currency: authData.currency || "USD",
          // Add other necessary user data here
          enrolledCourses: [], // This should be fetched from a database in a real app
          completedCourses: [], // This should be fetched from a database in a real app
          achievements: [], // This should be fetched from a database in a real app
        },
      }
    } catch (error) {
      console.error("Error parsing auth cookie:", error)
    }
  }

  return { isLoggedIn: false }
}

