"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminData } from "@/hooks/use-admin-data"
import { Search, Download } from "lucide-react"
import { useState } from "react"

export default function AdminTransactionsPage() {
  const { data, loading } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  if (loading) {
    return (
      <AuthGuard requireAdmin>
        <AdminDashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
          </div>
        </AdminDashboardLayout>
      </AuthGuard>
    )
  }

  const transactions = data?.transactions || []

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch =
      transaction.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">Monitor and manage all platform transactions</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
              <CardDescription>Filter and search transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by sender, recipient, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Reference</th>
                      <th className="text-left p-2">Sender</th>
                      <th className="text-left p-2">Recipient</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">{transaction.reference}</td>
                        <td className="p-2">{transaction.sender_name}</td>
                        <td className="p-2">{transaction.recipient_name}</td>
                        <td className="p-2">
                          {transaction.amount} {transaction.from_currency} → {transaction.to_currency}
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
