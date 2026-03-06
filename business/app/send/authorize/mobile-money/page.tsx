"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { currencySymbols } from "@/lib/mock-data"
import { generateTransactionId } from "@/lib/transaction-id"
import { ArrowLeft, Smartphone, Copy, Check } from "lucide-react"

const SEND_FLOW_STATE_KEY = "send_flow_state"

interface SendFlowState {
  recipient: { name: string }
  amount: number
  receiveCurrency: string
  sendAmount: number
  sendCurrency: string
  paymentMethod?: string
  otherCurrency?: string
  transactionId?: string
}

function getNetworkName(sendCurrency: string): string {
  if (sendCurrency === "GHS") return "MTN MOMO"
  if (sendCurrency === "KES") return "M-Pesa"
  return "Mobile Money"
}

export default function MobileMoneyPage() {
  const router = useRouter()
  const [state, setState] = useState<SendFlowState | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
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
        setState(JSON.parse(raw) as SendFlowState)
      } catch {
        router.replace("/send")
      }
    } else {
      router.replace("/send")
    }
  }, [router])

  const handleConfirmPayment = () => {
    if (!phoneNumber.trim()) return
    setPaymentConfirmed(true)
    const transactionId = state?.transactionId ?? generateTransactionId()
    sessionStorage.removeItem(SEND_FLOW_STATE_KEY)
    router.push(
      `/send/status?id=${transactionId}&amount=${state?.amount ?? 0}&currency=${state?.receiveCurrency ?? "USD"}&recipient=${encodeURIComponent(state?.recipient?.name ?? "")}&method=mobile-money`
    )
  }

  if (!state) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const networkName = getNetworkName(state.sendCurrency)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{networkName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your phone number registered with {networkName} to authorize the payment
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b gap-2">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <button
              type="button"
              onClick={() => handleCopy(state?.transactionId ?? generateTransactionId(), "transactionId")}
              className="flex items-center gap-2 font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              {state?.transactionId ?? generateTransactionId()}
              {copiedKey === "transactionId" ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Copy className="h-4 w-4 shrink-0" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">You pay</span>
            <span className="font-semibold">
              {currencySymbols[state.sendCurrency] ?? state.sendCurrency}
              {state.sendAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              {state.sendCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Recipient gets</span>
            <span className="font-semibold">
              {currencySymbols[state.receiveCurrency] ?? state.receiveCurrency}
              {state.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              {state.receiveCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Recipient</span>
            <span className="font-medium">{state.recipient?.name ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number ({networkName})</Label>
        <div className="relative">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder={state.sendCurrency === "GHS" ? "233 XX XXX XXXX" : "254 XXX XXX XXX"}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 15))}
            className="pl-10 h-12"
          />
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Payment Instructions</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Enter your phone number registered with {networkName}</li>
            <li>Authorize the payment to complete the transaction</li>
            <li>You will receive a confirmation SMS</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="h-11" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 h-11"
          onClick={handleConfirmPayment}
          disabled={!phoneNumber.trim() || paymentConfirmed}
        >
          {paymentConfirmed ? "Processing..." : `Pay ${currencySymbols[state.sendCurrency] ?? ""}${state.sendAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        </Button>
      </div>
    </div>
  )
}
