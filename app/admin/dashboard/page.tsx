"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminData } from "@/hooks/use-admin-data"
import { Users, CreditCard, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
  const { stats, loading } = useAdminData()

  if (loading) {
    return (
      <AuthGuard requireAdmin>
        <AdminDashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
          </div>
        </AdminDashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of platform metrics and activities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats?.transactionVolume?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingReviews || 0}</div>
                <p className="text-xs text-muted-foreground">-2 from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentTransactions?.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.sender_email}</p>
                        <p className="text-sm text-gray-500">{transaction.recipient_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{transaction.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{transaction.status}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No recent transactions</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Platform health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>API Status</span>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Gateway</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
