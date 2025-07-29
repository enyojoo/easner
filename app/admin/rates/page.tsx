"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
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
}

export default function AdminRatesPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRates, setEditingRates] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchExchangeRates()

    // Set up auto-refresh every 5 minutes in background
    adminCache.setupAutoRefresh(ADMIN_CACHE_KEYS.EXCHANGE_RATES, fetchRatesData, 5 * 60 * 1000)

    return () => {
      // Clean up auto-refresh when component unmounts
      adminCache.clearAutoRefresh(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
    }
  }, [])

  const fetchRatesData = async () => {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .order("from_currency", { ascending: true })
      .order("to_currency", { ascending: true })

    if (error) throw error

    return data || []
  }

  const fetchExchangeRates = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = adminCache.get(ADMIN_CACHE_KEYS.EXCHANGE_RATES)
      if (cachedData) {
        setExchangeRates(cachedData)
        setLoading(false)
        return
      }

      // Fetch fresh data
      const data = await fetchRatesData()

      // Cache the result
      adminCache.set(ADMIN_CACHE_KEYS.EXCHANGE_RATES, data)

      setExchangeRates(data)
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError("Failed to load exchange rates")
    } finally {
      setLoading(false)
    }
  }

  const handleEditRates = () => {
    // Initialize editing rates with current values
    const initialRates: { [key: string]: number } = {}
    exchangeRates.forEach((rate) => {
      const key = `${rate.from_currency}-${rate.to_currency}`
      initialRates[key] = rate.rate
    })
    setEditingRates(initialRates)
    setIsEditDialogOpen(true)
  }

  const handleSaveRates = async () => {
    try {
      setError(null)
      setSuccess(null)

      // Update each rate
      for (const [key, newRate] of Object.entries(editingRates)) {
        const [fromCurrency, toCurrency] = key.split("-")
        const numericRate = Number(newRate)

        if (isNaN(numericRate) || numericRate <= 0) {
          throw new Error(`Invalid rate for ${fromCurrency} to ${toCurrency}`)
        }

        const { error } = await supabase
          .from("exchange_rates")
          .update({
            rate: numericRate,
            updated_at: new Date().toISOString(),
          })
          .eq("from_currency", fromCurrency)
          .eq("to_currency", toCurrency)

        if (error) throw error
      }

      // Refresh data and cache
      const updatedData = await fetchRatesData()
      adminCache.set(ADMIN_CACHE_KEYS.EXCHANGE_RATES, updatedData)
      setExchangeRates(updatedData)

      setSuccess("Exchange rates updated successfully!")
      setIsEditDialogOpen(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating exchange rates:", err)
      setError(err instanceof Error ? err.message : "Failed to update exchange rates")
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from("exchange_rates")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Update local state
      setExchangeRates((prev) => prev.map((rate) => (rate.id === id ? { ...rate, status: newStatus } : rate)))

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.EXCHANGE_RATES)

      setSuccess(`Exchange rate ${newStatus === "active" ? "activated" : "suspended"} successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating exchange rate status:", err)
      setError("Failed to update exchange rate status")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase.from("exchange_rates").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setExchangeRates((prev) => prev.filter((rate) => rate.id !== id))

      // Invalidate cache
      adminCache.invalidate(ADMIN_CACHE_KEYS.EXCHANGE_RATES)

      setSuccess("Exchange rate deleted successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error deleting exchange rate:", err)
      setError("Failed to delete exchange rate")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      inactive: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      suspended: { color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

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
    return `${symbols[currency] || ""}${amount.toFixed(4)}`
  }

  // Group rates by currency pairs for display
  const currencyPairs = Array.from(new Set(exchangeRates.map((rate) => `${rate.from_currency}-${rate.to_currency}`)))

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading exchange rates...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Exchange Rate Management</h1>
            <p className="text-gray-600">Manage currency exchange rates and fees</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEditRates} className="bg-novapay-primary hover:bg-novapay-primary-600">
              <Edit className="h-4 w-4 mr-2" />
              Edit Exchange Rates
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Exchange Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Exchange Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Pair</TableHead>
                  <TableHead>Exchange Rate</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Fee Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.from_currency} → {rate.to_currency}
                    </TableCell>
                    <TableCell className="font-mono">
                      1 {rate.from_currency} = {rate.rate} {rate.to_currency}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">{rate.fee_type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(rate.fee_amount, rate.to_currency)}</TableCell>
                    <TableCell>{getStatusBadge(rate.status)}</TableCell>
                    <TableCell>{new Date(rate.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(rate.id, rate.status === "active" ? "suspended" : "active")
                            }
                          >
                            {rate.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(rate.id)} className="text-red-600">
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

            {exchangeRates.length === 0 && (
              <div className="text-center py-8 text-gray-500">No exchange rates found.</div>
            )}
          </CardContent>
        </Card>

        {/* Edit Exchange Rates Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Exchange Rates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-4">
                {currencyPairs.slice(0, 2).map((pair) => {
                  const [fromCurrency, toCurrency] = pair.split("-")
                  const currentRate = exchangeRates.find(
                    (r) => r.from_currency === fromCurrency && r.to_currency === toCurrency,
                  )
                  return (
                    <div key={pair} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                      <div className="font-medium">
                        {fromCurrency} → {toCurrency}
                      </div>
                      <div className="text-sm text-gray-600">Current: {currentRate?.rate || "N/A"}</div>
                      <Input
                        type="number"
                        step="0.0001"
                        value={editingRates[pair] || ""}
                        onChange={(e) =>
                          setEditingRates((prev) => ({
                            ...prev,
                            [pair]: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="Enter new rate"
                      />
                    </div>
                  )
                })}
                {currencyPairs.length > 2 && (
                  <div className="max-h-[200px] overflow-y-auto space-y-4">
                    {currencyPairs.slice(2).map((pair) => {
                      const [fromCurrency, toCurrency] = pair.split("-")
                      const currentRate = exchangeRates.find(
                        (r) => r.from_currency === fromCurrency && r.to_currency === toCurrency,
                      )
                      return (
                        <div key={pair} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                          <div className="font-medium">
                            {fromCurrency} → {toCurrency}
                          </div>
                          <div className="text-sm text-gray-600">Current: {currentRate?.rate || "N/A"}</div>
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingRates[pair] || ""}
                            onChange={(e) =>
                              setEditingRates((prev) => ({
                                ...prev,
                                [pair]: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="Enter new rate"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveRates} className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
