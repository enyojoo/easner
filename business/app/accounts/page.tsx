"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAccounts, currencySymbols } from "@/lib/mock-data"
import { Copy, Check, Plus, MoreVertical, FileText, Ban, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
}

export default function AccountsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getInsuranceInfo = (currency: string) => {
    switch (currency) {
      case "USD":
        return "FDIC insured up to $250,000"
      case "EUR":
        return "Protected up to €100,000 by EU Deposit Guarantee"
      case "GBP":
        return "FSCS protected up to £85,000"
      case "NGN":
        return "NDIC insured up to ₦500,000"
      default:
        return "Insured by local partner"
    }
  }

  const getAccountIdentifierLabel = (currency: string) => {
    switch (currency) {
      case "EUR":
        return "IBAN"
      case "GBP":
        return "Account Number"
      case "USD":
      case "NGN":
      default:
        return "Account Number"
    }
  }

  const getSecondaryIdentifier = (account: (typeof mockAccounts)[0]) => {
    if (account.currency === "USD" && account.routingNumber) {
      return { label: "Routing Number", value: account.routingNumber }
    }
    if (account.currency === "GBP" && account.sortCode) {
      return { label: "Sort Code", value: account.sortCode }
    }
    if (account.currency === "EUR" && account.bic) {
      return { label: "BIC/SWIFT", value: account.bic }
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-currency accounts powered by global banking partners
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Open Currency Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAccounts.map((account) => {
          const secondaryId = getSecondaryIdentifier(account)
          return (
            <Card key={account.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{currencyFlags[account.currency]}</div>
                        <div>
                          <h3 className="text-lg font-semibold">{account.currency}</h3>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {account.status}
                      </Badge>
                    </div>

                    <div className="mb-10">
                      <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                      <p className="text-3xl font-semibold">
                        {currencySymbols[account.currency]}
                        {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
                          <Plus className="h-4 w-4" />
                          Deposit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Account Details</DialogTitle>
                          <DialogDescription>Complete account information and details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
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
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">IBAN</p>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <code className="text-sm font-mono">{account.iban}</code>
                                  <button
                                    onClick={() => copyToClipboard(account.iban!, `dialog-iban-${account.id}`)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {copiedField === `dialog-iban-${account.id}` ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {account.bic && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">BIC/SWIFT</p>
                                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <code className="text-sm font-mono">{account.bic}</code>
                                    <button
                                      onClick={() => copyToClipboard(account.bic!, `dialog-bic-${account.id}`)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {copiedField === `dialog-bic-${account.id}` ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <code className="text-sm font-mono">{account.fullAccountNumber}</code>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(account.fullAccountNumber, `dialog-acc-${account.id}`)
                                    }
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {copiedField === `dialog-acc-${account.id}` ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {account.routingNumber && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Routing Number</p>
                                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <code className="text-sm font-mono">{account.routingNumber}</code>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(account.routingNumber!, `dialog-routing-${account.id}`)
                                      }
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {copiedField === `dialog-routing-${account.id}` ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {account.sortCode && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Sort Code</p>
                                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <code className="text-sm font-mono">{account.sortCode}</code>
                                    <button
                                      onClick={() => copyToClipboard(account.sortCode!, `dialog-sort-${account.id}`)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {copiedField === `dialog-sort-${account.id}` ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Currency</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <span className="text-xl">{currencyFlags[account.currency]}</span>
                              {account.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <Badge variant="secondary" className="capitalize">
                              {account.status}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              {getInsuranceInfo(account.currency)} • {account.bankName}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="px-2 bg-transparent">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <FileText className="h-4 w-4" />
                          Download Statement
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <Ban className="h-4 w-4" />
                          Disable Account
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
