"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Users, MessageCircle, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"
import { useRouter } from "next/navigation"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

interface Transaction {
  id: string
  transaction_id: string
  type?: "send" | "receive" | "card_funding"
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  status: string
  created_at: string
  recipient?: {
    full_name: string
  }
  // Receive transaction fields
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  // Card funding fields
  destination_type?: "bank" | "card"
  bridge_card_account_id?: string
}

export default function UserDashboardPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const { transactions, currencies, exchangeRates, loading } = useUserData()
  const [totalSent, setTotalSent] = useState(0)
  const [cardTransactions, setCardTransactions] = useState<any[]>([])

  // Fetch card transactions
  useEffect(() => {
    if (!userProfile?.id) return

    const fetchCardTransactions = async () => {
      try {
        // Fetch all cards first
        const cardsResponse = await fetch("/api/cards", {
          credentials: "include",
        })
        
        if (cardsResponse.ok) {
          const cardsData = await cardsResponse.json()
          const cards = cardsData.cards || []
          
          // Fetch transactions for all cards
          const transactionPromises = cards.map((card: any) =>
            fetch(`/api/cards/${card.id}/transactions`, {
              credentials: "include",
            })
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
          
          const transactionResults = await Promise.all(transactionPromises)
          
          // Combine all card transactions (only debit/spending transactions)
          const allCardTransactions: any[] = []
          transactionResults.forEach((result) => {
            if (result && result.transactions) {
              const debitTransactions = result.transactions
                .filter((tx: any) => {
                  // Only include debit transactions (spending)
                  const amount = parseFloat(tx.amount || "0")
                  return amount < 0 || tx.type === "debit"
                })
                .map((tx: any) => ({
                  ...tx,
                  amount: Math.abs(parseFloat(tx.amount || "0")),
                  currency: tx.currency || "USD",
                }))
              allCardTransactions.push(...debitTransactions)
            }
          })
          
          setCardTransactions(allCardTransactions)
        }
      } catch (error) {
        console.error("Error fetching card transactions:", error)
      }
    }

    fetchCardTransactions()
  }, [userProfile?.id])

  // Helper function to convert amount to base currency
  const convertToBaseCurrency = (
    amount: number,
    fromCurrency: string,
    baseCurrency: string,
    exchangeRates: any[]
  ): number => {
    if (fromCurrency === baseCurrency) return amount

    // Find exchange rate from transaction currency to base currency
    const rate = exchangeRates.find(
      (r) => r && r.from_currency === fromCurrency && r.to_currency === baseCurrency,
    )

    if (rate && rate.rate > 0) {
      return amount * rate.rate
    }

    // If direct rate not found, try reverse rate
    const reverseRate = exchangeRates.find(
      (r) => r && r.from_currency === baseCurrency && r.to_currency === fromCurrency,
    )
    if (reverseRate && reverseRate.rate > 0) {
      return amount / reverseRate.rate
    }

    // If no rate found, return original amount (assume same currency)
    return amount
  }

  useEffect(() => {
    if (!userProfile?.id) {
      setTotalSent(0)
      return
    }

    // Need exchange rates for currency conversion
    if (!exchangeRates || exchangeRates.length === 0) {
      // If no exchange rates yet, wait (don't set to 0, keep previous value)
      return
    }

    // If transactions is not loaded yet (still loading), wait
    if (loading) {
      return
    }

    try {
      const calculateTotalSpent = () => {
        const baseCurrency = userProfile.base_currency || "NGN"
        let totalInBaseCurrency = 0

        const transactionsList = transactions || []

        // 1. Send transactions: use receive_amount (what recipient gets)
        const sendTransactions = transactionsList.filter((t) => {
          if (!t) return false
          // Must be completed
          if (t.status !== "completed") return false
          // If type is explicitly set, use it
          if (t.type === "send") return true
          // Exclude receive and card_funding
          if (t.type === "receive" || t.type === "card_funding") return false
          // If type is not set but has send_amount/receive_amount, it's a send transaction
          // Also check if it has recipient (send transactions have recipients)
          if (t.send_amount || t.receive_amount || t.recipient) return true
          return false
        })


        for (const transaction of sendTransactions) {
          // Use receive_amount if available, otherwise fall back to send_amount
          const amount = transaction.receive_amount || transaction.send_amount || 0
          const currency = transaction.receive_currency || transaction.send_currency || baseCurrency
          
          if (amount > 0) {
            const amountInBaseCurrency = convertToBaseCurrency(
              amount,
              currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        // 2. Receive transactions: use fiat_amount (what user received as payout)
        // Only include if type is explicitly "receive" (not card_funding)
        const receiveTransactions = transactionsList.filter((t) => {
          if (!t) return false
          if (t.status !== "completed") return false
          // Must be explicitly marked as receive (not card_funding)
          return t.type === "receive" && t.destination_type === "bank"
        })

        for (const transaction of receiveTransactions) {
          if (transaction.fiat_amount && transaction.fiat_currency) {
            const amountInBaseCurrency = convertToBaseCurrency(
              transaction.fiat_amount,
              transaction.fiat_currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        // 3. Card transactions: use amount spent (debit transactions)
        for (const cardTx of cardTransactions || []) {
          if (cardTx.amount && cardTx.currency && cardTx.amount > 0) {
            const amountInBaseCurrency = convertToBaseCurrency(
              cardTx.amount,
              cardTx.currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        setTotalSent(totalInBaseCurrency)
      }

      calculateTotalSpent()
    } catch (error) {
      console.error("Error calculating total spent:", error)
      setTotalSent(0)
    }
  }, [transactions, exchangeRates, userProfile, cardTransactions])

  // Extract first name only (in case first_name contains full name)
  const userName = userProfile?.first_name?.split(' ')[0] || "User"
  const baseCurrency = userProfile?.base_currency || "NGN"
  const completedTransactions = transactions?.filter((t) => t && t.status === "completed").length || 0
  const totalSentValue = totalSent > 0 ? totalSent : 0

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
      case "deposited":
        return "#10b981" // green
      case "processing":
      case "converting":
      case "converted":
        return "#f59e0b" // yellow
      case "pending":
      case "confirmed":
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

  const recentTransactions = transactions?.slice(0, 2) || []

  // Check if we have valid data to display
  const hasValidData = 
    transactions && 
    currencies && currencies.length > 0 && 
    exchangeRates && exchangeRates.length > 0

  // Show skeleton only if:
  // 1. Actually loading AND no data available, OR
  // 2. No user profile
  // This prevents flickering when navigating with cached data
  if ((loading && !hasValidData) || !userProfile) {
    return (
      <UserDashboardLayout>
        <DashboardSkeleton />
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-5 sm:space-y-6 pb-5 sm:pb-6">
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
              <div className="text-base sm:text-lg font-medium text-gray-600">Total Volume</div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-5 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{completedTransactions}</div>
              <div className="text-base sm:text-lg font-medium text-gray-600">Transactions</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Minimal Modern Banking Style (All Screen Sizes) */}
        <div className="px-5 sm:px-6 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Send Button */}
          <Link href="/user/send" className="flex-1 group">
            <div className="w-full flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-4 sm:py-5 cursor-pointer transition-all duration-200">
              <div className="p-3 sm:p-3.5 rounded-full bg-[#007ACC]/10 group-hover:bg-[#007ACC]/20 transition-colors">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-[#007ACC]" />
              </div>
              <span className="text-[#007ACC] text-xs sm:text-sm font-semibold tracking-wide">Send</span>
            </div>
          </Link>
          
          {/* Recipient Button */}
          <Link href="/user/recipients" className="flex-1 group">
            <div className="w-full flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-4 sm:py-5 cursor-pointer transition-all duration-200">
              <div className="p-3 sm:p-3.5 rounded-full bg-[#007ACC]/10 group-hover:bg-[#007ACC]/20 transition-colors">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-[#007ACC]" />
              </div>
              <span className="text-[#007ACC] text-xs sm:text-sm font-semibold tracking-wide">Recipient</span>
            </div>
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

          {!transactions || transactions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
              <p className="text-base sm:text-lg text-gray-600 mb-4">No recent transactions</p>
              <Link href="/user/send">
                <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#007ACC] to-[#005A9E] hover:from-[#0088E0] hover:to-[#0066B8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                  Send Your First Transfer
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {recentTransactions.map((transaction) => {
                if (!transaction) return null
                const statusColor = getStatusColor(transaction.status)
                
                // Determine transaction type: send, receive (bank), or card_funding
                let transactionType: "send" | "receive" | "card_funding" = "send"
                if (transaction.type === "receive" || transaction.type === "card_funding") {
                  transactionType = transaction.type
                } else if (transaction.destination_type === "card") {
                  transactionType = "card_funding"
                } else if (transaction.destination_type === "bank" || transaction.crypto_amount) {
                  transactionType = "receive"
                }
                
                const detailUrl =
                  transactionType === "send"
                    ? `/user/send/${transaction.transaction_id.toLowerCase()}`
                    : `/user/receive/${transaction.transaction_id.toLowerCase()}`

                return (
                  <Link
                    href={detailUrl}
                    key={transaction.id}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 sm:p-5">
                        {/* Transaction Header */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                transactionType === "send"
                                  ? "default"
                                  : transactionType === "card_funding"
                                  ? "outline"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {transactionType === "send"
                                ? "Send"
                                : transactionType === "card_funding"
                                ? "Card Funding"
                                : "Receive"}
                            </Badge>
                            <span className="text-xs sm:text-sm text-gray-500 font-mono">
                              {transaction.transaction_id}
                            </span>
                          </div>
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

                        {transactionType === "send" ? (
                          <>
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
                                  {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
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
                          </>
                        ) : transactionType === "card_funding" ? (
                          <>
                            {/* Card Funding Info */}
                            <div className="mb-4 sm:mb-5">
                              <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-1">
                                Card Top-Up
                              </div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">
                                {formatAmount(transaction.crypto_amount || 0, transaction.crypto_currency || "USDC")}
                              </div>
                            </div>

                            {/* Amount Section */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                              {transaction.fiat_amount && transaction.fiat_currency && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                    Card Currency
                                  </span>
                                  <span className="text-base sm:text-lg font-semibold text-green-600">
                                    {formatAmount(transaction.fiat_amount, transaction.fiat_currency)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Receive Transaction Info */}
                            <div className="mb-4 sm:mb-5">
                              <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-1">
                                Stablecoin Received
                              </div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">
                                {formatAmount(transaction.crypto_amount || 0, transaction.crypto_currency || "USDC")}
                              </div>
                            </div>

                            {/* Amount Section */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                              {transaction.fiat_amount && transaction.fiat_currency && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                    Converted To
                                  </span>
                                  <span className="text-base sm:text-lg font-semibold text-green-600">
                                    {formatAmount(transaction.fiat_amount, transaction.fiat_currency)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}

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