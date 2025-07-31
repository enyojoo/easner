"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAdminData } from "@/hooks/use-admin-data"
import { TrendingUp, TrendingDown, Edit, Save } from "lucide-react"
import { useState } from "react"

export default function AdminRatesPage() {
  const { exchangeRates, loading } = useAdminData()
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (currencyPair: string, currentRate: number) => {
    setEditingRate(currencyPair)
    setEditValue(currentRate.toString())
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    setEditingRate(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingRate(null)
    setEditValue("")
  }

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

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exchange Rates</h1>
              <p className="text-muted-foreground">Manage currency exchange rates and fees</p>
            </div>
            <Button>Update All Rates</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { pair: "USD/NGN", rate: 1650.0, change: 2.5, updated: "2024-01-15 10:30:00", status: "active" },
              { pair: "GBP/NGN", rate: 2050.0, change: -1.2, updated: "2024-01-15 10:30:00", status: "active" },
              { pair: "EUR/NGN", rate: 1780.0, change: 0.8, updated: "2024-01-15 10:30:00", status: "active" },
            ].map((rate) => (
              <Card key={rate.pair}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{rate.pair}</CardTitle>
                  {rate.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{rate.rate.toFixed(2)}</div>
                  <p className={`text-xs ${rate.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {rate.change > 0 ? "+" : ""}
                    {rate.change}% from yesterday
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Management</CardTitle>
              <CardDescription>Update and manage all currency exchange rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Currency Pair</th>
                      <th className="text-left p-2">Current Rate</th>
                      <th className="text-left p-2">24h Change</th>
                      <th className="text-left p-2">Last Updated</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { pair: "USD/NGN", rate: 1650.0, change: 2.5, updated: "2024-01-15 10:30:00", status: "active" },
                      { pair: "GBP/NGN", rate: 2050.0, change: -1.2, updated: "2024-01-15 10:30:00", status: "active" },
                      { pair: "EUR/NGN", rate: 1780.0, change: 0.8, updated: "2024-01-15 10:30:00", status: "active" },
                    ].map((rate) => (
                      <tr key={rate.pair} className="border-b">
                        <td className="p-2 font-medium">{rate.pair}</td>
                        <td className="p-2">
                          {editingRate === rate.pair ? (
                            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-24" />
                          ) : (
                            `₦${rate.rate.toFixed(2)}`
                          )}
                        </td>
                        <td className="p-2">
                          <span className={rate.change > 0 ? "text-green-600" : "text-red-600"}>
                            {rate.change > 0 ? "+" : ""}
                            {rate.change}%
                          </span>
                        </td>
                        <td className="p-2">{rate.updated}</td>
                        <td className="p-2">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </td>
                        <td className="p-2">
                          {editingRate === rate.pair ? (
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={handleSave}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(rate.pair, rate.rate)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
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
</merged_code>
