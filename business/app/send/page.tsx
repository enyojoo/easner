"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SendRecipientPicker } from "@/components/send-recipient-picker"
import {
  mockAccounts,
  currencySymbols,
  currencyRates,
} from "@/lib/mock-data"
import type { Beneficiary } from "@/lib/mock-data"
import { ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const SEND_FLOW_STATE_KEY = "send_flow_state"

interface SendFlowState {
  recipient: Beneficiary
  amount: number
  receiveCurrency: string
  sendAmount: number
  sendCurrency: string
  sourceAccountId: string
  note: string
}

function getConversionRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1
  // currencyRates[currency] = USD per 1 unit of currency
  // So 1 fromCurrency = currencyRates[fromCurrency] USD
  // 1 toCurrency = currencyRates[toCurrency] USD
  // 1 fromCurrency = currencyRates[fromCurrency] / currencyRates[toCurrency] toCurrency
  const fromPerUsd = 1 / (currencyRates[fromCurrency] ?? 1)
  const toPerUsd = 1 / (currencyRates[toCurrency] ?? 1)
  return toPerUsd / fromPerUsd
}

function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount
  const rate = getConversionRate(fromCurrency, toCurrency)
  return amount * rate
}

export default function SendPage() {
  const router = useRouter()
  const [recipient, setRecipient] = useState<Beneficiary | null>(null)
  const [amountStr, setAmountStr] = useState("")
  const [sourceAccountId, setSourceAccountId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [sourcePopoverOpen, setSourcePopoverOpen] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(SEND_FLOW_STATE_KEY)
    if (raw) {
      try {
        const s = JSON.parse(raw) as SendFlowState
        setRecipient(s.recipient)
        setAmountStr(String(s.amount))
        setSourceAccountId(s.sourceAccountId)
        setNote(s.note || "")
      } catch {
        // ignore
      }
    }
  }, [])

  const amount = Number.parseFloat(amountStr) || 0
  const receiveCurrency = recipient?.currency ?? "USD"
  const sourceAccount = mockAccounts.find((a) => a.id === sourceAccountId)
  const sendCurrency = sourceAccount?.currency ?? "USD"

  const sendAmount = useMemo(() => {
    if (!recipient || amount <= 0) return 0
    return convertAmount(amount, receiveCurrency, sendCurrency)
  }, [amount, receiveCurrency, sendCurrency, recipient])

  const hasFx = receiveCurrency !== sendCurrency && amount > 0
  const rateDisplay =
    hasFx && sendCurrency && receiveCurrency
      ? `1 ${sendCurrency} = ${getConversionRate(sendCurrency, receiveCurrency).toFixed(4)} ${receiveCurrency}`
      : null

  const afterTransferBalance =
    sourceAccount && amount > 0
      ? sourceAccount.availableBalance - sendAmount
      : sourceAccount?.availableBalance ?? 0

  const suggestedAccount = useMemo(() => {
    if (!recipient || amount <= 0) return mockAccounts[0]
    const matching = mockAccounts.find(
      (a) => a.currency === receiveCurrency && a.availableBalance >= sendAmount
    )
    if (matching) return matching
    const sufficient = mockAccounts.find((a) => a.availableBalance >= sendAmount)
    return sufficient ?? mockAccounts[0]
  }, [recipient, amount, receiveCurrency, sendAmount])

  useEffect(() => {
    if (recipient && amount > 0 && !sourceAccountId && suggestedAccount) {
      setSourceAccountId(suggestedAccount.id)
    }
  }, [recipient, amount, sourceAccountId, suggestedAccount])

  const canContinue =
    recipient !== null &&
    amount > 0 &&
    sourceAccountId !== null &&
    sourceAccount &&
    sourceAccount.availableBalance >= sendAmount

  const handleContinue = () => {
    if (!canContinue || !recipient || !sourceAccount) return
    const state = {
      recipient,
      amount,
      receiveCurrency,
      sendAmount,
      sendCurrency,
      sourceAccountId: sourceAccount.id,
      note: note.trim(),
    }
    sessionStorage.setItem(SEND_FLOW_STATE_KEY, JSON.stringify(state))
    router.push("/send/confirm")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Send money</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select recipient, amount, and source account
        </p>
      </div>

      <div className="space-y-2">
        <Label>Recipient</Label>
        <SendRecipientPicker
          selected={recipient}
          onSelect={setRecipient}
        />
      </div>

      {recipient && (
        <div className="space-y-2">
          <Label>Amount ({receiveCurrency})</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
              {currencySymbols[receiveCurrency] ?? receiveCurrency}
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "")
                const parts = v.split(".")
                if (parts.length > 2) return
                if (parts[1]?.length > 2) return
                setAmountStr(v)
              }}
              className="h-14 pl-10 text-2xl font-semibold"
            />
          </div>
          {hasFx && rateDisplay && (
            <p className="text-sm text-muted-foreground">
              Sending: {currencySymbols[sendCurrency] ?? sendCurrency}
              {sendAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {sendCurrency} • Rate: {rateDisplay}
            </p>
          )}
        </div>
      )}

      {recipient && amount > 0 && (
        <div className="space-y-2">
          <Label>Sending from</Label>
          <Popover open={sourcePopoverOpen} onOpenChange={setSourcePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {sourceAccount ? (
                  <div>
                    <p className="font-medium">
                      {sourceAccount.accountName} • {sourceAccount.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {currencySymbols[sourceAccount.currency] ?? ""}
                      {sourceAccount.availableBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                      {amount > 0 && (
                        <span className="ml-2">
                          → After: {currencySymbols[sourceAccount.currency] ?? ""}
                          {afterTransferBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select account</span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <div className="max-h-[240px] overflow-y-auto">
                {mockAccounts.map((acc) => {
                  const sufficient = acc.availableBalance >= sendAmount
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setSourceAccountId(acc.id)
                        setSourcePopoverOpen(false)
                      }}
                      disabled={!sufficient}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        sourceAccountId === acc.id ? "bg-muted/50" : ""
                      }`}
                    >
                      <p className="font-medium">
                        {acc.accountName} • {acc.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currencySymbols[acc.currency] ?? ""}
                        {acc.availableBalance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {recipient && (
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Input
            id="note"
            placeholder="Add a note for this transfer"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-11"
          />
        </div>
      )}

      <Button
        size="lg"
        className="w-full h-12"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  )
}
