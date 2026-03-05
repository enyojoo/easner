"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Copy,
  Download,
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { mockAccounts, mockStablecoinAccounts } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { businessInfo } from "@/lib/business-info"
import { useInvoices } from "@/lib/invoices-context"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"
import { InvoicePaymentOptions } from "@/components/invoice-payment-options"
import type { Invoice } from "@/lib/mock-data"

function getInvoiceActivities(invoice: Invoice): { id: string; type: string; description: string; timestamp: string }[] {
  const activities: { id: string; type: string; description: string; timestamp: string }[] = []
  const createdTs = invoice.createdDate.includes("T") ? invoice.createdDate : `${invoice.createdDate}T00:00:00`
  activities.push({ id: "1", type: "created", description: "Invoice was created", timestamp: createdTs })
  if (invoice.finalizedDate) {
    const finalizedTs = invoice.finalizedDate.includes("T") ? invoice.finalizedDate : `${invoice.finalizedDate}T00:00:00`
    activities.push({ id: "2", type: "finalized", description: "Invoice was finalized", timestamp: finalizedTs })
  }
  if (invoice.status === "void") {
    activities.push({
      id: "3",
      type: "voided",
      description: "Invoice was voided",
      timestamp: invoice.finalizedDate ? `${invoice.finalizedDate}T00:01:00` : createdTs,
    })
  }
  if (invoice.status === "paid") {
    activities.push({
      id: "4",
      type: "paid",
      description: "Invoice was paid",
      timestamp: invoice.finalizedDate ? `${invoice.finalizedDate}T00:02:00` : createdTs,
    })
  }
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

const getActivityIcon = (type: string) => {
  const iconConfig = {
    voided: XCircle,
    collection_off: AlertCircle,
    finalized: CheckCircle,
    created: Clock,
    paid: CheckCircle
  }
  
  return iconConfig[type as keyof typeof iconConfig] || Clock
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const { invoices } = useInvoices()
  const invoice = invoices.find((i) => i.id === params.id)
  const [showMoreActivities, setShowMoreActivities] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field?: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      if (field) {
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="py-12 text-center">
          <h2 className="text-lg font-semibold">Invoice not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            The invoice you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/invoices">
            <Button className="mt-4">Back to invoices</Button>
          </Link>
        </div>
      </div>
    )
  }

  const bankAccount = mockAccounts.find((a) => a.currency === invoice.currency)
  const stablecoinAccount = mockStablecoinAccounts.find((s) => s.currency === invoice.currency)
  const showPayCard = invoice.status === "open" || invoice.status === "past_due"
  const activities = getInvoiceActivities(invoice)
  const displayedActivities = showMoreActivities ? activities : activities.slice(0, 3)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const [customerViewUrl, setCustomerViewUrl] = useState(`/invoice-view/${invoice.id}`)
  useEffect(() => {
    setCustomerViewUrl(`${window.location.origin}/invoice-view/${invoice.id}`)
  }, [invoice.id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            Billed to {invoice.customerName} - {formatCurrency(invoice.total, invoice.currency)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPdfPreviewOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit invoice</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Send invoice</DropdownMenuItem>
              <DropdownMenuItem>Void invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice payment options */}
          {showPayCard && bankAccount && (
            <InvoicePaymentOptions
              invoice={invoice}
              bankAccount={bankAccount}
              stablecoinAccount={stablecoinAccount}
            />
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent activity</CardTitle>
                <Button variant="outline" size="sm">
                  Add note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayedActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {activities.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowMoreActivities(!showMoreActivities)}
                  >
                    {showMoreActivities ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Billed to</span>
                  <span className="text-sm font-medium">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Invoice number</span>
                  <span className="text-sm font-medium font-mono">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total amount</span>
                  <span className="text-sm font-medium">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due date</span>
                  <span className="text-sm font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">in_1QUWaMCWrIYLwGATet8R3tOJ</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("in_1QUWaMCWrIYLwGATet8R3tOJ", "id")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{formatDate(invoice.createdDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finalized</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{invoice.finalizedDate ? formatDate(invoice.finalizedDate) : "-"}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Invoice Link</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(customerViewUrl, "invoice-link")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Link href={`/invoice-view/${invoice.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div id="invoice-pdf-content" className="bg-white p-8 rounded-lg border">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-semibold">{businessInfo.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{businessInfo.address}</p>
                <p className="text-sm text-muted-foreground">{businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}</p>
                <p className="text-sm text-muted-foreground">{businessInfo.country}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">Invoice</h2>
                <p className="text-sm text-muted-foreground mt-1">{invoice.invoiceNumber}</p>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Bill to</h3>
                <p className="font-medium">{invoice.customerName}</p>
                <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Invoice details</h3>
                <p className="text-sm"><span className="text-muted-foreground">Due date:</span> {formatDate(invoice.dueDate)}</p>
                <p className="text-sm"><span className="text-muted-foreground">Created:</span> {formatDate(invoice.createdDate)}</p>
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
                  {invoice.lineItems.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 text-sm">{item.description}</td>
                      <td className="p-3 text-right text-sm">{item.quantity}</td>
                      <td className="p-3 text-right text-sm">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPdfPreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                const content = document.getElementById("invoice-pdf-content")
                if (content) {
                  const printWindow = window.open("", "_blank")
                  if (printWindow) {
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head><title>Invoice ${invoice.invoiceNumber}</title></head>
                        <body style="font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto;">
                          ${content.outerHTML}
                        </body>
                      </html>
                    `)
                    printWindow.document.close()
                    printWindow.focus()
                    printWindow.print()
                    printWindow.close()
                  }
                }
                setPdfPreviewOpen(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Print / Save as PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
