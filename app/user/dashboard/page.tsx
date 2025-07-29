"use client"
import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, DollarSign, Activity } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { transactionService } from "@/lib/database"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserDashboardPage() {
  const { userProfile } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile?.id) return

      try {
        const userTransactions = await transactionService.getByUserId(userProfile.id)
        setTransactions(userTransactions.slice(0, 5)) // Show only recent 5

        // Calculate stats
        const totalSent = userTransactions
          .filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + t.send_amount, 0)

        const totalReceived = userTransactions
          .filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + t.receive_amount, 0)

        const pendingTransactions = userTransactions.filter((t) => t.status === "pending").length

        const completedTransactions = userTransactions.filter((t) => t.status === "completed").length

        setStats({
          totalSent,
          totalReceived,
          pendingTransactions,
          completedTransactions,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [userProfile?.id])

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      RUB: "₽",
      NGN: "₦",
      USD: "$",
      EUR: "€",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <UserDashboardLayout>
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </UserDashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userProfile?.full_name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-gray-600">Here's what's happening with your money transfers</p>
              </div>
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalSent, "RUB")}</div>
                  <p className="text-xs text-muted-foreground">From all currencies in your base currency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalReceived, "NGN")}</div>
                  <p className="text-xs text-muted-foreground">From all currencies in your base currency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">Transactions in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedTransactions}</div>
                  <p className="text-xs text-muted-foreground">Successful transfers</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600 mb-4">Start by sending your first money transfer</p>
                    <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Send Money
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5 text-novapay-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              To {transaction.recipients?.full_name || "Unknown Recipient"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(transaction.send_amount, transaction.send_currency)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Button variant="outline">View All Transactions</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
