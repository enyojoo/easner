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
}

export function CardSettingsDialog({ open, onOpenChange, cardLast4 }: CardSettingsDialogProps) {
  const [settings, setSettings] = useState({
    onlineTransactions: true,
    internationalTransactions: false,
    spendingLimit: "5000",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Card Settings</DialogTitle>
          <DialogDescription>Manage settings for virtual card ending in {cardLast4}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Transaction Controls</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="online" className="flex flex-col gap-1">
                <span>Online Transactions</span>
                <span className="text-xs font-normal text-muted-foreground">Allow online and e-commerce purchases</span>
              </Label>
              <Switch
                id="online"
                checked={settings.onlineTransactions}
                onCheckedChange={(checked) => setSettings({ ...settings, onlineTransactions: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="international" className="flex flex-col gap-1">
                <span>International Transactions</span>
                <span className="text-xs font-normal text-muted-foreground">Allow purchases outside your country</span>
              </Label>
              <Switch
                id="international"
                checked={settings.internationalTransactions}
                onCheckedChange={(checked) => setSettings({ ...settings, internationalTransactions: checked })}
              />
            </div>
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
