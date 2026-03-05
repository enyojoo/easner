"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download, Loader2 } from "lucide-react"
import { getInvoiceById } from "@/lib/invoice-store"
import { businessInfo } from "@/lib/business-info"
import { mockAccounts, mockStablecoinAccounts } from "@/lib/mock-data"
import { formatDate, formatCurrency } from "@/lib/utils"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"
import { InvoicePaymentOptions } from "@/components/invoice-payment-options"
import { downloadInvoicePdf } from "@/lib/use-invoice-pdf"
import { BusinessLogo } from "@/components/brand/business-logo"

export default function InvoiceViewPage() {
  const params = useParams()
  const invoice = getInvoiceById(params.id as string)
  const [paymentTab, setPaymentTab] = useState<"bank" | "stablecoin">("bank")
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = async () => {
    if (typeof window === "undefined" || !invoice) return
    const url = `${window.location.origin}/invoice-view/${invoice.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  if (!invoice) {
    return (
      <div className="w-full max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="text-lg font-semibold">Invoice not found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This invoice may have been removed or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bankAccount = mockAccounts.find((a) => a.currency === invoice.currency)
  const stablecoinAccount = mockStablecoinAccounts.find(
    (s) => s.currency === invoice.currency
  )
  const showPayCard =
    (invoice.status === "open" || invoice.status === "past_due") && bankAccount

  const handleDownloadPdf = async () => {
    if (!invoice) return
    setIsDownloading(true)
    try {
      await downloadInvoicePdf(invoice, bankAccount, stablecoinAccount)
    } catch (err) {
      console.error("Failed to download PDF:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center gap-4 print:hidden">
        <BusinessLogo size="lg" href="/" />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
          {copiedLink ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copiedLink ? "Copied" : "Copy Link"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
        </div>
      </div>
      <Card className="print:shadow-none print:border">
        <CardContent className="p-8">
          {/* Business info & Invoice header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-semibold">{businessInfo.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{businessInfo.address}</p>
              <p className="text-sm text-muted-foreground">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">{businessInfo.country}</p>
              <p className="text-sm text-muted-foreground mt-2">{businessInfo.email}</p>
              <p className="text-sm text-muted-foreground">{businessInfo.phone}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold">Invoice</h1>
              <p className="text-sm text-muted-foreground mt-1">{invoice.invoiceNumber}</p>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Bill to & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Bill to</h3>
              <p className="font-medium">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
            </div>
            <div />
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Invoice details</h3>
              <p className="text-sm">
                <span className="text-muted-foreground">Due date:</span> {formatDate(invoice.dueDate)}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Created:</span> {formatDate(invoice.createdDate)}
              </p>
            </div>
          </div>

          {/* Line items */}
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

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
            </div>
          </div>

          {/* Invoice payment options */}
          {showPayCard && bankAccount && (
            <InvoicePaymentOptions
              invoice={invoice}
              bankAccount={bankAccount}
              stablecoinAccount={stablecoinAccount}
              embedded
              audience="customer"
              value={paymentTab}
              onValueChange={setPaymentTab}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
