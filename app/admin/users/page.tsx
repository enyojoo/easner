"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Download,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Ban,
  UserCheck,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/utils/currency"
import { useAdminData } from "@/hooks/use-admin-data"
import { adminDataStore, calculateUserVolume } from "@/lib/admin-data-store"
import { AdminUsersSkeleton } from "@/components/admin-users-skeleton"
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { getIdTypeLabel } from "@/lib/country-id-types"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  status: string
  verification_status: string
  email_confirmed_at?: string
  base_currency: string
  created_at: string
  last_login?: string
  totalTransactions: number
  totalVolume: number
}

interface TransactionData {
  transaction_id: string
  created_at: string
  send_currency: string
  receive_currency: string
  send_amount: number
  receive_amount: number
  status: string
  recipient: {
    full_name: string
  }
}

export default function AdminUsersPage() {
  const { data, loading } = useAdminData()
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userTransactions, setUserTransactions] = useState<TransactionData[]>([])
  const [saving, setSaving] = useState(false)
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([])
  const [loadingKyc, setLoadingKyc] = useState(false)
  const [selectedKycSubmission, setSelectedKycSubmission] = useState<KYCSubmission | null>(null)
  const [kycReviewDialogOpen, setKycReviewDialogOpen] = useState(false)
  const [kycReviewSubDialogOpen, setKycReviewSubDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [rejectionReason, setRejectionReason] = useState("")
  const [updatingKyc, setUpdatingKyc] = useState(false)
  const [userKycMap, setUserKycMap] = useState<Map<string, KYCSubmission[]>>(new Map())

  // Format currency using database currencies
  const formatCurrencyFromDB = (amount: number, currencyCode: string): string => {
    const currency = data?.currencies?.find((c: any) => c.code === currencyCode)
    const symbol = currency?.symbol || currencyCode
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    // Format: "Nov 07, 2025 • 7:29 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }

  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          transaction_id,
          created_at,
          send_currency,
          receive_currency,
          send_amount,
          receive_amount,
          status,
          recipient:recipients(full_name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      // Remove .limit(20) to show all transactions

      if (error) throw error
      // Transform the data to match TransactionData interface
      const transformedData = (data || []).map((tx: any) => ({
        transaction_id: tx.transaction_id,
        created_at: tx.created_at,
        send_currency: tx.send_currency,
        receive_currency: tx.receive_currency,
        send_amount: tx.send_amount,
        receive_amount: tx.receive_amount,
        status: tx.status,
        recipient: {
          full_name: Array.isArray(tx.recipient) ? tx.recipient[0]?.full_name || '' : tx.recipient?.full_name || ''
        }
      }))
      setUserTransactions(transformedData)
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      setUserTransactions([])
    }
  }

  // Fetch KYC submissions for all users (must be before conditional return to follow Rules of Hooks)
  useEffect(() => {
    const fetchAllKyc = async () => {
      if (!data?.users) return
      
      const kycMap = new Map<string, KYCSubmission[]>()
      // Fetch KYC for all users in parallel (limit to avoid overwhelming)
      const userIds = data.users.map((u: any) => u.id).slice(0, 100) // Limit to first 100 users
      
      await Promise.all(
        userIds.map(async (userId: string) => {
          try {
            const submissions = await kycService.getByUserId(userId)
            kycMap.set(userId, submissions)
          } catch (error) {
            console.error(`Error fetching KYC for user ${userId}:`, error)
            kycMap.set(userId, [])
          }
        })
      )
      
      setUserKycMap(kycMap)
    }
    
    fetchAllKyc()
  }, [data?.users])

  if (loading || !data) {
    return (
      <AdminDashboardLayout>
        <AdminUsersSkeleton />
      </AdminDashboardLayout>
    )
  }

  // Calculate transaction stats and verification status for each user
  const usersWithStats = (data?.users || []).map((user: any) => {
    const userTransactions = (data?.transactions || []).filter((t: any) => t.user_id === user.id)
    const userExchangeRates = data?.exchangeRates || []
    const baseCurrency = user.base_currency || "NGN"

    // Use the same calculation method as the dashboard for consistency
    const totalVolume = calculateUserVolume(userTransactions, baseCurrency, userExchangeRates)
    const completedTransactions = userTransactions.filter((t: any) => t.status === "completed")

    // Get KYC submissions for this user
    const kycSubmissions = userKycMap.get(user.id) || []
    const identitySubmission = kycSubmissions.find((s: KYCSubmission) => s.type === "identity")
    const addressSubmission = kycSubmissions.find((s: KYCSubmission) => s.type === "address")
    const isVerified = identitySubmission?.status === "approved" && addressSubmission?.status === "approved"
    const verificationStatus = isVerified ? "verified" : "pending"

    return {
      ...user,
      totalTransactions: completedTransactions.length,
      totalVolume,
      verificationStatus,
    }
  })

  const filteredUsers = usersWithStats.filter((user: any) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const verificationStatus = user.verificationStatus || "pending"
    const matchesVerification = verificationFilter === "all" || verificationStatus === verificationFilter

    return matchesSearch && matchesStatus && matchesVerification
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      suspended: { color: "bg-red-100 text-red-800", icon: <Ban className="h-3 w-3 mr-1" /> },
      inactive: { color: "bg-gray-100 text-gray-800", icon: <Clock className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }


  const getVerificationBadge = (user: UserData & { verificationStatus?: string }) => {
    const status = user.verificationStatus || "pending"
    
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-700", text: "Verified" },
      pending: { color: "bg-amber-100 text-amber-700", text: "Pending" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        {config.text}
      </Badge>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u: UserData) => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      await adminDataStore.updateUserStatus(userId, newStatus)
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err) {
      console.error("Error updating user status:", err)
    }
  }

  const handleVerificationUpdate = async (userId: string, newStatus: string) => {
    try {
      await adminDataStore.updateUserVerification(userId, newStatus)
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, verification_status: newStatus } : null))
      }
    } catch (err) {
      console.error("Error updating user verification:", err)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      await Promise.all(selectedUsers.map((userId) => adminDataStore.updateUserStatus(userId, newStatus)))
      setSelectedUsers([])
    } catch (err) {
      console.error("Error bulk updating user status:", err)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Status", "Verification", "Registration Date", "Total Volume"].join(","),
      ...filteredUsers.map((u: UserData) =>
        [
          `${u.first_name} ${u.last_name}`,
          u.email,
          u.phone || "",
          u.status,
          u.email_confirmed_at ? "verified" : "unverified",
          formatDate(u.created_at),
          formatCurrencyFromDB(u.totalVolume, u.base_currency),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
  }

  const handleUserSelect = (user: UserData) => {
    setSelectedUser(user)
    fetchUserTransactions(user.id)
  }

  const handleKycOpen = async (user: UserData) => {
    setSelectedUser(user)
    setLoadingKyc(true)
    setKycSubmissions([]) // Clear previous submissions
    try {
      const submissions = await kycService.getByUserId(user.id)
      setKycSubmissions(submissions)
      setKycReviewDialogOpen(true)
    } catch (error: any) {
      console.error("Error loading KYC submissions:", error)
      // If table doesn't exist, show empty state instead of error
      if (error?.code === 'PGRST205' || error?.message?.includes('kyc_submissions')) {
        console.warn("KYC submissions table not found. Please run the migration.")
        setKycSubmissions([])
        setKycReviewDialogOpen(true) // Still open dialog to show empty state
      } else {
        setKycSubmissions([])
        setKycReviewDialogOpen(true)
      }
    } finally {
      setLoadingKyc(false)
    }
  }

  const handleKycReview = async () => {
    if (!selectedKycSubmission || !userProfile) return

    setUpdatingKyc(true)
    try {
      await kycService.updateStatus(
        selectedKycSubmission.id,
        reviewStatus,
        userProfile.id,
        reviewStatus === "rejected" ? rejectionReason : undefined
      )
      
      // Reload KYC submissions
      if (selectedUser) {
        const submissions = await kycService.getByUserId(selectedUser.id)
        setKycSubmissions(submissions)
      }
      
      setKycReviewSubDialogOpen(false)
      setSelectedKycSubmission(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error updating KYC submission:", error)
      alert("Failed to update KYC submission")
    } finally {
      setUpdatingKyc(false)
    }
  }

  const getKycStatusColor = (status: string) => {
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


  // Registration analytics data
  const registrationStats = {
    totalUsers: data?.stats.totalUsers || 0,
    activeUsers: data?.stats.activeUsers || 0,
    verifiedUsers: data?.stats.verifiedUsers || 0,
    newThisWeek: (data?.users || []).filter(
      (u: UserData) => new Date(u.created_at).getTime() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(),
    ).length,
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts and verification status</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Registration Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <User className="h-4 w-4 text-easner-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{registrationStats.totalUsers}</div>
              <p className="text-xs text-green-600">+{registrationStats.newThisWeek} this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{registrationStats.activeUsers}</div>
              <p className="text-xs text-gray-600">
                {registrationStats.totalUsers > 0
                  ? Math.round((registrationStats.activeUsers / registrationStats.totalUsers) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verified Users</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{registrationStats.verifiedUsers}</div>
              <p className="text-xs text-gray-600">
                {registrationStats.totalUsers > 0
                  ? Math.round((registrationStats.verifiedUsers / registrationStats.totalUsers) * 100)
                  : 0}
                % verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-easner-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{registrationStats.newThisWeek}</div>
              <p className="text-xs text-green-600">Growing steadily</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{selectedUsers.length} user(s) selected</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("active")}>
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("suspended")}>
                    Suspend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[200px] text-center">Name</TableHead>
                  <TableHead className="w-[250px] text-center">Email</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                  <TableHead className="w-[140px] text-center">Verification</TableHead>
                  <TableHead className="w-[120px] text-center">Transactions</TableHead>
                  <TableHead className="w-[150px] text-center">Total Volume</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithStats.map((user: UserData) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="w-[200px] text-center">
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="w-[250px] text-center">{user.email}</TableCell>
                    <TableCell className="w-[120px] text-center">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="w-[140px] text-center">{getVerificationBadge(user)}</TableCell>
                    <TableCell className="w-[120px] text-center font-medium">{user.totalTransactions}</TableCell>
                    <TableCell className="w-[150px] text-center font-medium">{formatCurrencyFromDB(user.totalVolume, user.base_currency)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleUserSelect(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                User Details - {selectedUser?.first_name} {selectedUser?.last_name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Information */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Personal Information</label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-gray-400" />
                                          <span>
                                            {selectedUser.first_name} {selectedUser.last_name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-gray-400" />
                                          <span>{selectedUser.email}</span>
                                        </div>
                                        {selectedUser.phone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{selectedUser.phone}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Account Status</label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">Status:</span>
                                          {getStatusBadge(selectedUser.status)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">Verification:</span>
                                          {getVerificationBadge(selectedUser)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Account Details</label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Registration:</span>
                                          <span className="text-sm">
                                            {formatDate(selectedUser.created_at)}
                                          </span>
                                        </div>
                                        {selectedUser.last_login && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Last Login:</span>
                                            <span className="text-sm">
                                              {formatTimestamp(selectedUser.last_login)}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Base Currency:</span>
                                          <span className="text-sm font-medium">{selectedUser.base_currency}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Transaction Summary</label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Total Transactions:</span>
                                          <span className="font-medium">{selectedUser.totalTransactions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Total Volume:</span>
                                          <span className="font-medium">
                                            {formatCurrencyFromDB(selectedUser.totalVolume, selectedUser.base_currency)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Transaction History */}
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Recent Transactions</label>
                                  <div className="mt-2 max-h-64 overflow-y-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Transaction ID</TableHead>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Currency Pair</TableHead>
                                          <TableHead>Amount</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {userTransactions.map((transaction) => (
                                          // Remove .slice(0, 5) to show all transactions
                                          <TableRow key={transaction.transaction_id}>
                                            <TableCell className="font-mono text-sm">
                                              {transaction.transaction_id}
                                            </TableCell>
                                            <TableCell>
                                              {formatTimestamp(transaction.created_at)}
                                            </TableCell>
                                            <TableCell>
                                              {transaction.send_currency} → {transaction.receive_currency}
                                            </TableCell>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">
                                                  {formatCurrencyFromDB(transaction.send_amount, transaction.send_currency)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  →{" "}
                                                  {formatCurrencyFromDB(
                                                    transaction.receive_amount,
                                                    transaction.receive_currency,
                                                  )}
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                className={
                                                  transaction.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : transaction.status === "processing"
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-gray-100 text-gray-800"
                                                }
                                              >
                                                {transaction.status}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {userTransactions.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                              No transactions found
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t pt-4">
                                  <label className="text-sm font-medium text-gray-600">Account Actions</label>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(selectedUser.id, "active")}
                                      disabled={selectedUser.status === "active"}
                                    >
                                      Activate Account
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(selectedUser.id, "suspended")}
                                      disabled={selectedUser.status === "suspended"}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      Suspend Account
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* KYC Dialog */}
                        <Dialog open={kycReviewDialogOpen} onOpenChange={setKycReviewDialogOpen}>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                KYC Verification - {selectedUser?.first_name} {selectedUser?.last_name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {loadingKyc ? (
                                  <div className="text-center py-8 text-gray-500">Loading KYC submissions...</div>
                                ) : kycSubmissions.length === 0 ? (
                                  <div className="text-center py-8">
                                    <p className="text-gray-500 mb-2">No KYC submissions found</p>
                                    <p className="text-sm text-gray-400">
                                      {selectedUser.first_name} {selectedUser.last_name} has not submitted any KYC documents yet.
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    {/* Identity Verification */}
                                    {(() => {
                                      const identitySubmission = kycSubmissions.find((s) => s.type === "identity")
                                      return identitySubmission ? (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Identity Verification</label>
                                          <div className="mt-2 space-y-4">
                                            <div className="grid grid-cols-2 gap-6">
                                              <div className="space-y-4">
                                                <div>
                                                  <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Status:</span>
                                                    <Badge className={getKycStatusColor(identitySubmission.status)}>
                                                      {identitySubmission.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                  </div>
                                                  {identitySubmission.country_code && (
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Country:</span>
                                                      <span className="text-sm">{identitySubmission.country_code}</span>
                                                    </div>
                                                  )}
                                                  {identitySubmission.id_type && (
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">ID Type:</span>
                                                      <span className="text-sm">{getIdTypeLabel(identitySubmission.id_type)}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="space-y-4">
                                                {identitySubmission.id_document_url && (
                                                  <div>
                                                    <span className="text-sm text-gray-600">Document:</span>
                                                    <div className="mt-2">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(identitySubmission.id_document_url, "_blank")}
                                                      >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Document
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                                <div className="space-y-1">
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Submitted:</span>
                                                    <span className="text-sm">
                                                      {new Date(identitySubmission.created_at).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                  {identitySubmission.reviewed_at && (
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Reviewed:</span>
                                                      <span className="text-sm">
                                                        {new Date(identitySubmission.reviewed_at).toLocaleDateString()}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                                {identitySubmission.rejection_reason && (
                                                  <div className="pt-2 border-t">
                                                    <span className="text-sm text-gray-600">Rejection Reason:</span>
                                                    <p className="text-sm text-red-600 mt-1">{identitySubmission.rejection_reason}</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {identitySubmission.status !== "approved" && identitySubmission.status !== "rejected" && (
                                              <div className="pt-2 border-t">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setSelectedKycSubmission(identitySubmission)
                                                    setReviewStatus("approved")
                                                    setRejectionReason("")
                                                    setKycReviewSubDialogOpen(true)
                                                  }}
                                                >
                                                  Review Submission
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : null
                                    })()}

                                    {/* Address Verification */}
                                    {(() => {
                                      const addressSubmission = kycSubmissions.find((s) => s.type === "address")
                                      return addressSubmission ? (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Address Verification</label>
                                          <div className="mt-2 space-y-4">
                                            <div className="grid grid-cols-2 gap-6">
                                              <div className="space-y-4">
                                                <div>
                                                  <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Status:</span>
                                                    <Badge className={getKycStatusColor(addressSubmission.status)}>
                                                      {addressSubmission.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                  </div>
                                                  {addressSubmission.document_type && (
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Document Type:</span>
                                                      <span className="text-sm">
                                                        {addressSubmission.document_type.replace("_", " ").toUpperCase()}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="space-y-4">
                                                {addressSubmission.address_document_url && (
                                                  <div>
                                                    <span className="text-sm text-gray-600">Document:</span>
                                                    <div className="mt-2">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(addressSubmission.address_document_url, "_blank")}
                                                      >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Document
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                                <div className="space-y-1">
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Submitted:</span>
                                                    <span className="text-sm">
                                                      {new Date(addressSubmission.created_at).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                  {addressSubmission.reviewed_at && (
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Reviewed:</span>
                                                      <span className="text-sm">
                                                        {new Date(addressSubmission.reviewed_at).toLocaleDateString()}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                                {addressSubmission.rejection_reason && (
                                                  <div className="pt-2 border-t">
                                                    <span className="text-sm text-gray-600">Rejection Reason:</span>
                                                    <p className="text-sm text-red-600 mt-1">{addressSubmission.rejection_reason}</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {addressSubmission.status !== "approved" && addressSubmission.status !== "rejected" && (
                                              <div className="pt-2 border-t">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setSelectedKycSubmission(addressSubmission)
                                                    setReviewStatus("approved")
                                                    setRejectionReason("")
                                                    setKycReviewSubDialogOpen(true)
                                                  }}
                                                >
                                                  Review Submission
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : null
                                    })()}
                                  </>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* KYC Review Sub-Dialog */}
                        <Dialog open={kycReviewSubDialogOpen} onOpenChange={setKycReviewSubDialogOpen}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Review KYC Submission</DialogTitle>
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
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant={reviewStatus === "rejected" ? "default" : "outline"}
                                    onClick={() => setReviewStatus("rejected")}
                                    className="flex-1 text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                              {reviewStatus === "rejected" && (
                                <div className="space-y-2">
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              )}
                              <div className="flex justify-end gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setKycReviewSubDialogOpen(false)
                                    setSelectedKycSubmission(null)
                                    setRejectionReason("")
                                  }}
                                  disabled={updatingKyc}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleKycReview} disabled={updatingKyc || (reviewStatus === "rejected" && !rejectionReason.trim())}>
                                  {updatingKyc ? "Updating..." : "Submit Review"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleKycOpen(user)}>
                              KYC
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, "active")}>
                              Activate Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, "suspended")}>
                              Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
