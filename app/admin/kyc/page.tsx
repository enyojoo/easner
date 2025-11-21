"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Check, X, Eye } from "lucide-react"
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

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [rejectionReason, setRejectionReason] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadSubmissions()
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
        setSubmissions(data.submissions || [])
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

  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      submission.user_id.toLowerCase().includes(searchLower) ||
      submission.country_code?.toLowerCase().includes(searchLower) ||
      submission.id_type?.toLowerCase().includes(searchLower) ||
      submission.document_type?.toLowerCase().includes(searchLower)
    )
  })

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
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {submission.type === "identity" ? "Identity Verification" : "Address Verification"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>User ID: {submission.user_id}</p>
                      {submission.type === "identity" && (
                        <>
                          {submission.country_code && (
                            <p>Country: {submission.country_code}</p>
                          )}
                          {submission.id_type && (
                            <p>ID Type: {getIdTypeLabel(submission.id_type)}</p>
                          )}
                        </>
                      )}
                      {submission.type === "address" && submission.document_type && (
                        <p>Document Type: {submission.document_type.replace("_", " ").toUpperCase()}</p>
                      )}
                      <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                      {submission.reviewed_at && (
                        <p>Reviewed: {new Date(submission.reviewed_at).toLocaleString()}</p>
                      )}
                      {submission.rejection_reason && (
                        <p className="text-red-600">Reason: {submission.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(submission.id_document_url || submission.address_document_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = submission.id_document_url || submission.address_document_url
                          if (url) window.open(url, "_blank")
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    )}
                    {submission.status !== "approved" && submission.status !== "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission)
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

