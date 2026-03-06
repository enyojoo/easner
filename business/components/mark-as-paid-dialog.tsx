"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Banknote, Building2, Check, Search } from "lucide-react"
import { getInboundDeposits, type InboundDeposit } from "@/lib/deposits"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Invoice, InvoicePaymentInfo } from "@/lib/mock-data"

type PaymentMethodChoice = "cash" | "easner" | null

interface MarkAsPaidDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (paymentInfo: InvoicePaymentInfo) => void
}

export function MarkAsPaidDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: MarkAsPaidDialogProps) {
  const [step, setStep] = useState<PaymentMethodChoice>(null)
  const [cashNote, setCashNote] = useState("")
  const [selectedDeposit, setSelectedDeposit] = useState<InboundDeposit | null>(null)
  const [search, setSearch] = useState("")

  const deposits = getInboundDeposits(invoice, search || undefined)

  useEffect(() => {
    if (open) {
      setStep(null)
      setCashNote("")
      setSelectedDeposit(null)
      setSearch("")
    }
  }, [open])

  const handleClose = () => {
    setStep(null)
    setCashNote("")
    setSelectedDeposit(null)
    setSearch("")
    onOpenChange(false)
  }

  const handleMarkAsPaid = () => {
    const paidAt = new Date().toISOString()
    const entry = { status: "paid" as const, timestamp: paidAt }

    if (step === "cash") {
      onSuccess({
        paidAt,
        method: "cash",
        cashNote: cashNote.trim() || undefined,
      })
      handleClose()
      return
    }

    if (step === "easner" && selectedDeposit) {
      onSuccess({
        paidAt,
        method: "easner",
        transactionId: selectedDeposit.id,
      })
      handleClose()
      return
    }
  }

  const canMarkAsPaid =
    step === "cash" || (step === "easner" && selectedDeposit !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Mark as Paid</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {step === null && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                How was the invoice paid?
              </p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setStep("cash")}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">External Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Payment received outside Easner Banking
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("easner")}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Easner Banking</p>
                    <p className="text-sm text-muted-foreground">
                      Bank transfer or stablecoin through Easner Banking
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "cash" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Optional note
                </label>
                <Textarea
                  placeholder="e.g. Received in person, check #1234..."
                  value={cashNote}
                  onChange={(e) => setCashNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {step === "easner" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep(null)
                  setSelectedDeposit(null)
                  setSearch("")
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, description, or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {deposits.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No matching deposits found
                  </div>
                ) : (
                  <div className="divide-y">
                    {deposits.map((d) => {
                      const isSelected = selectedDeposit?.id === d.id
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            setSelectedDeposit((prev) =>
                              prev?.id === d.id ? null : d
                            )
                          }
                          className={`w-full flex items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${
                            isSelected
                              ? "bg-primary/10 ring-2 ring-primary ring-inset"
                              : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{d.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.id} • {formatDate(d.date)}
                              {d.reference && ` • ${d.reference}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-medium text-sm">
                              {formatCurrency(d.amount, d.currency)}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkAsPaid}
            disabled={!canMarkAsPaid}
          >
            Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
