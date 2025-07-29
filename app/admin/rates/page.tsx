"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Download,
  Filter,
  Edit,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { currencies } from "@/utils/currency"
import { adminCache, ADMIN_CACHE_KEYS } from "@/lib/admin-cache"

interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  fee_type: string
  fee_amount: number
  status: string
  created_at: string
  updated_at: string
  from_currency_info?: {
    code: string
    name: string
    symbol: string
    flag: string
  }
  to_currency_info?: {
    code: string
    name: string
    symbol: string
    flag: string
  }
}

export default function AdminRatesPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRates, setEditingRates] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadExchangeRates()

    // Set up auto-refresh
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.EXCHANGE_RATES, fetchExchangeRates, 5 * 60 * 1000)

    return () => {
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
    }
  }, [])

  const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select(`
        *,
        from_currency_info:currencies!exchange_rates_from_currency_fkey(code, name, symbol, flag_svg),
        to_currency_info:currencies!exchange_rates_to_currency_fkey(code, name, symbol, flag_svg)
      `)
      .order("from_currency", { ascending: true })

    if (error) throw error

    // Map flag_svg to flag for frontend compatibility
    const rates =
      data?.map((rate) => ({
        ...rate,
        from_currency_info: rate.from_currency_info
          ? {
              ...rate.from_currency_info,
              flag: rate.from_currency_info.flag_svg,
            }
          : undefined,
        to_currency_info: rate.to_currency_info
          ? {
              ...rate.to_currency_info,
              flag: rate.to_currency_info.flag_svg,
            }
          : undefined,
      })) || []

    return rates
  }

  const loadExchangeRates = async () => {
    try {
      // Check cache first
      const cachedData = adminCache.get<ExchangeRate[]>(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
      if (cachedData) {
        setExchangeRates(cachedData)
        return
      }

      setLoading(true)
      setError(null)

      const data = await fetchExchangeRates()

      // Cache the data
      adminCache.set(ADMIN_CACHE_KEYS.EXCHANGE_RATES, data)

      setExchangeRates(data)
    } catch (err) {
      console.error("Error loading exchange rates:", err)
      setError("Failed to load exchange rates")
    } finally {
      setLoading(false)
    }
  }

  const filteredRates = exchangeRates.filter((rate) => {
    const matchesSearch =
      rate.from_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.to_currency.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || rate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEditRates = () => {
    const initialRates: { [key: string]: number } = {}
    exchangeRates.forEach((rate) => {
      const key = `${rate.from_currency}_${rate.to_currency}`
      initialRates[key] = rate.rate
    })
    setEditingRates(initialRates)
    setIsEditDialogOpen(true)
  }

  const handleSaveRates = async () => {
    try {
      setLoading(true)

      const updates = Object.entries(editingRates).map(([key, rate]) => {
        const [fromCurrency, toCurrency] = key.split("_")
        return {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: Number.parseFloat(rate.toString()),
          updated_at: new Date().toISOString(),
        }
      })

      for (const update of updates) {
        const { error } = await supabase
          .from("exchange_rates")
          .update({
            rate: update.rate,
            updated_at: update.updated_at,
          })
          .eq("from_currency", update.from_currency)
          .eq("to_currency", update.to_currency)

        if (error) throw error
      }

      // Invalidate cache and reload
      adminCache.invalidate(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
      await loadExchangeRates()

      setIsEditDialogOpen(false)
    } catch (err) {
      console.error("Error saving exchange rates:", err)
      setError("Failed to save exchange rates")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (rateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("exchange_rates")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", rateId)

      if (error) throw error

      setExchangeRates((prev) => prev.map((rate) => (rate.id === rateId ? { ...rate, status: newStatus } : rate)))

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
    } catch (err) {
      console.error("Error updating rate status:", err)
      setError("Failed to update rate status")
    }
  }

  const handleDeleteRate = async (rateId: string) => {
    try {
      const { error } = await supabase.from("exchange_rates").delete().eq("id", rateId)

      if (error) throw error

      setExchangeRates((prev) => prev.filter((rate) => rate.id !== rateId))

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
    } catch (err) {
      console.error("Error deleting rate:", err)
      setError("Failed to delete rate")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      inactive: { color: "bg-gray-100 text-gray-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      suspended: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
      <Badge className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency ? <div dangerouslySetInnerHTML={{ __html: currency.flag }} /> : null
  }

  const handleExport = () => {
    const csvContent = [
      ["From Currency", "To Currency", "Rate", "Fee Type", "Fee Amount", "Status", "Last Updated"].join(","),
      ...filteredRates.map((rate) =>
        [
          rate.from_currency,
          rate.to_currency,
          rate.rate,
          rate.fee_type,
          rate.fee_amount,
          rate.status,
          new Date(rate.updated_at).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exchange_rates.csv"
    a.click()
  }

  // Get first two currency pairs for main display
  const mainCurrencyPairs = filteredRates.slice(0, 2)
  const remainingCurrencyPairs = filteredRates.slice(2)

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exchange Rate Management</h1>
            <p className="text-gray-600">Manage currency exchange rates and fees</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEditRates} className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Edit className="h-4 w-4 mr-2" />
              Edit Exchange Rates
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Rates</CardTitle>
              <TrendingUp className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {exchangeRates.filter((r) => r.status === "active").length}
              </div>
              <p className="text-xs text-green-600">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Currency Pairs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{exchangeRates.length}</div>
              <p className="text-xs text-gray-600">Total pairs configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Updated</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {exchangeRates.length > 0
                  ? new Date(
                      Math.max(...exchangeRates.map((r) => new Date(r.updated_at).getTime())),
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
              <p className="text-xs text-gray-600">Most recent update</p>
            </CardContent>
          </Card>
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
                  placeholder="Search currency pairs..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rates Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Pair</TableHead>
                  <TableHead>Exchange Rate</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getCurrencyFlag(rate.from_currency)}
                          <span className="font-medium">{rate.from_currency}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          {getCurrencyFlag(rate.to_currency)}
                          <span className="font-medium">{rate.to_currency}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        1 {rate.from_currency} = {rate.rate.toFixed(4)} {rate.to_currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium capitalize">{rate.fee_type}</div>
                        {rate.fee_amount > 0 && (
                          <div className="text-sm text-gray-500">
                            {rate.fee_type === "percentage"
                              ? `${rate.fee_amount}%`
                              : `${rate.fee_amount} ${rate.to_currency}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(rate.status)}</TableCell>
                    <TableCell>{new Date(rate.updated_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRates()}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Rate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(rate.id, rate.status === "active" ? "inactive" : "active")
                            }
                          >
                            {rate.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRate(rate.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRates.length === 0 && (
              <div className="text-center py-8 text-gray-500">No exchange rates found matching your criteria.</div>
            )}
          </CardContent>
        </Card>

        {/* Edit Exchange Rates Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Exchange Rates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* First two currency pairs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainCurrencyPairs.map((rate) => {
                  const key = `${rate.from_currency}_${rate.to_currency}`
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        {rate.from_currency} → {rate.to_currency}
                      </label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={editingRates[key] || rate.rate}
                        onChange={(e) =>
                          setEditingRates((prev) => ({
                            ...prev,
                            [key]: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="Enter exchange rate"
                      />
                    </div>
                  )
                })}
              </div>

              {/* Remaining currency pairs in scrollable section */}
              {remainingCurrencyPairs.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Additional Currency Pairs</h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {remainingCurrencyPairs.map((rate) => {
                        const key = `${rate.from_currency}_${rate.to_currency}`
                        return (
                          <div key={key} className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              {rate.from_currency} → {rate.to_currency}
                            </label>
                            <Input
                              type="number"
                              step="0.0001"
                              value={editingRates[key] || rate.rate}
                              onChange={(e) =>
                                setEditingRates((prev) => ({
                                  ...prev,
                                  [key]: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="Enter exchange rate"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRates}
                  disabled={loading}
                  className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
