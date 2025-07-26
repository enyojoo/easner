"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from "lucide-react"

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

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("today")

  const getMetricsForTimeRange = (range: string) => {
    const baseMetrics = {
      today: {
        transactions: 234,
        transactionsChange: "+12%",
        volume: "₦45.2M",
        volumeChange: "+8%",
        revenue: "₦452K",
        revenueChange: "+15%",
        pending: 23,
      },
      week: {
        transactions: 1847,
        transactionsChange: "+18%",
        volume: "₦324.8M",
        volumeChange: "+22%",
        revenue: "₦3.2M",
        revenueChange: "+19%",
        pending: 67,
      },
      month: {
        transactions: 7234,
        transactionsChange: "+25%",
        volume: "₦1.2B",
        volumeChange: "+28%",
        revenue: "₦12.4M",
        revenueChange: "+31%",
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

  const getActivityBadgeColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your platform's performance and key metrics</p>
          </div>
          <div className="flex items-center gap-4">
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
            <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Plus className="h-4 w-4 mr-2" />
              Quick Action
            </Button>
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
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.revenue}</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">
                  {metrics.revenueChange} from last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.pending}</div>
              <p className="text-xs text-orange-600">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities and events</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                      <Badge className={`mt-2 text-xs ${getActivityBadgeColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-novapay-primary hover:bg-novapay-primary-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Review Pending Transactions
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Exchange Rates
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Activity className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Platform health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Exchange Rate API</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Delayed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Load</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
