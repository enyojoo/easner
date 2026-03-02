"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

export default function AdminBridgeWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [chainFilter, setChainFilter] = useState("all")

  useEffect(() => {
    loadWallets()
  }, [chainFilter])

  const loadWallets = async () => {
    setLoading(true)
    try {
      const url =
        chainFilter === "all"
          ? "/api/admin/bridge/wallets"
          : `/api/admin/bridge/wallets?chain=${chainFilter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setWallets(data.wallets || [])
      }
    } catch (error) {
      console.error("Error loading wallets:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWallets = wallets.filter((wallet) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      wallet.user?.email?.toLowerCase().includes(searchLower) ||
      wallet.address?.toLowerCase().includes(searchLower) ||
      wallet.bridge_wallet_id?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bridge Wallets</h1>
          <p className="text-gray-600">View all Bridge wallets and balances</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by email or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Chains</option>
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
            <option value="stellar">Stellar</option>
          </select>
        </div>

        {/* Wallets Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredWallets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No wallets found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>USDB Balance</TableHead>
                    <TableHead>EURC Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        {wallet.user?.email || `${wallet.user?.first_name} ${wallet.user?.last_name}`}
                      </TableCell>
                      <TableCell>
                        <Badge>{wallet.chain}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {wallet.address?.slice(0, 20)}...
                      </TableCell>
                      <TableCell>
                        {parseFloat(wallet.balances?.usdb || "0").toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {parseFloat(wallet.balances?.eurc || "0").toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(wallet.created_at).toLocaleDateString()}
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

