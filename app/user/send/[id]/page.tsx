"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, Clock } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function TransactionStatusPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  // Mock transaction data - in real app, this would be fetched based on ID
  const [transactionData] = useState({
    id: transactionId,
    sendAmount: "100",
    sendCurrency: "RUB",
    receiveAmount: 2245,
    receiveCurrency: "NGN",
    recipientName: "John Doe",
    recipientAccount: "1234567890",
    recipientBank: "First Bank",
    status: "processing", // pending, processing, completed, failed
    createdAt: new Date().toISOString(),
    estimatedCompletion: "15-30 minutes",
  })

  const [currentStatus, setCurrentStatus] = useState("processing")
  const [countdownTime, setCountdownTime] = useState(300) // 5 minutes in seconds

  // Countdown timer effect
  useEffect(() => {
    if (currentStatus !== "completed" && countdownTime > 0) {
      const timer = setTimeout(() => setCountdownTime(countdownTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStatus, countdownTime])

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Simulate status updates
  useEffect(() => {
    const statusUpdates = ["processing", "verified", "initiated", "completed"]
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < statusUpdates.length - 1) {
        currentIndex++
        setCurrentStatus(statusUpdates[currentIndex])
      } else {
        clearInterval(interval)
      }
    }, 10000) // Update every 10 seconds for demo

    return () => clearInterval(interval)
  }, [])

  const steps = [
    { number: 1, title: "Amount to Send", completed: true },
    { number: 2, title: "Add Recipient", completed: true },
    { number: 3, title: "Make Payment", completed: true },
    { number: 4, title: "Transaction Status", completed: currentStatus === "completed" },
  ]

  const statusSteps = [
    {
      id: "initiated",
      title: "Transaction Initiated",
      completed: true,
      icon: <Check className="h-4 w-4 text-white" />,
    },
    {
      id: "received",
      title: "Payment Received",
      completed: currentStatus === "verified" || currentStatus === "initiated" || currentStatus === "completed",
      icon:
        currentStatus === "processing" ? (
          <Clock className="h-4 w-4 text-white animate-spin" />
        ) : currentStatus === "verified" || currentStatus === "initiated" || currentStatus === "completed" ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <span className="text-gray-500 text-xs">2</span>
        ),
    },
    {
      id: "transfer_initiated",
      title: "Transfer Initiated",
      completed: currentStatus === "initiated" || currentStatus === "completed",
      icon:
        currentStatus === "verified" ? (
          <Clock className="h-4 w-4 text-white animate-spin" />
        ) : currentStatus === "initiated" || currentStatus === "completed" ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <span className="text-gray-500 text-xs">3</span>
        ),
    },
    {
      id: "completed",
      title: "Transfer Complete",
      completed: currentStatus === "completed",
      icon:
        currentStatus === "initiated" ? (
          <Clock className="h-4 w-4 text-white animate-spin" />
        ) : currentStatus === "completed" ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <span className="text-gray-500 text-xs">4</span>
        ),
    },
  ]

  const getStatusColor = (step: any) => {
    if (step.completed) return "bg-green-500"
    if (step.id === "received" && currentStatus === "processing") return "bg-yellow-500"
    if (step.id === "transfer_initiated" && currentStatus === "verified") return "bg-yellow-500"
    if (step.id === "completed" && currentStatus === "initiated") return "bg-yellow-500"
    return "bg-gray-300"
  }

  const getStatusTextColor = (step: any) => {
    if (step.completed) return "text-green-600"
    if (step.id === "received" && currentStatus === "processing") return "text-yellow-600"
    if (step.id === "transfer_initiated" && currentStatus === "verified") return "text-yellow-600"
    if (step.id === "completed" && currentStatus === "initiated") return "text-yellow-600"
    return "text-gray-500"
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const symbol = currency === "RUB" ? "₽" : "₦"
    return `${symbol}${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

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
                        currentStatus === "completed" ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {currentStatus === "completed" ? (
                        <Check className="h-8 w-8 text-green-600" />
                      ) : (
                        <Clock className="h-8 w-8 text-yellow-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentStatus === "completed" ? "Transfer Complete!" : "Transaction Processing"}
                    </h3>
                    <p className="text-gray-600">
                      {currentStatus === "completed"
                        ? "Your money has been successfully transferred"
                        : "Your transfer is being processed"}
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-4">
                    {statusSteps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(step)}`}
                        >
                          {step.icon}
                        </div>
                        <span className={`font-medium ${getStatusTextColor(step)}`}>{step.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`rounded-lg p-4 ${currentStatus === "completed" ? "bg-green-50" : "bg-blue-50"}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {currentStatus === "completed" ? "Completed:" : "Estimated completion:"}
                      </span>
                      <span className="font-medium">
                        {currentStatus === "completed" ? new Date().toLocaleString() : formatCountdown(countdownTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.push("/user/send")} className="flex-1">
                      Repeat
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
                        {formatCurrency(transactionData.sendAmount, transactionData.sendCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient Got</span>
                      <span className="font-semibold">
                        {formatCurrency(transactionData.receiveAmount, transactionData.receiveCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Recipient</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{transactionData.recipientName}</p>
                      <p className="text-gray-600">{transactionData.recipientAccount}</p>
                      <p className="text-gray-600">{transactionData.recipientBank}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm">{transactionData.id.toUpperCase()}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        currentStatus === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {currentStatus === "completed" ? "Completed" : "Processing"}
                    </span>
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
