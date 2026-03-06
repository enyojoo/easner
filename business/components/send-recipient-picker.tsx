"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RecipientForm } from "@/components/recipient-form"
import { mockBeneficiaries } from "@/lib/mock-data"
import type { Beneficiary } from "@/lib/mock-data"
import { Label } from "@/components/ui/label"
import { Search, Plus, User, ChevronDown } from "lucide-react"

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
}

function maskAccount(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return "****"
  return `****${accountNumber.slice(-4)}`
}

interface SendRecipientPickerProps {
  selected: Beneficiary | null
  onSelect: (beneficiary: Beneficiary | null) => void
  beneficiaries?: Beneficiary[]
  label?: string
}

export function SendRecipientPicker({
  selected,
  onSelect,
  beneficiaries: initialBeneficiaries,
  label = "Recipient",
}: SendRecipientPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    () => initialBeneficiaries ?? mockBeneficiaries
  )

  const filteredBeneficiaries = useMemo(() => {
    if (!searchTerm.trim()) return beneficiaries
    const term = searchTerm.toLowerCase()
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.bankName.toLowerCase().includes(term) ||
        b.country.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term)
    )
  }, [beneficiaries, searchTerm])

  const handleAddSuccess = (newBeneficiary?: Beneficiary) => {
    if (newBeneficiary) {
      setBeneficiaries((prev) => [...prev, newBeneficiary])
      onSelect(newBeneficiary)
    }
    setIsAddDialogOpen(false)
    setIsPickerOpen(false)
  }

  const handleSelect = (b: Beneficiary) => {
    onSelect(b)
    setIsPickerOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{selected.name}</p>
              <p className="text-sm text-muted-foreground">
                {currencyFlags[selected.currency] || ""} {selected.currency} • {maskAccount(selected.fullAccountNumber)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Select recipient</span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select recipient</DialogTitle>
            <DialogDescription>Choose a saved beneficiary or add a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, bank, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto space-y-1">
              {filteredBeneficiaries.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-muted hover:border-input"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{b.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {b.bankName} • {currencyFlags[b.currency] || ""} {b.currency}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add new beneficiary
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add beneficiary</DialogTitle>
            <DialogDescription>Enter the recipient&apos;s details</DialogDescription>
          </DialogHeader>
          <RecipientForm
            onSuccess={() => handleAddSuccess()}
            onSuccessWithData={(b) => handleAddSuccess(b)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
