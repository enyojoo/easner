"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
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

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Remove mockUsers array and replace with empty array initially
const initialUsers: any[] = []

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userTransactions, setUserTransactions] = useState<any[]>([])

  // Add useEffect to fetch users from Supabase
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Transform the data to match the expected format
      const transformedUsers =
        usersData?.map((user) => ({
          id: user.id,
          name: user.full_name || "N/A",
          email: user.email,
          phone: user.phone || "N/A",
          registrationDate: new Date(user.created_at).toISOString().split("T")[0],
          status: user.status || "active",
          verificationStatus: user.verification_status || "unverified",
          totalTransactions: 0, // Will be calculated from transactions
          totalVolume: "₦0.00",
          lastActivity: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never",
          country: user.country || "N/A",
          baseCurrency: user.base_currency || "NGN",
        })) || []

      // Fetch transaction counts and volumes for each user
      for (const user of transformedUsers) {
        const { data: transactions, error: transError } = await supabase
          .from("transactions")
          .select("amount, from_currency, status")
          .eq("user_id", user.id)

        if (!transError && transactions) {
          user.totalTransactions = transactions.length

          // Calculate total volume in NGN
          const totalVolume = transactions
            .filter((t) => t.status === "completed")
            .reduce((sum, t) => {
              const amount = Number.parseFloat(t.amount)
              // Convert to NGN if needed (using 22.45 rate for RUB)
              const amountInNGN = t.from_currency === "RUB" ? amount * 22.45 : amount
              return sum + amountInNGN
            }, 0)

          user.totalVolume = `₦${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }

      setUsers(transformedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesVerification = verificationFilter === "all" || user.verificationStatus === verificationFilter
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
        setSelectedUser((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error("Error updating user status:", err)
      alert("Failed to update user status")
    }
  }

  const handleVerificationUpdate = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ verification_status: newStatus }).eq("id", userId)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, verificationStatus: newStatus } : user)))
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, verificationStatus: newStatus }))
      }
    } catch (err) {
      console.error("Error updating verification status:", err)
      alert("Failed to update verification status")
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).in("id", selectedUsers)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: newStatus } : user)))
      setSelectedUsers([])
    } catch (err) {
      console.error("Error updating user statuses:", err)
      alert("Failed to update user statuses")
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["User ID", "Name", "Email", "Phone", "Status", "Verification", "Registration Date", "Total Volume"].join(","),
      ...filteredUsers.map((u) =>
        [u.id, u.name, u.email, u.phone, u.status, u.verificationStatus, u.registrationDate, u.totalVolume].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
  }

  // Registration analytics data
  const registrationStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    verifiedUsers: users.filter((u) => u.verificationStatus === "verified").length,
    newThisWeek: users.filter((u) => new Date(u.registrationDate) > new Date("2024-01-08")).length,
  }

  // Add this function to fetch user transactions
  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      const transformedTransactions =
        transactions?.map((t) => ({
          id: t.id,
          date: new Date(t.created_at).toLocaleString(),
          fromCurrency: t.from_currency,
          toCurrency: t.to_currency,
          sendAmount: `${t.from_currency === "RUB" ? "₽" : "₦"}${Number.parseFloat(t.amount).toLocaleString()}`,
          receiveAmount: `${t.to_currency === "RUB" ? "₽" : "₦"}${Number.parseFloat(t.converted_amount).toLocaleString()}`,
          status: t.status,
          recipient: t.recipient_name || "N/A",
        })) || []

      setUserTransactions(transformedTransactions)
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      setUserTransactions([])
    }
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
                {Math.round((registrationStats.activeUsers / registrationStats.totalUsers) * 100)}% of total
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
                {Math.round((registrationStats.verifiedUsers / registrationStats.totalUsers) * 100)}% verified
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

        {/* Loading and Error States */}
        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">Loading users...</div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-500">Error loading users: {error}</div>
            </CardContent>
          </Card>
        )}

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
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User ID</TableHead>
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
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getVerificationBadge(user.verificationStatus)}</TableCell>
                    <TableCell className="font-medium">{user.totalTransactions}</TableCell>
                    <TableCell className="font-medium">{user.totalVolume}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                fetchUserTransactions(user.id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
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
                                          <span>{selectedUser.name}</span>
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
                                          {getVerificationBadge(selectedUser.verificationStatus)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Account Details</label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">User ID:</span>
                                          <span className="font-mono text-sm">{selectedUser.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Registration:</span>
                                          <span className="text-sm">{selectedUser.registrationDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Last Activity:</span>
                                          <span className="text-sm">{selectedUser.lastActivity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Base Currency:</span>
                                          <span className="text-sm font-medium">{selectedUser.baseCurrency}</span>
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
                                          <span className="font-medium">{selectedUser.totalVolume}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Transaction History */}
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Recent Transactions</label>
                                  <div className="mt-2">
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
                                          <TableRow key={transaction.id}>
                                            <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                                            <TableCell>{transaction.date}</TableCell>
                                            <TableCell>
                                              {transaction.fromCurrency} → {transaction.toCurrency}
                                            </TableCell>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">{transaction.sendAmount}</div>
                                                <div className="text-sm text-gray-500">
                                                  → {transaction.receiveAmount}
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
                                        ))}
                                        {userTransactions.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500">
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
                                      disabled={selectedUser.verificationStatus === "verified"}
                                    >
                                      Verify User
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleVerificationUpdate(selectedUser.id, "rejected")}
                                      disabled={selectedUser.verificationStatus === "rejected"}
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
