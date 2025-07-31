"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, ArrowLeftRight, Send, Users, User, HelpCircle, LogOut, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      href: "/user/transactions",
      icon: ArrowLeftRight,
    },
    {
      name: "Send Money",
      href: "/user/send",
      icon: Send,
    },
    {
      name: "Recipients",
      href: "/user/recipients",
      icon: Users,
    },
  ]

  const moreMenuItems = [
    {
      name: "Profile",
      href: "/user/profile",
      icon: User,
    },
    {
      name: "Support",
      href: "/user/support",
      icon: HelpCircle,
    },
  ]

  const isActive = (href: string) => pathname === href

  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (userProfile?.first_name) {
      return userProfile.first_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "User"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <BrandLogo />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-novapay-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}

            {moreMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-novapay-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center h-16 bg-white border-b border-gray-200 px-4">
          <BrandLogo />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:h-16 lg:bg-white lg:border-b lg:border-gray-200 lg:px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find((item) => isActive(item.href))?.name ||
                moreMenuItems.find((item) => isActive(item.href))?.name ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-novapay-primary text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/support">Support</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          {/* Dashboard */}
          <Link
            href="/user/dashboard"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive("/user/dashboard") ? "text-novapay-primary" : "text-gray-500"
            }`}
          >
            <LayoutDashboard className="h-6 w-6" />
          </Link>

          {/* Transactions */}
          <Link
            href="/user/transactions"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive("/user/transactions") ? "text-novapay-primary" : "text-gray-500"
            }`}
          >
            <ArrowLeftRight className="h-6 w-6" />
          </Link>

          {/* Send Money - Larger Button */}
          <Link
            href="/user/send"
            className={`flex flex-col items-center justify-center p-3 rounded-full transition-colors ${
              isActive("/user/send")
                ? "bg-novapay-primary text-white"
                : "bg-novapay-primary text-white hover:bg-novapay-primary/90"
            }`}
          >
            <Send className="h-6 w-6" />
          </Link>

          {/* Recipients */}
          <Link
            href="/user/recipients"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive("/user/recipients") ? "text-novapay-primary" : "text-gray-500"
            }`}
          >
            <Users className="h-6 w-6" />
          </Link>

          {/* More Menu */}
          <DropdownMenu open={moreDropdownOpen} onOpenChange={setMoreDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  moreMenuItems.some((item) => isActive(item.href)) || moreDropdownOpen
                    ? "text-novapay-primary"
                    : "text-gray-500"
                }`}
              >
                <MoreHorizontal className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-48 mb-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
