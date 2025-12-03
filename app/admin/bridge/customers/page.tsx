"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BridgeCustomer {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  kyc_status: string
  endorsements?: Array<{
    name: string
    status: string
    requirements?: {
      missing?: string[]
      issues?: string[]
    }
  }>
  rejection_reasons?: Array<{
    reason: string
  }>
  created_at: string
  updated_at: string
}

export default function AdminBridgeCustomersPage() {
  const [customers, setCustomers] = useState<BridgeCustomer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<BridgeCustomer | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [statusFilter])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const url = statusFilter === "all"
        ? "/api/admin/bridge/customers"
        : `/api/admin/bridge/customers?kycStatus=${statusFilter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "in_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            In Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const getEndorsementStatus = (endorsements: any[], name: string) => {
    const endorsement = endorsements?.find((e) => e.name === name)
    if (!endorsement) return "Not requested"
    return endorsement.status
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.first_name?.toLowerCase().includes(searchLower) ||
      customer.last_name?.toLowerCase().includes(searchLower) ||
      customer.id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bridge Customers</h1>
          <p className="text-gray-600">Manage Bridge customer accounts and KYC status</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by email, name, or customer ID..."
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

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No customers found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Base Endorsement</TableHead>
                    <TableHead>SEPA Endorsement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-mono text-sm">
                        {customer.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {customer.first_name} {customer.last_name}
                      </TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{getKYCStatusBadge(customer.kyc_status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEndorsementStatus(customer.endorsements || [], "base")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEndorsementStatus(customer.endorsements || [], "sepa")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Customer ID:</span>{" "}
                      <span className="font-mono">{selectedCustomer.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedCustomer.email || "-"}
                    </div>
                    <div>
                      <span className="font-medium">KYC Status:</span>{" "}
                      {getKYCStatusBadge(selectedCustomer.kyc_status)}
                    </div>
                  </div>
                </div>

                {selectedCustomer.rejection_reasons &&
                  selectedCustomer.rejection_reasons.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Rejection Reasons</h3>
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {selectedCustomer.rejection_reasons.map((reason, idx) => (
                          <li key={idx}>{reason.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div>
                  <h3 className="font-semibold mb-2">Endorsements</h3>
                  <div className="space-y-2">
                    {(selectedCustomer.endorsements || []).map((endorsement, idx) => (
                      <div key={idx} className="border p-3 rounded">
                        <div className="font-medium">{endorsement.name}</div>
                        <div className="text-sm text-gray-600">
                          Status: {endorsement.status}
                        </div>
                        {endorsement.requirements?.missing &&
                          endorsement.requirements.missing.length > 0 && (
                            <div className="mt-2 text-sm">
                              <div className="font-medium text-yellow-600">
                                Missing Requirements:
                              </div>
                              <ul className="list-disc list-inside">
                                {endorsement.requirements.missing.map((req, reqIdx) => (
                                  <li key={reqIdx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {endorsement.requirements?.issues &&
                          endorsement.requirements.issues.length > 0 && (
                            <div className="mt-2 text-sm">
                              <div className="font-medium text-red-600">Issues:</div>
                              <ul className="list-disc list-inside">
                                {endorsement.requirements.issues.map((issue, issueIdx) => (
                                  <li key={issueIdx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}

