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
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase"
import { formatCurrency } from "@/utils/currency"

interface UserData {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
  status: string
  verification_status: string
  country: string
  base_currency: string
  last_activity: string
  totalTransactions: number
  totalVolume: number
}

interface Transaction {
  id: string
  created_at: string
  from_currency: string
  to_currency: string
  send_amount: number
  receive_amount: number
  status: string
  recipient_name: string
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Fetch transactions to calculate user stats
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("user_id, send_amount, from_currency, status")

      if (transactionsError) throw transactionsError

      // Calculate user statistics
      const usersWithStats = usersData.map((user) => {
        const userTransactions = transactionsData.filter((t) => t.user_id === user.id)
        const completedTransactions = userTransactions.filter((t) => t.status === "completed")

        // Convert all amounts to NGN for total volume calculation
        const totalVolume = completedTransactions.reduce((sum, transaction) => {
          let amountInNGN = transaction.send_amount
          if (transaction.from_currency === "RUB") {
            amountInNGN = transaction.send_amount * 22.45 // RUB to NGN rate
          }
          return sum + amountInNGN
        }, 0)

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name || "N/A",
          phone: user.phone || "N/A",
          created_at: user.created_at,
          status: user.status || "active",
          verification_status: user.verification_status || "unverified",
          country: user.country || "N/A",
          base_currency: user.base_currency || "NGN",
          last_activity: user.last_activity || user.created_at,
          totalTransactions: userTransactions.length,
          totalVolume,
        }
      })

      setUsers(usersWithStats)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTransactions = async (userId: string) => {
    try {
      setLoadingTransactions(true)

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setUserTransactions(data || [])
    } catch (err) {
      console.error("Error fetching user transactions:", err)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesVerification = verificationFilter === "all" || user.verification_status === verificationFilter
    const matchesCountry = countryFilter === "all" || user.country === countryFilter

    return matchesSearch && matchesStatus && matchesVerification && matchesCountry
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
    } catch (err) {
      console.error("Error updating verification status:", err)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).in("id", selectedUsers)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: newStatus } : user)))
      setSelectedUsers([])
    } catch (err) {
      console.error("Error bulk updating status:", err)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Status", "Verification", "Registration Date", "Total Volume"].join(","),
      ...filteredUsers.map((u) =>
        [
          u.full_name,
          u.email,
          u.phone,
          u.status,
          u.verification_status,
          u.created_at,
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

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminDashboardLayout>
    )
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="text-center text-red-600">Error loading users: {error}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Russia">Russia</SelectItem>
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
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.country}</div>
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
                              <DialogTitle>User Details - {selectedUser?.full_name}</DialogTitle>
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
                                          <span>{selectedUser.full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-gray-400" />
                                          <span>{selectedUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-gray-400" />
                                          <span>{selectedUser.phone}</span>
                                        </div>
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
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Last Activity:</span>
                                          <span className="text-sm">
                                            {new Date(selectedUser.last_activity).toLocaleDateString()}
                                          </span>
                                        </div>
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
                                  <div className="mt-2">
                                    {loadingTransactions ? (
                                      <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                      </div>
                                    ) : (
                                      <ScrollArea className="h-64 w-full rounded-md border">
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
                                            {userTransactions.length > 0 ? (
                                              userTransactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                                                  <TableCell>
                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                  </TableCell>
                                                  <TableCell>
                                                    {transaction.from_currency} → {transaction.to_currency}
                                                  </TableCell>
                                                  <TableCell>
                                                    <div>
                                                      <div className="font-medium">
                                                        {formatCurrency(
                                                          transaction.send_amount,
                                                          transaction.from_currency,
                                                        )}
                                                      </div>
                                                      <div className="text-sm text-gray-500">
                                                        →{" "}
                                                        {formatCurrency(
                                                          transaction.receive_amount,
                                                          transaction.to_currency,
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
                                                            : "bg-red-100 text-red-800"
                                                      }
                                                    >
                                                      {transaction.status}
                                                    </Badge>
                                                  </TableCell>
                                                </TableRow>
                                              ))
                                            ) : (
                                              <TableRow>
                                                <TableCell colSpan={5} className="text-center text-gray-500">
                                                  No transactions found
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </ScrollArea>
                                    )}
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
