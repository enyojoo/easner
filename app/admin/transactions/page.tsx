"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  X,
  ChevronDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Transaction } from "@/types"
import { formatCurrency } from "@/utils/currency"
import { supabase } from "@/lib/supabase"
import { paymentMethodService } from "@/lib/database"
import {
  getAccountTypeConfigFromCurrency,
  formatFieldValue,
} from "@/lib/currency-account-types"
import { AdminTransactionsSkeleton } from "@/components/admin-transactions-skeleton"
import { adminDataStore } from "@/lib/admin-data-store"
import { useAdminData } from "@/hooks/use-admin-data"

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "receive" | "card_funding"
  status: string
  created_at: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
  // Send transaction fields
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
  }
  // Receive transaction fields
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  stellar_transaction_hash?: string
  blockchain_tx_hash?: string
  crypto_wallet?: {
    wallet_address: string
    crypto_currency: string
  }
  // Card funding fields
  destination_type?: "bank" | "card"
  bridge_card_account_id?: string
  // Receipt fields
  receipt_url?: string
  receipt_filename?: string
  exchange_rate?: number
}

export default function AdminTransactionsPage() {
  const { data: adminData, loading: adminDataLoading } = useAdminData()
  
  // Initialize from cache synchronously to prevent flicker
  const getInitialTransactions = (): CombinedTransaction[] => {
    if (!adminData?.transactions) return []
    // Transform transactions to match CombinedTransaction interface
    return (adminData.transactions || []).map((tx: any) => {
      // If it's already transformed (has type), use it as is
      if (tx.type) {
        return {
          id: tx.id,
          transaction_id: tx.transaction_id || tx.id,
          type: tx.type,
          status: tx.status,
          created_at: tx.created_at,
          updated_at: tx.updated_at,
          user: tx.user,
          user_id: tx.user_id,
          // Send fields
          send_amount: tx.send_amount,
          send_currency: tx.send_currency,
          receive_amount: tx.receive_amount,
          receive_currency: tx.receive_currency,
          recipient: tx.recipient,
          // Receive fields
          crypto_amount: tx.crypto_amount,
          crypto_currency: tx.crypto_currency,
          fiat_amount: tx.fiat_amount,
          fiat_currency: tx.fiat_currency,
          stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash,
          blockchain_tx_hash: tx.blockchain_tx_hash,
          crypto_wallet: tx.crypto_wallet,
          destination_type: tx.destination_type,
          bridge_card_account_id: tx.bridge_card_account_id,
          // Receipt fields
          receipt_url: tx.receipt_url,
          receipt_filename: tx.receipt_filename,
          exchange_rate: tx.exchange_rate,
        }
      }
      // Otherwise, determine type from transaction structure
      const isReceive = tx.crypto_amount || tx.fiat_amount
      const isCardFunding = tx.destination_type === "card" || tx.bridge_card_account_id
      return {
        id: tx.id,
        transaction_id: tx.transaction_id || tx.id,
        type: isReceive ? (isCardFunding ? "card_funding" : "receive") : "send",
        status: tx.status,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        user: tx.user,
        user_id: tx.user_id,
        // Send fields
        send_amount: tx.send_amount,
        send_currency: tx.send_currency,
        receive_amount: tx.receive_amount,
        receive_currency: tx.receive_currency,
        recipient: tx.recipient,
        // Receive fields
        crypto_amount: tx.crypto_amount,
        crypto_currency: tx.crypto_currency,
        fiat_amount: tx.fiat_amount,
        fiat_currency: tx.fiat_currency,
        stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash,
        blockchain_tx_hash: tx.blockchain_tx_hash,
        crypto_wallet: tx.crypto_wallet,
        destination_type: tx.destination_type,
        bridge_card_account_id: tx.bridge_card_account_id,
        // Receipt fields
        receipt_url: tx.receipt_url,
        receipt_filename: tx.receipt_filename,
        exchange_rate: tx.exchange_rate,
      }
    })
  }

  const [transactions, setTransactions] = useState<CombinedTransaction[]>(() => getInitialTransactions())
  const [loading, setLoading] = useState(!adminData?.transactions) // Only show loading if no cached data
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "send" | "receive">("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<CombinedTransaction | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [timerDuration, setTimerDuration] = useState(3600) // Payment method's completion_timer_seconds
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const paymentMethodsData = await paymentMethodService.getAll()
        setPaymentMethods(paymentMethodsData || [])
      } catch (error) {
        console.error("Error loading payment methods:", error)
      }
    }

    loadPaymentMethods()
  }, [])

  // Initialize timer duration from payment method when transaction is selected
  useEffect(() => {
    if (selectedTransaction && paymentMethods.length > 0) {
      const getDefaultPaymentMethod = (currency: string) => {
        const methods = paymentMethods.filter((pm) => pm.currency === currency && pm.status === "active")
        return methods.find((pm) => pm.is_default) || methods[0]
      }

      const defaultMethod = getDefaultPaymentMethod(selectedTransaction.send_currency)
      const timerSeconds = defaultMethod?.completion_timer_seconds ?? 3600
      setTimerDuration(timerSeconds)
    }
  }, [selectedTransaction, paymentMethods])

  // Update transactions when adminData changes (from realtime updates or initial load)
  useEffect(() => {
    if (adminData?.transactions) {
      // Transform transactions to match CombinedTransaction interface
      const transformedTransactions: CombinedTransaction[] = (adminData.transactions || []).map((tx: any) => {
        // If it's already transformed (has type), use it as is
        if (tx.type) {
          return {
            id: tx.id,
            transaction_id: tx.transaction_id || tx.id,
            type: tx.type,
            status: tx.status,
            created_at: tx.created_at,
            updated_at: tx.updated_at,
            user: tx.user,
            user_id: tx.user_id,
            // Send fields
            send_amount: tx.send_amount,
            send_currency: tx.send_currency,
            receive_amount: tx.receive_amount,
            receive_currency: tx.receive_currency,
            recipient: tx.recipient,
            // Receive fields
            crypto_amount: tx.crypto_amount,
            crypto_currency: tx.crypto_currency,
            fiat_amount: tx.fiat_amount,
            fiat_currency: tx.fiat_currency,
            stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash,
            blockchain_tx_hash: tx.blockchain_tx_hash,
            crypto_wallet: tx.crypto_wallet,
            destination_type: tx.destination_type,
            bridge_card_account_id: tx.bridge_card_account_id,
            // Receipt fields
            receipt_url: tx.receipt_url,
            receipt_filename: tx.receipt_filename,
            exchange_rate: tx.exchange_rate,
          }
        }
        // Otherwise, determine type from transaction structure
        const isReceive = tx.crypto_amount || tx.fiat_amount
        const isCardFunding = tx.destination_type === "card" || tx.bridge_card_account_id
        return {
          id: tx.id,
          transaction_id: tx.transaction_id || tx.id,
          type: isReceive ? (isCardFunding ? "card_funding" : "receive") : "send",
          status: tx.status,
          created_at: tx.created_at,
          updated_at: tx.updated_at,
          user: tx.user,
          user_id: tx.user_id,
          // Send fields
          send_amount: tx.send_amount,
          send_currency: tx.send_currency,
          receive_amount: tx.receive_amount,
          receive_currency: tx.receive_currency,
          recipient: tx.recipient,
          // Receive fields
          crypto_amount: tx.crypto_amount,
          crypto_currency: tx.crypto_currency,
          fiat_amount: tx.fiat_amount,
          fiat_currency: tx.fiat_currency,
          stellar_transaction_hash: tx.stellar_transaction_hash || tx.blockchain_tx_hash,
          blockchain_tx_hash: tx.blockchain_tx_hash,
          crypto_wallet: tx.crypto_wallet,
          destination_type: tx.destination_type,
          bridge_card_account_id: tx.bridge_card_account_id,
          // Receipt fields
          receipt_url: tx.receipt_url,
          receipt_filename: tx.receipt_filename,
          exchange_rate: tx.exchange_rate,
        }
      })
      setTransactions(transformedTransactions)
      setLoading(false)
    } else if (!adminDataLoading) {
      // If adminData is loaded but has no transactions, set empty array
      setTransactions([])
      setLoading(false)
    }
  }, [adminData, adminDataLoading])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Only show skeleton if we're truly loading and have no data
  if ((loading || adminDataLoading) && transactions.length === 0 && !adminData?.transactions?.length) {
    return (
      <AdminDashboardLayout>
        <AdminTransactionsSkeleton />
      </AdminDashboardLayout>
    )
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchTerm === "" ||
      transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.type === "receive" || transaction.type === "card_funding") &&
        (transaction.stellar_transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.blockchain_tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || 
      (typeFilter === "send" && transaction.type === "send") ||
      (typeFilter === "receive" && (transaction.type === "receive" || transaction.type === "card_funding"))
    const matchesCurrency =
      currencyFilter === "all" ||
      (transaction.type === "send" &&
        (transaction.send_currency === currencyFilter || transaction.receive_currency === currencyFilter)) ||
      ((transaction.type === "receive" || transaction.type === "card_funding") &&
        (transaction.crypto_currency === currencyFilter || transaction.fiat_currency === currencyFilter))

    return matchesSearch && matchesStatus && matchesType && matchesCurrency
  })

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    // Format: "Nov 07, 2025 • 7:29 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      converting: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> },
      converted: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      deposited: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
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
      setSelectedTransactions(filteredTransactions.map((t: any) => t.transaction_id))
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
      await adminDataStore.updateTransactionStatus(transactionId, newStatus)

      // Update selectedTransaction if it's the one being updated
      if (selectedTransaction?.transaction_id === transactionId) {
        setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus as any } : null))
      }
    } catch (err) {
      console.error("Error updating transaction status:", err)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      await Promise.all(
        selectedTransactions.map(async (transactionId) => {
          await adminDataStore.updateTransactionStatus(transactionId, newStatus)
        })
      )
      setSelectedTransactions([])
    } catch (err) {
      console.error("Error updating transaction statuses:", err)
    }
  }

  // Calculate elapsed time in seconds
  const getElapsedTime = (): number => {
    if (!selectedTransaction) return 0
    
    const createdAt = new Date(selectedTransaction.created_at).getTime()
    
    if (selectedTransaction.status === "completed") {
      const completedAt = selectedTransaction.completed_at
        ? new Date(selectedTransaction.completed_at).getTime()
        : new Date(selectedTransaction.updated_at).getTime()
      return Math.floor((completedAt - createdAt) / 1000)
    } else {
      // For pending/processing, use current time
      return Math.floor((currentTime - createdAt) / 1000)
    }
  }

  // Calculate remaining time for pending/processing
  const getRemainingTime = (): number => {
    const elapsed = getElapsedTime()
    const remaining = timerDuration - elapsed
    return Math.max(0, remaining)
  }

  // Calculate delay for completed transactions or when timer has finished
  const getDelay = (): number => {
    if (!selectedTransaction) return 0
    const elapsed = getElapsedTime()
    const delay = elapsed - timerDuration
    return Math.max(0, delay)
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get timer display text
  const getTimerDisplay = (): string | null => {
    if (!selectedTransaction) return null
    
    // Don't show timer for failed/cancelled
    if (selectedTransaction.status === "failed" || selectedTransaction.status === "cancelled") {
      return null
    }

    if (selectedTransaction.status === "completed") {
      const elapsed = getElapsedTime()
      const delay = getDelay()
      
      if (delay > 0) {
        return `Took ${formatTime(elapsed)} • Delayed ${formatTime(delay)}`
      } else {
        return `Took ${formatTime(elapsed)}`
      }
    } else {
      // Pending or processing
      const remaining = getRemainingTime()
      const delay = getDelay()
      
      // If timer has finished (remaining <= 0), show delayed time
      if (remaining <= 0 && delay > 0) {
        return `Delayed ${formatTime(delay)}`
      }
      
      // Otherwise show countdown
      return `Time left ${formatTime(remaining)}`
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Transaction ID", "Date", "User", "From", "To", "Send Amount", "Receive Amount", "Status", "Recipient"].join(
        ",",
      ),
      ...filteredTransactions.map((t: any) =>
        [
          t.transaction_id,
          formatTimestamp(t.created_at),
          `${t.user?.first_name} ${t.user?.last_name}`,
          t.send_currency,
          t.receive_currency,
          t.send_amount,
          t.receive_amount,
          t.status,
          t.recipient?.full_name || "",
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

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search and Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter Tabs */}
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "send" | "receive")}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  All Transactions
                </TabsTrigger>
                <TabsTrigger value="send" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Send (Fiat)
                </TabsTrigger>
                <TabsTrigger value="receive" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Receive & Card
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Bar */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by transaction ID, email, or blockchain hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="converting">Converting</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="deposited">Deposited</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Currency Filter */}
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {adminData?.currencies?.map((currency: any) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== "all" || currencyFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCurrencyFilter("all")
                  setTypeFilter("all")
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Active Filters Badges */}
          {(searchTerm || statusFilter !== "all" || currencyFilter !== "all" || typeFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Active filters:</span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Type: {typeFilter === "send" ? "Send (Fiat)" : "Receive & Card"}
                  <button
                    onClick={() => setTypeFilter("all")}
                    className="ml-2 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-2 hover:bg-purple-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currencyFilter !== "all" && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Currency: {currencyFilter}
                  <button
                    onClick={() => setCurrencyFilter("all")}
                    className="ml-2 hover:bg-green-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <span className="text-sm text-gray-500 ml-2">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? "transaction" : "transactions"}
              </span>
            </div>
          )}
        </div>

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
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("completed")}>
                    Transfer Complete
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("failed")}>
                    Mark Failed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("cancelled")}>
                    Cancel Transfer
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
                      checked={
                        selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.transaction_id)}
                        onCheckedChange={(checked) =>
                          handleSelectTransaction(transaction.transaction_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{transaction.transaction_id}</TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.user?.first_name} {transaction.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.type === "send" ? (
                        <div>
                          <div className="font-medium">
                            {formatCurrency(transaction.send_amount || 0, transaction.send_currency || "")}
                          </div>
                          <div className="text-sm text-gray-500">
                            → {formatCurrency(transaction.receive_amount || 0, transaction.receive_currency || "")}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">
                            {transaction.crypto_amount} {transaction.crypto_currency}
                          </div>
                          <div className="text-sm text-gray-500">
                            → {formatCurrency(transaction.fiat_amount || 0, transaction.fiat_currency || "")}
                            {transaction.type === "card_funding" && (
                              <span className="ml-2 text-xs text-blue-600">(Card Funding)</span>
                            )}
                          </div>
                        </div>
                      )}
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
                              <div className="flex items-center gap-6">
                                <DialogTitle>Transaction Details</DialogTitle>
                                {selectedTransaction && getTimerDisplay() && (
                                  <div className="flex items-center text-orange-600">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="font-mono text-sm">{getTimerDisplay()}</span>
                                  </div>
                                )}
                              </div>
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
                                    <label className="text-sm font-medium text-gray-600">User</label>
                                    <p>
                                      {selectedTransaction.user?.first_name} {selectedTransaction.user?.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.user?.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Date</label>
                                    <p>{formatTimestamp(selectedTransaction.created_at)}</p>
                                  </div>
                                  {selectedTransaction.type === "send" ? (
                                    <>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Send Amount</label>
                                        <p className="font-medium">
                                          {formatCurrency(
                                            selectedTransaction.send_amount || 0,
                                            selectedTransaction.send_currency || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Receive Amount</label>
                                        <p className="font-medium">
                                          {formatCurrency(
                                            selectedTransaction.receive_amount || 0,
                                            selectedTransaction.receive_currency || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Recipient</label>
                                        <p>{selectedTransaction.recipient?.full_name}</p>
                                    {(() => {
                                      const recipient = selectedTransaction.recipient as any
                                      if (!recipient) return null

                                      const recipientCurrency = recipient.currency || selectedTransaction.receive_currency
                                      const accountConfig = recipientCurrency
                                        ? getAccountTypeConfigFromCurrency(recipientCurrency)
                                        : null
                                      const accountType = accountConfig?.accountType

                                      return (
                                        <div className="text-sm text-gray-500 space-y-1">
                                          {accountType === "us" && recipient.routing_number && (
                                            <p className="font-mono text-xs">
                                              Routing: {formatFieldValue(accountType, "routing_number", recipient.routing_number)}
                                            </p>
                                          )}
                                          {accountType === "uk" && recipient.sort_code && (
                                            <p className="font-mono text-xs">
                                              Sort Code: {formatFieldValue(accountType, "sort_code", recipient.sort_code)}
                                            </p>
                                          )}
                                          {recipient.account_number && (
                                            <p className="font-mono text-xs">
                                              {accountConfig?.fieldLabels.account_number || "Account Number"}: {recipient.account_number}
                                            </p>
                                          )}
                                          {recipient.iban && (
                                            <p className="font-mono text-xs">
                                              IBAN: {formatFieldValue(accountType || "generic", "iban", recipient.iban)}
                                            </p>
                                          )}
                                          {recipient.swift_bic && (
                                            <p className="font-mono text-xs">SWIFT/BIC: {recipient.swift_bic}</p>
                                          )}
                                          <p>{recipient.bank_name}</p>
                                        </div>
                                      )
                                    })()}
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                                        <p className="font-medium">
                                          1 {selectedTransaction.send_currency} = {selectedTransaction.exchange_rate}{" "}
                                          {selectedTransaction.receive_currency}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Stablecoin Received</label>
                                        <p className="font-medium">
                                          {selectedTransaction.crypto_amount} {selectedTransaction.crypto_currency}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Fiat Amount</label>
                                        <p className="font-medium">
                                          {formatCurrency(
                                            selectedTransaction.fiat_amount || 0,
                                            selectedTransaction.fiat_currency || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                                        <p className="font-medium">
                                          1 {selectedTransaction.crypto_currency} = {selectedTransaction.exchange_rate}{" "}
                                          {selectedTransaction.fiat_currency}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Stellar Transaction Hash</label>
                                        <p className="font-mono text-xs break-all">
                                          {selectedTransaction.stellar_transaction_hash}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                                        <p className="font-mono text-xs">
                                          {selectedTransaction.crypto_wallet?.wallet_address}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Deposit Account</label>
                                        <p>{selectedTransaction.crypto_wallet?.recipient?.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                          {selectedTransaction.crypto_wallet?.recipient?.account_number}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {selectedTransaction.crypto_wallet?.recipient?.bank_name}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-600">Receipt</label>
                                  {selectedTransaction.receipt_url ? (
                                    <div className="mt-1">
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            {selectedTransaction.receipt_filename || "Receipt"}
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={async () => {
                                            const receiptUrl = selectedTransaction.receipt_url!
                                            // Check if it's a file path (starts with "receipts/") or a public URL
                                            const isPath = receiptUrl.startsWith("receipts/")
                                            
                                            if (isPath) {
                                              // Get signed URL from API
                                              try {
                                                // Get access token from Supabase session
                                                const { data: { session } } = await supabase.auth.getSession()
                                                const headers: HeadersInit = {
                                                  'Content-Type': 'application/json',
                                                }
                                                
                                                if (session?.access_token) {
                                                  headers['Authorization'] = `Bearer ${session.access_token}`
                                                }
                                                
                                                const response = await fetch(`/api/admin/receipts/documents?path=${encodeURIComponent(receiptUrl)}`, {
                                                  credentials: "include",
                                                  headers,
                                                })
                                                
                                                if (response.ok) {
                                                  const data = await response.json()
                                                  if (data.url) {
                                                    window.open(data.url, "_blank")
                                                  } else {
                                                    alert("Failed to access receipt: No URL returned from server.")
                                                  }
                                                } else {
                                                  const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                                                  alert(`Failed to access receipt: ${errorData.error || response.statusText || "Please try again."}`)
                                                }
                                              } catch (error: any) {
                                                console.error("Error fetching signed URL:", error)
                                                alert(`Failed to access receipt: ${error.message || "Please try again."}`)
                                              }
                                            } else {
                                              // Public URL - open directly (backward compatibility)
                                              window.open(receiptUrl, "_blank")
                                            }
                                          }}
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
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleStatusUpdate(selectedTransaction.transaction_id, "processing")
                                      }
                                      disabled={selectedTransaction.status === "processing"}
                                    >
                                      Payment Received
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleStatusUpdate(selectedTransaction.transaction_id, "completed")
                                      }
                                      disabled={selectedTransaction.status === "completed"}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      Transfer Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(selectedTransaction.transaction_id, "failed")}
                                      disabled={selectedTransaction.status === "failed"}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      Mark Failed
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(selectedTransaction.transaction_id, "cancelled")}
                                      disabled={selectedTransaction.status === "cancelled"}
                                      className="text-gray-600 hover:text-gray-700"
                                    >
                                      Cancel Transfer
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
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(transaction.transaction_id, "processing")}
                            >
                              Payment Received
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(transaction.transaction_id, "completed")}
                            >
                              Transfer Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(transaction.transaction_id, "failed")}
                              className="text-red-600"
                            >
                              Mark as Failed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(transaction.transaction_id, "cancelled")}
                              className="text-gray-600"
                            >
                              Cancel Transfer
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
  )
}
