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
import {
  otherCurrencies,
  currencyPaymentMethods,
  stablecoinOptions,
  type OtherCurrencyCode,
  type PaymentMethodCode,
} from "@/lib/send-payment-methods"
import { ChevronDown, Check, ChevronRight, ArrowLeft, Landmark, Link2, AlertCircle, Coins } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateTransactionId } from "@/lib/transaction-id"

const SEND_FLOW_STATE_KEY = "send_flow_state"

interface SendFlowState {
  recipient: Beneficiary
  amount: number
  receiveCurrency: string
  sendAmount: number
  sendCurrency: string
  sourceAccountId?: string
  paymentMethod: PaymentMethodCode
  otherCurrency?: OtherCurrencyCode | "STABLECOIN"
  otherPaymentMethod?: string
  note: string
  transactionId: string
}

function getConversionRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1
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

function formatAmountForDisplay(raw: string): string {
  if (!raw || raw === ".") return raw || ""
  const cleaned = raw.replace(/,/g, "")
  const parts = cleaned.split(".")
  let intPart = (parts[0] || "0").replace(/\D/g, "")
  if (intPart.length > 1) {
    intPart = intPart.replace(/^0+/, "") || "0"
  }
  const decPart = (parts[1] || "").replace(/\D/g, "").slice(0, 2)
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  if (parts.length > 1) {
    return decPart ? `${formattedInt}.${decPart}` : `${formattedInt}.`
  }
  return formattedInt
}

function parseAmountFromDisplay(display: string): number {
  return Number.parseFloat(display.replace(/,/g, "")) || 0
}

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
  KES: "🇰🇪",
  GHS: "🇬🇭",
  RUB: "🇷🇺",
}

