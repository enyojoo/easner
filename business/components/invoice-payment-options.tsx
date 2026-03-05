"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Share2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { Account } from "@/lib/mock-data"
import type { Invoice } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

interface StablecoinAccount {
  currency: string
  stablecoin: string
  chain: string
  address: string
  memo?: string
}

function CopyableField({
  label,
  value,
  copiedField,
  fieldId,
  onCopy,
}: {
  label: string
  value: string
  copiedField: string | null
  fieldId: string
  onCopy: (t: string, f: string) => void
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg gap-2">
        <code className="text-sm font-mono break-all flex-1 min-w-0">{value}</code>
        <button
          onClick={() => onCopy(value, fieldId)}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
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

function PaymentInstructions({
  currency,
  type,
}: {
  currency: string
  type: "bank" | "stablecoin"
}) {
  if (type === "bank") {
    if (currency === "USD") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send ACH or domestic US Wire</li>
          <li>SWIFT is NOT supported</li>
          <li>Processing time: within 12–48 hours</li>
        </ul>
      )
    }
    if (currency === "EUR") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send SEPA transfers</li>
          <li>SWIFT is NOT supported</li>
          <li>Processing time: 1–3 business days</li>
        </ul>
      )
    }
    if (currency === "GBP") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Only send Faster Payments or BACS</li>
          <li>Processing time: same day or 1–2 business days</li>
        </ul>
      )
    }
    if (currency === "NGN") {
      return (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
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
        <li>Processing time: within seconds</li>
      </ul>
    )
  }
  return null
}

interface InvoicePaymentOptionsProps {
  invoice: Invoice
  bankAccount: Account
  stablecoinAccount?: StablecoinAccount
  /** When true, render without Card wrapper (e.g. inside invoice frame) */
  embedded?: boolean
  /** "customer" = invoice view; "business" = invoice detail page */
  audience?: "customer" | "business"
  /** Controlled tab value - when provided, parent tracks selection */
  value?: "bank" | "stablecoin"
  onValueChange?: (value: "bank" | "stablecoin") => void
}

const audienceDescriptions = {
  customer:
    "Kindly pay the invoice via any of the payment options. Reference must be the invoice number for reconciliation.",
  business: "Share these details with your customer.",
} as const

