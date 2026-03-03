"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Mock invoice data - in real app this would come from API
const mockInvoice = {
  id: "1",
  invoiceNumber: "A99204FB-0001",
  customerName: "Rosalyn Ward",
  customerEmail: "rosward1990@gmail.com",
  total: 500.00,
  currency: "USD",
  status: "void",
  dueDate: "2024-12-15",
  createdDate: "2024-12-10T17:46:00",
  finalizedDate: "2024-12-10T17:47:00",
  paymentPageUrl: "https://invoice.stripe.com/i/acct_1Ke7LKCWrIYLwGATet8R3tOJ",
  lineItems: [
    { description: "Donation", quantity: 1, unitPrice: 500.00, amount: 500.00 }
  ],
  activities: [
    {
      id: "1",
      type: "voided",
      description: "Invoice was voided",
      timestamp: "2024-12-10T17:48:00",
      icon: XCircle
    },
    {
      id: "2", 
      type: "collection_off",
      description: "Automatic collection for this invoice was turned off",
      timestamp: "2024-12-10T17:47:30",
      icon: AlertCircle
    },
    {
      id: "3",
      type: "finalized",
      description: "Invoice was finalized",
      timestamp: "2024-12-10T17:47:00",
      icon: CheckCircle
    }
  ]
}

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
  const [showMoreActivities, setShowMoreActivities] = useState(false)
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const displayedActivities = showMoreActivities ? mockInvoice.activities : mockInvoice.activities.slice(0, 3)

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
            <h1 className="text-2xl font-semibold text-foreground">{mockInvoice.invoiceNumber}</h1>
            {getStatusBadge(mockInvoice.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Billed to {mockInvoice.customerName} - ${mockInvoice.total.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
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
                {mockInvoice.activities.length > 3 && (
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
                  <span className="text-sm font-medium">{mockInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Invoice number</span>
                  <span className="text-sm font-medium font-mono">{mockInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total amount</span>
                  <span className="text-sm font-medium">${mockInvoice.total.toFixed(2)} {mockInvoice.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due date</span>
                  <span className="text-sm font-medium">
                    {new Date(mockInvoice.dueDate).toLocaleDateString()}
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
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("in_1QUWaMCWrIYLwGATet8R3tOJ")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{formatDate(mockInvoice.createdDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finalized</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{formatDate(mockInvoice.finalizedDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment page</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(mockInvoice.paymentPageUrl)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enabled payment methods</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs">💳</span>
                  </div>
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs">$</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Metadata</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No metadata
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
