"use client"

import { useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Mail, Shield, Save, Eye, Edit, Plus, Trash2, CreditCard, QrCode, Building2 } from "lucide-react"
import { currencies } from "@/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock data
const mockPlatformConfig = {
  platformName: "Novapay",
  supportEmail: "support@novapay.com",
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  maxTransactionAmount: 50000,
  minTransactionAmount: 10,
  dailyTransactionLimit: 100000,
  baseCurrency: "NGN",
}

const mockEmailTemplates = [
  {
    id: 1,
    name: "Welcome Email",
    subject: "Welcome to Novapay!",
    type: "registration",
    status: "active",
    lastModified: "2024-01-15",
  },
  {
    id: 2,
    name: "Transaction Confirmation",
    subject: "Your transaction has been processed",
    type: "transaction",
    status: "active",
    lastModified: "2024-01-14",
  },
  {
    id: 3,
    name: "Password Reset",
    subject: "Reset your Novapay password",
    type: "security",
    status: "active",
    lastModified: "2024-01-13",
  },
]

const mockSecuritySettings = {
  twoFactorRequired: true,
  sessionTimeout: 30,
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  accountLockoutDuration: 15,
}

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
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    currency: "RUB",
    type: "qr_code",
    name: "SberPay QR",
    qrCodeData: "https://qr.sber.ru/pay/12345",
    instructions: "Scan this QR code with your SberPay app to complete the payment",
    status: "inactive",
    isDefault: false,
    createdAt: "2024-01-13",
  },
]

