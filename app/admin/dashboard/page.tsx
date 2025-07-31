"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminData } from "@/hooks/use-admin-data"

export default function AdminDashboard() {
  const { stats, loading } = useAdminData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalTransactions || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₦{stats?.totalVolume?.toLocaleString() || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