export default function SendPage() {
  const router = useRouter()
  const [recipient, setRecipient] = useState<Beneficiary | null>(null)
  const [amountStr, setAmountStr] = useState("")
  const [sourceAccountId, setSourceAccountId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>("balance")
  const [otherCurrency, setOtherCurrency] = useState<OtherCurrencyCode | "STABLECOIN" | null>(null)
  const [otherPaymentMethod, setOtherPaymentMethod] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(SEND_FLOW_STATE_KEY)
    if (raw) {
      try {
        const s = JSON.parse(raw) as SendFlowState
        setRecipient(s.recipient)
        setAmountStr(formatAmountForDisplay(String(s.amount)))
        setSourceAccountId(s.sourceAccountId ?? null)
        setPaymentMethod(s.paymentMethod ?? "balance")
        setOtherCurrency(s.otherCurrency ?? null)
        setOtherPaymentMethod(s.otherPaymentMethod ?? null)
        setNote(s.note || "")
      } catch {
        // ignore
      }
    }
  }, [])

  const amount = parseAmountFromDisplay(amountStr)
  const receiveCurrency = recipient?.currency ?? "USD"
  const sourceAccount = mockAccounts.find((a) => a.id === sourceAccountId)

  const sendCurrency = useMemo(() => {
    if (paymentMethod === "balance" && sourceAccount) return sourceAccount.currency
    if (paymentMethod === "usdc" || paymentMethod === "usdt" || otherCurrency === "STABLECOIN")
      return "USD"
    if (otherCurrency) return otherCurrency
    return "USD"
  }, [paymentMethod, sourceAccount, otherCurrency])

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
    sourceAccount && amount > 0 && paymentMethod === "balance"
      ? sourceAccount.availableBalance - sendAmount
      : sourceAccount?.availableBalance ?? 0

  const suggestedAccount = useMemo(() => {
    const usdAccount = mockAccounts.find((a) => a.currency === "USD")
    if (!recipient || amount <= 0) return usdAccount ?? mockAccounts[0]
    const matching = mockAccounts.find(
      (a) => a.currency === receiveCurrency && a.availableBalance >= sendAmount
    )
    if (matching) return matching
    const sufficient = mockAccounts.find((a) => a.availableBalance >= sendAmount)
    return sufficient ?? usdAccount ?? mockAccounts[0]
  }, [recipient, amount, receiveCurrency, sendAmount])

  useEffect(() => {
    if (recipient && !sourceAccountId && paymentMethod === "balance" && suggestedAccount) {
      setSourceAccountId(suggestedAccount.id)
    }
  }, [recipient, sourceAccountId, paymentMethod, suggestedAccount])

  const isBalanceSource = paymentMethod === "balance"
  const isStablecoinSource = paymentMethod === "usdc" || paymentMethod === "usdt"
  const hasValidOtherCurrencySelection =
    (otherCurrency &&
      otherPaymentMethod &&
      (paymentMethod === "bankTransfer" ||
        paymentMethod === "mpesa" ||
        paymentMethod === "mtnMomo" ||
        paymentMethod === "sbp")) ||
    (otherCurrency === "STABLECOIN" && (paymentMethod === "usdc" || paymentMethod === "usdt"))
  const hasValidStablecoinSelection = isStablecoinSource

  const canContinueBalance =
    recipient !== null &&
    amount > 0 &&
    sourceAccountId !== null &&
    sourceAccount &&
    sourceAccount.availableBalance >= sendAmount &&
    isBalanceSource

  const canContinueStablecoin =
    recipient !== null && amount > 0 && hasValidStablecoinSelection

  const canContinueOtherCurrency =
    recipient !== null &&
    amount > 0 &&
    hasValidOtherCurrencySelection

  const canContinue =
    isBalanceSource
      ? canContinueBalance
      : isStablecoinSource
        ? canContinueStablecoin
        : canContinueOtherCurrency
  const isAuthorizeFlow = !isBalanceSource

  const hasInsufficientBalance =
    isBalanceSource &&
    sourceAccount &&
    amount > 0 &&
    sourceAccount.availableBalance < sendAmount
  const shortfallAmount =
    hasInsufficientBalance && sourceAccount
      ? sendAmount - sourceAccount.availableBalance
      : 0

  const getSourceDisplayLabel = () => {
    if (paymentMethod === "balance" && sourceAccount) {
      return `${sourceAccount.currency} Balance • ${currencySymbols[sourceAccount.currency] ?? ""}${sourceAccount.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    }
    if (paymentMethod === "usdc") return "Pay with USDC"
    if (paymentMethod === "usdt") return "Pay with USDT"
    if (otherCurrency && otherCurrency !== "STABLECOIN" && otherPaymentMethod) {
      const method = currencyPaymentMethods[otherCurrency]?.find(
        (m) => m.code === otherPaymentMethod
      )
      return `${otherCurrency} • ${method?.name ?? otherPaymentMethod}`
    }
    return "Select method"
  }

  const handleContinue = () => {
    if (!canContinue || !recipient) return

    const state: SendFlowState = {
      recipient,
      amount,
      receiveCurrency,
      sendAmount,
      sendCurrency,
      sourceAccountId: sourceAccount?.id,
      paymentMethod,
      otherCurrency: otherCurrency ?? undefined,
      otherPaymentMethod: otherPaymentMethod ?? undefined,
      note: note.trim(),
      transactionId: generateTransactionId(),
    }
    sessionStorage.setItem(SEND_FLOW_STATE_KEY, JSON.stringify(state))

    if (isBalanceSource) {
      router.push("/send/confirm")
      return
    }

    if (otherPaymentMethod === "sbp") {
      router.push("/send/authorize/open-banking")
      return
    }
    if (otherPaymentMethod === "bankTransfer") {
      router.push("/send/authorize/bank-transfer")
      return
    }
    if (otherPaymentMethod === "mpesa" || otherPaymentMethod === "mtnMomo") {
      router.push("/send/authorize/mobile-money")
      return
    }
    if (paymentMethod === "usdc" || paymentMethod === "usdt") {
      router.push("/send/authorize/stablecoin")
      return
    }

    router.push("/send/confirm")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Send money</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select recipient, amount, and how you&apos;d like to send
        </p>
      </div>

      <SendRecipientPicker
        selected={recipient}
        onSelect={setRecipient}
      />

      {recipient && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-muted-foreground shrink-0">Amount ({receiveCurrency})</Label>
            {hasFx && rateDisplay && (
              <span className="text-sm text-muted-foreground text-right">
                Sending: {currencySymbols[sendCurrency] ?? sendCurrency}
                {sendAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {sendCurrency} • Rate: {rateDisplay}
              </span>
            )}
          </div>
          <div
            className="flex items-center justify-center min-h-[100px] py-6 px-6 rounded-xl border-2 border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors gap-0.5"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span className="font-black text-foreground select-none shrink-0 text-5xl">
              {currencySymbols[receiveCurrency] ?? receiveCurrency}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "")
                const parts = v.split(".")
                if (parts.length > 2) return
                if (parts[1]?.length > 2) return
                setAmountStr(formatAmountForDisplay(v))
              }}
              className="w-full min-w-0 bg-transparent border-0 outline-none font-black text-foreground text-5xl placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          {hasInsufficientBalance && sourceAccount && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Insufficient {sourceAccount.currency} balance. You need{" "}
                {currencySymbols[sourceAccount.currency] ?? ""}
                {shortfallAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} more, or choose another source.
              </span>
            </div>
          )}
        </div>
      )}

      {recipient && (
        <div className="space-y-2">
          <Label>Sending from</Label>
          <button
            type="button"
            onClick={() => setSourceSheetOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                {paymentMethod === "balance" && sourceAccount
                  ? (currencyFlags[sourceAccount.currency] ?? "💳")
                  : paymentMethod === "usdc" || paymentMethod === "usdt"
                    ? <Coins className="h-5 w-5" />
                    : otherCurrency
                      ? (currencyFlags[otherCurrency] ?? "💳")
                      : "💳"}
              </span>
              <div>
                <p className="font-medium">{getSourceDisplayLabel()}</p>
                {paymentMethod === "balance" && sourceAccount && amount > 0 &&
                  (hasInsufficientBalance ? (
                    <p className="text-sm text-destructive font-medium">
                      Insufficient balance — short by {currencySymbols[sourceAccount.currency] ?? ""}
                      {shortfallAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      After: {currencySymbols[sourceAccount.currency] ?? ""}
                      {afterTransferBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  ))}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
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
        {isAuthorizeFlow ? "Authorize" : "Continue"}
      </Button>

      <Dialog open={sourceSheetOpen} onOpenChange={setSourceSheetOpen}>
        <DialogContent
          className="fixed bottom-0 left-0 right-0 top-auto max-h-[85vh] rounded-t-2xl border-t p-0 sm:max-w-lg sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border"
          showCloseButton={true}
        >
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>How would you like to send?</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 px-4 pb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">From Balance</p>
                <div className="space-y-1">
                  {mockAccounts.map((acc) => {
                    const sufficient = acc.availableBalance >= sendAmount
                    const isSelected =
                      paymentMethod === "balance" && sourceAccountId === acc.id
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod("balance")
                          setSourceAccountId(acc.id)
                          setOtherCurrency(null)
                          setOtherPaymentMethod(null)
                          if (sufficient) setSourceSheetOpen(false)
                        }}
                        disabled={!sufficient}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected ? "bg-muted" : ""
                        }`}
                      >
                        <span className="text-xl">{currencyFlags[acc.currency] ?? "💳"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{acc.currency} Balance</p>
                          <p className={`text-sm ${sufficient ? "text-muted-foreground" : "text-destructive"}`}>
                            {currencySymbols[acc.currency] ?? ""}
                            {acc.availableBalance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                            {!sufficient && amount > 0 && (
                              <span className="block mt-0.5">
                                Short by {currencySymbols[acc.currency] ?? ""}
                                {(sendAmount - acc.availableBalance).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            )}
                          </p>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Through Another Currency</p>
                {!otherCurrency ? (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("otherCurrency")
                        setOtherCurrency("STABLECOIN")
                        setSourceAccountId(null)
                        setOtherPaymentMethod(null)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="h-5 w-5 shrink-0" />
                        <p className="font-medium">Stablecoin</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {otherCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => {
                          setPaymentMethod("otherCurrency")
                          setOtherCurrency(currency.code)
                          setSourceAccountId(null)
                          setOtherPaymentMethod(null)
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{currencyFlags[currency.code] ?? "💳"}</span>
                          <p className="font-medium">{currency.name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : otherCurrency === "STABLECOIN" ? (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtherCurrency(null)
                        setOtherPaymentMethod(null)
                        setPaymentMethod("otherCurrency")
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <p className="font-medium">Stablecoin</p>
                    </button>
                    {stablecoinOptions.map((opt) => {
                      const isSelected = paymentMethod === opt.code
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(opt.code as PaymentMethodCode)
                            setSourceAccountId(null)
                            setOtherCurrency("STABLECOIN")
                            setOtherPaymentMethod(opt.code)
                            setSourceSheetOpen(false)
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                            isSelected ? "bg-muted" : ""
                          }`}
                        >
                          <img
                            src={
                              opt.code === "usdc"
                                ? "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
                                : "https://assets.coingecko.com/coins/images/325/small/Tether.png"
                            }
                            alt={opt.name}
                            className="h-8 w-8 rounded-full shrink-0"
                          />
                          <p className="font-medium">{opt.name}</p>
                          {isSelected && <Check className="h-5 w-5 text-primary shrink-0 ml-auto" />}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtherCurrency(null)
                        setOtherPaymentMethod(null)
                        setPaymentMethod("otherCurrency")
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <p className="font-medium">
                        {otherCurrencies.find((c) => c.code === otherCurrency)?.name}
                      </p>
                    </button>
                    {currencyPaymentMethods[otherCurrency as OtherCurrencyCode]?.map((method) => {
                      const isSelected = otherPaymentMethod === method.code
                      const icon =
                        method.code === "bankTransfer" ? (
                          <Landmark className="h-5 w-5" />
                        ) : method.code === "sbp" ? (
                          <Link2 className="h-5 w-5" />
                        ) : (
                          <span className="text-lg">📱</span>
                        )
                      return (
                        <button
                          key={method.code}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method.code as PaymentMethodCode)
                            setSourceAccountId(null)
                            setOtherPaymentMethod(method.code)
                            setSourceSheetOpen(false)
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                            isSelected ? "bg-muted" : ""
                          }`}
                        >
                          <span className="flex h-8 w-8 items-center justify-center shrink-0">
                            {icon}
                          </span>
                          <p className="font-medium">{method.name}</p>
                          {isSelected && <Check className="h-5 w-5 text-primary shrink-0 ml-auto" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
