"use client"

import { useState, useEffect, useRef } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, Clock, XCircle, User, Mail, Phone, Trash2, Check, FileText, ExternalLink, RotateCcw } from "lucide-react"
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { getIdTypeLabel } from "@/lib/country-id-types"
import { countryService, getCountryFlag } from "@/lib/country-service"
import { supabase } from "@/lib/supabase"
import { AdminComplianceSkeleton } from "@/components/admin-compliance-skeleton"

interface ComplianceUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  identitySubmission?: KYCSubmission
  addressSubmission?: KYCSubmission
}

export default function AdminCompliancePage() {
  // Initialize from cache synchronously to prevent flicker
  const getInitialUsers = (): ComplianceUser[] => {
    if (typeof window === "undefined") return []
    try {
      const cached = localStorage.getItem("easner_compliance_users")
      if (!cached) return []
      const { value, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minute cache
        return value || []
      }
      return []
    } catch {
      return []
    }
  }

  const [users, setUsers] = useState<ComplianceUser[]>(getInitialUsers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<ComplianceUser | null>(null)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    if (initialized) return // Don't re-initialize if already done

    const CACHE_KEY = "easner_compliance_users"
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    const getCachedUsers = (): ComplianceUser[] | null => {
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

    const setCachedUsers = (value: ComplianceUser[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Check cache first and set synchronously
    const cachedUsers = getCachedUsers()
    
    if (cachedUsers !== null) {
      // Set cached data immediately (synchronous)
      setUsers(cachedUsers)
      setInitialized(true)
      // Don't fetch if cache is valid
      return
    }

    // Only fetch missing or expired data
    loadData().then(() => {
      setInitialized(true)
    })
  }, [initialized])

  // Real-time subscription for KYC submission updates
  useEffect(() => {
    if (!initialized) return

    // Set up Supabase Realtime subscription for instant updates
    const channel = supabase
      .channel('admin-compliance-kyc-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'kyc_submissions',
        },
        async (payload) => {
          console.log('Admin compliance: KYC submission update received via Realtime:', payload.eventType)
          try {
            // Reload data to get updated submissions
            const updatedUsers = await loadData()
            
            // Update selected user if dialog is open and this update affects them
            if (selectedUser) {
              const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
              if (updatedUser) {
                // Check if the submission that changed belongs to this user
                const changedSubmission = payload.new || payload.old
                if (changedSubmission && changedSubmission.user_id === selectedUser.id) {
                  setSelectedUser(updatedUser)
                }
              }
            }
          } catch (error) {
            console.error("Error handling real-time update:", error)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin compliance: Subscribed to KYC submissions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Admin compliance: Realtime subscription error for KYC submissions')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [initialized, selectedUser?.id])

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll()
      setCountries(data)
    } catch (error) {
      console.error("Error loading countries:", error)
    }
  }

  const loadData = async (): Promise<ComplianceUser[]> => {
    try {
      // Only show loading if we don't have any cached data
      if (users.length === 0) {
        setLoading(true)
      }
      
      // Get all users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, phone")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Get all KYC submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("kyc_submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (submissionsError) throw submissionsError

      // Map submissions to users
      const usersWithKyc: ComplianceUser[] = (usersData || []).map((user: any) => {
        const userSubmissions = (submissionsData || []).filter((s: KYCSubmission) => s.user_id === user.id)
        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone,
          identitySubmission: userSubmissions.find((s: KYCSubmission) => s.type === "identity"),
          addressSubmission: userSubmissions.find((s: KYCSubmission) => s.type === "address"),
        }
      })

      setUsers(usersWithKyc)
      
      // Cache the data
      try {
        localStorage.setItem("easner_compliance_users", JSON.stringify({
          value: usersWithKyc,
          timestamp: Date.now()
        }))
      } catch {}
      
      return usersWithKyc
    } catch (error) {
      console.error("Error loading compliance data:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string, type: "identity" | "address") => {
    if (!confirm(`Are you sure you want to delete this ${type} submission? The user will need to submit again.`)) {
      return
    }

    try {
      setDeleting(submissionId)
      await kycService.deleteSubmission(submissionId)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user if it's the same user
      if (selectedUser) {
        const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        } else {
          // If user was removed, close dialog
          setUserDetailsDialogOpen(false)
          setSelectedUser(null)
        }
      }
    } catch (error: any) {
      console.error("Error deleting submission:", error)
      alert(error.message || "Failed to delete submission")
    } finally {
      setDeleting(null)
    }
  }

  const handleApproveSubmission = async (submissionId: string, type: "identity" | "address") => {
    if (!selectedUser) return

    try {
      setApproving(submissionId)
      await kycService.updateStatus(submissionId, "approved", selectedUser.id)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user
      const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
    } catch (error: any) {
      console.error("Error approving submission:", error)
      alert(error.message || "Failed to approve submission")
    } finally {
      setApproving(null)
    }
  }

  const handleSetInReview = async (submissionId: string, type: "identity" | "address") => {
    if (!selectedUser) return

    try {
      setApproving(submissionId)
      await kycService.updateStatus(submissionId, "in_review", selectedUser.id)
      
      // Reload data and update cache
      const updatedUsers = await loadData()
      
      // Update selected user
      const updatedUser = updatedUsers.find(u => u.id === selectedUser.id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
    } catch (error: any) {
      console.error("Error setting submission to in review:", error)
      alert(error.message || "Failed to update submission")
    } finally {
      setApproving(null)
    }
  }

  const handleViewFile = (url: string) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Done</Badge>
      case "in_review":
        return <Badge className="bg-yellow-100 text-yellow-700">In review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
    }
  }

  const getVerificationStatus = (user: ComplianceUser) => {
    const identity = user.identitySubmission
    const address = user.addressSubmission

    if (identity?.status === "approved" && address?.status === "approved") {
      return <Badge className="bg-green-100 text-green-700">Verified</Badge>
    }
    if (identity?.status === "in_review" || address?.status === "in_review") {
      return <Badge className="bg-yellow-100 text-yellow-700">In review</Badge>
    }
    if (identity || address) {
      return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-700">Not started</Badge>
  }

  const handleUserSelect = (user: ComplianceUser) => {
    setSelectedUser(user)
    setUserDetailsDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === "all") return matchesSearch
    
    const verificationStatus = getVerificationStatus(user)
    if (statusFilter === "verified") {
      return matchesSearch && user.identitySubmission?.status === "approved" && user.addressSubmission?.status === "approved"
    }
    if (statusFilter === "pending") {
      return matchesSearch && (user.identitySubmission?.status === "pending" || user.addressSubmission?.status === "pending")
    }
    if (statusFilter === "in_review") {
      return matchesSearch && (user.identitySubmission?.status === "in_review" || user.addressSubmission?.status === "in_review")
    }
    
    return matchesSearch
  })

  const getCountryName = (code?: string) => {
    if (!code) return "-"
    const country = countries.find(c => c.code === code)
    return country ? `${country.flag_emoji} ${country.name}` : code
  }

  // Show skeleton only if loading and no cached data
  if (loading && users.length === 0) {
    return (
      <AdminDashboardLayout>
        <AdminComplianceSkeleton />
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Identity</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>
                        {user.identitySubmission
                          ? getStatusBadge(user.identitySubmission.status)
                          : <Badge className="bg-gray-100 text-gray-700">Not submitted</Badge>}
                      </TableCell>
                      <TableCell>
                        {user.addressSubmission
                          ? getStatusBadge(user.addressSubmission.status)
                          : <Badge className="bg-gray-100 text-gray-700">Not submitted</Badge>}
                      </TableCell>
                      <TableCell>{getVerificationStatus(user)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Compliance Details - {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="h-4 w-4" />
                      <span>Name</span>
                    </div>
                    <p className="text-base font-medium">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="text-base">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                      <p className="text-base">{selectedUser.phone}</p>
                    </div>
                  )}
                </div>

                {/* Identity Verification */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
                  {selectedUser.identitySubmission ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5">
                            {getStatusBadge(selectedUser.identitySubmission.status)}
                            <span className="text-sm font-medium text-gray-700">
                              {selectedUser.identitySubmission.id_type
                                ? getIdTypeLabel(selectedUser.identitySubmission.id_type)
                                : "ID Document"}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            {selectedUser.identitySubmission.full_name && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">Name:</span>
                                <span className="text-gray-900 font-medium text-xs">{selectedUser.identitySubmission.full_name}</span>
                              </div>
                            )}
                            {selectedUser.identitySubmission.date_of_birth && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[90px] text-xs">DOB:</span>
                                <span className="text-gray-900 text-xs">{new Date(selectedUser.identitySubmission.date_of_birth).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Country:</span>
                              <span className="text-gray-900 font-medium text-xs">{getCountryName(selectedUser.identitySubmission.country_code)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Submitted:</span>
                              <span className="text-gray-900 text-xs">{new Date(selectedUser.identitySubmission.created_at).toLocaleDateString()}</span>
                            </div>
                            {selectedUser.identitySubmission.id_document_filename && (
                              <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 mt-1.5">
                                <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 text-xs truncate flex-1">{selectedUser.identitySubmission.id_document_filename}</span>
                                {selectedUser.identitySubmission.id_document_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewFile(selectedUser.identitySubmission!.id_document_url!)}
                                    className="h-6 px-2 text-xs flex-shrink-0"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {selectedUser.identitySubmission.status === "approved" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetInReview(selectedUser.identitySubmission!.id, "identity")}
                              disabled={approving === selectedUser.identitySubmission.id || deleting === selectedUser.identitySubmission.id}
                              className="text-xs h-7"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              In Review
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApproveSubmission(selectedUser.identitySubmission!.id, "identity")}
                              disabled={approving === selectedUser.identitySubmission.id || deleting === selectedUser.identitySubmission.id}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {approving === selectedUser.identitySubmission.id ? "..." : "Approve"}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSubmission(selectedUser.identitySubmission!.id, "identity")}
                            disabled={deleting === selectedUser.identitySubmission.id || approving === selectedUser.identitySubmission.id}
                            className="text-xs h-7"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {deleting === selectedUser.identitySubmission.id ? "..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs">No identity verification submitted</p>
                    </div>
                  )}
                </div>

                {/* Address Verification */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Address Verification</h3>
                  {selectedUser.addressSubmission ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5">
                            {getStatusBadge(selectedUser.addressSubmission.status)}
                            <span className="text-sm font-medium text-gray-700">
                              {selectedUser.addressSubmission.document_type === "utility_bill"
                                ? "Utility Bill"
                                : selectedUser.addressSubmission.document_type === "bank_statement"
                                ? "Bank Statement"
                                : "Address Document"}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Country:</span>
                              <span className="text-gray-900 font-medium text-xs">{getCountryName(selectedUser.addressSubmission.country_code)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs pt-0.5">Address:</span>
                              <span className="text-gray-900 text-xs flex-1">{selectedUser.addressSubmission.address || "-"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[90px] text-xs">Submitted:</span>
                              <span className="text-gray-900 text-xs">{new Date(selectedUser.addressSubmission.created_at).toLocaleDateString()}</span>
                            </div>
                            {selectedUser.addressSubmission.address_document_filename && (
                              <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 mt-1.5">
                                <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 text-xs truncate flex-1">{selectedUser.addressSubmission.address_document_filename}</span>
                                {selectedUser.addressSubmission.address_document_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewFile(selectedUser.addressSubmission!.address_document_url!)}
                                    className="h-6 px-2 text-xs flex-shrink-0"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {selectedUser.addressSubmission.status === "approved" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetInReview(selectedUser.addressSubmission!.id, "address")}
                              disabled={approving === selectedUser.addressSubmission.id || deleting === selectedUser.addressSubmission.id}
                              className="text-xs h-7"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              In Review
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApproveSubmission(selectedUser.addressSubmission!.id, "address")}
                              disabled={approving === selectedUser.addressSubmission.id || deleting === selectedUser.addressSubmission.id}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {approving === selectedUser.addressSubmission.id ? "..." : "Approve"}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSubmission(selectedUser.addressSubmission!.id, "address")}
                            disabled={deleting === selectedUser.addressSubmission.id || approving === selectedUser.addressSubmission.id}
                            className="text-xs h-7"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {deleting === selectedUser.addressSubmission.id ? "..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs">No address verification submitted</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}

