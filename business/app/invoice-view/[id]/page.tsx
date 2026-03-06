"use client"

import { useState, useEffect } from "react"
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
import { BRAND } from "@/components/brand/brand-constants"

export default function InvoiceViewPage() {
  const params = useParams()
  const invoice = getInvoiceById(params.id as string)
  const [paymentTab, setPaymentTab] = useState<"bank" | "stablecoin">("bank")
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Record view when page loads (API checks IP to distinguish customer vs business owner)
  useEffect(() => {
    if (invoice?.id) {
      fetch(`/api/invoices/${invoice.id}/record-view`, { method: "POST" }).catch(
        () => {}
      )
    }
  }, [invoice?.id])

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
    (invoice.status === "open" || invoice.status === "sent" || invoice.status === "past_due") && bankAccount

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
    <div className="w-full max-w-2xl">
      <Card className="print:shadow-none print:border">
        <CardContent className="p-4 pt-1 pb-0.5 sm:p-6 sm:pt-2 sm:pb-1 lg:p-8 lg:pt-3 lg:pb-2">
          {/* Copy & Download - top left & top right, inside frame */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
            >
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              )}
              {copiedLink ? "Copied" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              )}
              Download PDF
            </Button>
          </div>

          {/* Business info & Invoice header - two columns on all screens */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold">{businessInfo.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{businessInfo.address}</p>
              <p className="text-sm text-muted-foreground">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">{businessInfo.country}</p>
              <p className="text-sm text-muted-foreground mt-2">{businessInfo.email}</p>
              <p className="text-sm text-muted-foreground">{businessInfo.phone}</p>
            </div>
            <div className="text-right min-w-0">
              <h1 className="text-base sm:text-2xl font-bold">Invoice</h1>
              <p className="text-sm text-muted-foreground mt-1">{invoice.invoiceNumber}</p>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Bill to & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 sm:mb-8">
            <div className="text-left">
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Bill to</h3>
              {invoice.billToType === "company" && invoice.customerCompany ? (
                <>
                  <p className="text-sm font-medium">{invoice.customerCompany}</p>
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
                  <p className="text-sm font-medium">{invoice.customerName}</p>
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
            <div />
            <div className="text-left">
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Invoice details</h3>
              <p className="text-sm">
                <span className="text-muted-foreground">Due date:</span> {formatDate(invoice.dueDate)}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Created:</span> {formatDate(invoice.createdDate)}
              </p>
            </div>
          </div>

          {invoice.memo?.trim() && (
            <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Memo</p>
              <p className="text-sm whitespace-pre-wrap">{invoice.memo}</p>
            </div>
          )}

          {/* Line items - card layout on mobile, table on desktop */}
          <div className="mb-6">
            {/* Mobile: card layout */}
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
                    <p className="text-sm font-medium">{item.description}</p>
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
            {/* Desktop: table */}
            <div className="hidden sm:block border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Qty</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit Price</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
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
          <div className="flex justify-end mb-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-lg sm:text-2xl font-bold mt-0.5">
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

          {/* Powered by - bottom of frame, matches PDF */}
          <div className="flex items-center justify-center gap-1.5 mt-8 pt-6 pb-0 border-t text-xs text-muted-foreground">
            <span>Powered by</span>
            <a
              href="https://www.easner.com/business"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <img
                src={BRAND.logoBusiness}
                alt="Easner Business"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
