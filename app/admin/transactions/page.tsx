"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { adminCache, ADMIN_CACHE_KEYS } from "@/lib/admin-cache"

interface Transaction {
  id: string
  user_id: string
  recipient_id: string
  amount: number
  from_currency: string
  to_currency: string
  exchange_rate: number
  fee_amount: number
  total_amount: number
  status: string
  created_at: string
  updated_at: string
  sender?: {
    full_name: string
    email: string
  }
  recipient?: {
    full_name: string
    email: string
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchTransactions()

    // Set up auto-refresh every 5 minutes in background
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.TRANSACTIONS, fetchTransactionsData, 5 * 60 * 1000)

    return () => {
      // Clean up auto-refresh when component unmounts
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.TRANSACTIONS)
    }
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter])

  const fetchTransactionsData = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        sender:users!transactions_user_id_fkey(full_name, email),
        recipient:recipients(full_name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      // Check cache first
      const cachedData = adminCache.get(ADMIN_CACHE_KEYS.TRANSACTIONS)
      if (cachedData) {
        setTransactions(cachedData)
        setLoading(false)
        return
      }

      // Fetch fresh data
      const data = await fetchTransactionsData()

      // Cache the result
      adminCache.set(ADMIN_CACHE_KEYS.TRANSACTIONS, data)

      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.sender?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.recipient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.recipient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      RUB: "₽",
      USD: "$",
    }
    return `${symbols[currency] || ""}${amount.toLocaleString()}`
  }

  const exportTransactions = () => {
    // Create CSV content
    const headers = [
      "Transaction ID",
      "Sender",
      "Recipient",
      "Amount",
      "From Currency",
      "To Currency",
      "Status",
      "Date",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.id,
          transaction.sender?.full_name || "Unknown",
          transaction.recipient?.full_name || "Unknown",
          transaction.amount,
          transaction.from_currency,
          transaction.to_currency,
          transaction.status,
          new Date(transaction.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600">Monitor and manage all platform transactions</p>
          </div>
          <Button onClick={exportTransactions} className="bg-novapay-primary hover:bg-novapay-primary-600">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name, email, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Exchange</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.sender?.full_name || "Unknown User"}</div>
                        <div className="text-sm text-gray-500">{transaction.sender?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.recipient?.full_name || "Unknown Recipient"}</div>
                        <div className="text-sm text-gray-500">{transaction.recipient?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(transaction.amount, transaction.from_currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Fee: {formatCurrency(transaction.fee_amount, transaction.from_currency)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span>{transaction.from_currency}</span>
                        <ArrowDownLeft className="h-3 w-3" />
                        <span>{transaction.to_currency}</span>
                      </div>
                      <div className="text-xs text-gray-500">Rate: {transaction.exchange_rate}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No transactions match your filters."
                  : "No transactions found."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
