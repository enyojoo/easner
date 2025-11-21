"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, ExternalLink, Copy } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ReceiveTransaction {
  id: string
  transaction_id: string
  stellar_transaction_hash: string
  crypto_amount: number
  crypto_currency: string
  fiat_amount: number
  fiat_currency: string
  exchange_rate: number
  status: string
  created_at: string
  confirmed_at?: string
  converted_at?: string
  deposited_at?: string
  crypto_wallet: {
    wallet_address: string
    crypto_currency: string
    recipient: {
      full_name: string
      account_number: string
      bank_name: string
    }
  }
}

function ReceiveTransactionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile } = useAuth()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<ReceiveTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)


  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId || !userProfile?.id) return

      try {
        setError(null)
        setLoading(true)

        const response = await fetch(`/api/crypto/receive/${transactionId}`)
        if (!response.ok) {
          throw new Error("Transaction not found")
        }

        const data = await response.json()
        if (data.transaction.user_id !== userProfile.id) {
          throw new Error("Access denied")
        }

        setTransaction(data.transaction)
      } catch (err: any) {
        setError(err.message || "Failed to load transaction")
      } finally {
        setLoading(false)
      }
    }

    loadTransaction()
  }, [transactionId, userProfile?.id])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deposited":
        return "bg-green-100 text-green-800"
      case "converted":
      case "converting":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStages = () => {
    if (!transaction) return []

    const stages = [
      {
        id: "pending",
        title: "Waiting for Deposit",
        description: "Waiting for stablecoin deposit to wallet",
        completed: true,
        timestamp: transaction.created_at,
      },
      {
        id: "confirmed",
        title: "Confirmed",
        description: "Transaction confirmed on Stellar network",
        completed: transaction.status !== "pending",
        timestamp: transaction.confirmed_at,
      },
      {
        id: "converting",
        title: "Converting",
        description: "Converting stablecoin to fiat currency",
        completed: ["converting", "converted", "deposited"].includes(transaction.status),
        timestamp: transaction.converted_at,
      },
      {
        id: "deposited",
        title: "Deposited",
        description: `Funds deposited to ${transaction.crypto_wallet?.recipient?.bank_name || "bank account"}`,
        completed: transaction.status === "deposited",
        timestamp: transaction.deposited_at,
      },
    ]

    return stages
  }

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  if (error || !transaction) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error || "Transaction not found"}</p>
              <Button onClick={() => router.push("/user/transactions")}>Back to Transactions</Button>
            </CardContent>
          </Card>
        </div>
      </UserDashboardLayout>
    )
  }

  const stages = getStages()
  const stellarExplorerUrl = `https://stellar.expert/explorer/public/tx/${transaction.stellar_transaction_hash}`

  return (
    <UserDashboardLayout>
      <div className="space-y-6 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
              ← Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction Details</h1>
          </div>
          <Badge className={getStatusColor(transaction.status)}>{transaction.status.toUpperCase()}</Badge>
        </div>

        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Transaction ID</div>
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {transaction.transaction_id}
              </code>
            </div>

            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Stellar Transaction Hash</div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                  {transaction.stellar_transaction_hash}
                </code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.stellar_transaction_hash)}>
                  {copiedHash ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={stellarExplorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on Explorer
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Stablecoin Received</div>
                <div className="text-lg font-semibold text-gray-900">
                  {transaction.crypto_amount} {transaction.crypto_currency}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Exchange Rate</div>
                <div className="text-lg font-semibold text-gray-900">
                  1 {transaction.crypto_currency} = {transaction.exchange_rate.toFixed(4)} {transaction.fiat_currency}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Fiat Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {transaction.fiat_amount.toLocaleString()} {transaction.fiat_currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-6">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        stage.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-gray-200 border-gray-300 text-gray-500"
                      }`}
                    >
                      {stage.completed ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    {index < stages.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-2 ${
                          stage.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3
                      className={`font-semibold text-base mb-1 ${
                        stage.completed ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {stage.title}
                    </h3>
                    {stage.timestamp && (
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(stage.timestamp).toLocaleString()}
                      </p>
                    )}
                    <p className={`text-sm ${stage.completed ? "text-gray-700" : "text-gray-500"}`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wallet & Recipient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet & Recipient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Wallet Address</div>
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {transaction.crypto_wallet?.wallet_address}
              </code>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Deposit Account</div>
              <div className="text-sm text-gray-900">
                {transaction.crypto_wallet?.recipient?.full_name}
                <br />
                {transaction.crypto_wallet?.recipient?.account_number}
                <br />
                {transaction.crypto_wallet?.recipient?.bank_name}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}

export default ReceiveTransactionDetailsPage

