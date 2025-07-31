"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminData } from "@/hooks/use-admin-data"
import { Save, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function AdminRatesPage() {
  const { exchangeRates, loading } = useAdminData()
  const [rates, setRates] = useState(exchangeRates || {})

  const handleRateChange = (currency: string, rate: string) => {
    setRates((prev: any) => ({
      ...prev,
      [currency]: Number.parseFloat(rate) || 0,
    }))
  }

  const handleSave = async () => {
    // Implementation for saving rates
    console.log("Saving rates:", rates)
  }

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
  ]

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Currency & Exchange Rates</h1>
              <p className="text-gray-600">Manage currencies, exchange rates and transaction fees</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Rates
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Exchange Rates</CardTitle>
                <CardDescription>Base currency: Nigerian Naira (NGN)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-novapay-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currencies.map((currency) => (
                      <div key={currency.code} className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">{currency.code}</Label>
                          <p className="text-sm text-gray-500">{currency.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">1 {currency.code} =</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rates[currency.code] || ""}
                            onChange={(e) => handleRateChange(currency.code, e.target.value)}
                            className="w-24"
                            placeholder="0.00"
                          />
                          <span className="text-sm text-gray-500">NGN</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate History</CardTitle>
                <CardDescription>Recent rate changes and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">USD Rate Updated</p>
                      <p className="text-sm text-gray-500">Changed from ₦1,450 to ₦1,460</p>
                    </div>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">EUR Rate Updated</p>
                      <p className="text-sm text-gray-500">Changed from ₦1,580 to ₦1,590</p>
                    </div>
                    <span className="text-sm text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">GBP Rate Updated</p>
                      <p className="text-sm text-gray-500">Changed from ₦1,820 to ₦1,830</p>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
