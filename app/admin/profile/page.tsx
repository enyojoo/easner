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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Shield, Activity, Save, Eye, EyeOff, Smartphone, Mail, Calendar, MapPin } from "lucide-react"

// Mock admin profile data
const mockAdminProfile = {
  id: "admin_001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@novapay.com",
  phone: "+1234567890",
  role: "Super Admin",
  department: "Operations",
  location: "Lagos, Nigeria",
  joinDate: "2023-06-15",
  lastLogin: "2024-01-15 14:30:00",
  avatar: "/placeholder.svg?height=100&width=100&text=JD",
  twoFactorEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
}

// Mock activity logs
const mockActivityLogs = [
  {
    id: 1,
    action: "Login",
    description: "Successful login from 192.168.1.100",
    timestamp: "2024-01-15 14:30:00",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
  },
  {
    id: 2,
    action: "User Management",
    description: "Updated user status for user ID: 12345",
    timestamp: "2024-01-15 13:45:00",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
  },
  {
    id: 3,
    action: "Settings Update",
    description: "Modified exchange rate for RUB → NGN",
    timestamp: "2024-01-15 12:20:00",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
  },
  {
    id: 4,
    action: "Failed Login",
    description: "Failed login attempt - incorrect password",
    timestamp: "2024-01-14 18:15:00",
    status: "failed",
    ipAddress: "192.168.1.105",
    userAgent: "Firefox 121.0.0.0",
  },
  {
    id: 5,
    action: "Transaction Review",
    description: "Reviewed and approved transaction ID: TXN789012",
    timestamp: "2024-01-14 16:30:00",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
  },
]

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(mockAdminProfile)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [activeTab, setActiveTab] = useState("profile")

  const handleSaveProfile = () => {
    // Save profile changes
    console.log("Saving profile:", profile)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }
    // Change password logic
    console.log("Changing password")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleToggle2FA = () => {
    setProfile({ ...profile, twoFactorEnabled: !profile.twoFactorEnabled })
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600">Manage your account settings and security preferences</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile.avatar || "/placeholder.svg"}
                      alt={`${profile.firstName} ${profile.lastName}`}
                    />
                    <AvatarFallback className="text-xl">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-gray-600">{profile.role}</p>
                    <Badge className="mt-2 bg-novapay-primary text-white">{profile.department}</Badge>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Picture
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Join Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input value={profile.joinDate} disabled className="pl-10 bg-gray-50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Login</Label>
                      <Input value={profile.lastLogin} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={profile.emailNotifications}
                        onCheckedChange={(checked) => setProfile({ ...profile, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive SMS notifications for critical alerts</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={profile.smsNotifications}
                        onCheckedChange={(checked) => setProfile({ ...profile, smsNotifications: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="bg-novapay-primary hover:bg-novapay-primary-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains at least one uppercase letter</li>
                    <li>• Contains at least one lowercase letter</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    passwordData.newPassword !== passwordData.confirmPassword
                  }
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        {profile.twoFactorEnabled
                          ? "2FA is currently enabled for your account"
                          : "2FA is currently disabled for your account"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={profile.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch checked={profile.twoFactorEnabled} onCheckedChange={handleToggle2FA} />
                  </div>
                </div>

                {profile.twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">2FA is Active</h4>
                      <p className="text-sm text-green-800">
                        Your account is protected with two-factor authentication. You'll need to enter a code from your
                        authenticator app when signing in.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">View Recovery Codes</Button>
                      <Button variant="outline">Reset 2FA</Button>
                    </div>
                  </div>
                )}

                {!profile.twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Enable 2FA for Better Security</h4>
                      <p className="text-sm text-yellow-800">
                        Two-factor authentication adds an extra layer of security to your account by requiring a code
                        from your phone in addition to your password.
                      </p>
                    </div>
                    <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                      <Shield className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockActivityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )
}
