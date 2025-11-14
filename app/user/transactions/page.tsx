"use client"

import { useState } from "react"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useUserData } from "@/hooks/use-user-data"
import Link from "next/link"

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
    account_number: string
    bank_name: string
  }
}

export default function UserTransactionsPage() {
  const { transactions, currencies, loading } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981" // green
      case "processing":
        return "#f59e0b" // yellow
      case "pending":
        return "#6b7280" // gray
      case "failed":
        return "#ef4444" // red
      case "cancelled":
        return "#6b7280" // gray
      default:
        return "#6b7280"
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }



  return (
    <UserDashboardLayout>
      <div className="space-y-0">
        {/* Header - Mobile Style */}
        <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Transaction History</h1>
          <p className="text-base text-gray-600">View all your transfers</p>
        </div>

        {/* Search Bar */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-600 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Start by sending your first transfer"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              if (!transaction) return null
              const statusColor = getStatusColor(transaction.status)
              return (
                <Link
                  href={`/user/send/${transaction.transaction_id.toLowerCase()}`}
                  key={transaction.id}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-xs sm:text-sm text-gray-500 font-mono">
                          {transaction.transaction_id}
                        </span>
                        <span
                          className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Recipient Info */}
                      <div className="mb-4 sm:mb-5">
                        <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-1">
                          To
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          {transaction.recipient?.full_name || "Unknown"}
                        </div>
                      </div>

                      {/* Amount Section */}
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                            Send Amount
                          </span>
                          <span className="text-base sm:text-lg font-semibold text-gray-900">
                            {formatAmount(transaction.send_amount, transaction.send_currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                            Receive Amount
                          </span>
                          <span className="text-base sm:text-lg font-semibold text-green-600">
                            {formatAmount(transaction.receive_amount, transaction.receive_currency)}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-300 font-light">›</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}
