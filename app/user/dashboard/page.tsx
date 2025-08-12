"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  CreditCard,
  Send,
  Plus,
  Eye,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Link from "next/link"

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { userProfile } = useAuth()
  const { transactions, recipients, loading } = useUserData()

  // Mock data for demonstration
  const stats = {
    totalSent: 12500.0,
    totalReceived: 8750.0,
    pendingTransactions: 3,
    completedTransactions: 47,
  }

  const recentTransactions = transactions.slice(0, 5) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.full_name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your account today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalReceived.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                <p className="text-xs text-muted-foreground">Transactions in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTransactions}</div>
                <p className="text-xs text-muted-foreground">All time transactions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Your latest money transfers</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/user/transactions">
                        View All
                        <Eye className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                              {transaction.type === "send" ? (
                                <ArrowUpRight className="h-5 w-5 text-novapay-primary" />
                              ) : (
                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.type === "send" ? "Sent to" : "Received from"} {transaction.recipient_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {transaction.type === "send" ? "-" : "+"}${transaction.send_amount.toFixed(2)}
                            </p>
                            <Badge className={getStatusColor(transaction.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(transaction.status)}
                                <span className="capitalize">{transaction.status}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No transactions yet</p>
                      <Button asChild>
                        <Link href="/user/send">
                          Send Your First Transfer
                          <Send className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recipients */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/user/send">
                      <Send className="h-4 w-4 mr-2" />
                      Send Money
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/user/recipients">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Recipients
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/user/profile">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Recipients */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Recipients</CardTitle>
                      <CardDescription>People you've sent money to</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/user/recipients">
                        <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recipients.length > 0 ? (
                    <div className="space-y-3">
                      {recipients.slice(0, 3).map((recipient) => (
                        <div key={recipient.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {recipient.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{recipient.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{recipient.bank_name}</p>
                          </div>
                        </div>
                      ))}
                      {recipients.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href="/user/recipients">View All ({recipients.length})</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No recipients yet</p>
                      <Button size="sm" asChild>
                        <Link href="/user/recipients">
                          Add Recipient
                          <Plus className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
