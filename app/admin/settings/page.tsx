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
import { Settings, Mail, Shield, Save, Eye, Edit, Plus, Trash2 } from "lucide-react"
import { currencies } from "@/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  baseCurrency: "NGN", // Add this line
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

export default function AdminSettingsPage() {
  const [platformConfig, setPlatformConfig] = useState(mockPlatformConfig)
  const [emailTemplates, setEmailTemplates] = useState(mockEmailTemplates)
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings)
  const [activeTab, setActiveTab] = useState("platform")

  const handleSaveSecuritySettings = () => {
    // Save security settings
    console.log("Saving security settings:", securitySettings)
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Platform
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
                        // Auto-save functionality
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
