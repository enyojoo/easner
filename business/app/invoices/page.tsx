"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useRouter } from "next/navigation"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useInvoices } from "@/lib/invoices-context"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"

export default function InvoicesPage() {
  const router = useRouter()
  const { invoices } = useInvoices()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const activeInvoices = invoices.filter((i) => !i.archived)
  const archivedInvoices = invoices.filter((i) => i.archived)

  const statusTabs = [
    { id: "all", label: "All invoices", count: activeInvoices.length },
    { id: "draft", label: "Draft", count: activeInvoices.filter((i) => i.status === "draft").length },
    { id: "open", label: "Unpaid", count: activeInvoices.filter((i) => i.status === "open" || i.status === "sent").length },
    { id: "past_due", label: "Past due", count: activeInvoices.filter((i) => i.status === "past_due").length },
    { id: "paid", label: "Paid", count: activeInvoices.filter((i) => i.status === "paid").length },
    { id: "archived", label: "Archived", count: archivedInvoices.length },
  ]

  const filteredInvoices = useMemo(() => {
    let filtered = activeTab === "archived" ? archivedInvoices : activeInvoices

    // Filter by status tab (when not viewing archived)
    if (activeTab !== "all" && activeTab !== "archived") {
      if (activeTab === "open") {
        filtered = filtered.filter(invoice => invoice.status === "open" || invoice.status === "sent")
      } else {
        filtered = filtered.filter(invoice => invoice.status === activeTab)
      }
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
  }, [invoices, activeTab, searchTerm, activeInvoices, archivedInvoices])

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Tabs - sticky so content doesn't scroll through */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 shrink-0 pb-4 bg-background border-b">
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
        <div className="flex space-x-1">
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
      </div>

      {/* Invoices Table - fixed min-height for consistent view when switching tabs */}
      <Card className="flex flex-col min-h-[400px]">
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {filteredInvoices.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
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
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full min-w-[800px] table-fixed">
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Customer name</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Invoice number</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Amount</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Created</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Due</th>
                    <th className="text-left p-4 font-medium text-xs text-muted-foreground align-middle">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                      <td className="p-4 align-middle min-w-0">
                        <span className="font-medium text-sm block truncate">{invoice.customerName}</span>
                      </td>
                      <td className="p-4 align-middle min-w-0">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-mono text-xs hover:text-primary transition-colors block truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="font-semibold text-sm tabular-nums">{formatCurrency(invoice.total, invoice.currency)}</span>
                      </td>
                      <td className="p-4 align-middle min-w-0">
                        <span className="text-xs text-muted-foreground block truncate">
                          {formatDate(invoice.createdDate)}
                        </span>
                      </td>
                      <td className="p-4 align-middle min-w-0">
                        <span className="text-xs text-muted-foreground block truncate">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="p-4 align-middle">
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
      <div className="text-sm text-muted-foreground shrink-0 pt-2">
        {filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
