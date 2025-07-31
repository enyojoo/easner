"use client"
import { useState, useEffect, useRef } from "react"
import { QrCode, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { adminDataStore } from "@/lib/admin-data-store"
import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

  const [settings, setSettings] = useState({
    siteName: "NovaPay",
    supportEmail: "support@novapay.com",
    maintenanceMode: false,
    maxTransactionLimit: 1000000,
    announcement: "",
  })

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings)
  }

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
      const settingsData = data || []
      const newPlatformConfig = { ...platformConfig }
      const newSecuritySettings = { ...securitySettings }
      const newSettings = { ...settings }

      settingsData.forEach((setting) => {
        switch (setting.key) {
          case "maintenance_mode":
            newPlatformConfig.maintenanceMode = setting.value === "true"
            newSettings.maintenanceMode = setting.value === "true"
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
          case "site_name":
            newSettings.siteName = setting.value
            break
          case "support_email":
            newSettings.supportEmail = setting.value
            break
          case "max_transaction_limit":
            newSettings.maxTransactionLimit = Number.parseInt(setting.value)
            break
          case "announcement":
            newSettings.announcement = setting.value
            break
        }
      })

      setPlatformConfig(newPlatformConfig)
      setSecuritySettings(newSecuritySettings)
      setOriginalSecuritySettings(newSecuritySettings)
      setSettings(newSettings)
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
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("currency", { ascending: true })
        .order("is_default", { ascending: false })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error loading payment methods:", error)
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_type", { ascending: true })

      if (error) throw error
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
      console.error("Only SVG, PNG, and JPEG files are allowed for QR codes")
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
      // If setting as default, unset other defaults for the same currency
      if (newPaymentMethod.is_default) {
        await supabase.from("payment_methods").update({ is_default: false }).eq("currency", newPaymentMethod.currency)
      }

      let qrCodeData = newPaymentMethod.qr_code_data

      // Upload QR code file if provided
      if (newPaymentMethod.type === "qr_code" && qrCodeFile) {
        setUploadingQrCode(true)
        qrCodeData = await uploadQrCodeFile(qrCodeFile)
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
          qr_code_data: qrCodeData || null,
          instructions: newPaymentMethod.instructions || null,
          is_default: newPaymentMethod.is_default,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

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
      // If setting as default, unset other defaults for the same currency
      if (editingPaymentMethod.is_default) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("currency", editingPaymentMethod.currency)
          .neq("id", editingPaymentMethod.id)
      }

      let qrCodeData = editingPaymentMethod.qr_code_data

      // Upload new QR code file if provided
      if (editingPaymentMethod.type === "qr_code" && editingQrCodeFile) {
        setUploadingQrCode(true)
        qrCodeData = await uploadQrCodeFile(editingQrCodeFile)
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
          qr_code_data: qrCodeData || null,
          instructions: editingPaymentMethod.instructions || null,
          is_default: editingPaymentMethod.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPaymentMethod.id)
        .select()
        .single()

      if (error) throw error

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
      const { error } = await supabase
        .from("payment_methods")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setPaymentMethods(paymentMethods.map((pm) => (pm.id === id ? { ...pm, status: newStatus } : pm)))
      console.log("Payment method status updated successfully")
    } catch (error) {
      console.error("Error updating payment method status:", error)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    const targetMethod = paymentMethods.find((pm) => pm.id === id)
    if (!targetMethod) return

    try {
      // Unset other defaults for the same currency
      await supabase.from("payment_methods").update({ is_default: false }).eq("currency", targetMethod.currency)

      // Set this one as default
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

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
      const { error } = await supabase.from("payment_methods").delete().eq("id", id)

      if (error) throw error

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
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">System Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Transaction Limit (NGN)</label>
                <Input
                  type="number"
                  value={settings.maxTransactionLimit}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxTransactionLimit: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">System Announcement</label>
                <Textarea
                  value={settings.announcement}
                  onChange={(e) => setSettings((prev) => ({ ...prev, announcement: e.target.value }))}
                  placeholder="Enter system-wide announcement..."
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods Section */}
          {/* Email Templates Section */}
        </div>
      </AdminDashboardLayout>
    </AuthGuard>
  )
}
