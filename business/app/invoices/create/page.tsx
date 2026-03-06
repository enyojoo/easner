"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Mail,
  MapPin,
  FileText
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { mockCustomers } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { useInvoices } from "@/lib/invoices-context"
import type { Invoice } from "@/lib/mock-data"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceForm {
  customerId: string
  billToType: "individual" | "company"
  customerName: string
  customerEmail: string
  customerCompany: string
  customerAddress: string
  customerPhone: string
  currency: string
  dueDate: string
  memo: string
  lineItems: LineItem[]
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const { invoices, addInvoice, updateInvoice } = useInvoices()
  const invoiceToEdit = editId ? invoices.find((i) => i.id === editId) : null
  const isEditMode = !!invoiceToEdit

  const [formData, setFormData] = useState<InvoiceForm>({
    customerId: "",
    billToType: "individual",
    customerName: "",
    customerEmail: "",
    customerCompany: "",
    customerAddress: "",
    customerPhone: "",
    currency: "USD",
    dueDate: "",
    memo: "",
    lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 }]
  })

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Calculate totals
  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0 // For now, no tax
  const total = subtotal + tax

  // Update line item
  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    }))
  }

  // Add new line item
  const addLineItem = () => {
    const newId = (formData.lineItems.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, description: "", quantity: 1, unitPrice: 0, amount: 0 }]
    }))
  }

  // Remove line item
  const removeLineItem = (id: string) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }))
    }
  }

  // Select customer
  const selectCustomer = (customer: (typeof mockCustomers)[0]) => {
    const hasCompany = !!customer.company?.trim()
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerCompany: customer.company || "",
      customerAddress: customer.address || "",
      customerPhone: customer.phone || "",
      billToType: hasCompany ? "company" : "individual",
    }))
    setIsCustomerDialogOpen(false)
  }

  const createInvoiceFromForm = (status: "draft" | "open"): Invoice => {
    const now = new Date().toISOString().split("T")[0]
    const lineItems = formData.lineItems
      .filter((item) => item.description.trim() && item.amount > 0)
      .map(({ description, quantity, unitPrice, amount }) => ({
        description,
        quantity,
        unitPrice,
        amount,
      }))
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const base = {
      customerName: formData.customerName || "Unknown",
      customerEmail: formData.customerEmail || "",
      total,
      currency: formData.currency,
      status,
      dueDate: formData.dueDate || now,
      frequency: null,
      lineItems,
      billToType: formData.billToType,
      customerAddress: formData.customerAddress || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerCompany: formData.billToType === "company" ? (formData.customerCompany || undefined) : undefined,
      memo: formData.memo?.trim() || undefined,
    }
    if (isEditMode && invoiceToEdit) {
      return {
        ...invoiceToEdit,
        ...base,
        createdDate: invoiceToEdit.createdDate,
        finalizedDate: status === "draft" ? null : (invoiceToEdit.finalizedDate || now),
        notes: invoiceToEdit.notes,
        statusHistory: invoiceToEdit.statusHistory,
        archived: invoiceToEdit.archived,
      }
    }
    return {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdDate: now,
      finalizedDate: status === "draft" ? null : now,
      ...base,
    }
  }

  const handleSaveDraft = () => {
    const invoice = createInvoiceFromForm("draft")
    if (isEditMode) {
      updateInvoice(invoice.id, invoice)
      router.push(`/invoices/${invoice.id}`)
    } else {
      addInvoice(invoice)
      router.push(`/invoices/${invoice.id}`)
    }
  }

  const handleSendInvoice = () => {
    const invoice = createInvoiceFromForm("open")
    if (isEditMode) {
      updateInvoice(invoice.id, invoice)
      router.push(`/invoices/${invoice.id}`)
    } else {
      addInvoice(invoice)
      router.push(`/invoices/${invoice.id}`)
    }
  }

  // Load invoice when editing (including duplicated invoices)
  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        customerId: mockCustomers.find((c) => c.email === invoiceToEdit.customerEmail)?.id ?? "invoice",
        billToType: (invoiceToEdit.billToType as "individual" | "company") || "individual",
        customerName: invoiceToEdit.customerName,
        customerEmail: invoiceToEdit.customerEmail,
        customerCompany: invoiceToEdit.customerCompany || "",
        customerAddress: invoiceToEdit.customerAddress || "",
        customerPhone: invoiceToEdit.customerPhone || "",
        currency: invoiceToEdit.currency,
        dueDate: invoiceToEdit.dueDate,
        memo: invoiceToEdit.memo || "",
        lineItems: invoiceToEdit.lineItems.map((item, i) => ({
          id: (i + 1).toString(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      })
    }
  }, [editId, invoiceToEdit])

  // Set default due date (30 days from now) - only when creating
  useEffect(() => {
    if (!isEditMode) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        dueDate: futureDate.toISOString().split('T')[0]
      }))
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditMode ? "Edit invoice" : "Create invoice"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update your invoice details" : "Create a new invoice for your customer"}
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.customerId ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formData.customerName}</p>
                      <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                      {formData.customerCompany && (
                        <p className="text-sm text-muted-foreground">{formData.customerCompany}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsCustomerDialogOpen(true)}>
                      Change
                    </Button>
                  </div>
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex gap-4">
                      <Label className="text-sm font-medium">Bill to</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formData.billToType === "individual" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData((p) => ({ ...p, billToType: "individual" }))}
                        >
                          Individual
                        </Button>
                        <Button
                          type="button"
                          variant={formData.billToType === "company" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData((p) => ({ ...p, billToType: "company" }))}
                        >
                          Company
                        </Button>
                      </div>
                    </div>
                    {formData.billToType === "individual" ? (
                      <>
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={formData.customerName}
                            onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
                            placeholder="Customer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))}
                            placeholder="customer@example.com"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Company name</Label>
                          <Input
                            value={formData.customerCompany}
                            onChange={(e) => setFormData((p) => ({ ...p, customerCompany: e.target.value }))}
                            placeholder="Company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Attn (contact person)</Label>
                          <Input
                            value={formData.customerName}
                            onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
                            placeholder="Contact person name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))}
                            placeholder="billing@company.com"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label>Address (optional)</Label>
                      <Input
                        value={formData.customerAddress}
                        onChange={(e) => setFormData((p) => ({ ...p, customerAddress: e.target.value }))}
                        placeholder="Street, city, state, zip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone (optional)</Label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData((p) => ({ ...p, customerPhone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setIsCustomerDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Select Customer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
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
                <div className="space-y-3">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }))
                            setIsCalendarOpen(false)
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="memo">Memo</Label>
                <Input
                  id="memo"
                  placeholder="Add a note to your customer"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Amount</Label>
                      <Input
                        value={`$${item.amount.toFixed(2)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={formData.lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={addLineItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, formData.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax, formData.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Total</span>
                <span>{formatCurrency(total, formData.currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button className="w-full" onClick={handleSendInvoice}>
                <Send className="h-4 w-4 mr-2" />
                {isEditMode ? "Save Changes" : "Create Invoice"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mockCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => selectCustomer(customer)}
              >
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.company}</p>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
