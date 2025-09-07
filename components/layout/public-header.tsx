"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"

export function PublicHeader() {
  const { user, userProfile, signOut, isAdmin, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" className="h-7" />
          </Link>

          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-easner-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-easner-primary" />
                      </div>
                      <span className="text-gray-700">
                        {userProfile?.first_name || userProfile?.name || user.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}>Dashboard</Link>
                    </DropdownMenuItem>
                    {!isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile">Profile</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-easner-primary hover:bg-easner-primary-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
