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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Plus, Share2, AlertCircle } from "lucide-react"
import { mockStablecoinAccounts, type Account } from "@/lib/mock-data"
import { QRCodeSVG } from "qrcode.react"

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
}

interface CopyableFieldProps {
  label: string
  value: string
  copiedField: string | null
  fieldId: string
  onCopy: (text: string, field: string) => void
}

function CopyableField({ label, value, copiedField, fieldId, onCopy }: CopyableFieldProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg gap-2">
        <code className="text-sm font-mono break-all flex-1 min-w-0">{value}</code>
        <button
          onClick={() => onCopy(value, fieldId)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {copiedField === fieldId ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

function PaymentInstructions({ currency, type }: { currency: string; type: "bank" | "stablecoin" }) {
  if (type === "bank") {
    if (currency === "USD") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send ACH or domestic US Wire</li>
          <li>SWIFT is NOT supported</li>
          <li>Include the reference in your transfer</li>
          <li>Processing time: within 12–48 hours</li>
        </ul>
      )
    }
    if (currency === "EUR") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send SEPA transfers</li>
          <li>SWIFT is NOT supported</li>
          <li>Include the reference in your transfer</li>
          <li>Processing time: 1–3 business days</li>
        </ul>
      )
    }
    if (currency === "GBP") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send Faster Payments or BACS</li>
          <li>Include the reference in your transfer</li>
          <li>Processing time: same day or 1–2 business days</li>
        </ul>
      )
    }
    if (currency === "NGN") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Include the reference in your transfer</li>
          <li>Processing time: within 24 hours</li>
        </ul>
      )
    }
  }

  if (type === "stablecoin") {
    const stablecoin = currency === "USD" ? "USDC" : "EURC"
    return (
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Only send {stablecoin} on the supported network to this address</li>
        <li>Sending unsupported assets will be lost</li>
        <li>Ensure amount is above 1 {stablecoin}</li>
        <li>Processing time: within seconds</li>
      </ul>
    )
  }

  return null
}

interface CurrencyDepositDialogProps {
  account: Account
  copiedField: string | null
  onCopy: (text: string, field: string) => void
}

