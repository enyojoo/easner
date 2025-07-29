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
import { Plus, MoreHorizontal, Edit, Pause, Trash2 } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"

// Mock currencies data with exchange rates
const mockCurrencies = [
  {
    id: "RUB",
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#1435a1" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#fff"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(16 24)" fill="#c53a28"></path></svg>`,
    status: "active",
    createdAt: "2024-01-01",
    rates: [
      {
        toCurrency: "NGN",
        rate: 22.45,
        feeType: "free",
        feeAmount: 0,
        minAmount: 100,
        maxAmount: 500000,
      },
    ],
  },
  {
    id: "NGN",
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#3b8655"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#3b8655"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.657,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
    status: "active",
    createdAt: "2024-01-01",
    rates: [
      {
        toCurrency: "RUB",
        rate: 0.0445,
        feeType: "percentage",
        feeAmount: 1.5,
        minAmount: 1000,
        maxAmount: 10000000,
      },
    ],
  },
]

const AdminRatesPage = () => {
  const [currencies, setCurrencies] = useState(mockCurrencies)
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null)
  const [isEditingRates, setIsEditingRates] = useState(false)
  const [isAddingCurrency, setIsAddingCurrency] = useState(false)
  const [newCurrencyData, setNewCurrencyData] = useState({
    code: "",
    name: "",
    symbol: "",
    flag: "",
  })
  const [rateUpdates, setRateUpdates] = useState<any>({})

  const handleAddCurrency = () => {
    const newCurrency = {
      id: newCurrencyData.code.toUpperCase(),
      code: newCurrencyData.code.toUpperCase(),
      name: newCurrencyData.name,
      symbol: newCurrencyData.symbol,
      flag:
        newCurrencyData.flag ||
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ccc"/></svg>`,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      rates: currencies.map((currency) => ({
        toCurrency: currency.code,
        rate: 1,
        feeType: "free",
        feeAmount: 0,
        minAmount: 10,
        maxAmount: 1000000,
      })),
    }

    // Add rates for existing currencies to include the new currency
    const updatedCurrencies = currencies.map((currency) => ({
      ...currency,
      rates: [
        ...currency.rates,
        {
          toCurrency: newCurrency.code,
          rate: 1,
          feeType: "free",
          feeAmount: 0,
          minAmount: 10,
          maxAmount: 1000000,
        },
      ],
    }))

    setCurrencies([...updatedCurrencies, newCurrency])
    setNewCurrencyData({ code: "", name: "", symbol: "", flag: "" })
    setIsAddingCurrency(false)
  }

  const handleEditRates = (currency: any) => {
    setSelectedCurrency(currency)
    const updates: any = {}
    currency.rates.forEach((rate: any) => {
      updates[rate.toCurrency] = {
        rate: rate.rate.toString(),
        feeType: rate.feeType,
        feeAmount: rate.feeAmount.toString(),
        minAmount: rate.minAmount?.toString() || "0",
        maxAmount: rate.maxAmount?.toString() || "1000000",
      }
    })
    setRateUpdates(updates)
    setIsEditingRates(true)
  }

  const handleSaveRates = () => {
    setCurrencies((prev) =>
      prev.map((currency) =>
        currency.id === selectedCurrency.id
          ? {
              ...currency,
              rates: currency.rates.map((rate: any) => ({
                ...rate,
                rate: Number.parseFloat(rateUpdates[rate.toCurrency]?.rate || rate.rate),
                feeType: rateUpdates[rate.toCurrency]?.feeType || rate.feeType,
                feeAmount: Number.parseFloat(rateUpdates[rate.toCurrency]?.feeAmount || rate.feeAmount),
                minAmount: Number.parseFloat(rateUpdates[rate.toCurrency]?.minAmount || rate.minAmount || 0),
                maxAmount: Number.parseFloat(rateUpdates[rate.toCurrency]?.maxAmount || rate.maxAmount || 1000000),
              })),
            }
          : currency,
      ),
    )
    setIsEditingRates(false)
    setSelectedCurrency(null)
    setRateUpdates({})
  }

  const handleSuspendCurrency = (currencyId: string) => {
    setCurrencies((prev) =>
      prev.map((currency) =>
        currency.id === currencyId
          ? { ...currency, status: currency.status === "active" ? "suspended" : "active" }
          : currency,
      ),
    )
  }

  const handleDeleteCurrency = (currencyId: string) => {
    if (currencies.length <= 2) {
      alert("Cannot delete currency. At least 2 currencies are required.")
      return
    }

    setCurrencies((prev) => {
      const filtered = prev.filter((currency) => currency.id !== currencyId)
      // Remove rates for deleted currency from other currencies
      return filtered.map((currency) => ({
        ...currency,
        rates: currency.rates.filter((rate: any) => rate.toCurrency !== currencyId),
      }))
    })
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

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Currency & Exchange Rates</h1>
              <p className="text-gray-600">Manage currencies, exchange rates and transaction fees</p>
            </div>
            <Dialog open={isAddingCurrency} onOpenChange={setIsAddingCurrency}>
              <DialogTrigger asChild>
                <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
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
                      value={newCurrencyData.flag}
                      onChange={(e) => setNewCurrencyData({ ...newCurrencyData, flag: e.target.value })}
                      placeholder="SVG code for flag"
                    />
                  </div>
                  <Button
                    onClick={handleAddCurrency}
                    disabled={!newCurrencyData.code || !newCurrencyData.name || !newCurrencyData.symbol}
                    className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                  >
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
                          <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
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
                      <TableCell>{currency.createdAt}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleDeleteCurrency(currency.id)}
                              className="text-red-600"
                            >
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
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Edit Exchange Rates - {selectedCurrency?.name} ({selectedCurrency?.code})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedCurrency?.rates.map((rate: any) => (
                  <div key={rate.toCurrency} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <span>{selectedCurrency.code}</span>
                      <span>→</span>
                      <span>{rate.toCurrency}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Exchange Rate</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={rateUpdates[rate.toCurrency]?.rate || rate.rate}
                          onChange={(e) => updateRateField(rate.toCurrency, "rate", e.target.value)}
                          placeholder="0.0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fee Type</Label>
                        <select
                          value={rateUpdates[rate.toCurrency]?.feeType || rate.feeType}
                          onChange={(e) => updateRateField(rate.toCurrency, "feeType", e.target.value)}
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
                          {(rateUpdates[rate.toCurrency]?.feeType || rate.feeType) === "percentage"
                            ? "(%)"
                            : `(${selectedCurrency.code})`}
                        </Label>
                        <Input
                          type="number"
                          step={
                            (rateUpdates[rate.toCurrency]?.feeType || rate.feeType) === "percentage" ? "0.1" : "0.01"
                          }
                          value={rateUpdates[rate.toCurrency]?.feeAmount || rate.feeAmount}
                          onChange={(e) => updateRateField(rate.toCurrency, "feeAmount", e.target.value)}
                          placeholder={
                            (rateUpdates[rate.toCurrency]?.feeType || rate.feeType) === "percentage" ? "1.5" : "10.00"
                          }
                          disabled={(rateUpdates[rate.toCurrency]?.feeType || rate.feeType) === "free"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Min Amount ({selectedCurrency.code})</Label>
                        <Input
                          type="number"
                          step="1"
                          value={rateUpdates[rate.toCurrency]?.minAmount || rate.minAmount || 0}
                          onChange={(e) => updateRateField(rate.toCurrency, "minAmount", e.target.value)}
                          placeholder="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Amount ({selectedCurrency.code})</Label>
                        <Input
                          type="number"
                          step="1"
                          value={rateUpdates[rate.toCurrency]?.maxAmount || rate.maxAmount || 1000000}
                          onChange={(e) => updateRateField(rate.toCurrency, "maxAmount", e.target.value)}
                          placeholder="1000000"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Transaction Limits:</strong> Users can send between{" "}
                        <span className="font-medium">
                          {selectedCurrency.symbol}
                          {(rateUpdates[rate.toCurrency]?.minAmount || rate.minAmount || 0).toLocaleString()}
                        </span>{" "}
                        and{" "}
                        <span className="font-medium">
                          {selectedCurrency.symbol}
                          {(rateUpdates[rate.toCurrency]?.maxAmount || rate.maxAmount || 1000000).toLocaleString()}
                        </span>{" "}
                        when converting from {selectedCurrency.code} to {rate.toCurrency}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingRates(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRates} className="bg-novapay-primary hover:bg-novapay-primary-600">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}

export default AdminRatesPage
