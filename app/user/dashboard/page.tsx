"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyConverter } from "@/components/currency-converter"
import { Send, History, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user-data"
import { formatCurrency } from "@/utils/currency"

export default function UserDashboardPage() {
  const { data } = useUserData()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    }
    return statusConfig[status as keyof typeof statusConfig] || "bg-gray-100 text-gray-800"
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your account overview.</p>
            </div>
            <Button asChild className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Link href="/user/send">
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data?.stats.totalSent || 0, "NGN")}
                </div>
                <p className="text-xs text-gray-500 mt-1">Across all currencies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
                <History className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data?.stats.totalTransactions || 0}</div>
                <p className="text-xs text-green-600 mt-1">+{data?.stats.thisMonthTransactions || 0} this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Recipients</CardTitle>
                <Users className="h-4 w-4 text-novapay-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data?.stats.totalRecipients || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Saved recipients</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currency Converter */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Converter</CardTitle>
                <CardDescription>Check current exchange rates</CardDescription>
              </CardHeader>
              <CardContent>
                <CurrencyConverter />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest money transfers</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/user/transactions">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.recentTransactions?.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">{getStatusIcon(transaction.status)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.recipient?.full_name || "Unknown Recipient"}
                            </p>
                            <Badge className={getStatusBadge(transaction.status)}>{transaction.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {transaction.send_currency} → {transaction.receive_currency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.send_amount, transaction.send_currency)}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )) || []}
                  {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start by sending money to someone</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