export function CurrencyDepositDialog({ account, copiedField, onCopy }: CurrencyDepositDialogProps) {
  const stablecoinAccount = mockStablecoinAccounts.find((s) => s.currency === account.currency)
  const hasStablecoin = stablecoinAccount !== undefined
  const reference = `DEP-${account.currency}-${account.accountNumber.replace(/\*/g, "")}`

  const handleShare = async (type: "bank" | "stablecoin") => {
    const bankDetails = type === "bank"
      ? [
          `Account Name: ${account.accountName}`,
          account.iban && `IBAN: ${account.iban}`,
          account.bic && `BIC/SWIFT: ${account.bic}`,
          !account.iban && account.fullAccountNumber && `Account Number: ${account.fullAccountNumber}`,
          account.routingNumber && `Routing Number: ${account.routingNumber}`,
          account.sortCode && `Sort Code: ${account.sortCode}`,
          `Bank Name: ${account.bankName}`,
          `Reference: ${reference}`,
        ].filter(Boolean).join("\n")
      : stablecoinAccount
        ? [
            `Network: SOL • Solana`,
            `${stablecoinAccount.stablecoin} Address: ${stablecoinAccount.address}`,
            stablecoinAccount.memo && `Memo (Required): ${stablecoinAccount.memo}`,
          ].filter(Boolean).join("\n")
        : ""

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${account.currency} Deposit Details`,
          text: bankDetails,
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          onCopy(bankDetails, "share")
        }
      }
    } else {
      onCopy(bankDetails, "share")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
          <Plus className="h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{currencyFlags[account.currency]}</span>
            {account.currency} Deposit
          </DialogTitle>
          <DialogDescription>
            Deposit funds via bank transfer or stablecoin. Both methods credit your {account.currency} balance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank">
              {account.currency === "USD" ? "US Bank Account" : account.currency === "EUR" ? "EU Bank Account" : "Bank transfer"}
            </TabsTrigger>
            <TabsTrigger value="stablecoin">Stablecoin</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="space-y-4">
              <CopyableField
                label="Account Name"
                value={account.accountName}
                copiedField={copiedField}
                fieldId={`bank-name-${account.id}`}
                onCopy={onCopy}
              />

              {account.currency === "EUR" && account.iban ? (
                <>
                  <CopyableField
                    label="IBAN"
                    value={account.iban}
                    copiedField={copiedField}
                    fieldId={`bank-iban-${account.id}`}
                    onCopy={onCopy}
                  />
                  {account.bic && (
                    <CopyableField
                      label="BIC/SWIFT"
                      value={account.bic}
                      copiedField={copiedField}
                      fieldId={`bank-bic-${account.id}`}
                      onCopy={onCopy}
                    />
                  )}
                </>
              ) : (
                <>
                  <CopyableField
                    label="Account Number"
                    value={account.fullAccountNumber}
                    copiedField={copiedField}
                    fieldId={`bank-acc-${account.id}`}
                    onCopy={onCopy}
                  />
                  {account.routingNumber && (
                    <CopyableField
                      label="Routing Number"
                      value={account.routingNumber}
                      copiedField={copiedField}
                      fieldId={`bank-routing-${account.id}`}
                      onCopy={onCopy}
                    />
                  )}
                  {account.sortCode && (
                    <CopyableField
                      label="Sort Code"
                      value={account.sortCode}
                      copiedField={copiedField}
                      fieldId={`bank-sort-${account.id}`}
                      onCopy={onCopy}
                    />
                  )}
                </>
              )}

              <CopyableField
                label="Bank Name"
                value={account.bankName}
                copiedField={copiedField}
                fieldId={`bank-bank-${account.id}`}
                onCopy={onCopy}
              />

              <CopyableField
                label="Reference (required)"
                value={reference}
                copiedField={copiedField}
                fieldId={`bank-ref-${account.id}`}
                onCopy={onCopy}
              />
            </div>

            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleShare("bank")}>
              <Share2 className="h-4 w-4" />
              Share Account Details
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Payment Instructions</p>
              <PaymentInstructions currency={account.currency} type="bank" />
            </div>
          </TabsContent>

          <TabsContent value="stablecoin" className="space-y-4 mt-4">
            {hasStablecoin && stablecoinAccount ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl border">
                    <QRCodeSVG value={stablecoinAccount.address} size={200} level="M" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scan to send {stablecoinAccount.stablecoin}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Network</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {stablecoinAccount.chain === "Solana" ? "SOL" : stablecoinAccount.chain === "Ethereum" ? "ETH" : stablecoinAccount.chain}
                    </span>
                    <span className="text-sm text-muted-foreground"> • </span>
                    <span className="text-sm text-muted-foreground">{stablecoinAccount.chain}</span>
                  </div>
                </div>

                <CopyableField
                  label="Address"
                  value={stablecoinAccount.address}
                  copiedField={copiedField}
                  fieldId={`stable-addr-${account.id}`}
                  onCopy={onCopy}
                />

                {stablecoinAccount.memo && (
                  <>
                    <CopyableField
                      label="Memo (Required)"
                      value={stablecoinAccount.memo}
                      copiedField={copiedField}
                      fieldId={`stable-memo-${account.id}`}
                      onCopy={onCopy}
                    />
                    <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                      <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Include this memo when sending to this address on {stablecoinAccount.chain}. Sending without the memo may result in lost funds.
                      </p>
                    </div>
                  </>
                )}

                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleShare("stablecoin")}>
                  <Share2 className="h-4 w-4" />
                  Share {stablecoinAccount.stablecoin} Details
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Payment Instructions</p>
                  <PaymentInstructions currency={account.currency} type="stablecoin" />
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Stablecoin deposits for {account.currency} are coming soon.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
