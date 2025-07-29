"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { adminCache, ADMIN_CACHE_KEYS } from "@/lib/admin-cache"

interface DashboardStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  pendingTransactions: number
  completedTransactions: number
  failedTransactions: number
  recentTransactions: any[]
  popularCurrencyPairs: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0,
    recentTransactions: [],
    popularCurrencyPairs: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()

    // Set up auto-refresh every 5 minutes in background
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.DASHBOARD_STATS, fetchStatsData, 5 * 60 * 1000)

    return () => {
      // Clean up auto-refresh when component unmounts
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.DASHBOARD_STATS)
    }
  }, [])

  const fetchStatsData = async () => {
    // Fetch users count
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Fetch transactions data
    const { data: transactions, count: transactionsCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })

    // Calculate volume using the same logic as user dashboard
    const totalVolume =
      transactions?.reduce((sum, transaction) => {
        return sum + (Number(transaction.amount) || 0)
      }, 0) || 0

    // Count transactions by status
    const pendingCount = transactions?.filter((t) => t.status === "pending").length || 0
    const completedCount = transactions?.filter((t) => t.status === "completed").length || 0
    const failedCount = transactions?.filter((t) => t.status === "failed").length || 0

    // Get recent transactions (last 10)
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select(`
        *,
        sender:users!transactions_user_id_fkey(full_name, email),
        recipient:recipients(full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get popular currency pairs
    const currencyPairCounts =
      transactions?.reduce((acc: any, transaction) => {
        const pair = `${transaction.from_currency}-${transaction.to_currency}`
        acc[pair] = (acc[pair] || 0) + 1
        return acc
      }, {}) || {}

    const popularPairs = Object.entries(currencyPairCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([pair, count]) => ({ pair, count }))

    return {
      totalUsers: usersCount || 0,
      totalTransactions: transactionsCount || 0,
      totalVolume,
      pendingTransactions: pendingCount,
      completedTransactions: completedCount,
      failedTransactions: failedCount,
      recentTransactions: recentTransactions || [],
      popularCurrencyPairs: popularPairs,
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Check cache first
      const cachedData = adminCache.get(ADMIN_CACHE_KEYS.DASHBOARD_STATS)
      if (cachedData) {
        setStats(cachedData)
        setLoading(false)
        return
      }

      // Fetch fresh data
      const data = await fetchStatsData()

      // Cache the result
      adminCache.set(ADMIN_CACHE_KEYS.DASHBOARD_STATS, data)

      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
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
              <p className="mt-2 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your platform's performance and activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalVolume.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTransactions > 0
                  ? Math.round((stats.completedTransactions / stats.totalTransactions) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedTransactions}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.sender?.full_name || "Unknown User"}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.from_currency)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {stats.recentTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">No recent transactions found.</div>
              )}
            </CardContent>
          </Card>

          {/* Popular Currency Pairs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Currency Pairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularCurrencyPairs.map((pair, index) => (
                  <div key={pair.pair} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-novapay-primary text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="font-medium">{pair.pair.replace("-", " → ")}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{pair.count} transactions</Badge>
                  </div>
                ))}

                {stats.popularCurrencyPairs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No currency pair data available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
