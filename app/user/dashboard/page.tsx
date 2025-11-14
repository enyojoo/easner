"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Users, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  transaction_id: string
  send_amount: number
  send_currency: string
  receive_amount?: number
  receive_currency?: string
  status: string
  created_at: string
  recipient: {
    full_name: string
  }
}

export default function UserDashboardPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const { transactions, currencies, exchangeRates, loading } = useUserData()
  const [totalSent, setTotalSent] = useState(0)

  useEffect(() => {
    if (!userProfile?.id || !transactions?.length || !exchangeRates?.length) return

    try {
      const calculateTotalSent = () => {
        const baseCurrency = userProfile.base_currency || "NGN"
        let totalInBaseCurrency = 0

        for (const transaction of transactions) {
          if (!transaction || transaction.status !== "completed") continue

          let amountInBaseCurrency = transaction.send_amount || 0

          // If transaction currency is different from base currency, convert it
          if (transaction.send_currency !== baseCurrency) {
            // Find exchange rate from transaction currency to base currency
            const rate = exchangeRates.find(
              (r) => r && r.from_currency === transaction.send_currency && r.to_currency === baseCurrency,
            )

            if (rate && rate.rate > 0) {
              amountInBaseCurrency = transaction.send_amount * rate.rate
            } else {
              // If direct rate not found, try reverse rate
              const reverseRate = exchangeRates.find(
                (r) => r && r.from_currency === baseCurrency && r.to_currency === transaction.send_currency,
              )
              if (reverseRate && reverseRate.rate > 0) {
                amountInBaseCurrency = transaction.send_amount / reverseRate.rate
              }
            }
          }

          totalInBaseCurrency += amountInBaseCurrency
        }

        setTotalSent(totalInBaseCurrency)
      }

      calculateTotalSent()
    } catch (error) {
      console.error("Error calculating total sent:", error)
      setTotalSent(0)
    }
  }, [transactions, exchangeRates, userProfile])

  const userName = userProfile?.first_name || "User"
  const baseCurrency = userProfile?.base_currency || "NGN"
  const completedTransactions = transactions?.filter((t) => t && t.status === "completed").length || 0
  const totalSentValue = totalSent || 0

  const formatCurrencyValue = (amount: number, currencyCode: string) => {
    try {
      const currency = currencies?.find((c) => c && c.code === currencyCode)
      return `${currency?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } catch (error) {
      console.error("Error formatting currency:", error)
      return `${currencyCode} ${amount.toFixed(2)}`
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyInfo = currencies?.find((c) => c && c.code === currency)
    return `${currencyInfo?.symbol || currency} ${amount.toLocaleString()}`
  }

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

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    // Format: "Nov 07, 2025 • 7:29 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const recentTransactions = transactions?.slice(0, 3) || []

  return (
    <UserDashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Page Header - Mobile Style */}
        <div className="bg-white p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hi {userName} 👋🏻</h1>
            <button
              onClick={() => router.push("/user/support")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Support"
            >
              <MessageCircle className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Mobile Style */}
        <div className="px-5 sm:px-6 flex gap-3 sm:gap-6">
          <Card className="flex-[1.5] sm:flex-1">
            <CardContent className="p-5 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {formatCurrencyValue(totalSentValue, baseCurrency)}
              </div>
              <div className="text-base sm:text-lg font-medium text-gray-600">Total Sent</div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-5 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{completedTransactions}</div>
              <div className="text-base sm:text-lg font-medium text-gray-600">Transactions</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Style */}
        <div className="px-5 sm:px-6 flex gap-3 sm:gap-6">
          <Link href="/user/send" className="flex-1">
            <Button className="w-full bg-easner-primary hover:bg-easner-primary-600 h-14 sm:h-16 text-base sm:text-lg font-semibold">
              <Send className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Send Money
            </Button>
          </Link>
          <Link href="/user/recipients" className="flex-1">
            <Button variant="outline" className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold border-easner-primary text-easner-primary hover:bg-easner-primary-50">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Recipients
            </Button>
          </Link>
        </div>

        {/* Recent Transactions - Mobile Style */}
        <div className="px-5 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/user/transactions">
              <button className="text-sm sm:text-base text-easner-primary font-medium hover:underline">
                See All
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
              <p className="text-base sm:text-lg text-gray-600 mb-4">No recent transactions</p>
              <Link href="/user/send">
                <Button className="bg-easner-primary hover:bg-easner-primary-600">
                  Send Your First Transfer
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {recentTransactions.map((transaction) => {
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
                          {transaction.receive_amount && transaction.receive_currency && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                Receive Amount
                              </span>
                              <span className="text-base sm:text-lg font-semibold text-green-600">
                                {formatAmount(transaction.receive_amount, transaction.receive_currency)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatTimestamp(transaction.created_at)}
                          </span>
                          <span className="text-lg sm:text-xl text-gray-300 font-light">›</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}