"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, QrCode, Plus, Edit, Trash2, Star } from "lucide-react"

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: 1,
    currency: "RUB",
    type: "bank_account",
    name: "Sberbank Russia",
    accountName: "Novapay Russia LLC",
    accountNumber: "40817810123456789012",
    bankName: "Sberbank Russia",
    status: "active",
    isDefault: true,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    currency: "NGN",
    type: "bank_account",
    name: "First Bank Nigeria",
    accountName: "Novapay Nigeria Ltd",
    accountNumber: "1234567890",
    bankName: "First Bank Nigeria",
    status: "active",
    isDefault: true,
    createdAt: "2024-01-15",
  },
  {
    id: 3,
    currency: "RUB",
    type: "qr_code",
    name: "SberPay QR",
    qrCodeData: "https://qr.sber.ru/pay/12345",
    instructions: "Scan this QR code with your SberPay app to complete the payment",
    status: "active",
    isDefault: false,
    createdAt: "2024-01-20",
  },
]

const currencies = ["RUB", "NGN", "USD", "EUR"]

export default function AdminSettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  const [newMethod, setNewMethod] = useState({
    currency: "",
    type: "bank_account",
    name: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    qrCodeData: "",
    instructions: "",
  })

  const handleAddPaymentMethod = () => {
    const method = {
      id: Date.now(),
      ...newMethod,
      status: "active",
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setPaymentMethods([...paymentMethods, method])
    setNewMethod({
      currency: "",
      type: "bank_account",
      name: "",
      accountName: "",
      accountNumber: "",
      bankName: "",
      qrCodeData: "",
      instructions: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleToggleStatus = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id ? { ...method, status: method.status === "active" ? "inactive" : "active" } : method,
      ),
    )
  }

  const handleSetDefault = (id: number, currency: string) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.currency === currency ? { ...method, isDefault: method.id === id } : method,
      ),
    )
  }

  const handleDeleteMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage system settings and configurations</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="Novapay" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input id="supportEmail" defaultValue="support@novapay.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTransactionAmount">Max Transaction Amount</Label>
                      <Input id="maxTransactionAmount" defaultValue="10000" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minTransactionAmount">Min Transaction Amount</Label>
                      <Input id="minTransactionAmount" defaultValue="1" type="number" />
                    </div>
                  </div>
                  <Button className="bg-novapay-primary hover:bg-novapay-primary-600">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-methods">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Configure payment methods for different currencies</p>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select
                            value={newMethod.currency}
                            onValueChange={(value) => setNewMethod({ ...newMethod, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={newMethod.type}
                            onValueChange={(value) => setNewMethod({ ...newMethod, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank_account">Bank Account</SelectItem>
                              <SelectItem value="qr_code">QR Code</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            placeholder="e.g., Sberbank Russia"
                          />
                        </div>

                        {newMethod.type === "bank_account" && (
                          <>
                            <div className="space-y-2">
                              <Label>Account Name</Label>
                              <Input
                                value={newMethod.accountName}
                                onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
                                placeholder="Account holder name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Account Number</Label>
                              <Input
                                value={newMethod.accountNumber}
                                onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                                placeholder="Account number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Bank Name</Label>
                              <Input
                                value={newMethod.bankName}
                                onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
                                placeholder="Bank name"
                              />
                            </div>
                          </>
                        )}

                        {newMethod.type === "qr_code" && (
                          <>
                            <div className="space-y-2">
                              <Label>QR Code Data/URL</Label>
                              <Input
                                value={newMethod.qrCodeData}
                                onChange={(e) => setNewMethod({ ...newMethod, qrCodeData: e.target.value })}
                                placeholder="QR code data or payment URL"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Instructions</Label>
                              <Textarea
                                value={newMethod.instructions}
                                onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                                placeholder="Payment instructions for users"
                                rows={3}
                              />
                            </div>
                          </>
                        )}

                        <Button
                          onClick={handleAddPaymentMethod}
                          disabled={!newMethod.currency || !newMethod.name}
                          className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                        >
                          Add Payment Method
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentMethods.map((method) => (
                        <TableRow key={method.id}>
                          <TableCell>
                            <Badge variant="outline">{method.currency}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {method.type === "bank_account" ? (
                                <Building2 className="h-4 w-4 text-gray-500" />
                              ) : (
                                <QrCode className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="capitalize">{method.type.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{method.name}</TableCell>
                          <TableCell>
                            {method.type === "bank_account" ? (
                              <div className="text-sm text-gray-600">
                                <div>{method.accountName}</div>
                                <div className="font-mono">{method.accountNumber}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600 max-w-xs truncate">{method.qrCodeData}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={method.status === "active"}
                                onCheckedChange={() => handleToggleStatus(method.id)}
                              />
                              <Badge
                                variant={method.status === "active" ? "default" : "secondary"}
                                className={
                                  method.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {method.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(method.id, method.currency)}
                              className={method.isDefault ? "text-yellow-600" : "text-gray-400"}
                            >
                              <Star className={`h-4 w-4 ${method.isDefault ? "fill-current" : ""}`} />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMethod(method.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive email notifications for transactions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive SMS notifications for transactions</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive push notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Button className="bg-novapay-primary hover:bg-novapay-primary-600">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-gray-600">Auto logout after inactivity</p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="bg-novapay-primary hover:bg-novapay-primary-600">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
