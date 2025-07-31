"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAdminData } from "@/hooks/use-admin-data"
import { Search, Filter, Download } from "lucide-react"
import { useState } from "react"

export default function AdminTransactionsPage() {
  const { transactions, loading } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTransactions = transactions?.filter(
    (transaction: any) =>
      transaction.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toString().includes(searchTerm),
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions?.map((t: any) => t.id.toString()) || [])
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

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      // Placeholder for updating transaction status
      console.log(`Updating transaction ${transactionId} to status ${newStatus}`)

      // Update selectedTransaction if it's the one being updated
      if (selectedTransaction?.id.toString() === transactionId) {
        setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err) {
      console.error("Error updating transaction status:", err)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      // Placeholder for updating multiple transaction statuses
      console.log(`Updating ${selectedTransactions.length} transactions to status ${newStatus}`)
      setSelectedTransactions([])
    } catch (err) {
      console.error("Error updating transaction statuses:", err)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Transaction ID", "Date", "Sender", "Recipient", "Amount", "Status"].join(","),
      ...filteredTransactions?.map((t: any) =>
        [
          t.id,
          new Date(t.created_at).toLocaleString(),
          t.sender_email,
          t.recipient_email,
          t.amount.toLocaleString(),
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
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600">Manage and monitor all platform transactions</p>
            </div>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
              <CardDescription>View and manage all transactions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => console.log("Filter button clicked")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">
                          <Checkbox
                            checked={
                              selectedTransactions.length === (transactions?.length || 0) &&
                              (transactions?.length || 0) > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left py-3 px-4">Transaction ID</th>
                        <th className="text-left py-3 px-4">Sender</th>
                        <th className="text-left py-3 px-4">Recipient</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions?.map((transaction: any) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedTransactions.includes(transaction.id.toString())}
                              onCheckedChange={(checked) =>
                                handleSelectTransaction(transaction.id.toString(), checked as boolean)
                              }
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{transaction.id}</td>
                          <td className="py-3 px-4">{transaction.sender_email}</td>
                          <td className="py-3 px-4">{transaction.recipient_email}</td>
                          <td className="py-3 px-4 font-medium">₦{transaction.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                          </td>
                          <td className="py-3 px-4">{new Date(transaction.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
                      Payment Received
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("initiated")}>
                      Transfer Initiated
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("completed")}>
                      Transfer Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("failed")}>
                      Mark Failed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Details Dialog */}
          {selectedTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                      <p className="font-mono">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedTransaction.status)}>
                          {selectedTransaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sender</label>
                      <p>{selectedTransaction.sender_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Recipient</label>
                      <p>{selectedTransaction.recipient_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Amount</label>
                      <p className="font-medium">₦{selectedTransaction.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date</label>
                      <p>{new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600">Update Status</label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedTransaction.id.toString(), "processing")}
                      >
                        Payment Received
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedTransaction.id.toString(), "initiated")}
                      >
                        Transfer Initiated
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedTransaction.id.toString(), "completed")}
                      >
                        Transfer Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedTransaction.id.toString(), "failed")}
                        className="text-red-600 hover:text-red-700"
                      >
                        Mark Failed
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-6 bg-transparent" onClick={() => setSelectedTransaction(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
