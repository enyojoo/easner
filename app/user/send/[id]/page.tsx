"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, Clock, ExternalLink, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { transactionService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import type { Transaction } from "@/types"

export default function TransactionStatusPage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile } = useAuth()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdownTime, setCountdownTime] = useState(1800) // 30 minutes in seconds

  // Load transaction data from Supabase
  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId || !userProfile?.id) return

      try {
        setError(null)

        const transactionData = await transactionService.getById(transactionId.toUpperCase())

        // Verify this transaction belongs to the current user
        if (transactionData.user_id !== userProfile.id) {
          setError("Transaction not found or access denied")
          return
        }

        setTransaction(transactionData)
      } catch (error) {
        console.error("Error loading transaction:", error)
        setError("Failed to load transaction details")
      }
    }

    loadTransaction()
  }, [transactionId, userProfile?.id])

  // Poll for transaction updates every 30 seconds
  useEffect(() => {
    if (!transaction || !userProfile?.id) return

    const pollInterval = setInterval(async () => {
      try {
        const updatedTransaction = await transactionService.getById(transaction.transaction_id)
        if (updatedTransaction.status !== transaction.status) {
          setTransaction(updatedTransaction)
        }
      } catch (error) {
        console.error("Error polling transaction status:", error)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [transaction, userProfile?.id])

  // Countdown timer effect (only for non-completed transactions)
  useEffect(() => {
    if (transaction?.status !== "completed" && countdownTime > 0) {
      const timer = setTimeout(() => setCountdownTime(countdownTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [transaction?.status, countdownTime])

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const steps = [
    { number: 1, title: "Amount to Send", completed: true },
    { number: 2, title: "Add Recipient", completed: true },
    { number: 3, title: "Make Payment", completed: true },
    { number: 4, title: "Transaction Status", completed: transaction?.status === "completed" },
  ]

  const getStatusSteps = (currentStatus: string) => [
    {
      id: "pending",
      title: "Transaction Initiated",
      completed: true,
      icon: <Check className="h-4 w-4 text-white" />,
    },
    {
      id: "processing",
      title: "Payment Received",
      completed: ["processing", "initiated", "completed"].includes(currentStatus),
      icon: ["processing", "initiated", "completed"].includes(currentStatus) ? (
        <Check className="h-4 w-4 text-white" />
      ) : currentStatus === "pending" ? (
        <Clock className="h-4 w-4 text-white animate-spin" />
      ) : (
        <span className="text-gray-500 text-xs">2</span>
      ),
    },
    {
      id: "initiated",
      title: "Transfer Initiated",
      completed: ["initiated", "completed"].includes(currentStatus),
      icon: ["initiated", "completed"].includes(currentStatus) ? (
        <Check className="h-4 w-4 text-white" />
      ) : currentStatus === "processing" ? (
        <Clock className="h-4 w-4 text-white animate-spin" />
      ) : (
        <span className="text-gray-500 text-xs">3</span>
      ),
    },
    {
      id: "completed",
      title: "Transfer Complete",
      completed: currentStatus === "completed",
      icon:
        currentStatus === "completed" ? (
          <Check className="h-4 w-4 text-white" />
        ) : currentStatus === "initiated" ? (
          <Clock className="h-4 w-4 text-white animate-spin" />
        ) : (
          <span className="text-gray-500 text-xs">4</span>
        ),
    },
  ]

  const getStatusColor = (step: any, currentStatus: string) => {
    if (step.completed) return "bg-green-500"
    if (step.id === "processing" && currentStatus === "pending") return "bg-yellow-500"
    if (step.id === "initiated" && currentStatus === "processing") return "bg-yellow-500"
    if (step.id === "completed" && currentStatus === "initiated") return "bg-yellow-500"
    return "bg-gray-300"
  }

  const getStatusTextColor = (step: any, currentStatus: string) => {
    if (step.completed) return "text-green-600"
    if (step.id === "processing" && currentStatus === "pending") return "text-yellow-600"
    if (step.id === "initiated" && currentStatus === "processing") return "text-yellow-600"
    if (step.id === "completed" && currentStatus === "initiated") return "text-yellow-600"
    return "text-gray-500"
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const symbol = currency === "RUB" ? "₽" : currency === "NGN" ? "₦" : currency
    return `${symbol}${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          title: "Transaction Initiated",
          description: "Waiting for payment confirmation",
          isCompleted: false,
        }
      case "processing":
        return {
          title: "Payment Received",
          description: "Your payment has been received and is being processed",
          isCompleted: false,
        }
      case "initiated":
        return {
          title: "Transfer in Progress",
          description: "Your transfer has been initiated to the recipient",
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
      default:
        return {
          title: "Transaction Processing",
          description: "Your transaction is being processed",
          isCompleted: false,
        }
    }
  }

  if (error || !transaction) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">{error || "Transaction not found"}</p>
              <Button
                onClick={() => router.push("/user/dashboard")}
                className="bg-novapay-primary hover:bg-novapay-primary-600"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  const statusMessage = getStatusMessage(transaction.status)
  const statusSteps = getStatusSteps(transaction.status)

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? "bg-green-500 text-white"
                        : step.number === 4
                          ? "bg-novapay-primary text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : step.number}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:block">{step.title}</span>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-gray-200 mx-4 hidden sm:block">
                      <div
                        className={`h-full transition-all duration-300 ${
                          step.completed ? "bg-green-500 w-full" : "bg-gray-200 w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        statusMessage.isCompleted
                          ? "bg-green-100"
                          : transaction.status === "failed"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      {statusMessage.isCompleted ? (
                        <Check className="h-8 w-8 text-green-600" />
                      ) : transaction.status === "failed" ? (
                        <XCircle className="h-8 w-8 text-red-600" />
                      ) : (
                        <Clock className="h-8 w-8 text-yellow-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{statusMessage.title}</h3>
                    <p className="text-gray-600">{statusMessage.description}</p>
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-4">
                    {statusSteps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(
                            step,
                            transaction.status,
                          )}`}
                        >
                          {step.icon}
                        </div>
                        <span className={`font-medium ${getStatusTextColor(step, transaction.status)}`}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Information */}
                  <div
                    className={`rounded-lg p-4 ${
                      statusMessage.isCompleted
                        ? "bg-green-50"
                        : transaction.status === "failed"
                          ? "bg-red-50"
                          : "bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {statusMessage.isCompleted
                          ? "Completed:"
                          : transaction.status === "failed"
                            ? "Failed:"
                            : "Estimated completion:"}
                      </span>
                      <span className="font-medium">
                        {statusMessage.isCompleted
                          ? new Date(transaction.completed_at || transaction.updated_at).toLocaleString()
                          : transaction.status === "failed"
                            ? new Date(transaction.updated_at).toLocaleString()
                            : formatCountdown(countdownTime)}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Section */}
                  {transaction.receipt_url && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Payment Receipt Uploaded</p>
                            <p className="text-sm text-gray-600">{transaction.receipt_filename}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewReceipt}
                          className="flex items-center gap-2 bg-transparent"
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
                    <Button
                      onClick={() => router.push("/user/dashboard")}
                      className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                    >
                      Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Summary</CardTitle>
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
                        1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(4)}{" "}
                        {transaction.receive_currency}
                      </span>
                    </div>
                  </div>

                  {transaction.recipient && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Recipient</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{transaction.recipient.full_name}</p>
                        <p className="text-gray-600">{transaction.recipient.account_number}</p>
                        <p className="text-gray-600">{transaction.recipient.bank_name}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm">{transaction.transaction_id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
