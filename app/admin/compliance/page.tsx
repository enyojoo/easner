"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, Clock, XCircle, User, Mail, Phone } from "lucide-react"
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { getIdTypeLabel } from "@/lib/country-id-types"
import { countryService, getCountryFlag } from "@/lib/country-service"
import { createServerClient } from "@/lib/supabase"

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
  const [users, setUsers] = useState<ComplianceUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<ComplianceUser | null>(null)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [countries, setCountries] = useState<any[]>([])

  useEffect(() => {
    loadData()
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll()
      setCountries(data)
    } catch (error) {
      console.error("Error loading countries:", error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const serverClient = createServerClient()
      
      // Get all users
      const { data: usersData, error: usersError } = await serverClient
        .from("users")
        .select("id, email, first_name, last_name, phone")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Get all KYC submissions
      const { data: submissionsData, error: submissionsError } = await serverClient
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
    } catch (error) {
      console.error("Error loading compliance data:", error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="text-gray-500">Loading...</div>
        </div>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
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
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
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
                    <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <div>{getStatusBadge(selectedUser.identitySubmission.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Country</p>
                          <p className="text-base">
                            {getCountryName(selectedUser.identitySubmission.country_code)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">ID Type</p>
                          <p className="text-base">
                            {selectedUser.identitySubmission.id_type
                              ? getIdTypeLabel(selectedUser.identitySubmission.id_type)
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Document</p>
                          <p className="text-base">
                            {selectedUser.identitySubmission.id_document_filename || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Submitted</p>
                          <p className="text-base">
                            {new Date(selectedUser.identitySubmission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No identity verification submitted</p>
                  )}
                </div>

                {/* Address Verification */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Address Verification</h3>
                  {selectedUser.addressSubmission ? (
                    <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <div>{getStatusBadge(selectedUser.addressSubmission.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Country</p>
                          <p className="text-base">
                            {getCountryName(selectedUser.addressSubmission.country_code)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Address</p>
                          <p className="text-base whitespace-pre-wrap">
                            {selectedUser.addressSubmission.address || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Document Type</p>
                          <p className="text-base">
                            {selectedUser.addressSubmission.document_type === "utility_bill"
                              ? "Utility Bill"
                              : selectedUser.addressSubmission.document_type === "bank_statement"
                              ? "Bank Statement"
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Document</p>
                          <p className="text-base">
                            {selectedUser.addressSubmission.address_document_filename || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Submitted</p>
                          <p className="text-base">
                            {new Date(selectedUser.addressSubmission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No address verification submitted</p>
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

