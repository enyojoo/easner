"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"

interface Transaction {
  id: string
  transaction_id: string
  send_amount: number
  send_currency: string
  receive_amount: number
  receive_currency: string
  status: string
  created_at: string
  recipient: {
    full_name: string
    account_number: string
    bank_name: string
  }
}

export default function UserTransactionsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const { transactions, currencies, loading } = useUserData()
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesCurrency =
      currencyFilter === "all" ||
      transaction.send_currency === currencyFilter ||
      transaction.receive_currency === currencyFilter

    return matchesSearch && matchesStatus && matchesCurrency
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export")
      return
    }

    const csvContent = [
      ["Transaction ID", "Date", "Recipient", "Send Amount", "Receive Amount", "Status"].join(","),
      ...filteredTransactions.map((t) =>
        [
          t.transaction_id,
          formatDate(t.created_at),
          t.recipient?.full_name || "N/A",
          `${formatAmount(t.send_amount, t.send_currency)}`,
          `${formatAmount(t.receive_amount, t.receive_currency)}`,
          t.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `novapay-transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/user/send/${transactionId.toLowerCase()}`)
  }

  if (!userProfile) {
    return (
      <UserDashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View and manage your money transfers</p>
          </div>
          <Button onClick={handleExport} variant="outline" disabled={filteredTransactions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currency</SelectItem>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => setError(null)} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Send Amount</TableHead>
                      <TableHead>Receive Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">{transaction.transaction_id}</TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell className="font-medium">{transaction.recipient?.full_name || "N/A"}</TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(transaction.send_amount, transaction.send_currency)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(transaction.receive_amount, transaction.receive_currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction.transaction_id)}
                            className="bg-transparent"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredTransactions.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    {transactions.length === 0
                      ? "No transactions found. Start by sending money to create your first transaction."
                      : "No transactions found matching your criteria."}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
