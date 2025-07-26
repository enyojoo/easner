"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
} from "lucide-react"

// Mock data for reports
const mockTransactionVolume = [
  { month: "Jan", volume: 1250000, transactions: 2450 },
  { month: "Feb", volume: 1380000, transactions: 2680 },
  { month: "Mar", volume: 1520000, transactions: 2890 },
  { month: "Apr", volume: 1420000, transactions: 2750 },
  { month: "May", volume: 1680000, transactions: 3120 },
  { month: "Jun", volume: 1850000, transactions: 3450 },
]

const mockRevenueData = [
  { month: "Jan", revenue: 12500, fees: 8200, spread: 4300 },
  { month: "Feb", revenue: 13800, fees: 9100, spread: 4700 },
  { month: "Mar", revenue: 15200, fees: 10200, spread: 5000 },
  { month: "Apr", revenue: 14200, fees: 9500, spread: 4700 },
  { month: "May", revenue: 16800, fees: 11200, spread: 5600 },
  { month: "Jun", revenue: 18500, fees: 12300, spread: 6200 },
]

const mockUserGrowth = [
  { month: "Jan", newUsers: 245, totalUsers: 1245 },
  { month: "Feb", newUsers: 312, totalUsers: 1557 },
  { month: "Mar", newUsers: 428, totalUsers: 1985 },
  { month: "Apr", newUsers: 356, totalUsers: 2341 },
  { month: "May", newUsers: 489, totalUsers: 2830 },
  { month: "Jun", newUsers: 567, totalUsers: 3397 },
]

const mockCurrencyPairs = [
  { pair: "RUB → NGN", volume: 45.2, transactions: 1250, revenue: 8500 },
  { pair: "NGN → RUB", volume: 32.8, transactions: 890, revenue: 6200 },
  { pair: "USD → NGN", volume: 15.5, transactions: 420, revenue: 2800 },
  { pair: "NGN → USD", volume: 6.5, transactions: 180, revenue: 1200 },
]

const mockConversionFunnel = [
  { stage: "Visitors", count: 12450, percentage: 100 },
  { stage: "Registrations", count: 3397, percentage: 27.3 },
  { stage: "Email Verified", count: 2890, percentage: 85.1 },
  { stage: "First Transaction", count: 2156, percentage: 74.6 },
  { stage: "Active Users (30d)", count: 1823, percentage: 84.6 },
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")

  const totalVolume = mockTransactionVolume.reduce((sum, item) => sum + item.volume, 0)
  const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalUsers = mockUserGrowth[mockUserGrowth.length - 1].totalUsers
  const monthlyGrowth = ((mockUserGrowth[5].newUsers - mockUserGrowth[4].newUsers) / mockUserGrowth[4].newUsers) * 100

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Monitor platform performance and business metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold">${(totalVolume / 1000000).toFixed(1)}M</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">12.5%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">8.2%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">{monthlyGrowth.toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">74.6%</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500">2.1%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4">
                {mockTransactionVolume.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{item.month}</div>
                    <div
                      className="bg-novapay-primary rounded-t"
                      style={{
                        height: `${(item.volume / Math.max(...mockTransactionVolume.map((d) => d.volume))) * 100}px`,
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-2">${(item.volume / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-400">{item.transactions} txns</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Transaction Fees</TableHead>
                  <TableHead>Exchange Spread</TableHead>
                  <TableHead>Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRevenueData.map((item, index) => {
                  const prevRevenue = index > 0 ? mockRevenueData[index - 1].revenue : item.revenue
                  const growth = ((item.revenue - prevRevenue) / prevRevenue) * 100
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell>${item.revenue.toLocaleString()}</TableCell>
                      <TableCell>${item.fees.toLocaleString()}</TableCell>
                      <TableCell>${item.spread.toLocaleString()}</TableCell>
                      <TableCell>
                        {index > 0 && (
                          <Badge className={growth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {growth >= 0 ? "+" : ""}
                            {growth.toFixed(1)}%
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Growth & Currency Pairs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>New Users</TableHead>
                    <TableHead>Total Users</TableHead>
                    <TableHead>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUserGrowth.map((item, index) => {
                    const prevMonth = index > 0 ? mockUserGrowth[index - 1] : null
                    const growthRate = prevMonth ? ((item.newUsers - prevMonth.newUsers) / prevMonth.newUsers) * 100 : 0
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell>{item.newUsers}</TableCell>
                        <TableCell>{item.totalUsers.toLocaleString()}</TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Badge
                              className={growthRate >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {growthRate >= 0 ? "+" : ""}
                              {growthRate.toFixed(1)}%
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currency Pair Popularity</CardTitle>
            </CardHeader>
            <CardContent>
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
                            <div className="bg-novapay-primary h-2 rounded-full" style={{ width: `${item.volume}%` }} />
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

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockConversionFunnel.map((stage, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{stage.stage}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-novapay-primary h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          <span className="text-white text-xs font-medium">{stage.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-gray-600">{stage.count.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
