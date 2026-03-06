"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { currencySymbols } from "@/lib/mock-data"
import { generateTransactionId } from "@/lib/transaction-id"
import { ArrowLeft, Link2, Loader2, Copy, Check } from "lucide-react"

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

export default function OpenBankingPage() {
  const router = useRouter()
  const [state, setState] = useState<SendFlowState | null>(null)
  const [loading, setLoading] = useState(false)
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

  const isSBP = state?.paymentMethod === "sbp" || state?.sendCurrency === "RUB"

  const handleConnect = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    const transactionId = state?.transactionId ?? generateTransactionId()
    sessionStorage.removeItem(SEND_FLOW_STATE_KEY)
    router.push(
      `/send/status?id=${transactionId}&amount=${state?.amount ?? 0}&currency=${state?.receiveCurrency ?? "USD"}&recipient=${encodeURIComponent(state?.recipient?.name ?? "")}&method=open-banking`
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {isSBP ? "Connect via SBP" : "Link Bank Account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isSBP
            ? "Securely connect your Russian bank account via SBP (Faster Payments System) to complete this payment."
            : "Securely connect your bank account to complete this payment. We use bank-level encryption to keep your information safe."}
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
            <span className="text-sm text-muted-foreground">You send</span>
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

      <div className="flex flex-col items-center gap-4 py-6">
        <div className="rounded-full bg-primary/10 p-6">
          <Link2 className="h-12 w-12 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {isSBP
            ? "You will be redirected to your bank to authorize the payment via SBP."
            : "You will be redirected to your bank to authorize the payment."}
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="h-11" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 h-11"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : isSBP ? (
            "Connect via SBP"
          ) : (
            "Connect Bank Account"
          )}
        </Button>
      </div>
    </div>
  )
}
