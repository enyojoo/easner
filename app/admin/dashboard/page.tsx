"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminData } from "@/hooks/use-admin-data"
import { Users, CreditCard, TrendingUp, DollarSign } from "lucide-react"

export default function AdminDashboardPage() {
  const { data, loading } = useAdminData()

  if (loading) {
    return (
      <AuthGuard requireAdmin>
        <AdminDashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
          </div>
        </AdminDashboardLayout>
      </AuthGuard>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers || "0",
      description: "+20.1% from last month",
      icon: Users,
    },
    {
      title: "Total Transactions",
      value: data?.totalTransactions || "0",
      description: "+180.1% from last month",
      icon: CreditCard,
    },
    {
      title: "Total Revenue",
      value: `₦${(data?.totalRevenue || 0).toLocaleString()}`,
      description: "+19% from last month",
      icon: DollarSign,
    },
    {
      title: "Active Rate",
      value: "98.2%",
      description: "+2% from last month",
      icon: TrendingUp,
    },
  ]

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Here's what's happening with your platform today.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  {(data?.recentTransactions || []).slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {transaction.sender_name} → {transaction.recipient_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.amount} {transaction.from_currency} → {transaction.to_currency}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">{new Date(transaction.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(data?.recentUsers || []).slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
