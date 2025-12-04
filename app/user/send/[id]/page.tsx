"use client"

import { useState, useEffect, memo } from "react"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Clock, ExternalLink, XCircle, AlertTriangle, Copy } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { transactionService, paymentMethodService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { TransactionTimeline } from "@/components/transaction-timeline"
import { TransactionDetailsSkeleton } from "@/components/transaction-details-skeleton"
import { supabase } from "@/lib/supabase"
import type { Transaction } from "@/types"

function TransactionStatusPage() {
  const router = useRouter()
  const params = useParams()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { currencies } = useUserData()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [timerDuration, setTimerDuration] = useState(3600) // Payment method's completion_timer_seconds
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [paymentInfo, setPaymentInfo] = useState<{
    hasPayment: boolean
    payments: any[]
    latestPayment: any | null
  } | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const paymentMethodsData = await paymentMethodService.getAll()
        setPaymentMethods(paymentMethodsData || [])
      } catch (error) {
        console.error("Error loading payment methods:", error)
      }
    }

    loadPaymentMethods()
  }, [])

  // Initialize timer duration from payment method when transaction is loaded
  useEffect(() => {
    if (transaction && paymentMethods.length > 0) {
      const getDefaultPaymentMethod = (currency: string) => {
        const methods = paymentMethods.filter((pm) => pm.currency === currency && pm.status === "active")
        return methods.find((pm) => pm.is_default) || methods[0]
      }

      const defaultMethod = getDefaultPaymentMethod(transaction.send_currency)
      const timerSeconds = defaultMethod?.completion_timer_seconds ?? 3600
      setTimerDuration(timerSeconds)
    }
  }, [transaction, paymentMethods])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load transaction data from Supabase
  useEffect(() => {
    const loadTransaction = async () => {
      // Wait for auth to finish loading before attempting to load transaction
      if (authLoading) return
      
      // If no user is authenticated, redirect to login
      if (!user?.id) {
        router.push('/auth/user/login')
        return
      }
      
      if (!transactionId) {
        setHasAttemptedLoad(true)
        return
      }

      try {
        setError(null)
        setLoading(true)

        const transactionData = await transactionService.getById(transactionId.toUpperCase())

        // Verify this transaction belongs to the current user
        if (transactionData.user_id !== user.id) {
          setError("Transaction not found or access denied")
          setHasAttemptedLoad(true)
          return
        }

        setTransaction(transactionData)
        setHasAttemptedLoad(true)
      } catch (error) {
        console.error("Error loading transaction:", error)
        setError("Failed to load transaction details")
        setHasAttemptedLoad(true)
      } finally {
        setLoading(false)
      }
    }

    loadTransaction()
  }, [transactionId, user?.id, authLoading])

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!transaction || !user?.id || !transactionId) return

    // Set up Supabase Realtime subscription for instant updates
    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `transaction_id=eq.${transactionId.toUpperCase()}`,
        },
        async (payload) => {
          console.log('Transaction update received via Realtime:', payload)
          try {
            // Fetch full transaction data with relations
            const updatedTransaction = await transactionService.getById(transactionId.toUpperCase())
            if (updatedTransaction) {
              setTransaction(updatedTransaction)
            }
          } catch (error) {
            console.error("Error fetching updated transaction:", error)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to transaction updates via Realtime')
        } else if (status === 'CHANNEL_ERROR') {
          // Realtime subscription failed - this is expected if Realtime is not enabled
          // Polling fallback will handle updates instead (silent fallback)
        }
      })

    // Fallback: Poll every 5 seconds if Realtime is not available
    const pollInterval = setInterval(async () => {
      try {
        const updatedTransaction = await transactionService.getById(transaction.transaction_id)
        if (updatedTransaction.status !== transaction.status || 
            updatedTransaction.updated_at !== transaction.updated_at) {
          setTransaction(updatedTransaction)
        }
      } catch (error) {
        console.error("Error polling transaction status:", error)
      }
    }, 5000) // Poll every 5 seconds as fallback

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [transaction, user?.id, transactionId])

  // Load payment information for this transaction
  useEffect(() => {
    if (!transaction || !user?.id) return

    const loadPaymentInfo = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}/payment`, {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setPaymentInfo(data)
        }
      } catch (error) {
        console.error("Error loading payment info:", error)
      }
    }

    loadPaymentInfo()
  }, [transaction, transactionId, user?.id])

  const getTimeInfo = () => {
    if (!transaction) return { timeRemaining: 0, isOverdue: false, elapsedTime: 0 }

    const createdAt = new Date(transaction.created_at).getTime()
    const estimatedCompletionTime = 30 * 60 * 1000 // 30 minutes in milliseconds
    const targetCompletionTime = createdAt + estimatedCompletionTime
    const elapsedTime = currentTime - createdAt
    const timeRemaining = Math.max(0, targetCompletionTime - currentTime)
    const isOverdue = currentTime > targetCompletionTime

    return {
      timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
      isOverdue,
      elapsedTime: Math.floor(elapsedTime / 1000), // in seconds
    }
  }

  // Calculate elapsed time in seconds
  const getElapsedTime = (): number => {
    if (!transaction) return 0
    
    const createdAt = new Date(transaction.created_at).getTime()
    
    if (transaction.status === "completed") {
      // For completed, use completed_at or updated_at
      const completedAt = transaction.completed_at 
        ? new Date(transaction.completed_at).getTime()
        : new Date(transaction.updated_at).getTime()
      return Math.floor((completedAt - createdAt) / 1000)
    } else {
      // For pending/processing, use current time
      return Math.floor((currentTime - createdAt) / 1000)
    }
  }

  // Calculate remaining time for pending/processing
  const getRemainingTime = (): number => {
    const elapsed = getElapsedTime()
    const remaining = timerDuration - elapsed
    return Math.max(0, remaining)
  }

  // Calculate delay for completed transactions or when timer has finished
  const getDelay = (): number => {
    if (!transaction) return 0
    const elapsed = getElapsedTime()
    const delay = elapsed - timerDuration
    return Math.max(0, delay)
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get timer display text
  const getTimerDisplay = (): string | null => {
    if (!transaction) return null
    
    // Don't show timer for failed/cancelled
    if (transaction.status === "failed" || transaction.status === "cancelled") {
      return null
    }

    if (transaction.status === "completed") {
      const elapsed = getElapsedTime()
      const delay = getDelay()
      
      if (delay > 0) {
        return `Took ${formatTime(elapsed)} • Delayed ${formatTime(delay)}`
      } else {
        return `Took ${formatTime(elapsed)}`
      }
    } else {
      // Pending or processing
      const remaining = getRemainingTime()
      const delay = getDelay()
      
      // If timer has finished (remaining <= 0), show delayed time
      if (remaining <= 0 && delay > 0) {
        return `Delayed ${formatTime(delay)}`
      }
      
      // Otherwise show countdown
      return `Time left ${formatTime(remaining)}`
    }
  }


  const getStatusSteps = (currentStatus: string) => {
    // If transaction is failed or cancelled, show different steps
    if (currentStatus === "failed" || currentStatus === "cancelled") {
      return [
        {
          id: "pending",
          title: "Transaction Initiated",
          completed: true,
          icon: <Check className="h-4 w-4 text-white" />,
        },
        {
          id: "processing",
          title: "Payment Received",
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
        {
          id: "initiated",
          title: "Transfer Initiated",
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
        {
          id: "completed",
          title: currentStatus === "failed" ? "Transfer Failed" : "Transfer Cancelled",
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
      ]
    }

    return [
      {
        id: "pending",
        title: "Transaction Created",
        completed: true,
        icon: <Check className="h-4 w-4 text-white" />,
      },
        {
          id: "processing",
          title: "Payment Received",
          completed: ["processing", "completed"].includes(currentStatus),
          icon: ["processing", "completed"].includes(currentStatus) ? (
            <Check className="h-4 w-4 text-white" />
          ) : currentStatus === "pending" ? (
            <Clock className="h-4 w-4 text-white" />
          ) : (
            <span className="text-gray-500 text-xs">2</span>
          ),
        },
        {
          id: "completed",
          title: "Transfer Complete",
          completed: currentStatus === "completed",
            icon:
            currentStatus === "completed" ? (
              <Check className="h-4 w-4 text-white" />
            ) : currentStatus === "processing" ? (
              <Clock className="h-4 w-4 text-white" />
            ) : (
              <span className="text-gray-500 text-xs">3</span>
            ),
        },
    ]
  }

  const getStatusColor = (step: any, currentStatus: string) => {
    if (step.completed) return "bg-green-500"
    if (currentStatus === "failed" || currentStatus === "cancelled") return "bg-red-500"
    if (step.id === "processing" && currentStatus === "pending") return "bg-yellow-500"
    if (step.id === "completed" && currentStatus === "processing") return "bg-yellow-500"
    return "bg-gray-300"
  }

  const getStatusTextColor = (step: any, currentStatus: string) => {
    if (step.completed) return "text-green-600"
    if (currentStatus === "failed" || currentStatus === "cancelled") return "text-red-600"
    if (step.id === "processing" && currentStatus === "pending") return "text-yellow-600"
    if (step.id === "completed" && currentStatus === "processing") return "text-yellow-600"
    return "text-gray-500"
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
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

  const handleViewReceipt = () => {
    if (transaction?.receipt_url) {
      window.open(transaction.receipt_url, "_blank")
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return {
          title: "Transaction Created",
          description: "Your transfer has been created and is being processed",
          isCompleted: false,
        }
      case "processing":
        return {
          title: "Payment Received",
          description: "Your payment has been received and is being processed",
          isCompleted: false,
        }
      case "completed":
        return {
          title: "Transfer Complete!",
          description: "Your money has been successfully transferred",
          isCompleted: true,
        }
      case "failed":
        return {
          title: "Transaction Failed",
          description: "There was an issue with your transaction. Please contact support.",
          isCompleted: false,
        }
      case "cancelled":
        return {
          title: "Transaction Cancelled",
          description: "This transaction has been cancelled. You will receive a refund if payment was made.",
          isCompleted: false,
        }
      default:
        return {
          title: "Transaction Processing",
          description: "Your transaction is being processed",
          isCompleted: false,
        }
    }
  }

  if (hasAttemptedLoad && (error || !transaction)) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">{error || "Transaction not found"}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/user/dashboard")}
                  className="bg-easner-primary hover:bg-easner-primary-600"
                >
                  Back to Dashboard
                </Button>
                {error && error.includes("access denied") && (
                  <Button
                    onClick={() => router.push("/auth/user/login")}
                    variant="outline"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  // Show loading only if we haven't attempted to load yet or if auth is still loading
  if (authLoading || (!hasAttemptedLoad && !transaction)) {
    return (
      <UserDashboardLayout>
        <TransactionDetailsSkeleton />
      </UserDashboardLayout>
    )
  }

  const statusMessage = getStatusMessage(transaction.status)
  const statusSteps = getStatusSteps(transaction.status)
  const { timeRemaining, isOverdue } = getTimeInfo()

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 leading-none">
                    <div className="flex flex-col gap-1 items-center sm:items-start">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">Transaction Status</span>
                      <span className="text-3xl font-bold text-gray-900 leading-tight">
                        {transaction && formatCurrency(transaction.send_amount, transaction.send_currency)}
                      </span>
                      {transaction && getTimerDisplay() && (
                        <div className="flex items-center justify-center sm:hidden text-orange-600 mt-2">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="font-mono text-sm">{getTimerDisplay()}</span>
                        </div>
                      )}
                    </div>
                    {transaction && getTimerDisplay() && (
                      <div className="hidden sm:flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono text-sm">{getTimerDisplay()}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Transaction ID for pending, processing, or completed statuses */}
                  {transaction.status === "pending" ||
                  transaction.status === "processing" ||
                  transaction.status === "completed" ? (
                    <div className="pb-4 border-b">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-600">Transaction ID</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">{transaction.transaction_id}</span>
                          <button
                            onClick={() => handleCopy(transaction.transaction_id, "transactionId")}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy Transaction ID"
                          >
                            {copiedStates.transactionId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Show Timeline for pending, processing, or completed statuses */}
                  {transaction.status === "pending" ||
                  transaction.status === "processing" ||
                  transaction.status === "completed" ? (
                    <TransactionTimeline transaction={transaction} />
                  ) : (
                    /* Show current UI for failed/cancelled statuses */
                    <>
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            transaction.status === "failed"
                              ? "bg-red-100"
                              : transaction.status === "cancelled"
                                ? "bg-gray-100"
                                : "bg-yellow-100"
                          }`}
                        >
                          {transaction.status === "failed" ? (
                            <XCircle className="h-8 w-8 text-red-600" />
                          ) : transaction.status === "cancelled" ? (
                            <XCircle className="h-8 w-8 text-gray-600" />
                          ) : (
                            <Clock className="h-8 w-8 text-yellow-600" />
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          {statusMessage.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">{statusMessage.description}</p>
                        
                        {/* Transaction ID and Created for failed/cancelled */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-gray-900">{transaction.transaction_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900">{formatTimestamp(transaction.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Information */}
                      <div
                        className={`rounded-lg p-4 ${
                          transaction.status === "failed" ? "bg-red-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {transaction.status === "failed" ? "Failed:" : "Status:"}
                          </span>
                          <span className="font-medium text-sm sm:text-base">
                            {formatTimestamp(transaction.updated_at)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment Status Section */}
                  {paymentInfo && paymentInfo.hasPayment && paymentInfo.latestPayment && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900 mb-1">Payment Received</p>
                          <p className="text-sm text-green-700 mb-2">
                            {formatCurrency(
                              parseFloat(paymentInfo.latestPayment.amount),
                              paymentInfo.latestPayment.currency.toUpperCase()
                            )} received via virtual account
                          </p>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <span>
                              {paymentInfo.latestPayment.matched
                                ? "✓ Matched to transaction"
                                : "⏳ Processing"}
                            </span>
                            {paymentInfo.latestPayment.matched_at && (
                              <span className="text-gray-500">
                                • {new Date(paymentInfo.latestPayment.matched_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Receipt Section */}
                  {transaction.receipt_url && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Your Payment Receipt</p>
                            <p className="text-sm text-gray-600">{transaction.receipt_filename}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewReceipt}
                          className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.push("/user/send")} className="flex-1">
                      Send Again
                    </Button>
                    {isOverdue && transaction.status !== "completed" && transaction.status !== "failed" ? (
                      <Button
                        onClick={() => router.push("/user/support")}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        Contact Support
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/user/dashboard")}
                        className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                      >
                        Dashboard
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">You Sent</span>
                      <span className="font-semibold">
                        {formatCurrency(transaction.send_amount, transaction.send_currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee</span>
                      <span
                        className={`font-medium ${transaction.fee_amount === 0 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {transaction.fee_amount === 0
                          ? "FREE"
                          : formatCurrency(transaction.fee_amount, transaction.send_currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Paid</span>
                      <span className="font-semibold">
                        {formatCurrency(transaction.total_amount, transaction.send_currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient Gets</span>
                      <span className="font-semibold">
                        {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="text-sm">
                        1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(2)}{" "}
                        {transaction.receive_currency}
                      </span>
                    </div>
                  </div>

                  {transaction.recipient && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Recipient</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-sm sm:text-base font-medium">{transaction.recipient.full_name}</p>
                        <p className="text-gray-600">{transaction.recipient.account_number}</p>
                        <p className="text-gray-600">{transaction.recipient.bank_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default memo(TransactionStatusPage)
