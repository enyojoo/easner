"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Mock customers data
const mockCustomers = [
  {
    id: "1",
    name: "Rosalyn Ward",
    email: "rosward1990@gmail.com",
    phone: "+1 (555) 123-4567",
    company: "Ward Enterprises",
    address: "123 Main St, New York, NY 10001",
    totalInvoices: 5,
    totalPaid: 2500.00,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-12-10"
  },
  {
    id: "2", 
    name: "Wilson Dagah",
    email: "admin@thekingsrubies.org",
    phone: "+1 (555) 987-6543",
    company: "The Kings Rubies",
    address: "456 Business Ave, Los Angeles, CA 90210",
    totalInvoices: 12,
    totalPaid: 8500.00,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-12-10"
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 456-7890",
    company: "TechCorp Solutions",
    address: "789 Tech Blvd, San Francisco, CA 94105",
    totalInvoices: 3,
    totalPaid: 1200.00,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-11-28"
  },
  {
    id: "4",
    name: "Michael Chen",
    email: "m.chen@startup.io",
    phone: "+1 (555) 321-0987",
    company: "StartupIO",
    address: "321 Innovation Dr, Austin, TX 78701",
    totalInvoices: 8,
    totalPaid: 4200.00,
    currency: "USD",
    status: "inactive",
    lastInvoiceDate: "2024-10-15"
  }
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer information for invoicing</p>
        </div>
        <Button>
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
                <Button>
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
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{customer.name}</h3>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"} className="text-xs">
                          {customer.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{customer.company}</p>
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
                      <div className="text-sm font-semibold">
                        ${customer.totalPaid.toFixed(2)} {customer.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.totalInvoices} invoice{customer.totalInvoices !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href="/invoices/create">
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                          <DropdownMenuItem>View Invoices</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
    </div>
  )
}
