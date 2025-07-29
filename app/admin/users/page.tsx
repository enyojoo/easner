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
import { adminCache, ADMIN_CACHE_KEYS } from "@/lib/admin-cache"

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  status: string
  verification_status: string
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
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userTransactions, setUserTransactions] = useState<TransactionData[]>([])

  useEffect(() => {
    fetchUsers()

    // Set up auto-refresh
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.USERS, fetchUsersData, 5 * 60 * 1000)

    return () => {
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.USERS)
    }
  }, [])

  const fetchUsersData = async (): Promise<UserData[]> => {
    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) throw usersError

    // Fetch transaction counts and volumes for each user
    const usersWithStats = await Promise.all(
      (usersData || []).map(async (user) => {
        const { data: transactions, error: transError } = await supabase
          .from("transactions")
          .select("send_amount, send_currency, status")
          .eq("user_id", user.id)

        if (transError) {
          console.error("Error fetching transactions for user:", user.id, transError)
          return {
            ...user,
            totalTransactions: 0,
            totalVolume: 0,
          }
        }

        const totalTransactions = transactions?.length || 0

        // Calculate total volume in NGN (base currency)
        const totalVolume = (transactions || []).reduce((sum, transaction) => {
          let amount = Number(transaction.send_amount)

          // Convert to NGN if needed
          if (transaction.send_currency === "RUB") {
            amount = amount * 22.45 // RUB to NGN rate
          }

          return sum + amount
        }, 0)

        return {
          ...user,
          totalTransactions,
          totalVolume,
        }
      }),
    )

    return usersWithStats
  }

  const fetchUsers = async () => {
    try {
      // Check cache first
      const cachedData = adminCache.get<UserData[]>(ADMIN_CACHE_KEYS.USERS)
      if (cachedData) {
        setUsers(cachedData)
        return
      }

      setLoading(true)
      setError(null)

      const data = await fetchUsersData()

      // Cache the data
      adminCache.set(ADMIN_CACHE_KEYS.USERS, data)

      setUsers(data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
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
        .limit(5)

      if (error) throw error
      setUserTransactions(data || [])
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      setUserTransactions([])
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesVerification = verificationFilter === "all" || user.verification_status === verificationFilter

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

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-800", icon: <UserCheck className="h-3 w-3 mr-1" /> },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      rejected: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      unverified: { color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unverified

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id))
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
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", userId)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null))
      }

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.USERS)
    } catch (err) {
      console.error("Error updating user status:", err)
    }
  }

  const handleVerificationUpdate = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ verification_status: newStatus }).eq("id", userId)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, verification_status: newStatus } : user)))
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, verification_status: newStatus } : null))
      }

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.USERS)
    } catch (err) {
      console.error("Error updating user verification:", err)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).in("id", selectedUsers)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: newStatus } : user)))
      setSelectedUsers([])

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.USERS)
    } catch (err) {
      console.error("Error bulk updating user status:", err)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Status", "Verification", "Registration Date", "Total Volume"].join(","),
      ...filteredUsers.map((u) =>
        [
          `${u.first_name} ${u.last_name}`,
          u.email,
          u.phone || "",
          u.status,
          u.verification_status,
          new Date(u.created_at).toLocaleDateString(),
          formatCurrency(u.totalVolume, "NGN"),
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

  // Registration analytics data
  const registrationStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    verifiedUsers: users.filter((u) => u.verification_status === "verified").length,
    newThisWeek: users.filter((u) => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button onClick={fetchUsers} size="sm" variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts and verification status</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>

        {/* Registration Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <User className="h-4 w-4 text-novapay-primary" />
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
              <TrendingUp className="h-4 w-4 text-novapay-primary" />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Total Volume</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.base_currency}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getVerificationBadge(user.verification_status)}</TableCell>
                    <TableCell className="font-medium">{user.totalTransactions}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(user.totalVolume, "NGN")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                                          {getVerificationBadge(selectedUser.verification_status)}
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
                                            {new Date(selectedUser.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        {selectedUser.last_login && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Last Login:</span>
                                            <span className="text-sm">
                                              {new Date(selectedUser.last_login).toLocaleDateString()}
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
                                            {formatCurrency(selectedUser.totalVolume, "NGN")}
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
                                          <TableRow key={transaction.transaction_id}>
                                            <TableCell className="font-mono text-sm">
                                              {transaction.transaction_id}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(transaction.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                              {transaction.send_currency} → {transaction.receive_currency}
                                            </TableCell>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">
                                                  {formatCurrency(transaction.send_amount, transaction.send_currency)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  →{" "}
                                                  {formatCurrency(
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleVerificationUpdate(selectedUser.id, "verified")}
                                      disabled={selectedUser.verification_status === "verified"}
                                    >
                                      Verify User
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleVerificationUpdate(selectedUser.id, "rejected")}
                                      disabled={selectedUser.verification_status === "rejected"}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      Reject Verification
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, "active")}>
                              Activate Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, "suspended")}>
                              Suspend Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVerificationUpdate(user.id, "verified")}>
                              Verify User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleVerificationUpdate(user.id, "rejected")}
                              className="text-red-600"
                            >
                              Reject Verification
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
