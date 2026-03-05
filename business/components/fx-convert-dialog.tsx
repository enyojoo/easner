"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockAccounts, currencyRates, currencySymbols } from "@/lib/mock-data"
import { ArrowRightLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
}

interface FXConvertDialogProps {
  account: (typeof mockAccounts)[0]
}

export function FXConvertDialog({ account }: FXConvertDialogProps) {
  const [fromCurrency, setFromCurrency] = useState(account.currency)
  const [toCurrency, setToCurrency] = useState<string>(
    account.currency === "USD" ? "EUR" : "USD"
  )
  const [amount, setAmount] = useState("")

  const amountNum = parseFloat(amount) || 0
  const rate = toCurrency && fromCurrency !== toCurrency
    ? currencyRates[toCurrency] / currencyRates[fromCurrency]
    : 0
  const result = amountNum * rate

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Convert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert currency</DialogTitle>
          <DialogDescription>
            Check FX rates and convert between your accounts. This is a preview — actual conversion is done when you confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.currency}>
                      {currencyFlags[acc.currency]} {acc.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Select
              value={toCurrency === fromCurrency ? "" : toCurrency}
              onValueChange={setToCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts
                  .filter((acc) => acc.currency !== fromCurrency)
                  .map((acc) => (
                    <SelectItem key={acc.id} value={acc.currency}>
                      {currencyFlags[acc.currency]} {acc.currency}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Rate</p>
            <p className="text-lg font-semibold">
              1 {fromCurrency} = {(currencyRates[toCurrency] / currencyRates[fromCurrency]).toFixed(4)} {toCurrency}
            </p>
            <p className="text-sm text-muted-foreground pt-2">You receive</p>
            <p className="text-2xl font-bold">
              {currencySymbols[toCurrency]}
              {result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Button className="w-full" disabled={!amount || amountNum <= 0}>
            Convert (Preview only)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
