"use client"

import { useState, useEffect, useMemo } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface CardTransaction {
  id: string
  card_id: string
  amount: number
  currency: string
  direction: "credit" | "debit"
  description: string
  merchant_name?: string
  status: string
  type: string
  created_at: string
}

export default function CardTransactionsPage() {
  const { userProfile } = useAuth()
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Initialize from cache synchronously to prevent reload flicker
  const getInitialTransactions = (): CardTransaction[] | null => {
    if (!userProfile?.id) return null
    try {
      const cached = localStorage.getItem(`easner_all_card_transactions_${userProfile.id}`)
      if (!cached) return null
      const { value, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return value
      }
      return null
    } catch {
      return null
    }
  }

  const [allTransactions, setAllTransactions] = useState<CardTransaction[]>(() => getInitialTransactions() || [])

  // Fetch all card transactions - only if not in cache
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_all_card_transactions_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000

    const getCachedTransactions = (): CardTransaction[] | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        localStorage.removeItem(CACHE_KEY)
        return null
      } catch {
        return null
      }
    }

    const setCachedTransactions = (value: CardTransaction[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Data is already loaded from cache in initial state
    // Only fetch if cache is missing or expired
    const cachedTransactions = getCachedTransactions()

    // Update state if cache exists and state is empty (only on first mount)
    if (cachedTransactions !== null && allTransactions.length === 0) {
      setAllTransactions(cachedTransactions)
    }

    // If cache exists and is valid, no need to fetch
    if (cachedTransactions !== null) {
      return
    }

    // Only fetch missing or expired data
    const fetchAllTransactions = async () => {
      // Only show loading if we don't have any cached data
      if (allTransactions.length === 0) {
        setLoading(true)
      }
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
            }).then(res => res.ok ? res.json() : null)
          )
          
          const transactionResults = await Promise.all(transactionPromises)
          
          // Combine all transactions
          const allCardTransactions: CardTransaction[] = []
          transactionResults.forEach((result, index) => {
            if (result && result.transactions) {
              const transformed = result.transactions.map((tx: any) => ({
                ...tx,
                id: tx.id || `${cards[index].id}_${tx.created_at}`,
                card_id: cards[index].id,
                direction: tx.type === "credit" || parseFloat(tx.amount) > 0 ? "credit" : "debit",
                description: tx.merchant_name || tx.type || "Transaction",
                amount: Math.abs(parseFloat(tx.amount)),
                currency: tx.currency || cards[index].currency || "USD",
              }))
              allCardTransactions.push(...transformed)
            }
          })
          
          // Sort by date (newest first)
          allCardTransactions.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          setAllTransactions(allCardTransactions)
          setCachedTransactions(allCardTransactions)
        }
      } catch (error) {
        console.error("Error fetching card transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllTransactions()
  }, [userProfile?.id])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return allTransactions
    
    const searchLower = searchTerm.toLowerCase()
    return allTransactions.filter((tx) => {
      const description = (tx.description || "").toLowerCase()
      const merchant = (tx.merchant_name || "").toLowerCase()
      const amount = formatCurrency(tx.amount, tx.currency).toLowerCase()
      return description.includes(searchLower) || merchant.includes(searchLower) || amount.includes(searchLower)
    })
  }, [allTransactions, searchTerm])

  if (loading && allTransactions.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-1">
              <Link href="/user/card">
                <button className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Card Transactions</h1>
                <p className="text-base text-gray-600">View all your card transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300"
            />
          </div>

          {/* Transactions List */}
          <div className="space-y-4 sm:space-y-5">
            {filteredTransactions.length === 0 ? (
              <Card className="border border-gray-200">
                <CardContent className="p-8 text-center">
                  <p className="text-base text-gray-600">
                    {searchTerm ? "No transactions found matching your search" : "No transactions found"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => {
                const statusColor = transaction.status === "success" || transaction.status === "completed" 
                  ? "#10b981" 
                  : transaction.status === "pending" 
                  ? "#f59e0b" 
                  : "#ef4444"
                
                return (
                  <Card
                    key={transaction.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`rounded-full p-2 flex-shrink-0 ${
                              transaction.direction === "credit"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {transaction.direction === "credit" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                              {transaction.description || transaction.merchant_name || "Transaction"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs sm:text-sm text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </p>
                              <span className="text-gray-400">•</span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                                style={{
                                  backgroundColor: `${statusColor}20`,
                                  color: statusColor,
                                }}
                              >
                                {transaction.status === "success" || transaction.status === "completed" 
                                  ? "Success" 
                                  : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p
                          className={`text-sm sm:text-base font-semibold tabular-nums ml-4 ${
                            transaction.direction === "credit" ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {transaction.direction === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount, transaction.currency || "USD")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}


