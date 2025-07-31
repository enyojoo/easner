"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Search, Download, Filter, Eye, Upload, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { useUserData } from "@/hooks/use-user-data"

export default function TransactionsPage() {
  const { data } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const transactions = data?.transactions || []

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch =
      searchTerm === "" ||
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      initiated: { color: "bg-purple-100 text-purple-800", icon: <Upload className="h-3 w-3 mr-1" /> },
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

  const handleExport = () => {
    const csvContent = [
      ["Transaction ID", "Date", "Recipient", "Send Amount", "Receive Amount", "Status"].join(","),
      ...filteredTransactions.map((t: any) =>
        [
          t.transaction_id,
          new Date(t.created_at).toLocaleString(),
          t.recipient?.full_name || "",
          `${t.send_amount} ${t.send_currency}`,
          `${t.receive_amount} ${t.receive_currency}`,
          t.status,
        ].join(","),
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
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600">View and manage your money transfers</p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.transaction_id}</TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.recipient?.full_name}</div>
                          <div className="text-sm text-gray-500">{transaction.recipient?.bank_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {transaction.send_currency} → {transaction.receive_currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(transaction.send_amount, transaction.send_currency)}
                          </div>
                          <div className="text-sm text-gray-500">
                            → {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
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
                                    <p className="font-mono">{selectedTransaction.transaction_id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Date</label>
                                    <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                                    <p className="font-medium">
                                      1 {selectedTransaction.send_currency} = {selectedTransaction.exchange_rate}{" "}
                                      {selectedTransaction.receive_currency}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Send Amount</label>
                                    <p className="font-medium">
                                      {formatCurrency(
                                        selectedTransaction.send_amount,
                                        selectedTransaction.send_currency,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Receive Amount</label>
                                    <p className="font-medium">
                                      {formatCurrency(
                                        selectedTransaction.receive_amount,
                                        selectedTransaction.receive_currency,
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-600">Recipient Details</label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium">{selectedTransaction.recipient?.full_name}</p>
                                    <p className="text-sm text-gray-600">{selectedTransaction.recipient?.bank_name}</p>
                                    <p className="text-sm text-gray-600">
                                      {selectedTransaction.recipient?.account_number}
                                    </p>
                                  </div>
                                </div>

                                {selectedTransaction.receipt_url && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Receipt</label>
                                    <div className="mt-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => window.open(selectedTransaction.receipt_url, "_blank")}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Receipt
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
      </UserDashboardLayout>
    </AuthGuard>
  )
}
