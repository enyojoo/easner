"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"

interface Transaction {
  id: string
  transaction_id: string
  send_amount: number
  send_currency: string
  status: string
  created_at: string
  recipient: {
    full_name: string
  }
}

export default function UserDashboardPage() {
  const { userProfile, loading: authLoading } = useAuth()
  const { transactions, currencies, exchangeRates, loading: dataLoading, error } = useUserData()
  const [totalSent, setTotalSent] = useState(0)

  // Debug logging
  console.log("Dashboard Debug:", {
    userProfile: userProfile?.id,
    authLoading,
    dataLoading,
    error,
    transactionsCount: transactions?.length,
    currenciesCount: currencies?.length,
    exchangeRatesCount: exchangeRates?.length
  })

  // Show error if data loading failed
  if (error) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-easner-primary text-white px-4 py-2 rounded-lg hover:bg-easner-primary-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  // Show loading while auth or data is loading
  if (authLoading || dataLoading) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-easner-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  // If no user profile, show error
  if (!userProfile) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load profile</h3>
            <p className="text-gray-600 mb-4">Please try logging in again</p>
            <button 
              onClick={() => window.location.href = "/login"} 
              className="bg-easner-primary text-white px-4 py-2 rounded-lg hover:bg-easner-primary-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

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

  try {
    return (
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi {userName} 👋🏻</h1>
          <p className="text-gray-600">Overview of your account and recent activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
              <TrendingUp className="h-4 w-4 text-easner-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrencyValue(totalSentValue, baseCurrency)}
              </div>
              <p className="text-xs text-gray-500">From all currencies in your base currency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
              <Send className="h-4 w-4 text-easner-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{completedTransactions}</div>
              <p className="text-xs text-green-600">Completed transactions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Send Money Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Send</CardTitle>
              <CardDescription>Send money instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-easner-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-easner-primary" />
                </div>
                <p className="text-sm text-gray-600 mb-4">Start a new money transfer</p>
                <Link href="/user/send">
                  <Button className="w-full bg-easner-primary hover:bg-easner-primary-600">Send Money</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
                <CardDescription>Your latest money transfers</CardDescription>
              </div>
              <Link href="/user/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
            { dataLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No transactions yet</div>
                ) : (
                  transactions.slice(0, 3).map((transaction) => {
                    if (!transaction) return null
                    return (
                    <Link href={`/user/send/${transaction.transaction_id.toLowerCase()}`} key={transaction.id}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-easner-primary-100 rounded-full flex items-center justify-center">
                            <Send className="h-5 w-5 text-easner-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.recipient?.full_name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrencyValue(transaction.send_amount, transaction.send_currency)}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
    )
  } catch (error) {
    console.error("Dashboard render error:", error)
    return (
      <UserDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">There was an error loading the dashboard</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-easner-primary text-white px-4 py-2 rounded-lg hover:bg-easner-primary-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }
}