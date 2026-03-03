"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface Card {
  id: string
  type: "debit" | "credit"
  last4: string
  fullCardNumber: string
  cvv: string
  cardholderName: string
  expiryDate: string
  status: "active" | "inactive" | "blocked"
  balance: number
  billingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

interface CardDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card
}

export function CardDetailsDialog({ open, onOpenChange, card }: CardDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const fullCardNumber = card.fullCardNumber
  const cvv = card.cvv

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Card Number</label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <span className="flex-1 font-mono text-sm">{fullCardNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(fullCardNumber, "cardNumber")}
              >
                {copiedField === "cardNumber" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Expiry</label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <span className="flex-1 font-mono text-sm">{card.expiryDate}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(card.expiryDate, "expiry")}
                >
                  {copiedField === "expiry" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CVV</label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <span className="flex-1 font-mono text-sm">{cvv}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(cvv, "cvv")}>
                  {copiedField === "cvv" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cardholder Name</label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <span className="flex-1 text-sm">{card.cardholderName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(card.cardholderName, "name")}
              >
                {copiedField === "name" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Billing Address</label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <div className="flex-1 text-sm">
                <div>{card.billingAddress.street}</div>
                <div>
                  {card.billingAddress.city}, {card.billingAddress.state} {card.billingAddress.postalCode}
                </div>
                <div>{card.billingAddress.country}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 self-start"
                onClick={() => {
                  const fullAddress = `${card.billingAddress.street}, ${card.billingAddress.city}, ${card.billingAddress.state} ${card.billingAddress.postalCode}, ${card.billingAddress.country}`
                  copyToClipboard(fullAddress, "address")
                }}
              >
                {copiedField === "address" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
