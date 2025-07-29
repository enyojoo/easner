"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Download,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AuthGuard } from "@/components/auth/auth-guard"

// Mock transaction data
const mockTransactions = [
  {
    id: "NP1705123456789",
    date: "2024-01-15 14:30",
    user: "John Doe",
    userEmail: "john@email.com",
    fromCurrency: "RUB",
    toCurrency: "NGN",
    sendAmount: "₽2,000.00",
    receiveAmount: "₦44,900.00",
    status: "completed",
    recipient: "Jane Smith",
    recipientAccount: "1234567890",
    recipientBank: "First Bank",
    reference: "REF123456",
    fee: "₽0.00",
    receipt: {
      name: "payment_receipt.jpg",
      size: "2.4 MB",
      uploadedAt: "2024-01-15 14:25",
      url: "/placeholder.svg?height=400&width=600&text=Payment+Receipt",
    },
  },
  {
    id: "NP1705123456790",
    date: "2024-01-15 13:45",
    user: "Alice Johnson",
    userEmail: "alice@email.com",
    fromCurrency: "NGN",
    toCurrency: "RUB",
    sendAmount: "₦280,000.00",
    receiveAmount: "₽12,444.00",
    status: "processing",
    recipient: "Bob Wilson",
    recipientAccount: "0987654321",
    recipientBank: "Sberbank",
    reference: "REF123457",
    fee: "₦0.00",
    receipt: null,
  },
  {
    id: "NP1705123456791",
    date: "2024-01-15 12:20",
    user: "Mike Brown",
    userEmail: "mike@email.com",
    fromCurrency: "RUB",
    toCurrency: "NGN",
    sendAmount: "₽3,500.00",
    receiveAmount: "₦78,575.00",
    status: "pending",
    recipient: "Sarah Davis",
    recipientAccount: "1122334455",
    recipientBank: "GTBank",
    reference: "REF123458",
    fee: "₽0.00",
    receipt: {
      name: "bank_transfer_receipt.pdf",
      size: "1.8 MB",
      uploadedAt: "2024-01-15 12:18",
      url: "/placeholder.svg?height=400&width=600&text=Bank+Transfer+Receipt",
    },
  },
  {
    id: "NP1705123456792",
    date: "2024-01-15 11:15",
    user: "Emma Wilson",
    userEmail: "emma@email.com",
    fromCurrency: "NGN",
    toCurrency: "RUB",
    sendAmount: "₦200,000.00",
    receiveAmount: "₽8,888.00",
    status: "failed",
    recipient: "Tom Anderson",
    recipientAccount: "5566778899",
    recipientBank: "VTB Bank",
    reference: "REF123459",
    fee: "₦0.00",
    receipt: null,
  },
  {
    id: "NP1705123456793",
    date: "2024-01-15 10:30",
    user: "David Lee",
    userEmail: "david@email.com",
    fromCurrency: "RUB",
    toCurrency: "NGN",
    sendAmount: "₽1,500.00",
    receiveAmount: "₦33,675.00",
    status: "initiated",
    recipient: "Lisa Chen",
    recipientAccount: "9988776655",
    recipientBank: "Access Bank",
    reference: "REF123460",
    fee: "₽0.00",
    receipt: {
      name: "payment_confirmation.png",
      size: "956 KB",
      uploadedAt: "2024-01-15 10:28",
      url: "/placeholder.svg?height=400&width=600&text=Payment+Confirmation",
    },
  },
]

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [transactions, setTransactions] = useState(mockTransactions)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesCurrency =
      currencyFilter === "all" ||
      transaction.fromCurrency === currencyFilter ||
      transaction.toCurrency === currencyFilter

    return matchesSearch && matchesStatus && matchesCurrency
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      initiated: { color: "bg-purple-100 text-purple-800", icon: <ArrowUpDown className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredTransactions.map((t) => t.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId])
    } else {
      setSelectedTransactions(selectedTransactions.filter((id) => id !== transactionId))
    }
  }

  const handleStatusUpdate = (transactionId: string, newStatus: string) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction,
      ),
    )
    // Also update selectedTransaction if it's the one being updated
    if (selectedTransaction?.id === transactionId) {
      setSelectedTransaction((prev) => ({ ...prev, status: newStatus }))
    }
  }

  const handleBulkStatusUpdate = (newStatus: string) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        selectedTransactions.includes(transaction.id) ? { ...transaction, status: newStatus } : transaction,
      ),
    )
    setSelectedTransactions([])
  }

  const handleExport = () => {
    const csvContent = [
      ["Transaction ID", "Date", "User", "From", "To", "Send Amount", "Receive Amount", "Status", "Recipient"].join(
        ",",
      ),
      ...filteredTransactions.map((t) =>
        [t.id, t.date, t.user, t.fromCurrency, t.toCurrency, t.sendAmount, t.receiveAmount, t.status, t.recipient].join(
          ",",
        ),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
              <p className="text-gray-600">Monitor and manage all platform transactions</p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="initiated">Initiated</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="w-full bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedTransactions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{selectedTransactions.length} transaction(s) selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("processing")}>
                      Mark as Processing
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("initiated")}>
                      Mark as Initiated
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("completed")}>
                      Mark as Completed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTransactions.length === filteredTransactions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user}</div>
                          <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {transaction.fromCurrency} → {transaction.toCurrency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.sendAmount}</div>
                          <div className="text-sm text-gray-500">→ {transaction.receiveAmount}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              {selectedTransaction && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                                      <p className="font-mono">{selectedTransaction.id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">User</label>
                                      <p>{selectedTransaction.user}</p>
                                      <p className="text-sm text-gray-500">{selectedTransaction.userEmail}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Date</label>
                                      <p>{selectedTransaction.date}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Send Amount</label>
                                      <p className="font-medium">{selectedTransaction.sendAmount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Receive Amount</label>
                                      <p className="font-medium">{selectedTransaction.receiveAmount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Recipient</label>
                                      <p>{selectedTransaction.recipient}</p>
                                      <p className="text-sm text-gray-500">{selectedTransaction.recipientBank}</p>
                                      <p className="text-sm text-gray-500">{selectedTransaction.recipientAccount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                                      <p className="font-medium">
                                        1 {selectedTransaction.fromCurrency} ={" "}
                                        {selectedTransaction.fromCurrency === "RUB" ? "22.45" : "0.0445"}{" "}
                                        {selectedTransaction.toCurrency}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Receipt</label>
                                    {selectedTransaction.receipt ? (
                                      <div className="mt-1">
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                              {selectedTransaction.receipt.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {selectedTransaction.receipt.size} • Uploaded{" "}
                                              {selectedTransaction.receipt.uploadedAt}
                                            </p>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(selectedTransaction.receipt.url, "_blank")}
                                          >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500 mt-1">No receipt uploaded</p>
                                    )}
                                  </div>

                                  <div className="border-t pt-4">
                                    <label className="text-sm font-medium text-gray-600">Update Status</label>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedTransaction.id, "processing")}
                                      >
                                        Payment Received
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedTransaction.id, "initiated")}
                                      >
                                        Transfer Initiated
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedTransaction.id, "completed")}
                                      >
                                        Transfer Complete
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedTransaction.id, "failed")}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        Mark Failed
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(transaction.id, "processing")}>
                                Payment Received
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(transaction.id, "initiated")}>
                                Transfer Initiated
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(transaction.id, "completed")}>
                                Transfer Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(transaction.id, "failed")}
                                className="text-red-600"
                              >
                                Mark as Failed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">No transactions found matching your criteria.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
