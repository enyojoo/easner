"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Download,
  MoreHorizontal,
  DollarSign
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

// Mock invoices data
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "A99204FB-0001",
    customerName: "Rosalyn Ward",
    customerEmail: "rosward1990@gmail.com",
    total: 500.00,
    currency: "USD",
    status: "void",
    dueDate: "2024-12-15",
    createdDate: "2024-12-10",
    finalizedDate: "2024-12-10",
    frequency: null,
    lineItems: [
      { description: "Donation", quantity: 1, unitPrice: 500.00, amount: 500.00 }
    ]
  },
  {
    id: "2",
    invoiceNumber: "D91F75E6-0005",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 500.00,
    currency: "USD",
    status: "uncollectible",
    dueDate: "2024-12-15",
    createdDate: "2024-12-10",
    finalizedDate: "2024-12-10",
    frequency: null,
    lineItems: [
      { description: "Service Fee", quantity: 1, unitPrice: 500.00, amount: 500.00 }
    ]
  },
  {
    id: "3",
    invoiceNumber: "D91F75E6-0004",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 1000.00,
    currency: "USD",
    status: "failed",
    dueDate: "2024-05-30",
    createdDate: "2024-05-23",
    finalizedDate: "2024-05-23",
    frequency: null,
    lineItems: [
      { description: "Consulting Services", quantity: 10, unitPrice: 100.00, amount: 1000.00 }
    ]
  },
  {
    id: "4",
    invoiceNumber: "A99204FB-DRAFT",
    customerName: "Rosalyn Ward",
    customerEmail: "rosward1990@gmail.com",
    total: 0.00,
    currency: "USD",
    status: "draft",
    dueDate: "2024-05-30",
    createdDate: "2024-05-23",
    finalizedDate: null,
    frequency: null,
    lineItems: []
  },
  {
    id: "5",
    invoiceNumber: "D91F75E6-0003",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-02-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [
      { description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }
    ]
  },
  {
    id: "6",
    invoiceNumber: "D91F75E6-0002",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-01-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [
      { description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }
    ]
  },
  {
    id: "7",
    invoiceNumber: "D91F75E6-0001",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-01-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [
      { description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }
    ]
  }
]

const statusTabs = [
  { id: "all", label: "All invoices", count: mockInvoices.length },
  { id: "draft", label: "Draft", count: mockInvoices.filter(i => i.status === "draft").length },
  { id: "open", label: "Open", count: mockInvoices.filter(i => i.status === "open").length },
  { id: "past_due", label: "Past due", count: mockInvoices.filter(i => i.status === "past_due").length },
  { id: "paid", label: "Paid", count: mockInvoices.filter(i => i.status === "paid").length }
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: "Draft", variant: "secondary" as const },
    open: { label: "Open", variant: "default" as const },
    past_due: { label: "Past due", variant: "destructive" as const },
    paid: { label: "Paid", variant: "default" as const },
    void: { label: "Void", variant: "secondary" as const },
    uncollectible: { label: "Uncollectible", variant: "secondary" as const },
    failed: { label: "Failed", variant: "destructive" as const }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInvoices = useMemo(() => {
    let filtered = mockInvoices

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(invoice => invoice.status === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [activeTab, searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your billing and invoicing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/invoices/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-1 border-b">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first invoice"}
              </p>
              {!searchTerm && (
                <Link href="/invoices/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create invoice
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Frequency</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Invoice number</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Customer name</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Customer email</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Due</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Created</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground">Finalization</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/invoices/${invoice.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">${invoice.total.toFixed(2)} {invoice.currency}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </td>
                      <td className="p-4">
                        {invoice.frequency ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-3 h-3 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                            </div>
                            {invoice.frequency.charAt(0).toUpperCase() + invoice.frequency.slice(1)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="font-mono text-xs hover:text-primary transition-colors"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm">{invoice.customerName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">{invoice.customerEmail}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {formatDate(invoice.createdDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {invoice.finalizedDate ? formatDate(invoice.finalizedDate) : "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Send</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>Void</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        {filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
