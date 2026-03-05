"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Lock } from "lucide-react"

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pin: string) => void
  title?: string
  description?: string
  confirmLabel?: string
}

export function PinDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Enter Transfer PIN",
  description = "Enter your 4-digit PIN to authorize this transfer",
  confirmLabel = "Confirm Transfer",
}: PinDialogProps) {
  const [pin, setPin] = useState("")

  const handleConfirm = () => {
    if (pin.length === 4) {
      onConfirm(pin)
      setPin("")
      onOpenChange(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setPin("")
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="relative flex justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-2xl font-semibold bg-background ${
                  pin.length === index ? "border-primary" : "border-input"
                }`}
              >
                {pin[index] || ""}
              </div>
            ))}
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder=""
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              autoFocus
            />
          </div>
          <Button
            onClick={handleConfirm}
            disabled={pin.length !== 4}
            className="w-full h-11"
            size="lg"
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
