"use client"

import { useState, useEffect, useRef } from "react"
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
  Edit,
  Plus,
  Trash2,
  CreditCard,
  QrCode,
  Building2,
  MoreHorizontal,
  X,
  Upload,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { adminDataStore } from "@/lib/admin-data-store"

interface SystemSetting {
  id: string
  key: string
  value: string
  data_type: string
  category: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag_svg: string
  status: string
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
  updated_at: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  template_type: string
  html_content: string
  text_content: string
  variables: string
  status: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export default function AdminSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [activeTab, setActiveTab] = useState("platform")
  const [saving, setSaving] = useState(false)
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)
  const [isEditPaymentMethodOpen, setIsEditPaymentMethodOpen] = useState(false)
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false)
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isEditingSecuritySettings, setIsEditingSecuritySettings] = useState(false)
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
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    template_type: "registration",
    html_content: "",
    text_content: "",
    variables: "",
    is_default: false,
  })

  // Add these state variables after the existing state declarations
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [editingQrCodeFile, setEditingQrCodeFile] = useState<File | null>(null)
  const [uploadingQrCode, setUploadingQrCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Platform configuration derived from system settings
  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    baseCurrency: "NGN",
  })

  // Security settings derived from system settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
  })

  const [originalSecuritySettings, setOriginalSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      await Promise.all([loadSystemSettings(), loadCurrencies(), loadPaymentMethods(), loadEmailTemplates()])
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })

      if (error) throw error

      setSystemSettings(data || [])

      // Update platform config from settings
      const settings = data || []
      const newPlatformConfig = { ...platformConfig }
      const newSecuritySettings = { ...securitySettings }

      settings.forEach((setting) => {
        switch (setting.key) {
          case "maintenance_mode":
            newPlatformConfig.maintenanceMode = setting.value === "true"
            break
          case "registration_enabled":
            newPlatformConfig.registrationEnabled = setting.value === "true"
            break
          case "email_verification_required":
            newPlatformConfig.emailVerificationRequired = setting.value === "true"
            break
          case "base_currency":
            newPlatformConfig.baseCurrency = setting.value
            break
          case "session_timeout":
            newSecuritySettings.sessionTimeout = Number.parseInt(setting.value)
            break
          case "password_min_length":
            newSecuritySettings.passwordMinLength = Number.parseInt(setting.value)
            break
          case "max_login_attempts":
            newSecuritySettings.maxLoginAttempts = Number.parseInt(setting.value)
            break
          case "account_lockout_duration":
            newSecuritySettings.accountLockoutDuration = Number.parseInt(setting.value)
            break
        }
      })

      setPlatformConfig(newPlatformConfig)
      setSecuritySettings(newSecuritySettings)
      setOriginalSecuritySettings(newSecuritySettings)
    } catch (error) {
      console.error("Error loading system settings:", error)
    }
  }

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase.from("currencies").select("*").order("code", { ascending: true })

      if (error) throw error
      setCurrencies(data || [])
    } catch (error) {
      console.error("Error loading currencies:", error)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const data = await adminDataStore.loadPaymentMethods()
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error loading payment methods:", error)
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const data = await adminDataStore.loadEmailTemplates()
      setEmailTemplates(data || [])
    } catch (error) {
      console.error("Error loading email templates:", error)
    }
  }

  const updateSystemSetting = async (key: string, value: any, dataType = "string") => {
    try {
      const { error } = await supabase.from("system_settings").upsert(
        {
          key,
          value: String(value),
          data_type: dataType,
          category: "platform",
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        },
      )

      if (error) throw error
      console.log(`Setting ${key} updated successfully`)
    } catch (error) {
      console.error("Error updating system setting:", error)
      throw error
    }
  }

  const handlePlatformConfigChange = async (key: string, value: any) => {
    try {
      setPlatformConfig({ ...platformConfig, [key]: value })

      const settingKey = key === "baseCurrency" ? "base_currency" : key.replace(/([A-Z])/g, "_$1").toLowerCase()
      await updateSystemSetting(settingKey, value, typeof value === "boolean" ? "boolean" : "string")

      // If base currency changed, refresh admin data store
      if (key === "baseCurrency") {
        await adminDataStore.refreshDataForBaseCurrencyChange()
      }
    } catch (error) {
      console.error("Error updating platform config:", error)
      // Revert the change if it failed
      setPlatformConfig(platformConfig)
    }
  }

  const handleSecuritySettingsChange = (key: string, value: number) => {
    setSecuritySettings({ ...securitySettings, [key]: value })
  }

  const handleSaveSecuritySettings = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: "session_timeout", value: securitySettings.sessionTimeout, data_type: "number" },
        { key: "password_min_length", value: securitySettings.passwordMinLength, data_type: "number" },
        { key: "max_login_attempts", value: securitySettings.maxLoginAttempts, data_type: "number" },
        { key: "account_lockout_duration", value: securitySettings.accountLockoutDuration, data_type: "number" },
      ]

      for (const update of updates) {
        await updateSystemSetting(update.key, update.value, update.data_type)
      }

      setOriginalSecuritySettings(securitySettings)
      setIsEditingSecuritySettings(false)
      console.log("Security settings saved successfully")
    } catch (error) {
      console.error("Error saving security settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSecuritySettings = () => {
    setSecuritySettings(originalSecuritySettings)
    setIsEditingSecuritySettings(false)
  }

  const handleQrCodeFileSelect = (file: File, isEditing = false) => {
    const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"]
    if (!allowedTypes.includes(file.type)) {
      console.error("Only SVG, PNG, and JPEG, files are allowed for QR codes")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("File size must be less than 5MB")
      return
    }

    if (isEditing) {
      setEditingQrCodeFile(file)
    } else {
      setQrCodeFile(file)
    }
  }

  const uploadQrCodeFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `qr_${Date.now()}.${fileExt}`
    const filePath = `qr-codes/${fileName}`

    const { data, error } = await supabase.storage.from("payment-qr-codes").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("payment-qr-codes").getPublicUrl(filePath)

    return publicUrl
  }

  const handleAddPaymentMethod = async () => {
    setSaving(true)
    try {
      let qrCodeData = newPaymentMethod.qr_code_data

      // Upload QR code file if provided
      if (newPaymentMethod.type === "qr_code" && qrCodeFile) {
        setUploadingQrCode(true)
        qrCodeData = await uploadQrCodeFile(qrCodeFile)
      }

      const data = await adminDataStore.createPaymentMethod({
        currency: newPaymentMethod.currency,
        type: newPaymentMethod.type,
        name: newPaymentMethod.name,
        account_name: newPaymentMethod.account_name || null,
        account_number: newPaymentMethod.account_number || null,
        bank_name: newPaymentMethod.bank_name || null,
        qr_code_data: qrCodeData || null,
        instructions: newPaymentMethod.instructions || null,
        is_default: newPaymentMethod.is_default,
        status: "active",
      })

      setPaymentMethods([...paymentMethods, data])
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
      setQrCodeFile(null)
      setIsAddPaymentMethodOpen(false)
      console.log("Payment method added successfully")
    } catch (error) {
      console.error("Error adding payment method:", error)
    } finally {
      setSaving(false)
      setUploadingQrCode(false)
    }
  }

  const handleEditPaymentMethod = async () => {
    if (!editingPaymentMethod) return

    setSaving(true)
    try {
      let qrCodeData = editingPaymentMethod.qr_code_data

      // Upload new QR code file if provided
      if (editingPaymentMethod.type === "qr_code" && editingQrCodeFile) {
        setUploadingQrCode(true)
        qrCodeData = await uploadQrCodeFile(editingQrCodeFile)
      }

      const data = await adminDataStore.updatePaymentMethod(editingPaymentMethod.id, {
        currency: editingPaymentMethod.currency,
        type: editingPaymentMethod.type,
        name: editingPaymentMethod.name,
        account_name: editingPaymentMethod.account_name || null,
        account_number: editingPaymentMethod.account_number || null,
        bank_name: editingPaymentMethod.bank_name || null,
        qr_code_data: qrCodeData || null,
        instructions: editingPaymentMethod.instructions || null,
        is_default: editingPaymentMethod.is_default,
        updated_at: new Date().toISOString(),
      })

      setPaymentMethods(paymentMethods.map((pm) => (pm.id === editingPaymentMethod.id ? data : pm)))
      setEditingPaymentMethod(null)
      setEditingQrCodeFile(null)
      setIsEditPaymentMethodOpen(false)
      console.log("Payment method updated successfully")
    } catch (error) {
      console.error("Error updating payment method:", error)
    } finally {
      setSaving(false)
      setUploadingQrCode(false)
    }
  }

  const handleTogglePaymentMethodStatus = async (id: string) => {
    const method = paymentMethods.find((pm) => pm.id === id)
    if (!method) return

    const newStatus = method.status === "active" ? "inactive" : "active"

    try {
      const data = await adminDataStore.updatePaymentMethodStatus(id, newStatus)
      setPaymentMethods(paymentMethods.map((pm) => (pm.id === id ? data : pm)))
      console.log("Payment method status updated successfully")
    } catch (error) {
      console.error("Error updating payment method status:", error)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    const targetMethod = paymentMethods.find((pm) => pm.id === id)
    if (!targetMethod) return

    try {
      const data = await adminDataStore.setDefaultPaymentMethod(id, targetMethod.currency)
      
      setPaymentMethods(
        paymentMethods.map((pm) => ({
          ...pm,
          is_default: pm.currency === targetMethod.currency ? pm.id === id : pm.is_default,
        })),
      )
      console.log("Default payment method updated successfully")
    } catch (error) {
      console.error("Error setting default payment method:", error)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await adminDataStore.deletePaymentMethod(id)
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
      console.log("Payment method deleted successfully")
    } catch (error) {
      console.error("Error deleting payment method:", error)
    }
  }

  const handleAddEmailTemplate = async () => {
    setSaving(true)
    try {
      // If setting as default, unset other defaults for the same template type
      if (newTemplate.is_default) {
        await supabase
          .from("email_templates")
          .update({ is_default: false })
          .eq("template_type", newTemplate.template_type)
      }

      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: newTemplate.name,
          subject: newTemplate.subject,
          template_type: newTemplate.template_type,
          html_content: newTemplate.html_content,
          text_content: newTemplate.text_content,
          variables: newTemplate.variables,
          is_default: newTemplate.is_default,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setEmailTemplates([...emailTemplates, data])
      setNewTemplate({
        name: "",
        subject: "",
        template_type: "registration",
        html_content: "",
        text_content: "",
        variables: "",
        is_default: false,
      })
      setIsAddTemplateOpen(false)
      console.log("Email template added successfully")
    } catch (error) {
      console.error("Error adding email template:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditEmailTemplate = async () => {
    if (!editingTemplate) return

    setSaving(true)
    try {
      // If setting as default, unset other defaults for the same template type
      if (editingTemplate.is_default) {
        await supabase
          .from("email_templates")
          .update({ is_default: false })
          .eq("template_type", editingTemplate.template_type)
          .neq("id", editingTemplate.id)
      }

      const { data, error } = await supabase
        .from("email_templates")
        .update({
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          template_type: editingTemplate.template_type,
          html_content: editingTemplate.html_content,
          text_content: editingTemplate.text_content,
          variables: editingTemplate.variables,
          is_default: editingTemplate.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTemplate.id)
        .select()
        .single()

      if (error) throw error

      setEmailTemplates(emailTemplates.map((template) => (template.id === editingTemplate.id ? data : template)))
      setEditingTemplate(null)
      setIsEditTemplateOpen(false)
      console.log("Email template updated successfully")
    } catch (error) {
      console.error("Error updating email template:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleTemplateStatus = async (id: string) => {
    const template = emailTemplates.find((t) => t.id === id)
    if (!template) return

    const newStatus = template.status === "active" ? "inactive" : "active"

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setEmailTemplates(emailTemplates.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
      console.log("Email template status updated successfully")
    } catch (error) {
      console.error("Error updating template status:", error)
    }
  }

  const handleDeleteEmailTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("email_templates").delete().eq("id", id)

      if (error) throw error

      setEmailTemplates(emailTemplates.filter((t) => t.id !== id))
      console.log("Email template deleted successfully")
    } catch (error) {
      console.error("Error deleting email template:", error)
    }
  }

  const handleEditClick = (method: PaymentMethod) => {
    setEditingPaymentMethod({ ...method })
    setIsEditPaymentMethodOpen(true)
  }

  const handleEditTemplateClick = (template: EmailTemplate) => {
    setEditingTemplate({ ...template })
    setIsEditTemplateOpen(true)
  }

  const getPaymentMethodIcon = (type: string) => {
    return type === "qr_code" ? <QrCode className="h-4 w-4" /> : <Building2 className="h-4 w-4" />
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency?.flag_svg ? <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} /> : null
  }

  const handleSetDefaultTemplate = async (id: string) => {
    const targetTemplate = emailTemplates.find((t) => t.id === id)
    if (!targetTemplate) return

    try {
      // Unset other defaults for the same template type
      await supabase
        .from("email_templates")
        .update({ is_default: false })
        .eq("template_type", targetTemplate.template_type)

      // Set this one as default
      const { error } = await supabase
        .from("email_templates")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setEmailTemplates(
        emailTemplates.map((t) => ({
          ...t,
          is_default: t.template_type === targetTemplate.template_type ? t.id === id : t.is_default,
        })),
      )
      console.log("Default email template updated successfully")
    } catch (error) {
      console.error("Error setting default email template:", error)
    }
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
                      onCheckedChange={(checked) => handlePlatformConfigChange("maintenanceMode", checked)}
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
                      onCheckedChange={(checked) => handlePlatformConfigChange("registrationEnabled", checked)}
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
                      onCheckedChange={(checked) => handlePlatformConfigChange("emailVerificationRequired", checked)}
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
                      onValueChange={(value) => handlePlatformConfigChange("baseCurrency", value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select base currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies
                          .filter((c) => c.status === "active")
                          .map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-3">
                                <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
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
                      <Button className="bg-easner-primary hover:bg-easner-primary-600">
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
                                {currencies
                                  .filter((c) => c.status === "active")
                                  .map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      <div className="flex items-center gap-3">
                                        <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
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
                              <Label htmlFor="qrCodeFile">Upload QR Code *</Label>
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleQrCodeFileSelect(file)
                                }}
                                accept=".svg,.png,.jpg,.jpeg,.pdf"
                                className="hidden"
                              />
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex items-center gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  {qrCodeFile ? "Change File" : "Select File"}
                                </Button>
                                {qrCodeFile && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{qrCodeFile.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setQrCodeFile(null)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">Supported formats: SVG, PNG, JPEG (Max 5MB)</p>
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
                              saving ||
                              uploadingQrCode ||
                              !newPaymentMethod.currency ||
                              !newPaymentMethod.name ||
                              (newPaymentMethod.type === "bank_account" &&
                                (!newPaymentMethod.account_name ||
                                  !newPaymentMethod.account_number ||
                                  !newPaymentMethod.bank_name)) ||
                              (newPaymentMethod.type === "qr_code" && !qrCodeFile && !newPaymentMethod.qr_code_data)
                            }
                            className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                          >
                            {saving ? "Adding..." : "Add Payment Method"}
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
                                  {currencies
                                    .filter((c) => c.status === "active")
                                    .map((currency) => (
                                      <SelectItem key={currency.code} value={currency.code}>
                                        <div className="flex items-center gap-3">
                                          <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
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
                                <Label htmlFor="editQrCodeFile">Upload QR Code *</Label>
                                <input
                                  type="file"
                                  ref={editFileInputRef}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleQrCodeFileSelect(file, true)
                                  }}
                                  accept=".svg,.png,.jpg,.jpeg,.pdf"
                                  className="hidden"
                                />
                                <div className="flex items-center gap-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    {editingQrCodeFile
                                      ? "Change File"
                                      : editingPaymentMethod.qr_code_data
                                        ? "Replace File"
                                        : "Select File"}
                                  </Button>
                                  {editingQrCodeFile && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span>{editingQrCodeFile.name}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingQrCodeFile(null)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                  {!editingQrCodeFile && editingPaymentMethod.qr_code_data && (
                                    <span className="text-sm text-gray-600">Current file uploaded</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Supported formats: SVG, PNG, JPEG (Max 5MB)
                                </p>
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
                                saving ||
                                uploadingQrCode ||
                                !editingPaymentMethod.currency ||
                                !editingPaymentMethod.name ||
                                (editingPaymentMethod.type === "bank_account" &&
                                  (!editingPaymentMethod.account_name ||
                                    !editingPaymentMethod.account_number ||
                                    !editingPaymentMethod.bank_name)) ||
                                (editingPaymentMethod.type === "qr_code" &&
                                  !editingQrCodeFile &&
                                  !editingPaymentMethod.qr_code_data)
                              }
                              className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                            >
                              {saving ? "Saving..." : "Save Changes"}
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
                  <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-easner-primary hover:bg-easner-primary-600">
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
                              value={newTemplate.name}
                              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                              placeholder="e.g., Welcome Email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateType">Template Type *</Label>
                            <Select
                              value={newTemplate.template_type}
                              onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value })}
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
                            value={newTemplate.subject}
                            onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                            placeholder="e.g., Welcome to Novapay!"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateVariables">Variables (JSON format)</Label>
                          <Input
                            id="templateVariables"
                            value={newTemplate.variables}
                            onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
                            placeholder='e.g., {"user_name": "string", "amount": "number"}'
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateHtmlContent">HTML Content *</Label>
                          <Textarea
                            id="templateHtmlContent"
                            value={newTemplate.html_content}
                            onChange={(e) => setNewTemplate({ ...newTemplate, html_content: e.target.value })}
                            placeholder="HTML email template content..."
                            rows={6}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="templateTextContent">Text Content *</Label>
                          <Textarea
                            id="templateTextContent"
                            value={newTemplate.text_content}
                            onChange={(e) => setNewTemplate({ ...newTemplate, text_content: e.target.value })}
                            placeholder="Plain text email template content..."
                            rows={4}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isDefaultTemplate"
                            checked={newTemplate.is_default}
                            onCheckedChange={(checked) =>
                              setNewTemplate({ ...newTemplate, is_default: checked as boolean })
                            }
                          />
                          <Label htmlFor="isDefaultTemplate" className="text-sm font-medium">
                            Set as default template for this type
                          </Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button variant="outline" onClick={() => setIsAddTemplateOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddEmailTemplate}
                            disabled={
                              saving ||
                              !newTemplate.name ||
                              !newTemplate.subject ||
                              !newTemplate.html_content ||
                              !newTemplate.text_content
                            }
                            className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                          >
                            {saving ? "Adding..." : "Add Template"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Email Template Dialog */}
                  <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Email Template</DialogTitle>
                      </DialogHeader>
                      {editingTemplate && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="editTemplateName">Template Name *</Label>
                              <Input
                                id="editTemplateName"
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                placeholder="e.g., Welcome Email"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editTemplateType">Template Type *</Label>
                              <Select
                                value={editingTemplate.template_type}
                                onChange={(value) => setEditingTemplate({ ...editingTemplate, template_type: value })}
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
                              value={editingTemplate.subject}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                              placeholder="e.g., Welcome to Novapay!"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editTemplateVariables">Variables (JSON format)</Label>
                            <Input
                              id="editTemplateVariables"
                              value={editingTemplate.variables}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, variables: e.target.value })}
                              placeholder='e.g., {"user_name": "string", "amount": "number"}'
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editTemplateHtmlContent">HTML Content *</Label>
                            <Textarea
                              id="editTemplateHtmlContent"
                              value={editingTemplate.html_content}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, html_content: e.target.value })}
                              placeholder="HTML email template content..."
                              rows={6}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editTemplateTextContent">Text Content *</Label>
                            <Textarea
                              id="editTemplateTextContent"
                              value={editingTemplate.text_content}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, text_content: e.target.value })}
                              placeholder="Plain text email template content..."
                              rows={4}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="editIsDefaultTemplate"
                              checked={editingTemplate.is_default}
                              onChange={(checked) =>
                                setEditingTemplate({ ...editingTemplate, is_default: checked as boolean })
                              }
                            />
                            <Label htmlFor="editIsDefaultTemplate" className="text-sm font-medium">
                              Set as default template for this type
                            </Label>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={handleEditEmailTemplate}
                              disabled={
                                saving ||
                                !editingTemplate.name ||
                                !editingTemplate.subject ||
                                !editingTemplate.html_content ||
                                !editingTemplate.text_content
                              }
                              className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                            >
                              {saving ? "Saving..." : "Save Changes"}
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
                      <TableHead>Default</TableHead>
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
                          <Badge className="bg-purple-100 text-purple-800">{template.template_type}</Badge>
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
                        <TableCell>
                          {template.is_default && <Badge className="bg-blue-100 text-blue-800">Default</Badge>}
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
                              <DropdownMenuItem onClick={() => handleEditTemplateClick(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleTemplateStatus(template.id)}>
                                {template.status === "active" ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                              {template.status === "active" && !template.is_default && (
                                <DropdownMenuItem onClick={() => handleSetDefaultTemplate(template.id)}>
                                  Make Default
                                </DropdownMenuItem>
                              )}
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
                <div className="flex items-center justify-between">
                  <CardTitle>Security Settings</CardTitle>
                  {!isEditingSecuritySettings && (
                    <Button
                      onClick={() => setIsEditingSecuritySettings(true)}
                      className="bg-easner-primary hover:bg-easner-primary-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Settings
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingsChange("sessionTimeout", Number(e.target.value))}
                      disabled={!isEditingSecuritySettings}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordLength">Password Min Length</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => handleSecuritySettingsChange("passwordMinLength", Number(e.target.value))}
                      disabled={!isEditingSecuritySettings}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => handleSecuritySettingsChange("maxLoginAttempts", Number(e.target.value))}
                      disabled={!isEditingSecuritySettings}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securitySettings.accountLockoutDuration}
                      onChange={(e) => handleSecuritySettingsChange("accountLockoutDuration", Number(e.target.value))}
                      disabled={!isEditingSecuritySettings}
                    />
                  </div>
                </div>

                {isEditingSecuritySettings && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelSecuritySettings}
                      className="flex-1 bg-transparent"
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSecuritySettings}
                      disabled={saving}
                      className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )
}
