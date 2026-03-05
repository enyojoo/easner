"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardLast4: string
  cardForm?: "virtual" | "physical"
}

export function CardSettingsDialog({ open, onOpenChange, cardLast4, cardForm = "virtual" }: CardSettingsDialogProps) {
  const [settings, setSettings] = useState({
    onlineTransactions: true,
    non3dsTransactions: false,
    atmWithdrawals: true,
    spendingLimit: "5000",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-left">
          <DialogTitle>Card Settings</DialogTitle>
          <DialogDescription>Manage settings for {cardForm} card ending in {cardLast4}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-left">
          {/* Transaction Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-left">Transaction Controls</h4>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="online" className="flex flex-col gap-1 text-left items-start flex-1 min-w-0">
                <span>Online Transactions</span>
                <span className="text-xs font-normal text-muted-foreground max-w-[280px]">
                  Use your card for online purchases. Mobile wallets like Google and Apple Pay will remain unaffected.
                </span>
              </Label>
              <Switch
                id="online"
                checked={settings.onlineTransactions}
                onCheckedChange={(checked) => setSettings({ ...settings, onlineTransactions: checked })}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="non3ds" className="flex flex-col gap-1 text-left items-start flex-1 min-w-0">
                <span>Non-3DS Online Transactions</span>
                <span className="text-xs font-normal text-muted-foreground max-w-[280px]">
                  Allow online payments without 3D Secure (3DS). This may increase fraud risk.
                </span>
              </Label>
              <Switch
                id="non3ds"
                checked={settings.non3dsTransactions}
                onCheckedChange={(checked) => setSettings({ ...settings, non3dsTransactions: checked })}
              />
            </div>

            {cardForm === "physical" && (
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="atm" className="flex flex-col gap-1 text-left items-start flex-1 min-w-0">
                  <span>ATM Withdrawals</span>
                  <span className="text-xs font-normal text-muted-foreground max-w-[280px]">
                    Allow cash withdrawals at ATMs.
                  </span>
                </Label>
                <Switch
                  id="atm"
                  checked={settings.atmWithdrawals}
                  onCheckedChange={(checked) => setSettings({ ...settings, atmWithdrawals: checked })}
                />
              </div>
            )}
          </div>

          {/* Spending Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Spending Limit</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="limit"
                type="number"
                value={settings.spendingLimit}
                onChange={(e) => setSettings({ ...settings, spendingLimit: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
