"use client"
import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Search, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { transactionService } from "@/lib/database"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserTransactionsPage() {
  const { userProfile } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const loadTransactions = async () => {
      if (!userProfile?.id) return

      try {
        const userTransactions = await transactionService.getByUserId(userProfile.id)
        setTransactions(userTransactions)
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
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
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <UserDashboardLayout>
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600">View and manage your money transfers</p>
              </div>
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by recipient name or transaction ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      onClick={() => setStatusFilter("pending")}
                      size="sm"
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "completed" ? "default" : "outline"}
                      onClick={() => setStatusFilter("completed")}
                      size="sm"
                    >
                      Completed
                    </Button>
                    <Button
                      variant={statusFilter === "failed" ? "default" : "outline"}
                      onClick={() => setStatusFilter("failed")}
                      size="sm"
                    >
                      Failed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowUpRight className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Start by sending your first money transfer"}
                    </p>
                    <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Send Money
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="h-6 w-6 text-novapay-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              To {transaction.recipients?.full_name || "Unknown Recipient"}
                            </p>
                            <p className="text-sm text-gray-600">ID: {transaction.transaction_id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(transaction.send_amount, transaction.send_currency)}
                            </p>
                            <span className="text-gray-400">→</span>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
