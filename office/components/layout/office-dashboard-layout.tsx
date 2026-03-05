"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, CreditCard, Users, TrendingUp, Settings, LogOut, Menu, X, UserPlus, ShieldCheck, FileText } from "lucide-react"
import { BrandLogo } from "@easner/shared"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { officeDataStore } from "@/lib/office-data-store"

interface OfficeDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "Early Access", href: "/early-access", icon: UserPlus },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Rates", href: "/rates", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Bridge Customers", href: "/bridge/customers", icon: Users },
  { name: "Bridge Wallets", href: "/bridge/wallets", icon: CreditCard },
  { name: "Bridge Virtual Accounts", href: "/bridge/virtual-accounts", icon: CreditCard },
]

export function OfficeDashboardLayout({ children }: OfficeDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      officeDataStore.clearDataCache()
      officeDataStore.destroy()
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/auth/login")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 border-r bg-sidebar flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-sm text-primary font-medium">Office</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent px-3 py-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-56">
        <div className="bg-background border-b border-sidebar-border px-4 h-16 flex items-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1"></div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
