"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Loader2,
  Mail,
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { mockAccounts, mockStablecoinAccounts } from "@/lib/mock-data"
import { businessInfo } from "@/lib/business-info"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useInvoices } from "@/lib/invoices-context"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"
import { InvoicePaymentOptions } from "@/components/invoice-payment-options"
import { downloadInvoicePdf } from "@/lib/use-invoice-pdf"
import type { Invoice } from "@/lib/mock-data"

const STATUS_ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  sent: "Invoice was sent to customer",
  paid: "Invoice was marked as paid",
  open: "Invoice was marked as unpaid",
  void: "Invoice was voided",
  past_due: "Invoice was marked past due",
  uncollectible: "Invoice was marked uncollectible",
  draft: "Invoice was reverted to draft",
  failed: "Invoice was marked as failed",
}

function getInvoiceActivities(invoice: Invoice): { id: string; type: string; description: string; timestamp: string }[] {
  const activities: { id: string; type: string; description: string; timestamp: string }[] = []
  const createdTs = invoice.createdDate.includes("T") ? invoice.createdDate : `${invoice.createdDate}T00:00:00`
  activities.push({ id: "1", type: "created", description: "Invoice was created", timestamp: createdTs })
  // Use statusHistory for status-change activities (each change = new activity)
  const history = invoice.statusHistory ?? []
  if (history.length > 0) {
    history.forEach((entry, i) => {
      const description = STATUS_ACTIVITY_DESCRIPTIONS[entry.status] ?? `Invoice status changed to ${entry.status}`
      const type = entry.status === "void" ? "voided" : entry.status === "open" ? "unpaid" : entry.status
      activities.push({
        id: `status-${i}-${entry.timestamp}`,
        type,
        description,
        timestamp: entry.timestamp,
      })
    })
  } else {
    // Fallback for invoices without statusHistory (legacy)
    if (invoice.status === "sent") {
      activities.push({
        id: "3",
        type: "sent",
        description: "Invoice was sent to customer",
        timestamp: createdTs,
      })
    }
    if (invoice.status === "void") {
      activities.push({
        id: "4",
        type: "voided",
        description: "Invoice was voided",
        timestamp: createdTs,
      })
    }
    if (invoice.status === "paid") {
      activities.push({
        id: "5",
        type: "paid",
        description: "Invoice was paid",
        timestamp: createdTs,
      })
    }
  }
  // Add notes as activities
  ;(invoice.notes ?? []).forEach((note) => {
    activities.push({
      id: `note-${note.id}`,
      type: "note",
      description: note.text,
      timestamp: note.createdAt,
    })
  })
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

const getActivityIcon = (type: string) => {
  const iconConfig = {
    voided: XCircle,
    sent: Mail,
    viewed: Eye,
    note: FileText,
    unpaid: XCircle,
    collection_off: AlertCircle,
    created: Clock,
    paid: CheckCircle,
  }
  return iconConfig[type as keyof typeof iconConfig] || Clock
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { invoices, updateInvoice, addInvoice, deleteInvoice } = useInvoices()
  const invoice = invoices.find((i) => i.id === params.id)
  const [showMoreActivities, setShowMoreActivities] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [customerViews, setCustomerViews] = useState<{ viewedAt: string }[]>([])
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleStatusChange = (newStatus: Invoice["status"]) => {
    if (!invoice) return
    const entry = { status: newStatus, timestamp: new Date().toISOString() }
    updateInvoice(invoice.id, {
      status: newStatus,
      statusHistory: [...(invoice.statusHistory ?? []), entry],
    })
  }

  const handleEdit = () => {
    router.push(`/invoices/create?edit=${invoice.id}`)
  }

  const handleDuplicate = () => {
    const newId = `inv_${Date.now()}`
    const newInvoiceNumber = `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const now = new Date().toISOString().split("T")[0]
    const duplicate: Invoice = {
      ...invoice,
      id: newId,
      invoiceNumber: newInvoiceNumber,
      status: "draft",
      createdDate: now,
      finalizedDate: null,
      statusHistory: [],
      archived: false,
    }
    addInvoice(duplicate)
    toast.success("Invoice duplicated")
    router.push(`/invoices/${duplicate.id}`)
  }

  const handleArchive = () => {
    updateInvoice(invoice.id, { archived: true })
    toast.success("Invoice archived")
    router.push("/invoices")
  }

  const handleUnarchive = () => {
    updateInvoice(invoice.id, { archived: false })
    toast.success("Invoice restored")
  }

  const handleDelete = () => {
    deleteInvoice(invoice.id)
    toast.success("Invoice deleted")
    router.push("/invoices")
  }

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
  // Fetch customer view events
  useEffect(() => {
    if (!invoice?.id) return
    fetch(`/api/invoices/${invoice.id}/views`)
      .then((res) => res.json())
      .then((data) => setCustomerViews(data.views ?? []))
      .catch(() => {})
  }, [invoice?.id])

  const activities = useMemo(() => {
    const base = getInvoiceActivities(invoice)
    const viewActivities = customerViews.map((v, i) => ({
      id: `view-${i}`,
      type: "viewed",
      description: "Invoice viewed by customer",
      timestamp: v.viewedAt,
    }))
    return [...base, ...viewActivities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [invoice, customerViews])

  const displayedActivities = showMoreActivities ? activities : activities.slice(0, 3)

  const formatDateWithTime = (dateString: string) => {
    return formatDate(dateString, {
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                  Change status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleStatusChange("paid")}
                  disabled={invoice.status === "paid"}
                >
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("open")}
                  disabled={invoice.status === "open"}
                >
                  Mark as Unpaid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("sent")}
                  disabled={invoice.status === "sent"}
                >
                  Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("past_due")}
                  disabled={invoice.status === "past_due"}
                >
                  Mark Past Due
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("void")}
                  disabled={invoice.status === "void"}
                >
                  Mark as Void
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground mt-1">
            Billed to {invoice.customerName} - {formatCurrency(invoice.total, invoice.currency)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {invoice.customerEmail?.trim() && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!invoice) return
                setIsSendingEmail(true)
                try {
                  const res = await fetch("/api/invoices/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoice }),
                  })
                  const data = await res.json()
                  if (!res.ok) {
                    throw new Error(data.error || "Failed to send email")
                  }
                  handleStatusChange("sent")
                  toast.success(`Invoice sent to ${invoice.customerEmail}`)
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Failed to send email"
                  )
                } finally {
                  setIsSendingEmail(false)
                }
              }}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Email Invoice
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!invoice) return
              setIsDownloading(true)
              try {
                await downloadInvoicePdf(invoice, bankAccount, stablecoinAccount)
              } catch (err) {
                console.error("Failed to download PDF:", err)
              } finally {
                setIsDownloading(false)
              }
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                Edit invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={invoice.archived ? handleUnarchive : handleArchive}>
                {invoice.archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice content: Business info | Bill to, line items, total, payment options */}
          <Card>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Business info | Bill to */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 sm:mb-8">
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold">{businessInfo.name}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{businessInfo.address}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{businessInfo.country}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{businessInfo.email}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{businessInfo.phone}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Bill to</h3>
                  {invoice.billToType === "company" && invoice.customerCompany ? (
                    <>
                      <p className="font-medium">{invoice.customerCompany}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                      {invoice.customerAddress && (
                        <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
                      )}
                      {invoice.customerPhone && (
                        <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                      )}
                      {invoice.customerName && (
                        <p className="text-sm text-muted-foreground mt-1">Attn: {invoice.customerName}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                      {invoice.customerAddress && (
                        <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
                      )}
                      {invoice.customerPhone && (
                        <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Line items - card layout on mobile, table on desktop */}
              <div className="mb-6">
                <div className="sm:hidden border rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2.5 bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  {invoice.lineItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start gap-3 px-3 py-3 border-t bg-muted/20"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
                        </p>
                      </div>
                      <span className="text-sm font-medium flex-shrink-0">
                        {formatCurrency(item.amount, invoice.currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block border rounded-lg overflow-hidden">
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
                          <td className="p-3 text-right text-sm">
                            {formatCurrency(item.unitPrice, invoice.currency)}
                          </td>
                          <td className="p-3 text-right text-sm font-medium">
                            {formatCurrency(item.amount, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice payment options */}
          {bankAccount && (
            <InvoicePaymentOptions
              invoice={invoice}
              bankAccount={bankAccount}
              stablecoinAccount={stablecoinAccount}
              audience="business"
            />
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">in_1QUWaMCWrIYLwGATet8R3tOJ</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("in_1QUWaMCWrIYLwGATet8R3tOJ", "id")}>
                    {copiedField === "id" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due date</span>
                <span className="text-sm">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(invoice.createdDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Invoice link</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(customerViewUrl, "invoice-link")}>
                    {copiedField === "invoice-link" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
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

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent activity</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoteText("")
                    setAddNoteOpen(true)
                  }}
                >
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
                          {formatDateWithTime(activity.timestamp)}
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
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice {invoice.invoiceNumber}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add note dialog */}
      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Add a note to this invoice..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!noteText.trim() || !invoice) return
                const newNote = {
                  id: `note-${Date.now()}`,
                  text: noteText.trim(),
                  createdAt: new Date().toISOString(),
                }
                updateInvoice(invoice.id, {
                  notes: [...(invoice.notes ?? []), newNote],
                })
                toast.success("Note added")
                setAddNoteOpen(false)
                setNoteText("")
              }}
              disabled={!noteText.trim()}
            >
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