export default function AdminSettingsPage() {
  const [platformConfig, setPlatformConfig] = useState(mockPlatformConfig)
  const [emailTemplates, setEmailTemplates] = useState(mockEmailTemplates)
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings)
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [activeTab, setActiveTab] = useState("platform")
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    currency: "",
    type: "bank_account",
    name: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    qrCodeData: "",
    instructions: "",
  })

  const handleSaveSecuritySettings = () => {
    console.log("Saving security settings:", securitySettings)
  }

  const handleAddPaymentMethod = () => {
    const paymentMethod = {
      id: Date.now(),
      currency: newPaymentMethod.currency,
      type: newPaymentMethod.type,
      name: newPaymentMethod.name,
      accountName: newPaymentMethod.accountName,
      accountNumber: newPaymentMethod.accountNumber,
      bankName: newPaymentMethod.bankName,
      qrCodeData: newPaymentMethod.qrCodeData,
      instructions: newPaymentMethod.instructions,
      status: "active",
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setPaymentMethods([...paymentMethods, paymentMethod])
    setNewPaymentMethod({
      currency: "",
      type: "bank_account",
      name: "",
      accountName: "",
      accountNumber: "",
      bankName: "",
      qrCodeData: "",
      instructions: "",
    })
    setIsAddPaymentMethodOpen(false)
  }

  const handleTogglePaymentMethodStatus = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((pm) =>
        pm.id === id ? { ...pm, status: pm.status === "active" ? "inactive" : "active" } : pm,
      ),
    )
  }

  const handleSetDefaultPaymentMethod = (id: number) => {
    const targetMethod = paymentMethods.find((pm) => pm.id === id)
    if (!targetMethod) return

    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.currency === targetMethod.currency ? pm.id === id : pm.isDefault,
      })),
    )
  }

  const handleDeletePaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
  }

  const getPaymentMethodIcon = (type: string) => {
    return type === "qr_code" ? <QrCode className="h-4 w-4" /> : <Building2 className="h-4 w-4" />
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency ? <div dangerouslySetInnerHTML={{ __html: currency.flag }} /> : null
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure platform settings and system parameters</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Platform
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Platform Configuration */}
          <TabsContent value="platform">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Enable to temporarily disable user access</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={platformConfig.maintenanceMode}
                      onCheckedChange={(checked) => setPlatformConfig({ ...platformConfig, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">Registration Enabled</Label>
                      <p className="text-sm text-gray-500">Allow new user registrations</p>
                    </div>
                    <Switch
                      id="registration"
                      checked={platformConfig.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setPlatformConfig({ ...platformConfig, registrationEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailVerification">Email Verification Required</Label>
                      <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      id="emailVerification"
                      checked={platformConfig.emailVerificationRequired}
                      onCheckedChange={(checked) =>
                        setPlatformConfig({ ...platformConfig, emailVerificationRequired: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="baseCurrency">Base Currency for Reporting</Label>
                      <p className="text-sm text-gray-500">
                        Default currency for displaying transaction amounts and reports
                      </p>
                    </div>
                    <Select
                      value={platformConfig.baseCurrency}
                      onValueChange={(value) => {
                        setPlatformConfig({ ...platformConfig, baseCurrency: value })
                        console.log("Auto-saving base currency:", value)
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select base currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-3">
                              <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
                              <div className="font-medium">{currency.code}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure payment methods that users will see when sending money
                    </p>
                  </div>
                  <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Payment Method</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency *</Label>
                            <Select
                              value={newPaymentMethod.currency}
                              onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, currency: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    <div className="flex items-center gap-3">
                                      <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
                                      <div className="font-medium">
                                        {currency.code} - {currency.name}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                              value={newPaymentMethod.type}
                              onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank_account">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Bank Account
                                  </div>
                                </SelectItem>
                                <SelectItem value="qr_code">
                                  <div className="flex items-center gap-2">
                                    <QrCode className="h-4 w-4" />
                                    QR Code
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Display Name *</Label>
                          <Input
                            id="name"
                            value={newPaymentMethod.name}
                            onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                            placeholder="e.g., Sberbank Russia, SberPay QR"
                          />
                        </div>

                        {newPaymentMethod.type === "bank_account" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="accountName">Account Name *</Label>
                              <Input
                                id="accountName"
                                value={newPaymentMethod.accountName}
                                onChange={(e) =>
                                  setNewPaymentMethod({ ...newPaymentMethod, accountName: e.target.value })
                                }
                                placeholder="e.g., Novapay Russia LLC"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number *</Label>
                                <Input
                                  id="accountNumber"
                                  value={newPaymentMethod.accountNumber}
                                  onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, accountNumber: e.target.value })
                                  }
                                  placeholder="e.g., 40817810123456789012"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name *</Label>
                                <Input
                                  id="bankName"
                                  value={newPaymentMethod.bankName}
                                  onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, bankName: e.target.value })
                                  }
                                  placeholder="e.g., Sberbank Russia"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {newPaymentMethod.type === "qr_code" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="qrCodeData">QR Code Data/URL *</Label>
                              <Input
                                id="qrCodeData"
                                value={newPaymentMethod.qrCodeData}
                                onChange={(e) =>
                                  setNewPaymentMethod({ ...newPaymentMethod, qrCodeData: e.target.value })
                                }
                                placeholder="e.g., https://qr.sber.ru/pay/12345 or payment data"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="instructions">Instructions</Label>
                              <Textarea
                                id="instructions"
                                value={newPaymentMethod.instructions}
                                onChange={(e) =>
                                  setNewPaymentMethod({ ...newPaymentMethod, instructions: e.target.value })
                                }
                                placeholder="Instructions for users on how to use this QR code"
                                rows={3}
                              />
                            </div>
                          </>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddPaymentMethod}
                            disabled={
                              !newPaymentMethod.currency ||
                              !newPaymentMethod.name ||
                              (newPaymentMethod.type === "bank_account" &&
                                (!newPaymentMethod.accountName ||
                                  !newPaymentMethod.accountNumber ||
                                  !newPaymentMethod.bankName)) ||
                              (newPaymentMethod.type === "qr_code" && !newPaymentMethod.qrCodeData)
                            }
                            className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                          >
                            Add Payment Method
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                          <div className="flex items-center gap-2">
                            {getCurrencyFlag(method.currency)}
                            <span className="font-medium">{method.currency}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(method.type)}
                            <span className="capitalize">{method.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>
                          {method.type === "bank_account" ? (
                            <div className="text-sm text-gray-600">
                              <div>{method.accountName}</div>
                              <div className="font-mono">{method.accountNumber}</div>
                              <div>{method.bankName}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              <div className="font-mono text-xs">{method.qrCodeData}</div>
                              {method.instructions && (
                                <div className="mt-1 text-xs">{method.instructions.substring(0, 50)}...</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              method.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {method.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {method.isDefault && <Badge className="bg-blue-100 text-blue-800">Default</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePaymentMethodStatus(method.id)}
                            >
                              {method.status === "active" ? "Disable" : "Enable"}
                            </Button>
                            {method.status === "active" && !method.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(method.id)}
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

                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No payment methods configured yet</p>
                    <p className="text-sm">Add payment methods to enable user transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Templates</CardTitle>
                  <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">{template.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              template.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{template.lastModified}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
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

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordLength">Password Min Length</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, passwordMinLength: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securitySettings.accountLockoutDuration}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, accountLockoutDuration: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSecuritySettings}
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )
}
