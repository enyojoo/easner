"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Download, Filter, Eye, MoreHorizontal, CheckCircle, Clock, XCircle, AlertCircle, ArrowUpDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Transaction } from "@/types"
import { formatCurrency } from "@/utils/currency"
import { useAdminData } from "@/hooks/use-admin-data"
import { adminDataStore } from "@/lib/admin-data-store"

export default function AdminTransactionsPage() {
 const { data } = useAdminData()
 const [searchTerm, setSearchTerm] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [currencyFilter, setCurrencyFilter] = useState("all")
 const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
 const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
 const [isDialogOpen, setIsDialogOpen] = useState(false)

 // Update selected transaction when data changes to keep popup in sync
 useEffect(() => {
   if (selectedTransaction && data?.transactions) {
     const updatedTransaction = data.transactions.find(
       (tx: any) => tx.transaction_id === selectedTransaction.transaction_id
     )
     if (updatedTransaction) {
       setSelectedTransaction(updatedTransaction)
     }
   }
 }, [data?.transactions, selectedTransaction?.transaction_id])

 const filteredTransactions = (data?.transactions || []).filter((transaction: any) => {
   const matchesSearch =
     searchTerm === "" ||
     transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

   const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
   const matchesCurrency =
     currencyFilter === "all" ||
     transaction.send_currency === currencyFilter ||
     transaction.receive_currency === currencyFilter

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
     console.log(`Updating transaction ${transactionId} to ${newStatus}`)
     await adminDataStore.updateTransactionStatus(transactionId, newStatus)
   } catch (err) {
     console.error("Error updating transaction status:", err)
     alert("Failed to update transaction status. Please try again.")
   }
 }

 const handleBulkStatusUpdate = async (newStatus: string) => {
   try {
     console.log(`Bulk updating ${selectedTransactions.length} transactions to ${newStatus}`)
     await Promise.all(
       selectedTransactions.map((transactionId) => adminDataStore.updateTransactionStatus(transactionId, newStatus)),
     )
     setSelectedTransactions([])
   } catch (err) {
     console.error("Error updating transaction statuses:", err)
     alert("Failed to update transaction statuses. Please try again.")
   }
 }

 const handleViewTransaction = async (transaction: any) => {
   try {
     // Fetch fresh transaction data
     const freshTransaction = await adminDataStore.getFreshTransaction(transaction.transaction_id)
     setSelectedTransaction(freshTransaction)
     setIsDialogOpen(true)
   } catch (error) {
     console.error("Error loading transaction details:", error)
     // Fallback to cached data
     setSelectedTransaction(transaction)
     setIsDialogOpen(true)
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
         new Date(t.created_at).toLocaleString(),
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

       {/* Filters */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Filter className="h-5 w-5" />
             Filters
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                 <SelectItem value="USD">USD</SelectItem>
               </SelectContent>
             </Select>
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
                 <TableHead>Currency Pair</TableHead>
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
                   <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                   <TableCell>
                     <div>
                       <div className="font-medium">
                         {transaction.user?.first_name} {transaction.user?.last_name}
                       </div>
                       <div className="text-sm text-gray-500">{transaction.user?.email}</div>
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
                     <div className="flex items-center gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => handleViewTransaction(transaction)}
                       >
                         <Eye className="h-4 w-4" />
                       </Button>

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
                             onClick={() => handleStatusUpdate(transaction.transaction_id, "initiated")}
                           >
                             Transfer Initiated
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

       {/* Transaction Details Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                   <label className="text-sm font-medium text-gray-600">User</label>
                   <p>
                     {selectedTransaction.user?.first_name} {selectedTransaction.user?.last_name}
                   </p>
                   <p className="text-sm text-gray-500">{selectedTransaction.user?.email}</p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Date</label>
                   <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
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
                 <div>
                   <label className="text-sm font-medium text-gray-600">Recipient</label>
                   <p>{selectedTransaction.recipient?.full_name}</p>
                   <p className="text-sm text-gray-500">{selectedTransaction.recipient?.bank_name}</p>
                   <p className="text-sm text-gray-500">
                     {selectedTransaction.recipient?.account_number}
                   </p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                   <p className="font-medium">
                     1 {selectedTransaction.send_currency} = {selectedTransaction.exchange_rate}{" "}
                     {selectedTransaction.receive_currency}
                   </p>
                 </div>
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
                         <p className="text-xs text-gray-500">
                           Uploaded {new Date(selectedTransaction.updated_at).toLocaleString()}
                         </p>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => window.open(selectedTransaction.receipt_url, "_blank")}
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
                     onClick={() =>
                       handleStatusUpdate(selectedTransaction.transaction_id, "processing")
                     }
                   >
                     Payment Received
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() =>
                       handleStatusUpdate(selectedTransaction.transaction_id, "initiated")
                     }
                   >
                     Transfer Initiated
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() =>
                       handleStatusUpdate(selectedTransaction.transaction_id, "completed")
                     }
                   >
                     Transfer Complete
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => handleStatusUpdate(selectedTransaction.transaction_id, "failed")}
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
     </div>
   </AdminDashboardLayout>
 )
}
