"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { BusinessDropdown } from "@/components/business-dropdown"
import { businessInfo } from "@/lib/business-info"

interface DashboardShellProps {
  children: React.ReactNode
  /** Extra class for main content (e.g. overflow-y-auto) */
  mainClassName?: string
  /** Use max-width constraint like dashboard (max-w-6xl) */
  constrained?: boolean
}

export function DashboardShell({ children, mainClassName = "", constrained = false }: DashboardShellProps) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-64 right-0 z-10 flex h-16 min-h-16 items-center justify-end gap-4 border-b bg-background px-6">
          <BusinessDropdown
            businessName={businessInfo.name}
            adminName={user?.name || "Admin"}
            adminEmail={user?.email || ""}
            onSignOut={logout}
            variant="header"
          />
        </header>
        <main
          className={`flex-1 pt-20 px-6 pb-8 ${constrained ? "w-full max-w-6xl mx-auto" : "w-full"} ${mainClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
