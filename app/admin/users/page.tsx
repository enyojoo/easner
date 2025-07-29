"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Eye,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { adminCache, ADMIN_CACHE_KEYS } from "@/lib/admin-cache"

interface User {
  id: string
  email: string
  full_name: string
  phone_number: string
  date_of_birth: string
  address: string
  city: string
  country: string
  verification_status: string
  created_at: string
  updated_at: string
}

interface UserTransaction {
  id: string
  amount: number
  from_currency: string
  to_currency: string
  status: string
  created_at: string
  recipient: {
    full_name: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([])
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)

  useEffect(() => {
    fetchUsers()

    // Set up auto-refresh every 5 minutes in background
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.USERS, fetchUsersData, 5 * 60 * 1000)

    return () => {
      // Clean up auto-refresh when component unmounts
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.USERS)
    }
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const fetchUsersData = async () => {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Check cache first
      const cachedData = adminCache.get(ADMIN_CACHE_KEYS.USERS)
      if (cachedData) {
        setUsers(cachedData)
        setLoading(false)
        return
      }

      // Fetch fresh data
      const data = await fetchUsersData()

      // Cache the result
      adminCache.set(ADMIN_CACHE_KEYS.USERS, data)

      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.includes(searchTerm),
      )
    }

    // Filter by verification status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.verification_status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const fetchUserTransactions = async (userId: string) => {
    try {
      setLoadingUserDetails(true)
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          from_currency,
          to_currency,
          status,
          created_at,
          recipient:recipients(full_name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      setUserTransactions(data || [])
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      setUserTransactions([])
    } finally {
      setLoadingUserDetails(false)
    }
  }

  const handleViewUser = async (user: User) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
    await fetchUserTransactions(user.id)
  }

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
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

  const getTransactionStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center text-xs`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      RUB: "₽",
      USD: "$",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
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
            <p className="text-gray-600">Monitor and manage platform users</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number || "N/A"}</TableCell>
                    <TableCell>{user.country || "N/A"}</TableCell>
                    <TableCell>{getVerificationBadge(user.verification_status || "unverified")}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all" ? "No users match your filters." : "No users found."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Name:</span>
                        <span>{selectedUser.full_name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedUser.phone_number || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Date of Birth:</span>
                        <span>
                          {selectedUser.date_of_birth
                            ? new Date(selectedUser.date_of_birth).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Location:</span>
                        <span>{[selectedUser.city, selectedUser.country].filter(Boolean).join(", ") || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="font-medium">Verification Status:</span>
                        <div className="mt-1">
                          {getVerificationBadge(selectedUser.verification_status || "unverified")}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Member Since:</span>
                        <div className="mt-1">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <div className="mt-1">{new Date(selectedUser.updated_at).toLocaleDateString()}</div>
                      </div>
                      {selectedUser.address && (
                        <div>
                          <span className="font-medium">Address:</span>
                          <div className="mt-1 text-sm text-gray-600">{selectedUser.address}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingUserDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-novapay-primary"></div>
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Recipient</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Currency</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>{transaction.recipient?.full_name || "Unknown"}</TableCell>
                                <TableCell>{formatCurrency(transaction.amount, transaction.from_currency)}</TableCell>
                                <TableCell>
                                  {transaction.from_currency} → {transaction.to_currency}
                                </TableCell>
                                <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                                <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {userTransactions.length === 0 && (
                          <div className="text-center py-8 text-gray-500">No transactions found for this user.</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
