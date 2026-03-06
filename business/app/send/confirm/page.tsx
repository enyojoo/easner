"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PinDialog } from "@/components/pin-dialog"
import { mockAccounts, currencySymbols } from "@/lib/mock-data"
import type { Beneficiary } from "@/lib/mock-data"
import { generateTransactionId } from "@/lib/transaction-id"
import { ArrowLeft, User, Copy, Check } from "lucide-react"

const SEND_FLOW_STATE_KEY = "send_flow_state"

interface SendFlowState {
  recipient: Beneficiary
  amount: number
  receiveCurrency: string
  sendAmount: number
  sendCurrency: string
  sourceAccountId?: string
  paymentMethod?: string
  note: string
  transactionId?: string
}

function getTransferMethod(recipient: Beneficiary, currency: string): string {
  if (currency === "USD" && recipient.country === "United States") return "ACH"
  if (currency === "EUR") return "SEPA"
  if (currency === "GBP" && recipient.country === "United Kingdom") return "Faster Payments"
  return "Wire Transfer"
}

function getProcessingTime(method: string): string {
  switch (method) {
    case "ACH":
      return "1-3 business days"
    case "SEPA":
      return "1-2 business days"
    case "Faster Payments":
      return "Within minutes"
    default:
      return "Same day"
  }
}

function getFee(method: string): string {
  return method === "Wire Transfer" ? "$25.00" : "$0.00"
}

export default function SendConfirmPage() {
  const router = useRouter()
  const [state, setState] = useState<SendFlowState | null>(null)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem(SEND_FLOW_STATE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SendFlowState
        if (parsed.paymentMethod && parsed.paymentMethod !== "balance") {
          router.replace("/send")
          return
        }
        if (!parsed.sourceAccountId) {
          router.replace("/send")
          return
        }
        setState(parsed)
      } catch {
        router.replace("/send")
      }
    } else {
      router.replace("/send")
    }
  }, [router])

  const handlePinConfirm = () => {
    if (!state) return
    const transactionId = state.transactionId ?? generateTransactionId()
    sessionStorage.removeItem(SEND_FLOW_STATE_KEY)
    router.push(
      `/send/status?id=${transactionId}&amount=${state.amount}&currency=${state.receiveCurrency}&recipient=${encodeURIComponent(state.recipient.name)}`
    )
  }

  if (!state) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const sourceAccount = mockAccounts.find((a) => a.id === state.sourceAccountId!)
  const transferMethod = getTransferMethod(state.recipient, state.receiveCurrency)
  const processingTime = getProcessingTime(transferMethod)
  const fee = getFee(transferMethod)
  const hasFx = state.receiveCurrency !== state.sendCurrency

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review transfer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm your transfer details before authorizing
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b gap-2">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <button
              type="button"
              onClick={() => handleCopy(state.transactionId ?? generateTransactionId(), "transactionId")}
              className="flex items-center gap-2 font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              {state.transactionId ?? generateTransactionId()}
              {copiedKey === "transactionId" ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Copy className="h-4 w-4 shrink-0" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-xl font-semibold">
              {currencySymbols[state.receiveCurrency] ?? state.receiveCurrency}
              {state.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              {state.receiveCurrency}
            </span>
          </div>
          {hasFx && (
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-sm text-muted-foreground">You send</span>
              <span className="font-medium">
                {currencySymbols[state.sendCurrency] ?? state.sendCurrency}
                {state.sendAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                {state.sendCurrency}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Recipient</span>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{state.recipient.name}</span>
            </div>
          </div>
          {sourceAccount && (
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-sm text-muted-foreground">From account</span>
              <span className="font-medium">
                {sourceAccount.accountName} • {sourceAccount.currency}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Transfer method</span>
            <span className="font-medium">{transferMethod}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Processing time</span>
            <span className="font-medium">{processingTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Fee</span>
            <span className="font-semibold">{fee}</span>
          </div>
        </CardContent>
      </Card>

      {state.note && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Note</p>
            <p className="text-sm">{state.note}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="h-11" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 h-11"
          onClick={() => setShowPinDialog(true)}
        >
          Authorize transfer
        </Button>
      </div>

      <PinDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onConfirm={handlePinConfirm}
      />
    </div>
  )
}
