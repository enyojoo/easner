"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

export default function AdminBridgeVirtualAccountsPage() {
  const [virtualAccounts, setVirtualAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")

  useEffect(() => {
    loadVirtualAccounts()
  }, [currencyFilter])

  const loadVirtualAccounts = async () => {
    setLoading(true)
    try {
      const url =
        currencyFilter === "all"
          ? "/api/admin/bridge/virtual-accounts"
          : `/api/admin/bridge/virtual-accounts?currency=${currencyFilter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setVirtualAccounts(data.virtualAccounts || [])
      }
    } catch (error) {
      console.error("Error loading virtual accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = virtualAccounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      account.user?.email?.toLowerCase().includes(searchLower) ||
      account.account_number?.toLowerCase().includes(searchLower) ||
      account.iban?.toLowerCase().includes(searchLower) ||
      account.bridge_virtual_account_id?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bridge Virtual Accounts</h1>
          <p className="text-gray-600">View all USD/EUR virtual accounts</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by email, account number, or IBAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Currencies</option>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
          </select>
        </div>

        {/* Virtual Accounts Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No virtual accounts found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Routing Number</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>BIC</TableHead>
                    <TableHead>Bank Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        {account.user?.email || `${account.user?.first_name} ${account.user?.last_name}`}
                      </TableCell>
                      <TableCell>
                        <Badge>{account.currency.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.account_number || account.bridgeDetails?.source_deposit_instructions?.bank_account_number || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.routing_number || account.bridgeDetails?.source_deposit_instructions?.bank_routing_number || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.iban || account.bridgeDetails?.source_deposit_instructions?.iban || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.bic || account.bridgeDetails?.source_deposit_instructions?.bic || "-"}
                      </TableCell>
                      <TableCell>{account.bank_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(account.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}

