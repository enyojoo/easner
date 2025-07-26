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

// Mock transaction data
const mockTransactions = [
  {
    id: "NP1705123456789",
    date: "2024-01-15",
    recipient: "John Doe",
    amount: "₦45,000.00",
    sendAmount: "₽2,000.00",
    status: "completed",
    currency: "NGN",
    sendCurrency: "RUB",
    reference: "REF123456",
    bankName: "First Bank",
    accountNumber: "1234567890",
  },
  {
    id: "NP1705123456790",
    date: "2024-01-14",
    recipient: "Jane Smith",
    amount: "₽12,500.00",
    sendAmount: "₦280,000.00",
    status: "processing",
    currency: "RUB",
    sendCurrency: "NGN",
    reference: "REF123457",
    bankName: "Sberbank",
    accountNumber: "0987654321",
  },
  {
    id: "NP1705123456791",
    date: "2024-01-13",
    recipient: "Mike Johnson",
    amount: "₦78,900.00",
    sendAmount: "₽3,500.00",
    status: "completed",
    currency: "NGN",
    sendCurrency: "RUB",
    reference: "REF123458",
    bankName: "GTBank",
    accountNumber: "1122334455",
  },
  {
    id: "NP1705123456792",
    date: "2024-01-12",
    recipient: "Sarah Wilson",
    amount: "₽8,900.00",
    sendAmount: "₦200,000.00",
    status: "failed",
    currency: "RUB",
    sendCurrency: "NGN",
    reference: "REF123459",
    bankName: "VTB Bank",
    accountNumber: "5566778899",
  },
]

export default function UserTransactionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesCurrency = currencyFilter === "all" || transaction.currency === currencyFilter

    return matchesSearch && matchesStatus && matchesCurrency
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
      ["Transaction ID", "Date", "Recipient", "Amount", "Status", "Currency"].join(","),
      ...filteredTransactions.map((t) => [t.id, t.date, t.recipient, t.amount, t.status, t.currency].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
  }

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/user/send/${transactionId.toLowerCase()}`)
  }

  return (
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currency</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">{transaction.recipient}</TableCell>
                    <TableCell className="font-semibold">{transaction.amount}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction.id)}
                        className="bg-transparent"
                      >
                        View
                      </Button>
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
  )
}
