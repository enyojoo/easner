"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MoreHorizontal, Edit, Pause, Trash2, Loader2 } from "lucide-react"
import { useAdminData } from "@/hooks/use-admin-data"
import { adminDataStore } from "@/lib/admin-data-store"
import { AdminRatesSkeleton } from "@/components/admin-rates-skeleton"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

const AdminRatesPage = () => {
  const { data, loading } = useAdminData()

  if (loading || !data) {
    return (
      <AdminDashboardLayout>
        <AdminRatesSkeleton />
      </AdminDashboardLayout>
    )
  }
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null)
  const [isEditingRates, setIsEditingRates] = useState(false)
  const [isAddingCurrency, setIsAddingCurrency] = useState(false)
  const [newCurrencyData, setNewCurrencyData] = useState({
    code: "",
    name: "",
    symbol: "",
    flag_svg: "",
    can_send: true,
    can_receive: true,
  })
  const [rateUpdates, setRateUpdates] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [currencySettings, setCurrencySettings] = useState({
    can_send: true,
    can_receive: true,
  })

  const currencies = data?.currencies || []
  const exchangeRates = data?.exchangeRates || []

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

  const handleAddCurrency = async () => {
    try {
      setSaving(true)

      const currencyData = {
        code: newCurrencyData.code.toUpperCase(),
        name: newCurrencyData.name,
        symbol: newCurrencyData.symbol,
        flag_svg:
          newCurrencyData.flag_svg ||
          `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ccc"/></svg>`,
        status: "active",
        can_send: newCurrencyData.can_send ?? true,
        can_receive: newCurrencyData.can_receive ?? true,
      }

      const newCurrency = await adminDataStore.addCurrency(currencyData)

      // Create default exchange rates for the new currency
      const existingCurrencies = currencies.filter((c) => c.code !== newCurrencyData.code.toUpperCase())
      const newRates = []

      // Add rates FROM new currency TO existing currencies
      for (const currency of existingCurrencies) {
        newRates.push({
          from_currency: newCurrencyData.code.toUpperCase(),
          to_currency: currency.code,
          rate: 1,
          fee_type: "free",
          fee_amount: 0,
          min_amount: 10,
          max_amount: 1000000,
          status: "active",
        })
      }

      // Add rates FROM existing currencies TO new currency
      for (const currency of existingCurrencies) {
        newRates.push({
          from_currency: currency.code,
          to_currency: newCurrencyData.code.toUpperCase(),
          rate: 1,
          fee_type: "free",
          fee_amount: 0,
          min_amount: 10,
          max_amount: 1000000,
          status: "active",
        })
      }

      if (newRates.length > 0) {
        await adminDataStore.updateExchangeRates(newRates)
      }

      setNewCurrencyData({ code: "", name: "", symbol: "", flag_svg: "", can_send: true, can_receive: true })
      setIsAddingCurrency(false)
    } catch (error) {
      console.error("Error adding currency:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditRates = (currency: any) => {
    setSelectedCurrency(currency)
    const currencyRates = exchangeRates.filter((rate) => rate.from_currency === currency.code)
    const updates: any = {}

    currencyRates.forEach((rate: any) => {
      updates[rate.to_currency] = {
        rate: rate.rate.toString(),
        feeType: rate.fee_type,
        feeAmount: rate.fee_amount.toString(),
        minAmount: (rate.min_amount || 0).toString(),
        maxAmount: (rate.max_amount || 1000000).toString(),
      }
    })

    setRateUpdates(updates)
    setCurrencySettings({
      can_send: currency.can_send ?? true,
      can_receive: currency.can_receive ?? true,
    })
    setIsEditingRates(true)
  }

  const handleSaveRates = async () => {
    try {
      setSaving(true)
      const updates = []

      for (const [toCurrency, rateData] of Object.entries(rateUpdates)) {
        const rateInfo = rateData as any
        updates.push({
          from_currency: selectedCurrency.code,
          to_currency: toCurrency,
          rate: Number.parseFloat(rateInfo.rate),
          fee_type: rateInfo.feeType,
          fee_amount: Number.parseFloat(rateInfo.feeAmount || "0"),
          min_amount: Number.parseFloat(rateInfo.minAmount || "0"),
          max_amount: Number.parseFloat(rateInfo.maxAmount || "1000000"),
          status: "active",
          updated_at: new Date().toISOString(),
        })
      }

      if (updates.length > 0) {
        await adminDataStore.updateExchangeRates(updates)
      }

      // Update currency send/receive settings
      if (selectedCurrency) {
        await adminDataStore.updateCurrency(selectedCurrency.id, {
          can_send: currencySettings.can_send,
          can_receive: currencySettings.can_receive,
        })
      }

      setIsEditingRates(false)
      setSelectedCurrency(null)
      setRateUpdates({})
      setCurrencySettings({ can_send: true, can_receive: true })
    } catch (error) {
      console.error("Error saving rates:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSuspendCurrency = async (currencyId: string) => {
    try {
      const currency = currencies.find((c) => c.id === currencyId)
      if (!currency) return

      const newStatus = currency.status === "active" ? "suspended" : "active"
      await adminDataStore.updateCurrencyStatus(currencyId, newStatus)
    } catch (error) {
      console.error("Error updating currency status:", error)
    }
  }

  const handleDeleteCurrency = async (currencyId: string) => {
    if (currencies.length <= 2) {
      return
    }

    if (!confirm("Are you sure you want to delete this currency? This will also delete all related exchange rates.")) {
      return
    }

    try {
      await adminDataStore.deleteCurrency(currencyId)
    } catch (error) {
      console.error("Error deleting currency:", error)
    }
  }

  const updateRateField = (toCurrency: string, field: string, value: string) => {
    setRateUpdates((prev: any) => ({
      ...prev,
      [toCurrency]: {
        ...prev[toCurrency],
        [field]: value,
      },
    }))
  }

  const getCurrencyRates = (currencyCode: string) => {
    return exchangeRates.filter((rate) => rate.from_currency === currencyCode)
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Currency & Exchange Rates</h1>
            <p className="text-gray-600">Manage currencies, exchange rates and transaction fees</p>
          </div>
          <Dialog open={isAddingCurrency} onOpenChange={setIsAddingCurrency}>
            <DialogTrigger asChild>
              <Button className="bg-easner-primary hover:bg-easner-primary-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Currency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code *</Label>
                  <Input
                    id="currencyCode"
                    value={newCurrencyData.code}
                    onChange={(e) => setNewCurrencyData({ ...newCurrencyData, code: e.target.value })}
                    placeholder="e.g., USD"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyName">Currency Name *</Label>
                  <Input
                    id="currencyName"
                    value={newCurrencyData.name}
                    onChange={(e) => setNewCurrencyData({ ...newCurrencyData, name: e.target.value })}
                    placeholder="e.g., US Dollar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol *</Label>
                  <Input
                    id="currencySymbol"
                    value={newCurrencyData.symbol}
                    onChange={(e) => setNewCurrencyData({ ...newCurrencyData, symbol: e.target.value })}
                    placeholder="e.g., $"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyFlag">Flag SVG (Optional)</Label>
                  <Input
                    id="currencyFlag"
                    value={newCurrencyData.flag_svg}
                    onChange={(e) => setNewCurrencyData({ ...newCurrencyData, flag_svg: e.target.value })}
                    placeholder="SVG code for flag"
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canSend"
                      checked={newCurrencyData.can_send}
                      onCheckedChange={(checked) =>
                        setNewCurrencyData({ ...newCurrencyData, can_send: checked as boolean })
                      }
                    />
                    <Label htmlFor="canSend" className="font-normal cursor-pointer">
                      Can Send
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canReceive"
                      checked={newCurrencyData.can_receive}
                      onCheckedChange={(checked) =>
                        setNewCurrencyData({ ...newCurrencyData, can_receive: checked as boolean })
                      }
                    />
                    <Label htmlFor="canReceive" className="font-normal cursor-pointer">
                      Can Receive
                    </Label>
                  </div>
                </div>
                <Button
                  onClick={handleAddCurrency}
                  disabled={!newCurrencyData.code || !newCurrencyData.name || !newCurrencyData.symbol || saving}
                  className="w-full bg-easner-primary hover:bg-easner-primary-600"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Currency
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Currency Management Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
                        <span className="font-medium">{currency.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{currency.code}</TableCell>
                    <TableCell className="font-medium">{currency.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          currency.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {currency.status === "active" ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(currency.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRates(currency)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Rates
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspendCurrency(currency.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            {currency.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCurrency(currency.id)} className="text-red-600">
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
          </CardContent>
        </Card>

        {/* Edit Rates Dialog */}
        <Dialog open={isEditingRates} onOpenChange={setIsEditingRates}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader className="flex flex-row items-center gap-6">
              <DialogTitle>
                Edit Exchange Rates - {selectedCurrency?.name} ({selectedCurrency?.code})
              </DialogTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editCanSend"
                    checked={currencySettings.can_send}
                    onCheckedChange={(checked) =>
                      setCurrencySettings({ ...currencySettings, can_send: checked as boolean })
                    }
                  />
                  <Label htmlFor="editCanSend" className="font-normal cursor-pointer text-sm">
                    Can Send
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editCanReceive"
                    checked={currencySettings.can_receive}
                    onCheckedChange={(checked) =>
                      setCurrencySettings({ ...currencySettings, can_receive: checked as boolean })
                    }
                  />
                  <Label htmlFor="editCanReceive" className="font-normal cursor-pointer text-sm">
                    Can Receive
                  </Label>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {getCurrencyRates(selectedCurrency?.code || "").map((rate: any) => (
                  <div key={rate.to_currency} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <span>{selectedCurrency.code}</span>
                      <span>→</span>
                      <span>{rate.to_currency}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Exchange Rate</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={rateUpdates[rate.to_currency]?.rate || rate.rate}
                          onChange={(e) => updateRateField(rate.to_currency, "rate", e.target.value)}
                          placeholder="0.0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fee Type</Label>
                        <select
                          value={rateUpdates[rate.to_currency]?.feeType || rate.fee_type}
                          onChange={(e) => updateRateField(rate.to_currency, "feeType", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="free">Free</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Fee Amount{" "}
                          {(rateUpdates[rate.to_currency]?.feeType || rate.fee_type) === "percentage"
                            ? "(%)"
                            : `(${selectedCurrency.code})`}
                        </Label>
                        <Input
                          type="number"
                          step={
                            (rateUpdates[rate.to_currency]?.feeType || rate.fee_type) === "percentage" ? "0.1" : "0.01"
                          }
                          value={rateUpdates[rate.to_currency]?.feeAmount || rate.fee_amount}
                          onChange={(e) => updateRateField(rate.to_currency, "feeAmount", e.target.value)}
                          placeholder={
                            (rateUpdates[rate.to_currency]?.feeType || rate.fee_type) === "percentage" ? "1.5" : "10.00"
                          }
                          disabled={(rateUpdates[rate.to_currency]?.feeType || rate.fee_type) === "free"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Min Amount ({selectedCurrency.code})</Label>
                        <Input
                          type="number"
                          step="1"
                          value={rateUpdates[rate.to_currency]?.minAmount || rate.min_amount || 0}
                          onChange={(e) => updateRateField(rate.to_currency, "minAmount", e.target.value)}
                          placeholder="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Amount ({selectedCurrency.code})</Label>
                        <Input
                          type="number"
                          step="1"
                          value={rateUpdates[rate.to_currency]?.maxAmount || rate.max_amount || 1000000}
                          onChange={(e) => updateRateField(rate.to_currency, "maxAmount", e.target.value)}
                          placeholder="1000000"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Transaction Limits:</strong> Users can send between{" "}
                        <span className="font-medium">
                          {selectedCurrency.symbol}
                          {(rateUpdates[rate.to_currency]?.minAmount || rate.min_amount || 0).toLocaleString()}
                        </span>{" "}
                        and{" "}
                        <span className="font-medium">
                          {selectedCurrency.symbol}
                          {(rateUpdates[rate.to_currency]?.maxAmount || rate.max_amount || 1000000).toLocaleString()}
                        </span>{" "}
                        when converting from {selectedCurrency.code} to {rate.to_currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditingRates(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRates}
                  className="bg-easner-primary hover:bg-easner-primary-600"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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

export default AdminRatesPage
