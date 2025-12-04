"use client"

import { useState, useEffect } from "react"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { TransactionsSkeleton } from "@/components/transactions-skeleton"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "receive"
  status: string
  created_at: string
  // Send transaction fields
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
  }
  // Receive transaction fields
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  stellar_transaction_hash?: string
  crypto_wallet?: {
    wallet_address: string
    crypto_currency: string
  }
}

export default function UserTransactionsPage() {
  const { userProfile } = useAuth()
  const { transactions: userTransactions, currencies, loading: userDataLoading } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")

  // Initialize from cache synchronously to prevent reload flicker
  const getInitialTransactions = (): CombinedTransaction[] | null => {
    if (!userProfile?.id) return null
    try {
      const cached = localStorage.getItem(`easner_combined_transactions_${userProfile.id}`)
      if (!cached) return null
      const { value, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minute cache
        return value
      }
      return null
    } catch {
      return null
    }
  }

  const [transactions, setTransactions] = useState<CombinedTransaction[]>(() => getInitialTransactions() || [])
  const [loading, setLoading] = useState(false)

  // Fetch combined transactions - only if not in cache
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    const getCachedTransactions = (): CombinedTransaction[] | null => {
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

    const setCachedTransactions = (value: CombinedTransaction[]) => {
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
    if (cachedTransactions !== null && transactions.length === 0) {
      setTransactions(cachedTransactions)
    }

    // If cached and valid, no need to fetch
    if (cachedTransactions !== null) {
      return
    }

    // Only fetch missing or expired data
    const fetchCombinedTransactions = async () => {
      // Only show loading if we don't have any cached data
      if (transactions.length === 0) {
        setLoading(true)
      }
      try {
        // Fetch all transactions (both send and receive) from API
        const txResponse = await fetch(
          `/api/transactions?type=all&limit=100`,
          {
            credentials: 'include',
          }
        )
        if (txResponse.ok) {
          const txData = await txResponse.json()
          const transactionsList = txData.transactions || []
          setTransactions(transactionsList)
          setCachedTransactions(transactionsList)
        } else {
          // If API fails, fall back to userTransactions from useUserData (which has its own fallback)
          console.warn("API fetch failed, using cached transactions from useUserData")
          const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
          setTransactions(fallbackTransactions)
          if (fallbackTransactions.length > 0) {
            setCachedTransactions(fallbackTransactions)
          }
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        // Fall back to userTransactions from useUserData
        const fallbackTransactions = (userTransactions || []) as CombinedTransaction[]
        setTransactions(fallbackTransactions)
        if (fallbackTransactions.length > 0) {
          setCachedTransactions(fallbackTransactions)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCombinedTransactions()
  }, [userProfile?.id]) // Only fetch when user changes, not when userTransactions changes

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `easner_combined_transactions_${userProfile.id}`
    
    const setCachedTransactions = (value: CombinedTransaction[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    const fetchCombinedTransactions = async () => {
      try {
        const txResponse = await fetch(
          `/api/transactions?type=all&limit=100`,
          {
            credentials: 'include',
          }
        )
        if (txResponse.ok) {
          const txData = await txResponse.json()
          const transactionsList = txData.transactions || []
          setTransactions(transactionsList)
          setCachedTransactions(transactionsList)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    // Subscribe to send transactions table changes
    const sendTransactionsChannel = supabase
      .channel(`user-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('User transaction change received via Realtime:', payload.eventType)
          // Refetch transactions to get updated data
          await fetchCombinedTransactions()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user send transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('User send transactions subscription error, will refetch on next interaction')
        }
      })

    // Subscribe to receive transactions table changes
    const receiveTransactionsChannel = supabase
      .channel(`user-crypto-receive-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'crypto_receive_transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('User crypto receive transaction change received via Realtime:', payload.eventType)
          // Refetch transactions to get updated data
          await fetchCombinedTransactions()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user crypto receive transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('User crypto receive transactions subscription error')
        }
      })

    return () => {
      supabase.removeChannel(sendTransactionsChannel)
      supabase.removeChannel(receiveTransactionsChannel)
    }
  }, [userProfile?.id])

  // Show skeleton only if we're loading and have no data at all
  if ((loading || userDataLoading) && transactions.length === 0 && !userTransactions?.length) {
    return (
      <UserDashboardLayout>
        <TransactionsSkeleton />
      </UserDashboardLayout>
    )
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) return false
    
    // If no search term, show all transactions
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      transaction.transaction_id?.toLowerCase().includes(searchLower) ||
      (transaction.type === "send" &&
        transaction.recipient?.full_name?.toLowerCase().includes(searchLower)) ||
      (transaction.type === "receive" &&
        transaction.crypto_wallet?.wallet_address?.toLowerCase().includes(searchLower))
    return matchesSearch
  })

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
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-600 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">
                Start by sending your first transfer
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-600 mb-2">No transactions match your search</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              if (!transaction) return null
              const statusColor = getStatusColor(transaction.status)
              const transactionType = transaction.type || "send" // Default to send for backward compatibility
              const detailUrl =
                transactionType === "send"
                  ? `/user/send/${transaction.transaction_id.toLowerCase()}`
                  : `/user/receive/${transaction.transaction_id.toLowerCase()}`

              return (
                <Link href={detailUrl} key={transaction.id} className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={transactionType === "send" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {transactionType === "send" ? "Send" : "Receive"}
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
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                Receive Amount
                              </span>
                              <span className="text-base sm:text-lg font-semibold text-green-600">
                                {formatAmount(transaction.receive_amount || 0, transaction.receive_currency || "")}
                              </span>
                            </div>
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
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                Converted To
                              </span>
                              <span className="text-base sm:text-lg font-semibold text-green-600">
                                {formatAmount(transaction.fiat_amount || 0, transaction.fiat_currency || "")}
                              </span>
                            </div>
                            {transaction.crypto_wallet?.wallet_address && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                  Wallet
                                </span>
                                <span className="text-xs font-mono text-gray-500">
                                  {transaction.crypto_wallet.wallet_address.slice(0, 8)}...
                                  {transaction.crypto_wallet.wallet_address.slice(-6)}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

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
