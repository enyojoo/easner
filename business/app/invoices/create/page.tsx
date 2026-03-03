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
  Eye,
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

// Mock customers data
const mockCustomers = [
  { id: "1", name: "Rosalyn Ward", email: "rosward1990@gmail.com", company: "Ward Enterprises" },
  { id: "2", name: "Wilson Dagah", email: "admin@thekingsrubies.org", company: "The Kings Rubies" },
  { id: "3", name: "Sarah Johnson", email: "sarah.johnson@techcorp.com", company: "TechCorp Solutions" },
  { id: "4", name: "Michael Chen", email: "m.chen@startup.io", company: "StartupIO" }
]

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceForm {
  customerId: string
  customerName: string
  customerEmail: string
  customerCompany: string
  currency: string
  dueDate: string
  memo: string
  lineItems: LineItem[]
}

export default function CreateInvoicePage() {
  const [formData, setFormData] = useState<InvoiceForm>({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerCompany: "",
    currency: "USD",
    dueDate: "",
    memo: "",
    lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 }]
  })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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
  const selectCustomer = (customer: typeof mockCustomers[0]) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerCompany: customer.company
    }))
    setIsCustomerDialogOpen(false)
  }

  // Set default due date (30 days from now)
  useEffect(() => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      dueDate: futureDate.toISOString().split('T')[0]
    }))
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
          <h1 className="text-2xl font-semibold text-foreground">Create invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your customer</p>
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
            <CardContent>
              {formData.customerId ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formData.customerName}</p>
                      <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                      <p className="text-sm text-muted-foreground">{formData.customerCompany}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCustomerDialogOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
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
                <span>${subtotal.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)} {formData.currency}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
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

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-8 rounded-lg border">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold">Invoice</h2>
                <p className="text-sm text-muted-foreground">Invoice number: DRAFT-{Date.now().toString().slice(-6)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Easner Banking</p>
                <p className="text-sm text-muted-foreground">123 Business St</p>
                <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Bill to:</h3>
                <p className="font-medium">{formData.customerName || "Select a customer"}</p>
                <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                <p className="text-sm text-muted-foreground">{formData.customerCompany}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Invoice details:</h3>
                <p className="text-sm"><span className="text-muted-foreground">Due date:</span> {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : "Not set"}</p>
                <p className="text-sm"><span className="text-muted-foreground">Currency:</span> {formData.currency}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Description</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Qty</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Unit Price</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lineItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 text-sm">{item.description || "Item description"}</td>
                      <td className="p-3 text-right text-sm">{item.quantity}</td>
                      <td className="p-3 text-right text-sm">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">${tax.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)} {formData.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
