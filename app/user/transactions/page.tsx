"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Search, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { transactionService } from "@/lib/database"
import { formatCurrency } from "@/utils/currency"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface Transaction {
  id: string
  transaction_id: string
  send_amount: number
  send_currency: string
  receive_amount: number
  receive_currency: string
  status: string
  created_at: string
  recipient: {
    full_name: string
  }
}

function UserTransactionsContent() {
  const { userProfile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userProfile?.id) return

      try {
        const userTransactions = await transactionService.getByUserId(userProfile.id)
        setTransactions(userTransactions || [])
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userProfile?.id])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">View and manage your transaction history</p>
          </div>
          <Link href="/user/send">
            <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Send className="h-4 w-4 mr-2" />
              Send Money
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-novapay-primary focus:ring-novapay-primary"
            />
          </div>

          <div className="flex gap-3">
            {["all", "completed", "processing", "pending", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors outline-none capitalize ${
                  statusFilter === status
                    ? "bg-novapay-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="font-medium">{status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {searchTerm || statusFilter !== "all"
                    ? "No transactions found matching your criteria."
                    : "No transactions yet. Start by sending money!"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/user/send">
                    <Button className="mt-4 bg-novapay-primary hover:bg-novapay-primary-600">Send Money</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Link href={`/user/send/${transaction.transaction_id.toLowerCase()}`} key={transaction.id}>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-novapay-primary-200 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                          <Send className="h-6 w-6 text-novapay-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.recipient?.full_name || "Unknown Recipient"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.transaction_id} • {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(transaction.send_amount, transaction.send_currency)}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(transaction.status)}
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}

export default function UserTransactionsPage() {
  return (
    <ProtectedRoute>
      <UserTransactionsContent />
    </ProtectedRoute>
  )
}
