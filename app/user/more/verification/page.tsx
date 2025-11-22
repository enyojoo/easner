"use client"

import { useState, useEffect, useRef } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { ArrowLeft, MapPin, User, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { supabase } from "@/lib/supabase"

export default function VerificationPage() {
  const { userProfile } = useAuth()
  
  // Initialize from cache synchronously to prevent flicker
  // Use cached data even if expired to prevent skeleton flash
  const getInitialSubmissions = (): KYCSubmission[] => {
    if (typeof window === "undefined") return []
    if (!userProfile?.id) return []
    try {
      const cached = localStorage.getItem(`easner_kyc_submissions_${userProfile.id}`)
      if (!cached) return []
      const { value } = JSON.parse(cached)
      // Always return cached value if it exists (even if expired) to prevent flicker
      return value || []
    } catch {
      return []
    }
  }

  const [submissions, setSubmissions] = useState<KYCSubmission[]>(getInitialSubmissions)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!userProfile?.id) return
    if (initialized) return // Don't re-initialize if already done

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
    
    // If we have cached data, it's already set in useState initializer
    // Just mark as initialized and fetch in background
    if (cachedSubmissions !== null && cachedSubmissions.length >= 0) {
      setInitialized(true)
      // Fetch in background to ensure we have latest data
      const loadSubmissions = async () => {
        try {
          const submissionsData = await kycService.getByUserId(userProfile.id)
          // Only update if data changed (prevent flickering)
          setSubmissions(prev => {
            const prevStr = JSON.stringify(prev)
            const newStr = JSON.stringify(submissionsData)
            if (prevStr !== newStr) {
              setCachedSubmissions(submissionsData || [])
              return submissionsData || []
            }
            return prev
          })
        } catch (error) {
          console.error("Error loading submissions:", error)
        }
      }
      loadSubmissions()
      return
    }

    // No cache or expired - load with loading state
    const loadSubmissions = async () => {
      setLoading(true)
      try {
        const submissionsData = await kycService.getByUserId(userProfile.id)
        setSubmissions(submissionsData || [])
        setCachedSubmissions(submissionsData || [])
        setInitialized(true)
      } catch (error) {
        console.error("Error loading submissions:", error)
        setInitialized(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadSubmissions()
  }, [userProfile?.id, initialized])

  // Real-time subscription for KYC submission updates
  useEffect(() => {
    if (!userProfile?.id || !initialized) return

    // Set up Supabase Realtime subscription for instant updates
    const channel = supabase
      .channel(`kyc-submissions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'kyc_submissions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('KYC submission update received via Realtime:', payload.eventType)
          try {
            // Fetch updated submissions
            const updatedSubmissions = await kycService.getByUserId(userProfile.id)
            
            // Update state only if data actually changed (prevent unnecessary re-renders)
            setSubmissions(prev => {
              const prevStr = JSON.stringify(prev)
              const newStr = JSON.stringify(updatedSubmissions)
              if (prevStr !== newStr) {
                return updatedSubmissions || []
              }
              return prev
            })
            
            // Update cache
            const CACHE_KEY = `easner_kyc_submissions_${userProfile.id}`
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify({
                value: updatedSubmissions || [],
                timestamp: Date.now()
              }))
            } catch {}
          } catch (error) {
            console.error("Error fetching updated submissions:", error)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to KYC submissions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for KYC submissions')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userProfile?.id, initialized])

  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")

  // Check if both are approved (done)
  const bothCompleted = 
    identitySubmission?.status === "approved" && 
    addressSubmission?.status === "approved"

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Done
          </span>
        )
      case "in_review":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            In review
          </span>
        )
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Rejected
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Pending
          </span>
        )
    }
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header - Simple and clean */}
        <div className="bg-white px-5 py-6">
          <div className="flex items-center gap-3">
            <Link href="/user/more">
              <button className="p-1 -ml-1">
                <ArrowLeft className="h-6 w-6 text-gray-900" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Account Verification</h1>
          </div>
        </div>

        {/* Info Message - Only show if both are not completed */}
        {!bothCompleted && (
          <div className="px-5 pt-2 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Please complete KYC Identity and Address information for compliance.
              </p>
            </div>
          </div>
        )}

        {/* Cards Container */}
        <div className="px-5 pb-6 space-y-6">
          {/* Identity Verification Card */}
          <Link href="/user/more/verification/identity" className="block">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Icon on top */}
                    <div className="w-12 h-12 rounded-full bg-easner-primary-100 flex items-center justify-center mb-3">
                      <MapPin className="h-5 w-5 text-easner-primary" />
                    </div>
                    {/* Title below icon */}
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Identity verification</h3>
                    {/* Description below title */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your ID document and ID verification information.
                    </p>
                  </div>
                  {/* Status Badge and Arrow on the right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {identitySubmission ? getStatusBadge(identitySubmission.status) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Not started
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Address Information Card */}
          <Link href="/user/more/verification/address" className="block">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Icon on top */}
                    <div className="w-12 h-12 rounded-full bg-easner-primary-100 flex items-center justify-center mb-3">
                      <User className="h-5 w-5 text-easner-primary" />
                    </div>
                    {/* Title below icon */}
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Address information</h3>
                    {/* Description below title */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your home address and utility bill document.
                    </p>
                  </div>
                  {/* Status Badge and Arrow on the right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {addressSubmission ? getStatusBadge(addressSubmission.status) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Not started
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
