"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Plus,
  Pencil,
  Trash2,
  ReceiptText,
} from "lucide-react"
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
import { useCustomers } from "@/lib/customers-context"
import { useInvoices } from "@/lib/invoices-context"
import { getCustomerStats } from "@/lib/mock-data"
import { AddEditCustomerDialog } from "@/components/add-edit-customer-dialog"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Customer } from "@/lib/mock-data"
import { useState } from "react"

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { customers, updateCustomer, deleteCustomer } = useCustomers()
  const { invoices } = useInvoices()
  const customer = customers.find((c) => c.id === id)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Match invoices by customerId or customerEmail
  const customerInvoices = customer
    ? invoices.filter(
        (inv) =>
          !inv.archived &&
          (inv.customerId === customer.id ||
            inv.customerEmail?.toLowerCase() === customer.email?.toLowerCase())
      )
    : []

  const stats = customer
    ? getCustomerStats(customer.id, customer.email, invoices)
    : { totalInvoices: 0, totalPaid: 0, lastInvoiceDate: "" }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="py-12 text-center">
          <h2 className="text-lg font-semibold">Customer not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This customer may have been removed.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    deleteCustomer(customer.id)
    setDeleteDialogOpen(false)
    router.push("/customers")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {customer.company?.trim()
                        ? customer.company.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                        : customer.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {customer.company?.trim() || customer.name}
                    </CardTitle>
                    {customer.company?.trim() && (
                      <p className="text-sm text-muted-foreground mt-1">{customer.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Link href={`/invoices/create?customer=${customer.id}`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-primary hover:underline"
                >
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customer.phone}
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {customer.company}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {customer.address}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerInvoices.length === 0 ? (
                <div className="py-8 text-center">
                  <ReceiptText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No invoices yet for this customer
                  </p>
                  <Link href={`/invoices/create?customer=${customer.id}`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create first invoice
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {customerInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-sm tabular-nums">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </span>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total invoices
                </p>
                <p className="text-lg font-semibold">
                  {stats.totalInvoices}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total paid</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(stats.totalPaid, customer.currency)}
                </p>
              </div>
              {stats.lastInvoiceDate && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Last invoice date
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(stats.lastInvoiceDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete customer
          </Button>
        </div>
      </div>

      <AddEditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={customer}
        onSave={(c) => {
          updateCustomer(c.id, c)
          setEditDialogOpen(false)
        }}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer.name}. Invoices linked to
              this customer will remain but the customer record will be removed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
