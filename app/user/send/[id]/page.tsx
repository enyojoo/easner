"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  Loader2,
} from "lucide-react"
import { transactionService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"

export default function TransactionStatusPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load transaction data
  const loadTransaction = async () => {
    if (!userProfile?.id) return

    try {
      const data = await transactionService.getById(transactionId.toUpperCase())

      // Verify user owns this transaction
      if (data.user_id !== userProfile.id) {
        setError("Transaction not found or access denied")
        return
      }

      setTransaction(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (error) {
      console.error("Error loading transaction:", error)
      setError("Failed to load transaction details")
    }
  }

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true)
      await loadTransaction()
      setLoading(false)
    }

    if (userProfile?.id) {
      initialLoad()
    }
  }, [transactionId, userProfile?.id])

  // Poll for status updates every 30 seconds
  useEffect(() => {
    if (!transaction) return

    const pollInterval = setInterval(async () => {
      await loadTransaction()
    }, 30000) // 30 seconds

    return () => clearInterval(pollInterval)
  }, [transaction])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && transaction?.status === "pending") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, transaction?.status])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const symbols: { [key: string]: string } = {
      RUB: "₽",
      NGN: "₦",
      USD: "$",
      EUR: "€",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "bg-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          title: "Payment Pending",
          description: "Waiting for your payment to be received",
        }
      case "processing":
        return {
          icon: Loader2,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          title: "Processing Payment",
          description: "Your payment is being processed",
        }
      case "initiated":
        return {
          icon: RefreshCw,
          color: "bg-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
          title: "Transfer Initiated",
          description: "Money transfer to recipient has been initiated",
        }
      case "completed":
        return {
          icon: CheckCircle,
          color: "bg-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          badge: "bg-green-100 text-green-800",
          title: "Transfer Completed",
          description: "Money has been successfully sent to recipient",
        }
      case "failed":
        return {
          icon: XCircle,
          color: "bg-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          badge: "bg-red-100 text-red-800",
          title: "Transfer Failed",
          description: "There was an issue with your transfer",
        }
      default:
        return {
          icon: AlertCircle,
          color: "bg-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          title: "Unknown Status",
          description: "Transaction status is unknown",
        }
    }
  }

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transaction details...</p>
              </div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  if (error || !transaction) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-900 mb-2">Transaction Not Found</h2>
              <p className="text-red-700 mb-4">
                {error || "The transaction you're looking for doesn't exist or you don't have access to it."}
              </p>
              <Button
                onClick={() => router.push("/user/dashboard")}
                className="bg-novapay-primary hover:bg-novapay-primary-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  const statusConfig = getStatusConfig(transaction.status)
  const StatusIcon = statusConfig.icon

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/user/dashboard")} className="bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Status Card */}
          <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${statusConfig.color} rounded-full flex items-center justify-center`}>
                    <StatusIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${statusConfig.textColor}`}>{statusConfig.title}</h2>
                    <p className="text-gray-600">{statusConfig.description}</p>
                  </div>
                </div>
                <Badge className={statusConfig.badge}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>

              {/* Countdown Timer for Pending Status */}
              {transaction.status === "pending" && timeLeft > 0 && (
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Time remaining to complete payment</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-yellow-700">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{transaction.transaction_id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(transaction.transaction_id, "transactionId")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedStates.transactionId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">You Sent</span>
                    <span className="font-semibold">
                      {formatCurrency(transaction.send_amount, transaction.send_currency)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span
                      className={`font-semibold ${transaction.fee_amount === 0 ? "text-green-600" : "text-gray-900"}`}
                    >
                      {transaction.fee_amount === 0
                        ? "FREE"
                        : formatCurrency(transaction.fee_amount, transaction.send_currency)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-semibold text-lg">
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
                      1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(4)}{" "}
                      {transaction.receive_currency}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-sm">{new Date(transaction.created_at).toLocaleString()}</span>
                  </div>

                  {transaction.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="text-sm">{new Date(transaction.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recipient Details */}
            <Card>
              <CardHeader>
                <CardTitle>Recipient Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium">{transaction.recipient?.full_name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{transaction.recipient?.account_number}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(transaction.recipient?.account_number, "accountNumber")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedStates.accountNumber ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name</span>
                    <span className="font-medium">{transaction.recipient?.bank_name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium">{transaction.receive_currency}</span>
                  </div>

                  {transaction.recipient?.phone_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone Number</span>
                      <span className="font-medium">{transaction.recipient.phone_number}</span>
                    </div>
                  )}
                </div>

                {/* Receipt Section */}
                {transaction.receipt_url && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Payment Receipt</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Receipt uploaded</p>
                            <p className="text-xs text-gray-500">{transaction.receipt_filename}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(transaction.receipt_url, "_blank")}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = transaction.receipt_url
                              link.download = transaction.receipt_filename
                              link.click()
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/user/transactions")} className="bg-transparent">
              View All Transactions
            </Button>
            <Button
              onClick={() => router.push("/user/send")}
              className="bg-novapay-primary hover:bg-novapay-primary-600"
            >
              Send Money Again
            </Button>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
