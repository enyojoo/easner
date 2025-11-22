"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { ArrowLeft, MapPin, User, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { kycService, KYCSubmission } from "@/lib/kyc-service"

export default function VerificationPage() {
  const { userProfile } = useAuth()
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userProfile?.id) return
    
    const loadSubmissions = async () => {
      try {
        setLoading(true)
        const submissions = await kycService.getByUserId(userProfile.id)
        setSubmissions(submissions || [])
      } catch (error) {
        console.error("Error loading submissions:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSubmissions()
  }, [userProfile?.id])

  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")

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

        {/* Cards Container */}
        <div className="px-5 pb-6 space-y-4">
          {/* Identity Verification Card */}
          <Link href="/user/more/verification/identity">
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
                    {getStatusBadge(identitySubmission?.status || "pending")}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Address Information Card */}
          <Link href="/user/more/verification/address">
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
                    {getStatusBadge(addressSubmission?.status || "pending")}
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
