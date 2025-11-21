"use client"

import Link from "next/link"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronRight, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import type { KYCSubmission } from "@/lib/kyc-service"

export default function MorePage() {
  const router = useRouter()
  const { signOut, userProfile } = useAuth()
  
  // Initialize from cache synchronously to prevent flicker
  const getInitialKycSubmissions = (): KYCSubmission[] => {
    if (typeof window === "undefined" || !userProfile?.id) return []
    try {
      const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return []
      const { value, timestamp } = JSON.parse(cached)
      const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
      if (Date.now() - timestamp < CACHE_TTL) {
        return value || []
      }
      return []
    } catch {
      return []
    }
  }

  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>(() => getInitialKycSubmissions())
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handlePrivacy = () => {
    window.open("https://www.easner.com/privacy", "_blank")
  }

  const handleTerms = () => {
    window.open("https://www.easner.com/terms", "_blank")
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push("/auth/user/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  // Fetch KYC submissions with caching
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    const getCachedSubmissions = (): KYCSubmission[] | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        localStorage.removeItem(CACHE_KEY)
        return null
      } catch {
        return null
      }
    }

    const setCachedSubmissions = (value: KYCSubmission[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Check cache first
    const cachedSubmissions = getCachedSubmissions()
    
    // Update state if cache exists and state is empty (only on first mount)
    if (cachedSubmissions !== null && kycSubmissions.length === 0) {
      setKycSubmissions(cachedSubmissions)
    }

    // If cache exists and is valid, no need to fetch
    if (cachedSubmissions !== null) {
      return
    }

    // Only fetch missing or expired data
    const loadKycSubmissions = async () => {
      try {
        const response = await fetch("/api/kyc/submissions", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          const submissions = data.submissions || []
          setKycSubmissions(submissions)
          setCachedSubmissions(submissions)
        }
      } catch (error) {
        console.error("Error loading KYC submissions:", error)
      }
    }

    loadKycSubmissions()
  }, [userProfile?.id])

  // Determine verification status
  const getVerificationStatus = (): "verified" | "pending" => {
    const identitySubmission = kycSubmissions.find(s => s.type === "identity")
    const addressSubmission = kycSubmissions.find(s => s.type === "address")

    // Both must be approved to be "Verified"
    if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
      return "verified"
    }

    // Otherwise, show "Take action" (pending, in_review, rejected, or missing)
    return "pending"
  }

  const verificationStatus = getVerificationStatus()

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">More</h1>
            <p className="text-base text-gray-500">Manage your account information</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4">
              <Link
                href="/user/more/profile"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Your Profile</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                href="/user/more/verification"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Account Verification</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      verificationStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {verificationStatus === "verified" ? "Verified" : "Take action"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
              <Link
                href="/user/more/password"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Change Password</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                href="/user/more/notifications"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Notifications</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </CardContent>
          </Card>

          {/* App Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4">
              <Link
                href="/user/recipients"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Recipients</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                href="/user/support"
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Support</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <button
                onClick={handlePrivacy}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Privacy Policy</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={handleTerms}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Terms of Service</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* Sign Out Button */}
          <div className="pt-6">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* App Version */}
          <div className="text-center py-5">
            <p className="text-sm text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserDashboardLayout>
  )
}
