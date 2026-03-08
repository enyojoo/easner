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
  Search,
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
import { formatCurrency } from "@/lib/utils"
import { useInvoices } from "@/lib/invoices-context"
import { useCustomers } from "@/lib/customers-context"
import { generateInvoiceId } from "@/lib/invoice-id"
import type { Invoice } from "@/lib/mock-data"
import { AddEditCustomerDialog } from "@/components/add-edit-customer-dialog"

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
  taxRate: number
  lineItems: LineItem[]
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const { invoices, addInvoice, updateInvoice } = useInvoices()
  const { customers, addCustomer } = useCustomers()
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
    taxRate: 0,
    lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 }]
  })

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Calculate totals
  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * (formData.taxRate / 100)
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
  const selectCustomer = (customer: (typeof customers)[0]) => {
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
    setCustomerSearchTerm("")
  }

  const filteredCustomers = customers.filter(
    (c) =>
      !customerSearchTerm.trim() ||
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase())
  )

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
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * (formData.taxRate / 100)
    const total = subtotal + tax
    const base = {
      customerName: formData.customerName || "Unknown",
      customerEmail: formData.customerEmail || "",
      subtotal,
      taxRate: formData.taxRate,
      tax,
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
    const id = generateInvoiceId()
    return {
      id,
      invoiceNumber: `EINV-${id.slice(4)}`,
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
        customerId: customers.find((c) => c.email === invoiceToEdit.customerEmail)?.id ?? "invoice",
        billToType: (invoiceToEdit.billToType as "individual" | "company") || "individual",
        customerName: invoiceToEdit.customerName,
        customerEmail: invoiceToEdit.customerEmail,
        customerCompany: invoiceToEdit.customerCompany || "",
        customerAddress: invoiceToEdit.customerAddress || "",
        customerPhone: invoiceToEdit.customerPhone || "",
        currency: invoiceToEdit.currency,
        dueDate: invoiceToEdit.dueDate,
        taxRate: invoiceToEdit.taxRate ?? 0,
        lineItems: invoiceToEdit.lineItems.map((item, i) => ({
          id: (i + 1).toString(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      })
    }
  }, [editId, invoiceToEdit, customers])

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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {formData.customerCompany?.trim() || formData.customerName}
                    </p>
                    {formData.customerCompany?.trim() ? (
                      <p className="text-sm text-muted-foreground">{formData.customerName}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsCustomerDialogOpen(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsAddCustomerDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add new customer
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsCustomerDialogOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Select existing customer
                  </Button>
                </div>
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
          {/* Action buttons - above Invoice Summary */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button className="flex-1" onClick={handleSendInvoice}>
              {isEditMode ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>

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
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Label htmlFor="taxRate" className="text-muted-foreground text-sm font-normal">
                    Tax rate (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.taxRate || ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      setFormData((p) => ({ ...p, taxRate: isNaN(v) ? 0 : Math.min(100, Math.max(0, v)) }))
                    }}
                    placeholder="0"
                    className="w-20 h-8 text-sm"
                  />
                </div>
                <span>{formatCurrency(tax, formData.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Total</span>
                <span>{formatCurrency(total, formData.currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={(open) => {
          if (!open) setCustomerSearchTerm("")
          setIsCustomerDialogOpen(open)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="overflow-y-auto min-h-0 flex-1 space-y-2 pr-1 -mr-1">
            {filteredCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {customerSearchTerm ? "No customers match your search" : "No customers yet"}
              </p>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => selectCustomer(customer)}
                >
                  <div>
                    <p className="font-medium">
                      {customer.company?.trim() || customer.name}
                    </p>
                    {customer.company?.trim() ? (
                      <p className="text-sm text-muted-foreground">{customer.name}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddEditCustomerDialog
        open={isAddCustomerDialogOpen}
        onOpenChange={setIsAddCustomerDialogOpen}
        onSave={(c) => {
          addCustomer(c)
          selectCustomer(c)
          setIsAddCustomerDialogOpen(false)
        }}
      />
    </div>
  )
}
