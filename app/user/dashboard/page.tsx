"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { formatCurrency } from "@/utils/currency"
import { ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff, TrendingUp, Users, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function UserDashboard() {
  const { userProfile } = useAuth()
  const { transactions, recipients, loading } = useUserData()
  const [showBalance, setShowBalance] = useState(true)

  // Mock balance data - replace with real data
  const balance = 125000
  const baseCurrency = userProfile?.base_currency || "NGN"

  // Get recent transactions (last 5)
  const recentTransactions = transactions?.slice(0, 5) || []

  // Calculate stats
  const totalSent = transactions?.reduce((sum, tx) => (tx.type === "send" ? sum + tx.amount : sum), 0) || 0
  const totalReceived = transactions?.reduce((sum, tx) => (tx.type === "receive" ? sum + tx.amount : sum), 0) || 0
  const pendingTransactions = transactions?.filter((tx) => tx.status === "pending").length || 0

  return (
    <AuthGuard>
      <UserDashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userProfile?.first_name || "User"}!</h1>
              <p className="text-gray-600">Here's what's happening with your money today.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/user/send">
                <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
              </Link>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-novapay-primary to-novapay-primary-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white/90">Available Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{showBalance ? formatCurrency(balance, baseCurrency) : "••••••"}</div>
              <p className="text-white/80 text-sm mt-1">
                {baseCurrency} • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSent, baseCurrency)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalReceived, baseCurrency)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipients?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Saved recipients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTransactions}</div>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest money transfers</CardDescription>
                </div>
                <Link href="/user/transactions">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "send" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {transaction.type === "send" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === "send" ? "Sent to" : "Received from"} {transaction.recipient_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === "send" ? "text-red-600" : "text-green-600"}`}>
                          {transaction.type === "send" ? "-" : "+"}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600 mb-4">Start by sending money to someone</p>
                  <Link href="/user/send">
                    <Button>Send Money</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/user/send">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                    <ArrowUpRight className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Send Money</div>
                      <div className="text-sm text-gray-600">Transfer to anyone</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/user/recipients">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                    <Users className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Recipients</div>
                      <div className="text-sm text-gray-600">Manage saved recipients</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/user/transactions">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                    <TrendingUp className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Transaction History</div>
                      <div className="text-sm text-gray-600">View all transactions</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
