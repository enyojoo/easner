"use client"

import { useState, useEffect } from "react"
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
import { userService, currencyService, settingsService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  transactions: number
  transactionsChange: string
  volume: string
  volumeChange: string
  users: number
  usersChange: string
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
  revenue: number
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("today")
  const [baseCurrency, setBaseCurrency] = useState("NGN")
  const [stats, setStats] = useState<DashboardStats>({
    transactions: 0,
    transactionsChange: "+0%",
    volume: "₦0",
    volumeChange: "+0%",
    users: 0,
    usersChange: "+0%",
    pending: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBaseCurrency()
  }, [])

  useEffect(() => {
    if (baseCurrency) {
      loadDashboardData()
    }
  }, [timeRange, baseCurrency])

  const loadBaseCurrency = async () => {
    try {
      const savedBaseCurrency = await settingsService.get("base_currency")
      if (savedBaseCurrency) {
        setBaseCurrency(savedBaseCurrency)
      }
    } catch (error) {
      console.error("Error loading base currency:", error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load exchange rates for currency conversion
      const exchangeRates = await currencyService.getExchangeRates()

      // Load transaction stats with currency conversion
      const transactionStats = await getTransactionStatsWithConversion(timeRange, baseCurrency, exchangeRates)

      // Load user stats
      const userStats = await userService.getStats()

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

      // Load currency pair data
      const { data: currencyData } = await supabase
        .from("transactions")
        .select("send_currency, receive_currency, send_amount, status")
        .eq("status", "completed")
        .gte("created_at", getDateFilter(timeRange))

      // Process stats
      const formattedStats: DashboardStats = {
        transactions: transactionStats.totalTransactions,
        transactionsChange: "+12%", // You can calculate this based on previous period
        volume: formatCurrency(transactionStats.totalVolume, baseCurrency),
        volumeChange: "+8%",
        users: userStats.total,
        usersChange: "+5%",
        pending: transactionStats.pendingTransactions,
      }

      // Process recent activity
      const activities: RecentActivity[] =
        recentTransactions?.map((tx, index) => ({
          id: tx.id,
          type: getActivityType(tx.status),
          message: getActivityMessage(tx),
          user: tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : undefined,
          amount: formatCurrency(tx.send_amount, tx.send_currency),
          time: getRelativeTime(tx.created_at),
          status: getActivityStatus(tx.status),
        })) || []

      // Process currency pairs
      const pairs = processCurrencyPairs(currencyData || [], baseCurrency, exchangeRates)

      setStats(formattedStats)
      setRecentActivity(activities)
      setCurrencyPairs(pairs)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionStatsWithConversion = async (timeRange: string, baseCurrency: string, exchangeRates: any[]) => {
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .gte("created_at", getDateFilter(timeRange))

    const { data: pendingTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact" })
      .in("status", ["pending", "processing"])

    // Convert all transaction amounts to base currency
    let totalVolumeInBaseCurrency = 0

    if (transactions) {
      for (const tx of transactions) {
        const convertedAmount = await convertToBaseCurrency(
          tx.send_amount,
          tx.send_currency,
          baseCurrency,
          exchangeRates,
        )
        totalVolumeInBaseCurrency += convertedAmount
      }
    }

    return {
      totalTransactions: transactions?.length || 0,
      totalVolume: totalVolumeInBaseCurrency,
      pendingTransactions: pendingTransactions?.length || 0,
    }
  }

  const convertToBaseCurrency = async (
    amount: number,
    fromCurrency: string,
    baseCurrency: string,
    exchangeRates: any[],
  ) => {
    if (fromCurrency === baseCurrency) {
      return amount
    }

    // Find direct rate
    let rate = exchangeRates.find(
      (r) => r.from_currency === fromCurrency && r.to_currency === baseCurrency && r.status === "active",
    )

    if (rate) {
      return amount * rate.rate
    }

    // Find reverse rate
    rate = exchangeRates.find(
      (r) => r.from_currency === baseCurrency && r.to_currency === fromCurrency && r.status === "active",
    )

    if (rate && rate.rate > 0) {
      return amount / rate.rate
    }

    // If no direct conversion available, try via NGN as intermediate
    if (baseCurrency !== "NGN" && fromCurrency !== "NGN") {
      const toNGNRate = exchangeRates.find(
        (r) => r.from_currency === fromCurrency && r.to_currency === "NGN" && r.status === "active",
      )
      const fromNGNRate = exchangeRates.find(
        (r) => r.from_currency === "NGN" && r.to_currency === baseCurrency && r.status === "active",
      )

      if (toNGNRate && fromNGNRate) {
        const ngnAmount = amount * toNGNRate.rate
        return ngnAmount * fromNGNRate.rate
      }
    }

    // Fallback: return original amount if no conversion possible
    console.warn(`No exchange rate found for ${fromCurrency} to ${baseCurrency}`)
    return amount
  }

  const getDateFilter = (range: string) => {
    const date = new Date()
    switch (range) {
      case "today":
        date.setHours(0, 0, 0, 0)
        break
      case "week":
        date.setDate(date.getDate() - 7)
        break
      case "month":
        date.setMonth(date.getMonth() - 1)
        break
    }
    return date.toISOString()
  }

  const formatCurrency = (amount: number, currency = "NGN") => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      RUB: "₽",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }
    return `${symbols[currency] || currency + " "}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
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

  const processCurrencyPairs = (transactions: any[], baseCurrency: string, exchangeRates: any[]) => {
    const pairStats: { [key: string]: { volume: number; count: number; revenue: number } } = {}

    transactions.forEach((tx) => {
      const pair = `${tx.send_currency} → ${tx.receive_currency}`
      if (!pairStats[pair]) {
        pairStats[pair] = { volume: 0, count: 0, revenue: 0 }
      }

      // Convert volume to base currency
      const convertedVolume = convertToBaseCurrency(tx.send_amount, tx.send_currency, baseCurrency, exchangeRates)
      pairStats[pair].volume += convertedVolume
      pairStats[pair].count += 1
      pairStats[pair].revenue += convertedVolume * 0.02 // Assuming 2% fee
    })

    const totalVolume = Object.values(pairStats).reduce((sum, stat) => sum + stat.volume, 0)

    return Object.entries(pairStats)
      .map(([pair, stats]) => ({
        pair,
        volume: totalVolume > 0 ? (stats.volume / totalVolume) * 100 : 0,
        transactions: stats.count,
        revenue: Math.round(stats.revenue),
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
            <p className="text-gray-600">
              Monitor your platform's performance and key metrics (Base Currency: {baseCurrency})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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
              <div className="text-2xl font-bold text-gray-900">{stats.transactions.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">
                  {stats.transactionsChange} from last {timeRange}
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
              <div className="text-2xl font-bold text-gray-900">{stats.volume}</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">
                  {stats.volumeChange} from last {timeRange}
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
              <div className="text-2xl font-bold text-gray-900">{stats.users}</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">
                  {stats.usersChange} from last {timeRange}
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
              <CardDescription>Most popular trading pairs (Volume in {baseCurrency})</CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Volume %</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Revenue ({baseCurrency})</TableHead>
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
                      <TableCell>{formatCurrency(item.revenue, baseCurrency)}</TableCell>
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
