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
  // Use cached data even if expired to prevent skeleton flash
  const getInitialKycSubmissions = (): KYCSubmission[] => {
    if (typeof window === "undefined" || !userProfile?.id) return []
    try {
      const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return []
      const { value } = JSON.parse(cached)
      // Always return cached value if it exists (even if expired) to prevent flicker
      return value || []
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
    
    // If cache exists and is valid, no need to fetch (data already in state from initializer)
    if (cachedSubmissions !== null) {
      // Fetch in background to ensure we have latest data, but don't show loading
      const loadKycSubmissions = async () => {
        try {
          // Use client-side kycService directly (same as receipt upload)
          const { kycService } = await import("@/lib/kyc-service")
          const submissions = await kycService.getByUserId(userProfile.id)
          // Only update if data changed (prevent flickering)
          setKycSubmissions(prev => {
            const prevStr = JSON.stringify(prev)
            const newStr = JSON.stringify(submissions)
            if (prevStr !== newStr) {
              setCachedSubmissions(submissions || [])
              return submissions || []
            }
            return prev
          })
        } catch (error) {
          console.error("Error loading KYC submissions:", error)
        }
      }
      loadKycSubmissions()
      return
    }

    // No cache - fetch and update state
    const loadKycSubmissions = async () => {
      try {
        // Use client-side kycService directly (same as receipt upload)
        const { kycService } = await import("@/lib/kyc-service")
        const submissions = await kycService.getByUserId(userProfile.id)
        setKycSubmissions(submissions || [])
        setCachedSubmissions(submissions || [])
      } catch (error) {
        console.error("Error loading KYC submissions:", error)
      }
    }

    loadKycSubmissions()
  }, [userProfile?.id])

  // Determine verification status and badge
  const getVerificationStatus = () => {
    const identitySubmission = kycSubmissions.find(s => s.type === "identity")
    const addressSubmission = kycSubmissions.find(s => s.type === "address")

    // Both must be approved to be "Verified"
    if (identitySubmission?.status === "approved" && addressSubmission?.status === "approved") {
      return { status: "verified", label: "Verified", className: "bg-green-100 text-green-700" }
    }

    // Check for in_review status (either one)
    if (identitySubmission?.status === "in_review" || addressSubmission?.status === "in_review") {
      return { status: "in_review", label: "In review", className: "bg-yellow-100 text-yellow-700" }
    }

    // Check for rejected status (either one)
    if (identitySubmission?.status === "rejected" || addressSubmission?.status === "rejected") {
      return { status: "rejected", label: "Rejected", className: "bg-red-100 text-red-700" }
    }

    // If at least one submission exists but not approved, show pending
    if (identitySubmission || addressSubmission) {
      return { status: "pending", label: "Pending", className: "bg-gray-100 text-gray-700" }
    }

    // No submissions yet
    return { status: "not_started", label: "Take action", className: "bg-amber-100 text-amber-700" }
  }

  const verificationStatus = getVerificationStatus()

  return (
    <UserDashboardLayout>
      <div className="space-y-0">
        {/* Header - Mobile Style */}
        <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">More</h1>
          <p className="text-base text-gray-600">Manage your account information</p>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
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
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationStatus.className}`}
                  >
                    {verificationStatus.label}
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

          {/* Sign Out Button - Mobile/Tablet only */}
          <div className="pt-6 lg:hidden">
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
