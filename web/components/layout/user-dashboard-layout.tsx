"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, Send, History, LogOut, X, UserPlus } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

const baseNavigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Send Money", href: "/send", icon: Send },
  { name: "Recipients", href: "/recipients", icon: UserPlus },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "More", href: "/more", icon: LayoutDashboard },
]

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "Recipients", href: "/recipients", icon: UserPlus },
]

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar - business style: fixed w-56, bg-sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 border-r bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 hidden lg:flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
            <BrandLogo size="md" />
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {baseNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
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

          {/* Logout */}
          <div className="px-3 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area - ml-56 for desktop to account for fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-56">
        {/* Top bar - Desktop only, matches sidebar header line (h-16, border-sidebar-border) */}
        <div className="bg-background border-b border-sidebar-border px-4 h-16 items-center sm:px-6 lg:px-8 hidden lg:flex" />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>

        {/* Bottom Navigation - Mobile/Tablet only (preserved per plan) */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:hidden z-40">
          <div className="flex justify-around items-center py-2 px-2">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-600"}`} />
                  <span className={`text-xs mt-1 ${isActive ? "text-primary" : "text-gray-600"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* More Menu */}
            <Link
              href="/more"
              prefetch={true}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              <LayoutDashboard
                className={`h-5 w-5 ${
                  pathname === "/more" || pathname?.startsWith("/more/") ? "text-primary" : "text-gray-600"
                }`}
              />
              <span className={`text-xs mt-1 ${
                pathname === "/more" || pathname?.startsWith("/more/") ? "text-primary" : "text-gray-600"
              }`}>
                More
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
