"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  transactions: number
  volume: string
  users: number
  pending: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  user?: string
  amount?: string
  time: string
  status: string
}

interface CurrencyPair {
  pair: string
  volume: number
  transactions: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    transactions: 0,
    volume: "₦0",
    users: 0,
    pending: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        loadDashboardData()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load all transaction stats (no time filter)
      const { data: allTransactions } = await supabase.from("transactions").select("*")

      // Load user stats
      const { data: allUsers } = await supabase.from("users").select("id", { count: "exact" })

      // Load recent transactions for activity feed
      const { data: recentTransactions } = await supabase
        .from("transactions")
        .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
        .order("created_at", { ascending: false })
        .limit(10)

      // Load all completed transactions for volume calculation
      const { data: completedTransactions } = await supabase
        .from("transactions")
        .select("send_amount, send_currency, receive_amount, receive_currency, status")
        .eq("status", "completed")

      // Load currency pair data
      const { data: currencyData } = await supabase
        .from("transactions")
        .select("send_currency, receive_currency, send_amount, status")
        .eq("status", "completed")

      // Calculate total volume in NGN (base currency)
      let totalVolumeInNGN = 0
      if (completedTransactions) {
        for (const tx of completedTransactions) {
          if (tx.send_currency === "NGN") {
            totalVolumeInNGN += tx.send_amount
          } else if (tx.send_currency === "RUB") {
            // Convert RUB to NGN using exchange rate (22.45)
            totalVolumeInNGN += tx.send_amount * 22.45
          } else {
            // For other currencies, use send amount as fallback
            totalVolumeInNGN += tx.send_amount
          }
        }
      }

      // Count pending transactions
      const pendingCount =
        allTransactions?.filter((tx) => tx.status === "pending" || tx.status === "processing").length || 0

      // Process stats
      const formattedStats: DashboardStats = {
        transactions: allTransactions?.length || 0,
        volume: formatCurrency(totalVolumeInNGN, "NGN"),
        users: allUsers?.length || 0,
        pending: pendingCount,
      }

      // Process recent activity
      const activities: RecentActivity[] =
        recentTransactions?.map((tx) => ({
          id: tx.id,
          type: getActivityType(tx.status),
          message: getActivityMessage(tx),
          user: tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : undefined,
          amount: formatCurrency(tx.send_amount, tx.send_currency),
          time: getRelativeTime(tx.created_at),
          status: getActivityStatus(tx.status),
        })) || []

      // Process currency pairs
      const pairs = processCurrencyPairs(currencyData || [])

      setStats(formattedStats)
      setRecentActivity(activities)
      setCurrencyPairs(pairs)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = "NGN") => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      RUB: "₽",
      USD: "$",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getActivityType = (status: string) => {
    switch (status) {
      case "completed":
        return "transaction_completed"
      case "failed":
        return "transaction_failed"
      case "pending":
      case "processing":
        return "transaction_pending"
      default:
        return "transaction_pending"
    }
  }

  const getActivityMessage = (transaction: any) => {
    switch (transaction.status) {
      case "completed":
        return `Transaction ${transaction.transaction_id} completed successfully`
      case "failed":
        return `Transaction ${transaction.transaction_id} failed`
      case "pending":
        return `New transaction ${transaction.transaction_id} awaiting verification`
      default:
        return `Transaction ${transaction.transaction_id} is being processed`
    }
  }

  const getActivityStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "failed":
        return "error"
      case "pending":
      case "processing":
        return "warning"
      default:
        return "info"
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const processCurrencyPairs = (transactions: any[]) => {
    const pairStats: { [key: string]: { volume: number; count: number } } = {}

    transactions.forEach((tx) => {
      const pair = `${tx.send_currency} → ${tx.receive_currency}`
      if (!pairStats[pair]) {
        pairStats[pair] = { volume: 0, count: 0 }
      }
      pairStats[pair].volume += tx.send_amount
      pairStats[pair].count += 1
    })

    const totalVolume = Object.values(pairStats).reduce((sum, stat) => sum + stat.volume, 0)

    return Object.entries(pairStats)
      .map(([pair, stats]) => ({
        pair,
        volume: totalVolume > 0 ? (stats.volume / totalVolume) * 100 : 0,
        transactions: stats.count,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4)
  }

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
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your platform's performance and key metrics</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Auto-refreshes every 5 minutes
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
              <div className="text-2xl font-bold text-gray-900">{stats.transactions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.volume}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transactions Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
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
                {recentActivity.map((activity) => (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencyPairs.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.pair}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-novapay-primary h-2 rounded-full" style={{ width: `${item.volume}%` }} />
                          </div>
                          <span className="text-sm">{item.volume.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.transactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
