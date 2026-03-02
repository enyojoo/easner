"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Check, X, Eye, Send, Loader2 } from "lucide-react"
import { KYCSubmission } from "@/lib/kyc-service"
import { getIdTypeLabel } from "@/lib/country-id-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface UserKYCData {
  userId: string
  email?: string
  identitySubmission: KYCSubmission | null
  addressSubmission: KYCSubmission | null
  hasTOS: boolean
  hasBridgeCustomer: boolean
  bridgeCustomerId?: string
  bridgeKycStatus?: string
  bridgeKycRejectionReasons?: any
}

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [userKycData, setUserKycData] = useState<Map<string, UserKYCData>>(new Map())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [rejectionReason, setRejectionReason] = useState("")
  const [updating, setUpdating] = useState(false)
  const [sendingToBridge, setSendingToBridge] = useState<string | null>(null) // userId being sent

  useEffect(() => {
    loadSubmissions()
    
    // Auto-refresh every 30 seconds to get Bridge status updates
    const interval = setInterval(() => {
      loadSubmissions()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [statusFilter])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const url = statusFilter === "all" 
        ? "/api/admin/kyc" 
        : `/api/admin/kyc?status=${statusFilter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const allSubmissions = data.submissions || []
        setSubmissions(allSubmissions)
        
        // Group submissions by user and fetch user data
        const userMap = new Map<string, UserKYCData>()
        const userIds = new Set(allSubmissions.map((s: KYCSubmission) => s.user_id))
        
        // Fetch user data for each user
        await Promise.all(
          Array.from(userIds).map(async (userId) => {
            try {
              const userResponse = await fetch(`/api/admin/users/${userId}`, {
                credentials: "include",
              })
              let userData: any = null
              if (userResponse.ok) {
                userData = await userResponse.json()
              }
              
              const userSubmissions = allSubmissions.filter((s: KYCSubmission) => s.user_id === userId)
              const identitySubmission = userSubmissions.find((s: KYCSubmission) => s.type === "identity") || null
              const addressSubmission = userSubmissions.find((s: KYCSubmission) => s.type === "address") || null
              
              userMap.set(userId, {
                userId,
                email: userData?.email,
                identitySubmission,
                addressSubmission,
                hasTOS: !!userData?.bridge_signed_agreement_id,
                hasBridgeCustomer: !!userData?.bridge_customer_id,
                bridgeCustomerId: userData?.bridge_customer_id,
                bridgeKycStatus: userData?.bridge_kyc_status,
                bridgeKycRejectionReasons: userData?.bridge_kyc_rejection_reasons,
              })
            } catch (error) {
              console.error(`Error fetching user data for ${userId}:`, error)
              // Still add entry with available data
              const userSubmissions = allSubmissions.filter((s: KYCSubmission) => s.user_id === userId)
              userMap.set(userId, {
                userId,
                identitySubmission: userSubmissions.find((s: KYCSubmission) => s.type === "identity") || null,
                addressSubmission: userSubmissions.find((s: KYCSubmission) => s.type === "address") || null,
                hasTOS: false,
                hasBridgeCustomer: false,
              })
            }
          })
        )
        
        setUserKycData(userMap)
      }
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedSubmission) return

    setUpdating(true)
    try {
      const response = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          status: reviewStatus,
          rejectionReason: reviewStatus === "rejected" ? rejectionReason : undefined,
        }),
      })

      if (response.ok) {
        await loadSubmissions()
        setReviewDialogOpen(false)
        setSelectedSubmission(null)
        setRejectionReason("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update submission")
      }
    } catch (error) {
      console.error("Error updating submission:", error)
      alert("Failed to update submission")
    } finally {
      setUpdating(false)
    }
  }

  const handleSendToBridge = async (userId: string) => {
    if (!confirm("Send this user's KYC data to Bridge? This will create a Bridge customer account.")) {
      return
    }

    setSendingToBridge(userId)
    try {
      const response = await fetch("/api/admin/kyc/send-to-bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully sent KYC to Bridge!\n\nCustomer ID: ${data.customerId}\nKYC Status: ${data.kycStatus}`)
        await loadSubmissions() // Reload to update user data
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send KYC to Bridge")
      }
    } catch (error: any) {
      console.error("Error sending KYC to Bridge:", error)
      alert("Failed to send KYC to Bridge: " + (error.message || "Unknown error"))
    } finally {
      setSendingToBridge(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBridgeKycStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusLabels: Record<string, string> = {
      "not_started": "Not Started",
      "incomplete": "Incomplete",
      "under_review": "Under Review",
      "approved": "Approved",
      "rejected": "Rejected"
    }
    
    const label = statusLabels[status] || status
    
    return (
      <Badge className={getStatusColor(status)}>
        Bridge: {label}
      </Badge>
    )
  }

  // Group submissions by user for display
  const groupedByUser = Array.from(userKycData.values()).filter((userData) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      userData.userId.toLowerCase().includes(searchLower) ||
      userData.email?.toLowerCase().includes(searchLower) ||
      userData.identitySubmission?.country_code?.toLowerCase().includes(searchLower) ||
      userData.identitySubmission?.id_type?.toLowerCase().includes(searchLower) ||
      userData.addressSubmission?.document_type?.toLowerCase().includes(searchLower)
    )
  })

  // Check if user is ready to send to Bridge
  const canSendToBridge = (userData: UserKYCData): boolean => {
    return !!(
      userData.identitySubmission &&
      userData.addressSubmission &&
      userData.hasTOS &&
      !userData.hasBridgeCustomer
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Submissions</h1>
        <p className="text-sm text-gray-600 mt-1">Review and manage user verification submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search by user ID, country, or document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedByUser.map((userData) => (
            <Card key={userData.userId}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* User Header */}
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userData.email || userData.userId}
                      </h3>
                      <p className="text-sm text-gray-600">User ID: {userData.userId}</p>
                      {userData.hasBridgeCustomer && (
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-green-600">
                            ✓ Bridge Customer: {userData.bridgeCustomerId?.slice(0, 8)}...
                          </p>
                          {userData.bridgeKycStatus && getBridgeKycStatusBadge(userData.bridgeKycStatus)}
                          {userData.bridgeKycStatus === "rejected" && userData.bridgeKycRejectionReasons && (
                            <p className="text-sm text-red-600 mt-1">
                              Rejection: {Array.isArray(userData.bridgeKycRejectionReasons) 
                                ? userData.bridgeKycRejectionReasons.join(", ")
                                : JSON.stringify(userData.bridgeKycRejectionReasons)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {canSendToBridge(userData) && (
                      <Button
                        onClick={() => handleSendToBridge(userData.userId)}
                        disabled={sendingToBridge === userData.userId}
                        className="bg-easner-primary hover:bg-easner-primary-600"
                      >
                        {sendingToBridge === userData.userId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Bridge
                          </>
                        )}
                      </Button>
                    )}
                    {!userData.hasTOS && canSendToBridge(userData) && (
                      <p className="text-sm text-yellow-600">⚠ User must accept TOS first</p>
                    )}
                    {userData.hasBridgeCustomer && (
                      <Badge className="bg-green-100 text-green-800">Already in Bridge</Badge>
                    )}
                  </div>

                  {/* Identity Submission */}
                  {userData.identitySubmission ? (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(userData.identitySubmission.status)}>
                            {userData.identitySubmission.status.replace("_", " ").toUpperCase()}
                      </Badge>
                          <span className="text-sm font-medium text-gray-900">Identity Verification</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                          {userData.identitySubmission.country_code && (
                            <p>Country: {userData.identitySubmission.country_code}</p>
                          )}
                          {userData.identitySubmission.id_type && (
                            <p>ID Type: {getIdTypeLabel(userData.identitySubmission.id_type)}</p>
                          )}
                          <p>Submitted: {new Date(userData.identitySubmission.created_at).toLocaleString()}</p>
                          {userData.identitySubmission.reviewed_at && (
                            <p>Reviewed: {new Date(userData.identitySubmission.reviewed_at).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userData.identitySubmission.id_document_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const filePathOrUrl = userData.identitySubmission!.id_document_url
                              if (!filePathOrUrl) return
                              
                              const isPath = filePathOrUrl.startsWith("identity/") || filePathOrUrl.startsWith("address/")
                              
                              if (isPath) {
                                try {
                                  const response = await fetch(`/api/admin/kyc/documents?path=${encodeURIComponent(filePathOrUrl)}`, {
                                    credentials: "include",
                                  })
                                  
                                  if (response.ok) {
                                    const { url } = await response.json()
                                    window.open(url, "_blank")
                                  } else {
                                    alert("Failed to access document. Please try again.")
                                  }
                                } catch (error) {
                                  console.error("Error fetching signed URL:", error)
                                  alert("Failed to access document. Please try again.")
                                }
                              } else {
                                window.open(filePathOrUrl, "_blank")
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View Document
                          </Button>
                          )}
                        {userData.identitySubmission.status !== "approved" && userData.identitySubmission.status !== "rejected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(userData.identitySubmission!)
                              setReviewStatus("approved")
                              setRejectionReason("")
                              setReviewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No identity verification submitted</div>
                      )}

                  {/* Address Submission */}
                  {userData.addressSubmission ? (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(userData.addressSubmission.status)}>
                            {userData.addressSubmission.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">Address Verification</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {userData.addressSubmission.document_type && (
                            <p>Document Type: {userData.addressSubmission.document_type.replace("_", " ").toUpperCase()}</p>
                      )}
                          <p>Submitted: {new Date(userData.addressSubmission.created_at).toLocaleString()}</p>
                          {userData.addressSubmission.reviewed_at && (
                            <p>Reviewed: {new Date(userData.addressSubmission.reviewed_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                        {userData.addressSubmission.address_document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                              const filePathOrUrl = userData.addressSubmission!.address_document_url
                          if (!filePathOrUrl) return
                          
                          const isPath = filePathOrUrl.startsWith("identity/") || filePathOrUrl.startsWith("address/")
                          
                          if (isPath) {
                            try {
                              const response = await fetch(`/api/admin/kyc/documents?path=${encodeURIComponent(filePathOrUrl)}`, {
                                credentials: "include",
                              })
                              
                              if (response.ok) {
                                const { url } = await response.json()
                                window.open(url, "_blank")
                              } else {
                                alert("Failed to access document. Please try again.")
                              }
                            } catch (error) {
                              console.error("Error fetching signed URL:", error)
                              alert("Failed to access document. Please try again.")
                            }
                          } else {
                            window.open(filePathOrUrl, "_blank")
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    )}
                        {userData.addressSubmission.status !== "approved" && userData.addressSubmission.status !== "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                              setSelectedSubmission(userData.addressSubmission!)
                          setReviewStatus("approved")
                          setRejectionReason("")
                          setReviewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No address verification submitted</div>
                  )}

                  {/* TOS Status */}
                  <div className="text-sm">
                    <span className={userData.hasTOS ? "text-green-600" : "text-yellow-600"}>
                      {userData.hasTOS ? "✓ TOS Accepted" : "⚠ TOS Not Accepted"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.type === "identity" ? "Identity Verification" : "Address Verification"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="flex gap-2">
                <Button
                  variant={reviewStatus === "approved" ? "default" : "outline"}
                  onClick={() => setReviewStatus("approved")}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={reviewStatus === "rejected" ? "default" : "outline"}
                  onClick={() => setReviewStatus("rejected")}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>

            {reviewStatus === "rejected" && (
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialogOpen(false)
                  setSelectedSubmission(null)
                  setRejectionReason("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={updating || (reviewStatus === "rejected" && !rejectionReason)}
                className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
              >
                {updating ? "Updating..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}

