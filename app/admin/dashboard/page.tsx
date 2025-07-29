"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuthGuard } from "@/components/auth/auth-guard"

// Mock data
const mockRecentActivity = [
  {
    id: "1",
    type: "transaction_completed",
    message: "Transaction NP1705123456789 completed successfully",
    user: "John Doe",
    amount: "₦45,000.00",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    type: "user_registered",
    message: "New user registration",
    user: "Jane Smith",
    time: "5 minutes ago",
    status: "info",
  },
  {
    id: "3",
    type: "transaction_failed",
    message: "Transaction NP1705123456790 failed - insufficient funds",
    user: "Mike Johnson",
    amount: "₽12,500.00",
    time: "8 minutes ago",
    status: "error",
  },
  {
    id: "4",
    type: "rate_updated",
    message: "Exchange rate updated: RUB to NGN",
    time: "15 minutes ago",
    status: "info",
  },
  {
    id: "5",
    type: "transaction_pending",
    message: "New transaction awaiting verification",
    user: "Sarah Wilson",
    amount: "₦78,900.00",
    time: "20 minutes ago",
    status: "warning",
  },
]

const mockCurrencyPairs = [
  { pair: "RUB → NGN", volume: 45.2, transactions: 1250, revenue: 8500 },
  { pair: "NGN → RUB", volume: 32.8, transactions: 890, revenue: 6200 },
  { pair: "USD → NGN", volume: 15.5, transactions: 420, revenue: 2800 },
  { pair: "NGN → USD", volume: 6.5, transactions: 180, revenue: 1200 },
]

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("today")

  const getMetricsForTimeRange = (range: string) => {
    const baseMetrics = {
      today: {
        transactions: 234,
        transactionsChange: "+12%",
        volume: "₦45.2M",
        volumeChange: "+8%",
        users: 125,
        usersChange: "+5%",
        pending: 23,
      },
      week: {
        transactions: 1847,
        transactionsChange: "+18%",
        volume: "₦324.8M",
        volumeChange: "+22%",
        users: 957,
        usersChange: "+7%",
        pending: 67,
      },
      month: {
        transactions: 7234,
        transactionsChange: "+25%",
        volume: "₦1.2B",
        volumeChange: "+28%",
        users: 3852,
        usersChange: "+11%",
        pending: 156,
      },
    }
    return baseMetrics[range as keyof typeof baseMetrics] || baseMetrics.today
  }

  const metrics = getMetricsForTimeRange(timeRange)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transaction_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "transaction_failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "transaction_pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "user_registered":
        return <Users className="h-4 w-4 text-blue-600" />
      case "rate_updated":
        return <RefreshCw className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600">Monitor your platform's performance and key metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.transactions.toLocaleString()}</div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {metrics.transactionsChange} from last {timeRange}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.volume}</div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {metrics.volumeChange} from last {timeRange}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <Users className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.users}</div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {metrics.usersChange} from last {timeRange}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Transactions Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.pending}</div>
                <p className="text-xs text-orange-600">Awaiting processing</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity Feed */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities and events</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        {activity.user && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-600">User: {activity.user}</p>
                            {activity.amount && (
                              <span className="text-xs font-medium text-gray-900">{activity.amount}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & System Status */}
            {/* Currency Pair Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Pair Popularity</CardTitle>
                <CardDescription>Most popular trading pairs</CardDescription>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency Pair</TableHead>
                      <TableHead>Volume %</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCurrencyPairs.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.pair}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-novapay-primary h-2 rounded-full"
                                style={{ width: `${item.volume}%` }}
                              />
                            </div>
                            <span className="text-sm">{item.volume}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.transactions}</TableCell>
                        <TableCell>${item.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
