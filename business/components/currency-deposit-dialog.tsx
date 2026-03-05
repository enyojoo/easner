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
import { Copy, Check, Plus } from "lucide-react"
import { mockAccounts, mockStablecoinAccounts, type Account } from "@/lib/mock-data"
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

interface CurrencyDepositDialogProps {
  account: Account
  copiedField: string | null
  onCopy: (text: string, field: string) => void
}

export function CurrencyDepositDialog({ account, copiedField, onCopy }: CurrencyDepositDialogProps) {
  const stablecoinAccount = mockStablecoinAccounts.find((s) => s.currency === account.currency)
  const hasStablecoin = stablecoinAccount !== undefined
  const reference = `DEP-${account.currency}-${account.accountNumber.replace(/\*/g, "")}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
          <Plus className="h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{account.currency} Deposit</DialogTitle>
          <DialogDescription>
            Deposit funds via bank transfer or stablecoin. Both methods credit your {account.currency} balance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank">Bank account</TabsTrigger>
            <TabsTrigger value="stablecoin">Stablecoin</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                <p className="text-sm font-medium">{account.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                <p className="text-sm font-medium">{account.accountName}</p>
              </div>
            </div>

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
              label="Reference (for reconciliation)"
              value={reference}
              copiedField={copiedField}
              fieldId={`bank-ref-${account.id}`}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="stablecoin" className="space-y-4 mt-4">
            {hasStablecoin && stablecoinAccount ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-sm font-medium">Send {stablecoinAccount.stablecoin} (1:1 with {account.currency})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chain</p>
                  <p className="text-sm font-medium">{stablecoinAccount.chain}</p>
                </div>
                <CopyableField
                  label="Address"
                  value={stablecoinAccount.address}
                  copiedField={copiedField}
                  fieldId={`stable-addr-${account.id}`}
                  onCopy={onCopy}
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                  <div className="p-4 bg-white rounded-lg inline-block">
                    <QRCodeSVG value={stablecoinAccount.address} size={160} level="M" />
                  </div>
                </div>
                <CopyableField
                  label="Memo"
                  value={stablecoinAccount.memo}
                  copiedField={copiedField}
                  fieldId={`stable-memo-${account.id}`}
                  onCopy={onCopy}
                />
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
