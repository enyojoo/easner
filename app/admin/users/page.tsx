"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAdminData } from "@/hooks/use-admin-data"
import { Search, Filter, UserPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { adminDataStore } from "@/lib/admin-data-store"

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
  const { users, loading, stats } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userTransactions, setUserTransactions] = useState<TransactionData[]>([])

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
        .limit(20)

      if (error) throw error
      setUserTransactions(data || [])
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      setUserTransactions([])
    }
  }

  const filteredUsers = (users || []).filter((user: UserData) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesVerification = verificationFilter === "all" || user.verification_status === verificationFilter

    return matchesSearch && matchesStatus && matchesVerification
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: <span className="h-3 w-3 mr-1">✓</span> },
      suspended: { color: "bg-red-100 text-red-800", icon: <span className="h-3 w-3 mr-1">🚫</span> },
      inactive: { color: "bg-gray-100 text-gray-800", icon: <span className="h-3 w-3 mr-1">🕒</span> },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <span className="h-3 w-3 mr-1">⏳</span> },
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
      verified: { color: "bg-green-100 text-green-800", icon: <span className="h-3 w-3 mr-1">✓</span> },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <span className="h-3 w-3 mr-1">⏳</span> },
      rejected: { color: "bg-red-100 text-red-800", icon: <span className="h-3 w-3 mr-1">❌</span> },
      unverified: { color: "bg-gray-100 text-gray-800", icon: <span className="h-3 w-3 mr-1">❓</span> },
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
          u.verification_status,
          new Date(u.created_at).toLocaleDateString(),
          u.totalVolume.toString(),
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
    totalUsers: stats?.totalUsers || 0,
    activeUsers: stats?.activeUsers || 0,
    verifiedUsers: stats?.verifiedUsers || 0,
    newThisWeek: (users || []).filter(
      (u: UserData) => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600">Manage platform users and their accounts</p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Registration Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <span className="h-4 w-4 text-novapay-primary">👤</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{registrationStats.totalUsers}</div>
                <p className="text-xs text-green-600">+{registrationStats.newThisWeek} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                <span className="h-4 w-4 text-green-600">✓</span>
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
                <span className="h-4 w-4 text-blue-600">✓</span>
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
                <span className="h-4 w-4 text-novapay-primary">📈</span>
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
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Verification</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers?.map((user: UserData) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(user.verification_status)}>
                              {user.verification_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleUserSelect(user)}>
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Verification</th>
                    <th className="text-left py-3 px-4">Transactions</th>
                    <th className="text-left py-3 px-4">Total Volume</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: UserData) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.base_currency}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 px-4">{getVerificationBadge(user.verification_status)}</td>
                      <td className="py-3 px-4 font-medium">{user.totalTransactions}</td>
                      <td className="py-3 px-4 font-medium">{user.totalVolume.toString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleUserSelect(user)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
