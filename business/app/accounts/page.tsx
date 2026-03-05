"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAccounts, currencySymbols } from "@/lib/mock-data"
import { Plus, MoreVertical, FileText, Ban, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CurrencyDepositDialog } from "@/components/currency-deposit-dialog"
import { FXConvertDialog } from "@/components/fx-convert-dialog"

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
        {mockAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
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
                    <CurrencyDepositDialog
                      account={account}
                      copiedField={copiedField}
                      onCopy={copyToClipboard}
                    />
                    <FXConvertDialog account={account} />

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
        ))}
      </div>
    </div>
  )
}
