"use client"

import type React from "react"
import { useRouter } from "next/router"
import { logout } from "../auth/authService"

const UserDashboardLayout: React.FC = ({ children }) => {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div>
      <header>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default UserDashboardLayout
