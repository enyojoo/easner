"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Pencil,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import Link from "next/link"
import { useCustomers } from "@/lib/customers-context"
import { useInvoices } from "@/lib/invoices-context"
import { AddEditCustomerDialog } from "@/components/add-edit-customer-dialog"
import { getCustomerStats } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { Customer } from "@/lib/mock-data"

export default function CustomersPage() {
  const router = useRouter()
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const { invoices } = useInvoices()
  const [searchTerm, setSearchTerm] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer information for invoicing</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first customer"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {customer.company?.trim()
                          ? customer.company.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                          : customer.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {customer.company?.trim() || customer.name}
                        </h3>
                      </div>
                      {customer.company?.trim() && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {customer.name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      {(() => {
                        const stats = getCustomerStats(customer.id, customer.email, invoices)
                        return (
                          <>
                            <div className="text-sm font-semibold">
                              {formatCurrency(stats.totalPaid, customer.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stats.totalInvoices} invoice{stats.totalInvoices !== 1 ? 's' : ''}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/invoices/create?customer=${customer.id}`}>
                        <Button variant="outline" size="sm">
                          Create Invoice
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditCustomer(customer)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCustomerToDelete(customer)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
      </div>

      <AddEditCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={addCustomer}
      />
      <AddEditCustomerDialog
        open={!!editCustomer}
        onOpenChange={(open) => !open && setEditCustomer(null)}
        customer={editCustomer}
        onSave={(c) => {
          updateCustomer(c.id, c)
          setEditCustomer(null)
        }}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customerToDelete?.name}. Invoices linked to this customer will remain but the customer record will be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (customerToDelete) {
                  deleteCustomer(customerToDelete.id)
                  setCustomerToDelete(null)
                  setDeleteDialogOpen(false)
                }
              }}
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
