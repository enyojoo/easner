"use client"

import { type Transaction, mockCards } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  hideType?: boolean
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
  hideType = false,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null

  const card = transaction.cardId ? mockCards.find((c) => c.id === transaction.cardId) : null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount and Status */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p
                className={`text-2xl font-semibold ${transaction.direction === "credit" ? "text-green-600" : "text-foreground"}`}
              >
                {transaction.direction === "credit" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
            <Badge
              variant={
                transaction.status === "completed"
                  ? "default"
                  : transaction.status === "pending"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize"
            >
              {transaction.status}
            </Badge>
          </div>

          {/* Transaction Details Grid */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Merchant</span>
              <span className="font-medium">{transaction.description}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{transaction.id}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(transaction.id)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {transaction.reference && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{transaction.reference}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(transaction.reference!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {!hideType && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{transaction.type.toUpperCase()}</span>
              </div>
            )}

            {transaction.category && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{transaction.category}</span>
              </div>
            )}

            {card && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Card</span>
                <span className="font-medium">•••• {card.last4}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {transaction.fee !== undefined && transaction.fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">${transaction.fee.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
