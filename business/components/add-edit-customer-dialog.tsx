"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Customer } from "@/lib/mock-data"

interface AddEditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSave: (customer: Customer) => void
}

export function AddEditCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: AddEditCustomerDialogProps) {
  const isEdit = !!customer
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [address, setAddress] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (customer) {
        setName(customer.name)
        setEmail(customer.email)
        setPhone(customer.phone || "")
        setCompany(customer.company || "")
        setAddress(customer.address || "")
        setCurrency(customer.currency || "USD")
      } else {
        setName("")
        setEmail("")
        setPhone("")
        setCompany("")
        setAddress("")
        setCurrency("USD")
      }
      setError(null)
    }
  }, [open, customer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError("Name is required")
      return
    }
    if (!trimmedEmail) {
      setError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      return
    }

    const customerData: Customer = isEdit
      ? {
          ...customer!,
          name: trimmedName,
          email: trimmedEmail,
          phone: phone.trim(),
          company: company.trim(),
          address: address.trim(),
          currency: currency,
        }
      : {
          id: `cust_${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
          phone: phone.trim(),
          company: company.trim(),
          address: address.trim(),
          totalInvoices: 0,
          totalPaid: 0,
          currency: currency,
          lastInvoiceDate: "",
        }

    onSave(customerData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed (used for invoice linking)
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, state, zip"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Add Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