export function InvoicePaymentOptions({
  invoice,
  bankAccount,
  stablecoinAccount,
  embedded = false,
  audience = "customer",
  value,
  onValueChange,
}: InvoicePaymentOptionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const hasStablecoin = stablecoinAccount !== undefined

  const copyToClipboard = async (text: string, field?: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      if (field) {
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getShareContent = (type: "bank" | "stablecoin") => {
    const details =
      type === "bank"
        ? [
            `Amount: ${formatCurrency(invoice.total, invoice.currency)}`,
            `Account Name: ${bankAccount.accountName}`,
            bankAccount.iban && `IBAN: ${bankAccount.iban}`,
            bankAccount.bic && `BIC/SWIFT: ${bankAccount.bic}`,
            !bankAccount.iban &&
              bankAccount.fullAccountNumber &&
              `Account Number: ${bankAccount.fullAccountNumber}`,
            bankAccount.routingNumber &&
              `Routing Number: ${bankAccount.routingNumber}`,
            bankAccount.sortCode && `Sort Code: ${bankAccount.sortCode}`,
            `Bank Name: ${bankAccount.bankName}`,
            bankAccount.bankAddress && `Address: ${bankAccount.bankAddress}`,
          ]
            .filter(Boolean)
            .join("\n")
        : stablecoinAccount
          ? [
              `Amount: ${formatCurrency(invoice.total, invoice.currency)}`,
              `Network: ${stablecoinAccount.chain}`,
              `Address: ${stablecoinAccount.address}`,
            ]
              .filter(Boolean)
              .join("\n")
          : ""
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/invoice-view/${invoice.id}`
        : ""
    return { details, url }
  }

  const handleShare = async (type: "bank" | "stablecoin") => {
    const { details, url } = getShareContent(type)
    const text = url ? `${details}\n\nView invoice: ${url}` : details

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}\nPayment Details`,
          text,
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(text, `share-${type}`)
        }
      }
    } else {
      copyToClipboard(text, `share-${type}`)
    }
  }


  const header = (
    <div className={embedded ? "mb-4" : ""}>
      <h3 className="text-lg font-semibold">Invoice payment options</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {audienceDescriptions[audience]}
      </p>
    </div>
  )

  const tabsContent = (
    <Tabs
      {...(value !== undefined && onValueChange
        ? {
            value,
            onValueChange: (v: string) =>
              onValueChange(v as "bank" | "stablecoin"),
          }
        : { defaultValue: "bank" })}
      className="w-full"
    >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank">
              {bankAccount.currency === "USD"
                ? "US Bank Account"
                : bankAccount.currency === "EUR"
                  ? "EU Bank Account"
                  : "Bank transfer"}
            </TabsTrigger>
            <TabsTrigger value="stablecoin" disabled={!hasStablecoin}>
              Stablecoin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="space-y-4">
              <CopyableField
                label="Account Name"
                value={bankAccount.accountName}
                copiedField={copiedField}
                fieldId="inv-bank-name"
                onCopy={copyToClipboard}
              />
              {bankAccount.currency === "EUR" && bankAccount.iban ? (
                <>
                  <CopyableField
                    label="IBAN"
                    value={bankAccount.iban}
                    copiedField={copiedField}
                    fieldId="inv-iban"
                    onCopy={copyToClipboard}
                  />
                  {bankAccount.bic && (
                    <CopyableField
                      label="BIC/SWIFT"
                      value={bankAccount.bic}
                      copiedField={copiedField}
                      fieldId="inv-bic"
                      onCopy={copyToClipboard}
                    />
                  )}
                </>
              ) : (
                <>
                  <CopyableField
                    label="Account Number"
                    value={bankAccount.fullAccountNumber}
                    copiedField={copiedField}
                    fieldId="inv-acc"
                    onCopy={copyToClipboard}
                  />
                  {bankAccount.routingNumber && (
                    <CopyableField
                      label="Routing Number"
                      value={bankAccount.routingNumber}
                      copiedField={copiedField}
                      fieldId="inv-routing"
                      onCopy={copyToClipboard}
                    />
                  )}
                  {bankAccount.sortCode && (
                    <CopyableField
                      label="Sort Code"
                      value={bankAccount.sortCode}
                      copiedField={copiedField}
                      fieldId="inv-sort"
                      onCopy={copyToClipboard}
                    />
                  )}
                </>
              )}
              <CopyableField
                label="Bank Name"
                value={bankAccount.bankName}
                copiedField={copiedField}
                fieldId="inv-bank"
                onCopy={copyToClipboard}
              />
              {bankAccount.bankAddress && (
                <CopyableField
                  label="Address"
                  value={bankAccount.bankAddress}
                  copiedField={copiedField}
                  fieldId="inv-bank-addr"
                  onCopy={copyToClipboard}
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => handleShare("bank")}
            >
              {copiedField === "share-bank" ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copiedField === "share-bank" ? "Copied" : "Share Account Details"}
            </Button>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Payment Instructions</p>
              <PaymentInstructions currency={invoice.currency} type="bank" />
            </div>
          </TabsContent>

          <TabsContent value="stablecoin" className="space-y-4 mt-4">
            {hasStablecoin && stablecoinAccount ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl border">
                    <QRCodeSVG
                      value={stablecoinAccount.address}
                      size={200}
                      level="M"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scan to send {stablecoinAccount.stablecoin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Network</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {stablecoinAccount.chain === "Solana"
                        ? "SOL"
                        : stablecoinAccount.chain === "Ethereum"
                          ? "ETH"
                          : stablecoinAccount.chain}
                    </span>
                    <span className="text-sm text-muted-foreground"> • </span>
                    <span className="text-sm text-muted-foreground">
                      {stablecoinAccount.chain}
                    </span>
                  </div>
                </div>
                <CopyableField
                  label="Address"
                  value={stablecoinAccount.address}
                  copiedField={copiedField}
                  fieldId="inv-addr"
                  onCopy={copyToClipboard}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleShare("stablecoin")}
                >
                  {copiedField === "share-stablecoin" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  {copiedField === "share-stablecoin" ? "Copied" : `Share ${stablecoinAccount.stablecoin} Details`}
                </Button>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Payment Instructions</p>
                  <PaymentInstructions
                    currency={invoice.currency}
                    type="stablecoin"
                  />
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Stablecoin payments for {invoice.currency} are coming soon.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
  )

  if (embedded) {
    return (
      <div className="pt-6 border-t">
        {header}
        {tabsContent}
      </div>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Invoice payment options</CardTitle>
        <p className="text-sm text-muted-foreground">
          {audienceDescriptions[audience]}
        </p>
      </CardHeader>
      <CardContent>{tabsContent}</CardContent>
    </Card>
  )
}
