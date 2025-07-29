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
  Edit,
  Plus,
  Trash2,
  CreditCard,
  QrCode,
  Building2,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { currencies } from "@/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"

interface SystemSetting {
  id: string
  key: string
  value: string
  data_type: string
  category: string
  description?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  template_type: string
  html_content: string
  text_content?: string
  variables: any
  status: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface PaymentMethod {
  id: string
  currency: string
  type: string
  name: string
  account_name?: string
  account_number?: string
  bank_name?: string
  qr_code_data?: string
  instructions?: string
  is_default: boolean
  status: string
  created_at: string
}

export default function AdminSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [activeTab, setActiveTab] = useState("platform")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dialog states
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)
  const [isEditPaymentMethodOpen, setIsEditPaymentMethodOpen] = useState(false)
  const [isAddEmailTemplateOpen, setIsAddEmailTemplateOpen] = useState(false)
  const [isEditEmailTemplateOpen, setIsEditEmailTemplateOpen] = useState(false)
  
  // Form states
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null)
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    currency: "",
    type: "bank_account",
    name: "",
    account_name: "",
    account_number: "",
    bank_name: "",
    qr_code_data: "",
    instructions: "",
    is_default: false,
  })
  const [newEmailTemplate, setNewEmailTemplate] = useState({
    name: "",
    subject: "",
    template_type: "registration",
    html_content: "",
    text_content: "",
    variables: "{}",
  })

  // Platform config derived from system settings
  const platformConfig = {
    maintenanceMode: getSettingValue("maintenance_mode", "boolean", false),
    registrationEnabled: getSettingValue("registration_enabled", "boolean", true),
    emailVerificationRequired: getSettingValue("email_verification_required", "boolean", true),
    baseCurrency: getSettingValue("base_currency", "string", "NGN"),
  }

  // Security settings derived from system settings
  const securitySettings = {
    twoFactorRequired: getSettingValue("two_factor_required", "boolean", true),
    sessionTimeout: getSettingValue("session_timeout", "number", 30),
    passwordMinLength: getSettingValue("password_min_length", "number", 8),
    passwordRequireSpecialChars: getSettingValue("password_require_special_chars", "boolean", true),
    maxLoginAttempts: getSettingValue("max_login_attempts", "number", 5),
    accountLockoutDuration: getSettingValue("account_lockout_duration", "number", 15),
  }

  function getSettingValue(key: string, dataType: string, defaultValue: any) {
    const setting = systemSettings.find(s => s.key === key)
    if (!setting) return defaultValue
    
    switch (dataType) {
      case "boolean":
        return setting.value === "true"
      case "number":
        return Number(setting.value)
      case "json":
        try {
          return JSON.parse(setting.value)
        } catch {
          return defaultValue
        }
      default:
        return setting.value
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      await Promise.all([
        loadSystemSettings(),
        loadEmailTemplates(),
        loadPaymentMethods(),
      ])
    } catch (error) {
      console.error("Error loading settings data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSystemSettings() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("key", { ascending: true })

    if (error) throw error
    setSystemSettings(data || [])
  }

  async function loadEmailTemplates() {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_type", { ascending: true })
      .order("name", { ascending: true })

    if (error) throw error
    setEmailTemplates(data || [])
  }

  async function loadPaymentMethods() {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error
    setPaymentMethods(data || [])
  }

  async function updateSystemSetting(key: string, value: any, dataType = "string") {
    setSaving(true)
    try {
      let stringValue: string
      switch (dataType) {
        case "boolean":
          stringValue = value ? "true" : "false"
          break
        case "number":
          stringValue = String(value)
          break
        case "json":
          stringValue = JSON.stringify(value)
          break
        default:
          stringValue = String(value)
      }

      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key,
          value: stringValue,
          data_type: dataType,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Update local state
      setSystemSettings(prev => {
        const existing = prev.find(s => s.key === key)
        if (existing) {
          return prev.map(s => s.key === key ? { ...s, value: stringValue } : s)
        } else {
          return [...prev, { id: "", key, value: stringValue, data_type: dataType, category: "general" }]
        }
      })
    } catch (error) {
      console.error("Error updating system setting:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddPaymentMethod() {
    try {
      // If setting as default, unset other defaults for the same currency
      if (newPaymentMethod.is_default) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("currency", newPaymentMethod.currency)
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .insert({
          currency: newPaymentMethod.currency,
          type: newPaymentMethod.type,
          name: newPaymentMethod.name,
          account_name: newPaymentMethod.account_name || null,
          account_number: newPaymentMethod.account_number || null,
          bank_name: newPaymentMethod.bank_name || null,
          qr_code_data: newPaymentMethod.qr_code_data || null,
          instructions: newPaymentMethod.instructions || null,
          is_default: newPaymentMethod.is_default,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setPaymentMethods(prev => [...prev, data])
      setNewPaymentMethod({
        currency: "",
        type: "bank_account",
        name: "",
        account_name: "",
        account_number: "",
        bank_name: "",
        qr_code_data: "",
        instructions: "",
        is_default: false,
      })
      setIsAddPaymentMethodOpen(false)
    } catch (error) {
      console.error("Error adding payment method:", error)
    }
  }

  async function handleEditPaymentMethod() {
    if (!editingPaymentMethod) return

    try {
      // If setting as default, unset other defaults for the same currency
      if (editingPaymentMethod.is_default) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("currency", editingPaymentMethod.currency)
          .neq("id", editingPaymentMethod.id)
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .update({
          currency: editingPaymentMethod.currency,
          type: editingPaymentMethod.type,
          name: editingPaymentMethod.name,
          account_name: editingPaymentMethod.account_name || null,
          account_number: editingPaymentMethod.account_number || null,
          bank_name: editingPaymentMethod.bank_name || null,
          qr_code_data: editingPaymentMethod.qr_code_data || null,
          instructions: editingPaymentMethod.instructions || null,
          is_default: editingPaymentMethod.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPaymentMethod.id)
        .select()
        .single()

      if (error) throw error

      setPaymentMethods(prev => prev.map(pm => pm.id === editingPaymentMethod.id ? data : pm))
      setEditingPaymentMethod(null)
      setIsEditPaymentMethodOpen(false)
    } catch (error) {
      console.error("Error updating payment method:", error)
    }
  }

  async function handleTogglePaymentMethodStatus(id: string) {
    const method = paymentMethods.find(pm => pm.id === id)
    if (!method) return

    const newStatus = method.status === "active" ? "inactive" : "active"

    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) throw error

      setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, status: newStatus } : pm))
    } catch (error) {
      console.error("Error updating payment method status:", error)
    }
  }

  async function handleSetDefaultPaymentMethod(id: string) {
    const targetMethod = paymentMethods.find(pm => pm.id === id)
    if (!targetMethod) return

    try {
      // Unset other defaults for the same currency
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", targetMethod.currency)

      // Set this one as default
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id)

      if (error) throw error

      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.currency === targetMethod.currency ? pm.id === id : pm.is_default,
      })))
    } catch (error) {
      console.error("Error setting default payment method:", error)
    }
  }

  async function handleDeletePaymentMethod(id: string) {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)

      if (error) throw error

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id))
    } catch (error) {
      console.error("Error deleting payment method:", error)
    }
  }

  async function handleAddEmailTemplate() {
    try {
      let variables = {}
      try {
        variables = JSON.parse(newEmailTemplate.variables)
      } catch {
        variables = {}
      }

      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: newEmailTemplate.name,
          subject: newEmailTemplate.subject,
          template_type: newEmailTemplate.template_type,
          html_content: newEmailTemplate.html_content,
          text_content: newEmailTemplate.text_content || null,
          variables,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setEmailTemplates(prev => [...prev, data])
      setNewEmailTemplate({
        name: "",
        subject: "",
        template_type: "registration",
        html_content: "",
        text_content: "",
        variables: "{}",
      })
      setIsAddEmailTemplateOpen(false)
    } catch (error) {
      console.error("Error adding email template:", error)
    }
  }

  async function handleEditEmailTemplate() {
    if (!editingEmailTemplate) return

    try {
      let variables = {}
      try {
        variables = JSON.parse(JSON.stringify(editingEmailTemplate.variables))
      } catch {
        variables = {}
      }

      const { data, error } = await supabase
        .from("email_templates")
        .update({
          name: editingEmailTemplate.name,
          subject: editingEmailTemplate.subject,
          template_type: editingEmailTemplate.template_type,
          html_content: editingEmailTemplate.html_content,
          text_content: editingEmailTemplate.text_content || null,
          variables,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingEmailTemplate.id)
        .select()
        .single()

      if (error) throw error

      setEmailTemplates(prev => prev.map(et => et.id === editingEmailTemplate.id ? data : et))
      setEditingEmailTemplate(null)
      setIsEditEmailTemplateOpen(false)
    } catch (error) {
      console.error("Error updating email template:", error)
    }
  }

  async function handleToggleEmailTemplateStatus(id: string) {
    const template = emailTemplates.find(et => et.id === id)
    if (!template) return

    const newStatus = template.status === "active" ? "inactive" : "active"

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) throw error

      setEmailTemplates(prev => prev.map(et => et.id === id ? { ...et, status: newStatus } : et))
    } catch (error) {
      console.error("Error updating email template status:", error)
    }
  }

  async function handleDeleteEmailTemplate(id: string) {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id)

      if (error) throw error

      setEmailTemplates(prev => prev.filter(et => et.id !== id))
    } catch (error) {
      console.error("Error deleting email template:", error)
    }
  }

  const handleEditPaymentMethodClick = (method: PaymentMethod) => {
    setEditingPaymentMethod({ ...method })
    setIsEditPaymentMethodOpen(true)
  }

  const handleEditEmailTemplateClick = (template: EmailTemplate) => {
    setEditingEmailTemplate({ 
      ...template,
      variables: typeof template.variables === 'object' ? JSON.stringify(template.variables, null, 2) : template.variables
    })
    setIsEditEmailTemplateOpen(true)
  }

  const getPaymentMethodIcon = (type: string) => {
    return type === "qr_code" ? <QrCode className="h-4 w-4" /> : <Building2 className="h-4 w-4" />
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency ? <div dangerouslySetInnerHTML={{ __html: currency.flag }} /> : null
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Enable to temporarily disable user access</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={platformConfig.maintenanceMode}
                      onCheckedChange={(checked) => updateSystemSetting("maintenance_mode", checked, "boolean")}
                      disabled={saving}
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
                      onCheckedChange={(checked) => updateSystemSetting("registration_enabled", checked, "boolean")}
                      disabled={saving}
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
                      onCheckedChange={(checked) => updateSystemSetting("email_verification_required", checked, "boolean")}
                      disabled={saving}
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
                      onValueChange={(value) => updateSystemSetting("base_currency", value, "string")}
                      disabled={saving}
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
                                value={newPaymentMethod.account_name}
                                onChange={(e) =>
                                  setNewPaymentMethod({ ...newPaymentMethod, account_name: e.target.value })
                                }
                                placeholder="e.g., Novapay Russia LLC"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number *</Label>
                                <Input
                                  id="accountNumber"
                                  value={newPaymentMethod.account_number}
                                  onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, account_number: e.target.value })
                                  }
                                  placeholder="e.g., 40817810123456789012"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name *</Label>
                                <Input
                                  id="bankName"
                                  value={newPaymentMethod.bank_name}
                                  onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, bank_name: e.target.value })
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
                                value={newPaymentMethod.qr_code_data}
                                onChange={(e) =>
                                  setNewPaymentMethod({ ...newPaymentMethod, qr_code_data: e.target.value })
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
                            checked={newPaymentMethod.is_default}
                            onCheckedChange={(checked) =>
                              setNewPaymentMethod({ ...newPaymentMethod, is_default: checked as boolean })
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
                                (!newPaymentMethod.account_name ||
                                  !newPaymentMethod.account_number ||
                                  !newPaymentMethod.bank_name)) ||
                              (newPaymentMethod.type === "qr_code" && !newPaymentMethod.qr_code_data)
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
                              checked={editingPaymentMethod.is_default}
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
                              <DropdownMenuItem onClick={() => handleEditPaymentMethodClick(method)}>
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
                  <Dialog open={isAddEmailTemplateOpen} onOpenChange={setIsAddEmailTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Email Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="templateName">Template Name *</Label>
                            <Input
                              id="templateName"
                              value={newEmailTemplate.name}
                              onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, name: e.target.value })}
                              placeholder="e.g., Welcome Email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateType">Type *</Label>
                            <Select
                              value={newEmailTemplate.template_type}
                              onValueChange={(value) => setNewEmailTemplate({ ...newEmailTemplate, template_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="registration">Registration</SelectItem>
                                <SelectItem value="transaction">Transaction</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="notification">Notification</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateSubject">Subject *</Label>
                          <Input
                            id="templateSubject"
                            value={newEmailTemplate.subject}
                            onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, subject: e.target.value })}
                            placeholder="e.g., Welcome to Novapay!"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="htmlContent">HTML Content *</Label>
                          <Textarea
                            id="htmlContent"
                            value={newEmailTemplate.html_content}
                            onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, html_content: e.target.value })}
                            placeholder="HTML email content with variables like {{first_name}}"
                            rows={8}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="textContent">Text Content (Optional)</Label>
                          <Textarea
                            id="textContent"
                            value={newEmailTemplate.text_content}
                            onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, text_content: e.target.value })}
                            placeholder="Plain text version of the email"
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="variables">Variables (JSON)</Label>
                          <Textarea
                            id="variables"
                            value={newEmailTemplate.variables}
                            onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, variables: e.target.value })}
                            placeholder='{"first_name": "User\'s first name", \"email": "User\'s email"}'
                            rows={3}
                          />
                          <p className="text-xs text-gray-500">
                            Define available variables for this template in JSON format
                          </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button variant="outline" onClick={() => setIsAddEmailTemplateOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddEmailTemplate}
                            disabled={!newEmailTemplate.name || !newEmailTemplate.subject || !newEmailTemplate.html_content}
                            className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                          >
                            Add Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Email Template Dialog */}
                  <Dialog open={isEditEmailTemplateOpen} onOpenChange={setIsEditEmailTemplateOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Email Template</DialogTitle>
                      </DialogHeader>
                      {editingEmailTemplate && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="editTemplateName">Template Name *</Label>
                              <Input
                                id="editTemplateName"
                                value={editingEmailTemplate.name}
                                onChange={(e) => setEditingEmailTemplate({ ...editingEmailTemplate, name: e.target.value })}
                                placeholder="e.g., Welcome Email"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editTemplateType">Type *</Label>
                              <Select
                                value={editingEmailTemplate.template_type}
                                onChange={(value) => setEditingEmailTemplate({ ...editingEmailTemplate, template_type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="registration">Registration</SelectItem>
                                  <SelectItem value="transaction">Transaction</SelectItem>
                                  <SelectItem value="security">Security</SelectItem>
                                  <SelectItem value="notification">Notification</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editTemplateSubject">Subject *</Label>
                            <Input
                              id="editTemplateSubject"
                              value={editingEmailTemplate.subject}
                              onChange={(e) => setEditingEmailTemplate({ ...editingEmailTemplate, subject: e.target.value })}
                              placeholder="e.g., Welcome to Novapay!"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editHtmlContent">HTML Content *</Label>
                            <Textarea
                              id="editHtmlContent"
                              value={editingEmailTemplate.html_content}
                              onChange={(e) => setEditingEmailTemplate({ ...editingEmailTemplate, html_content: e.target.value })}
                              placeholder="HTML email content with variables like {{first_name}}"
                              rows={8}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editTextContent">Text Content (Optional)</Label>
                            <Textarea
                              id="editTextContent"
                              value={editingEmailTemplate.text_content || ""}
                              onChange={(e) => setEditingEmailTemplate({ ...editingEmailTemplate, text_content: e.target.value })}
                              placeholder="Plain text version of the email"
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editVariables">Variables (JSON)</Label>
                            <Textarea
                              id="editVariables"
                              value={typeof editingEmailTemplate.variables === 'string' ? editingEmailTemplate.variables : JSON.stringify(editingEmailTemplate.variables, null, 2)}
                              onChange={(e) => setEditingEmailTemplate({ ...editingEmailTemplate, variables: e.target.value })}
                              placeholder='{"first_name": "User\'s first name", \"email": "User\'s email"}'
                              rows={3}
                            />
                            <p className="text-xs text-gray-500">
                              Define available variables for this template in JSON format
                            </p>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={() => setIsEditEmailTemplateOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={handleEditEmailTemplate}
                              disabled={!editingEmailTemplate.name || !editingEmailTemplate.subject || !editingEmailTemplate.html_content}
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
                          <Badge className="bg-purple-100 text-purple-800 capitalize">{template.template_type}</Badge>
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
                        <TableCell>{new Date(template.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEmailTemplateClick(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleEmailTemplateStatus(template.id)}>
                                {template.status === "active" ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEmailTemplate(template.id)}
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

                {emailTemplates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No email templates configured yet</p>
                    <p className="text-sm">Add email templates to customize user communications</p>
                  </div>
                )}
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
                      onChange={(e) => updateSystemSetting("session_timeout", Number(e.target.value), "number")}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordLength">Password Min Length</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => updateSystemSetting("password_min_length", Number(e.target.value), "number")}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => updateSystemSetting("max_login_attempts", Number(e.target.value), "number")}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securitySettings.accountLockoutDuration}
                      onChange={(e) => updateSystemSetting("account_lockout_duration", Number(e.target.value), "number")}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Two-Factor Authentication Required</Label>
                      <p className="text-sm text-gray-500">Require 2FA for all user accounts</p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={securitySettings.twoFactorRequired}
                      onChange={(checked) => updateSystemSetting("two_factor_required", checked, "boolean")}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="specialChars">Require Special Characters in Passwords</Label>
                      <p className="text-sm text-gray-500">Enforce special character requirements</p>
                    </div>
                    <Switch
                      id="specialChars"
                      checked={securitySettings.passwordRequireSpecialChars}
                      onChange={(checked) => updateSystemSetting("password_require_special_chars", checked, "boolean")}
                      disabled={saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )\
}
