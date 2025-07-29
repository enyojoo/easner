"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Settings,
  Mail,
  Shield,
  Save,
  Eye,
  Edit,
  Plus,
  Trash2,
  CreditCard,
  QrCode,
  Building2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import { currencies } from "@/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { settingsService, paymentMethodService } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

// Mock data for email templates and security settings
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

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [platformConfig, setPlatformConfig] = useState({
    platformName: "Novapay",
    supportEmail: "support@novapay.com",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxTransactionAmount: 50000,
    minTransactionAmount: 10,
    dailyTransactionLimit: 100000,
    baseCurrency: "NGN",
  })
  const [emailTemplates, setEmailTemplates] = useState(mockEmailTemplates)
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("platform")
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)
  const [isEditPaymentMethodOpen, setIsEditPaymentMethodOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null)
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    currency: "",
    type: "bank_account",
    name: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    qrCodeData: "",
    instructions: "",
    isDefault: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
    loadPaymentMethods()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)

      // Load platform settings from Supabase
      const [
        platformName,
        supportEmail,
        maintenanceMode,
        registrationEnabled,
        emailVerificationRequired,
        maxTransactionAmount,
        minTransactionAmount,
        dailyTransactionLimit,
        baseCurrency,
      ] = await Promise.all([
        settingsService.get("platform_name"),
        settingsService.get("support_email"),
        settingsService.get("maintenance_mode"),
        settingsService.get("registration_enabled"),
        settingsService.get("email_verification_required"),
        settingsService.get("max_transaction_amount"),
        settingsService.get("min_transaction_amount"),
        settingsService.get("daily_transaction_limit"),
        settingsService.get("base_currency"),
      ])

      setPlatformConfig({
        platformName: platformName || "Novapay",
        supportEmail: supportEmail || "support@novapay.com",
        maintenanceMode: maintenanceMode || false,
        registrationEnabled: registrationEnabled !== false, // Default to true
        emailVerificationRequired: emailVerificationRequired !== false, // Default to true
        maxTransactionAmount: maxTransactionAmount || 50000,
        minTransactionAmount: minTransactionAmount || 10,
        dailyTransactionLimit: dailyTransactionLimit || 100000,
        baseCurrency: baseCurrency || "NGN",
      })
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load platform settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentMethodService.getAll()
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error loading payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      })
    }
  }

  const savePlatformSettings = async () => {
    try {
      setIsSaving(true)

      // Save all platform settings to Supabase
      await settingsService.updateMultiple([
        { key: "platform_name", value: platformConfig.platformName, dataType: "string" },
        { key: "support_email", value: platformConfig.supportEmail, dataType: "string" },
        { key: "maintenance_mode", value: platformConfig.maintenanceMode, dataType: "boolean" },
        { key: "registration_enabled", value: platformConfig.registrationEnabled, dataType: "boolean" },
        { key: "email_verification_required", value: platformConfig.emailVerificationRequired, dataType: "boolean" },
        { key: "max_transaction_amount", value: platformConfig.maxTransactionAmount, dataType: "number" },
        { key: "min_transaction_amount", value: platformConfig.minTransactionAmount, dataType: "number" },
        { key: "daily_transaction_limit", value: platformConfig.dailyTransactionLimit, dataType: "number" },
        { key: "base_currency", value: platformConfig.baseCurrency, dataType: "string" },
      ])

      toast({
        title: "Success",
        description: "Platform settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save platform settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSecuritySettings = () => {
    console.log("Saving security settings:", securitySettings)
    toast({
      title: "Success",
      description: "Security settings saved successfully",
    })
  }

  const handleAddPaymentMethod = async () => {
    try {
      await paymentMethodService.create({
        currency: newPaymentMethod.currency,
        type: newPaymentMethod.type,
        name: newPaymentMethod.name,
        accountName: newPaymentMethod.accountName,
        accountNumber: newPaymentMethod.accountNumber,
        bankName: newPaymentMethod.bankName,
        qrCodeData: newPaymentMethod.qrCodeData,
        instructions: newPaymentMethod.instructions,
        isDefault: newPaymentMethod.isDefault,
      })

      await loadPaymentMethods()
      setNewPaymentMethod({
        currency: "",
        type: "bank_account",
        name: "",
        accountName: "",
        accountNumber: "",
        bankName: "",
        qrCodeData: "",
        instructions: "",
        isDefault: false,
      })
      setIsAddPaymentMethodOpen(false)

      toast({
        title: "Success",
        description: "Payment method added successfully",
      })
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      })
    }
  }

  const handleEditPaymentMethod = async () => {
    if (!editingPaymentMethod) return

    try {
      await paymentMethodService.update(editingPaymentMethod.id, {
        currency: editingPaymentMethod.currency,
        type: editingPaymentMethod.type,
        name: editingPaymentMethod.name,
        accountName: editingPaymentMethod.account_name,
        accountNumber: editingPaymentMethod.account_number,
        bankName: editingPaymentMethod.bank_name,
        qrCodeData: editingPaymentMethod.qr_code_data,
        instructions: editingPaymentMethod.instructions,
        isDefault: editingPaymentMethod.is_default,
      })

      await loadPaymentMethods()
      setEditingPaymentMethod(null)
      setIsEditPaymentMethodOpen(false)

      toast({
        title: "Success",
        description: "Payment method updated successfully",
      })
    } catch (error) {
      console.error("Error updating payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      })
    }
  }

  const handleTogglePaymentMethodStatus = async (id: string) => {
    try {
      const method = paymentMethods.find((pm) => pm.id === id)
      if (!method) return

      const newStatus = method.status === "active" ? "inactive" : "active"
      await paymentMethodService.updateStatus(id, newStatus)
      await loadPaymentMethods()

      toast({
        title: "Success",
        description: `Payment method ${newStatus === "active" ? "enabled" : "disabled"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling payment method status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment method status",
        variant: "destructive",
      })
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const method = paymentMethods.find((pm) => pm.id === id)
      if (!method) return

      await paymentMethodService.setDefault(id, method.currency)
      await loadPaymentMethods()

      toast({
        title: "Success",
        description: "Default payment method updated successfully",
      })
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      })
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await paymentMethodService.delete(id)
      await loadPaymentMethods()

      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (method: any) => {
    setEditingPaymentMethod({ ...method })
    setIsEditPaymentMethodOpen(true)
  }

  const getPaymentMethodIcon = (type: string) => {
    return type === "qr_code" ? <QrCode className="h-4 w-4" /> : <Building2 className="h-4 w-4" />
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency ? <div dangerouslySetInnerHTML={{ __html: currency.flag }} /> : null
  }

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-novapay-primary" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={platformConfig.platformName}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={platformConfig.supportEmail}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Transaction Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={platformConfig.minTransactionAmount}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, minTransactionAmount: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Transaction Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={platformConfig.maxTransactionAmount}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, maxTransactionAmount: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Transaction Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={platformConfig.dailyTransactionLimit}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, dailyTransactionLimit: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={savePlatformSettings}
                  disabled={isSaving}
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Platform Settings"}
                </Button>
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

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isDefault"
                            checked={newPaymentMethod.isDefault}
                            onCheckedChange={(checked) =>
                              setNewPaymentMethod({ ...newPaymentMethod, isDefault: checked as boolean })
                            }
                          />
                          <Label htmlFor="isDefault" className="text-sm font-medium">
                            Set as default payment method for this currency
                          </Label>
                        </div>

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

                  {/* Edit Payment Method Dialog */}
                  <Dialog open={isEditPaymentMethodOpen} onOpenChange={setIsEditPaymentMethodOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Payment Method</DialogTitle>
                      </DialogHeader>
                      {editingPaymentMethod && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="editCurrency">Currency *</Label>
                              <Select
                                value={editingPaymentMethod.currency}
                                onValueChange={(value) =>
                                  setEditingPaymentMethod({ ...editingPaymentMethod, currency: value })
                                }
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
                              <Label htmlFor="editType">Type *</Label>
                              <Select
                                value={editingPaymentMethod.type}
                                onValueChange={(value) =>
                                  setEditingPaymentMethod({ ...editingPaymentMethod, type: value })
                                }
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
                            <Label htmlFor="editName">Display Name *</Label>
                            <Input
                              id="editName"
                              value={editingPaymentMethod.name}
                              onChange={(e) =>
                                setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })
                              }
                              placeholder="e.g., Sberbank Russia, SberPay QR"
                            />
                          </div>

                          {editingPaymentMethod.type === "bank_account" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="editAccountName">Account Name *</Label>
                                <Input
                                  id="editAccountName"
                                  value={editingPaymentMethod.account_name || ""}
                                  onChange={(e) =>
                                    setEditingPaymentMethod({ ...editingPaymentMethod, account_name: e.target.value })
                                  }
                                  placeholder="e.g., Novapay Russia LLC"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editAccountNumber">Account Number *</Label>
                                  <Input
                                    id="editAccountNumber"
                                    value={editingPaymentMethod.account_number || ""}
                                    onChange={(e) =>
                                      setEditingPaymentMethod({
                                        ...editingPaymentMethod,
                                        account_number: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., 40817810123456789012"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editBankName">Bank Name *</Label>
                                  <Input
                                    id="editBankName"
                                    value={editingPaymentMethod.bank_name || ""}
                                    onChange={(e) =>
                                      setEditingPaymentMethod({ ...editingPaymentMethod, bank_name: e.target.value })
                                    }
                                    placeholder="e.g., Sberbank Russia"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {editingPaymentMethod.type === "qr_code" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="editQrCodeData">QR Code Data/URL *</Label>
                                <Input
                                  id="editQrCodeData"
                                  value={editingPaymentMethod.qr_code_data || ""}
                                  onChange={(e) =>
                                    setEditingPaymentMethod({ ...editingPaymentMethod, qr_code_data: e.target.value })
                                  }
                                  placeholder="e.g., https://qr.sber.ru/pay/12345 or payment data"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editInstructions">Instructions</Label>
                                <Textarea
                                  id="editInstructions"
                                  value={editingPaymentMethod.instructions || ""}
                                  onChange={(e) =>
                                    setEditingPaymentMethod({ ...editingPaymentMethod, instructions: e.target.value })
                                  }
                                  placeholder="Instructions for users on how to use this QR code"
                                  rows={3}
                                />
                              </div>
                            </>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="editIsDefault"
                              checked={editingPaymentMethod.is_default || false}
                              onCheckedChange={(checked) =>
                                setEditingPaymentMethod({ ...editingPaymentMethod, is_default: checked as boolean })
                              }
                            />
                            <Label htmlFor="editIsDefault" className="text-sm font-medium">
                              Set as default payment method for this currency
                            </Label>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditPaymentMethodOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleEditPaymentMethod}
                              disabled={
                                !editingPaymentMethod.currency ||
                                !editingPaymentMethod.name ||
                                (editingPaymentMethod.type === "bank_account" &&
                                  (!editingPaymentMethod.account_name ||
                                    !editingPaymentMethod.account_number ||
                                    !editingPaymentMethod.bank_name)) ||
                                (editingPaymentMethod.type === "qr_code" && !editingPaymentMethod.qr_code_data)
                              }
                              className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
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
                              <div>{method.account_name}</div>
                              <div className="font-mono">{method.account_number}</div>
                              <div>{method.bank_name}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              <div className="font-mono text-xs">{method.qr_code_data}</div>
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
                          {method.is_default && <Badge className="bg-blue-100 text-blue-800">Default</Badge>}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(method)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePaymentMethodStatus(method.id)}>
                                {method.status === "active" ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                              {method.status === "active" && !method.is_default && (
                                <DropdownMenuItem onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                                  Make Default
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeletePaymentMethod(method.id)}
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
