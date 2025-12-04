"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Send, History, LogOut, X, MoreHorizontal, UserPlus } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

const baseNavigation = [
  { name: "Home", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Send Money", href: "/user/send", icon: Send },
  { name: "Recipients", href: "/user/recipients", icon: UserPlus },
  { name: "Transactions", href: "/user/transactions", icon: History },
  { name: "More", href: "/user/more", icon: MoreHorizontal },
]

const bottomNavItems = [
  { name: "Home", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/user/transactions", icon: History },
  { name: "Recipients", href: "/user/recipients", icon: UserPlus },
]

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/user/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 hidden lg:flex ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
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
                      ? "bg-easner-primary-100 text-easner-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
          <div className="px-3 py-4 border-t border-gray-200">
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Desktop only */}
        <div className="bg-white border-b border-gray-200 px-4 h-16 items-center sm:px-6 lg:px-8 hidden lg:flex">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>

        {/* Bottom Navigation - Mobile/Tablet only */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
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
                  <item.icon className={`h-5 w-5 ${isActive ? "text-easner-primary" : "text-gray-600"}`} />
                  <span className={`text-xs mt-1 ${isActive ? "text-easner-primary" : "text-gray-600"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* More Menu */}
            <Link
              href="/user/more"
              prefetch={true}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              <MoreHorizontal
                className={`h-5 w-5 ${
                  pathname === "/user/more" || pathname?.startsWith("/user/more/") ? "text-easner-primary" : "text-gray-600"
                }`}
              />
              <span className={`text-xs mt-1 ${
                pathname === "/user/more" || pathname?.startsWith("/user/more/") ? "text-easner-primary" : "text-gray-600"
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
