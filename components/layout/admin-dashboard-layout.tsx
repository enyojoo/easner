"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, CreditCard, Users, TrendingUp, Settings, LogOut, Menu, X } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Rates", href: "/admin/rates", icon: TrendingUp },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to admin login if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isAdmin, loading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  // Don't render if not authenticated or not admin (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-sm text-novapay-primary font-medium">Admin</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-novapay-primary-100 text-novapay-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 h-16 flex items-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
