"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Shield, Eye, EyeOff, Edit, X, Globe } from "lucide-react"
import { currencies } from "@/utils/currency"

export default function UserProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@email.com",
    phone: "+1234567890",
    baseCurrency: "NGN", // Default base currency
  })

  const [editProfileData, setEditProfileData] = useState(profileData)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = () => {
    setProfileData(editProfileData)
    setIsEditingProfile(false)
  }

  const handleCancelEdit = () => {
    setEditProfileData(profileData)
    setIsEditingProfile(false)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    console.log("Password changed")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsChangingPassword(false)
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsChangingPassword(false)
  }

  const getSelectedCurrency = () => {
    return currencies.find((c) => c.code === profileData.baseCurrency)
  }

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editProfileData.firstName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editProfileData.lastName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editProfileData.email}
                          onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editProfileData.phone}
                          onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseCurrency">Base Currency</Label>
                      <Select
                        value={editProfileData.baseCurrency}
                        onValueChange={(value) => setEditProfileData({ ...editProfileData, baseCurrency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select base currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-3">
                                <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
                                <div>
                                  <div className="font-medium">{currency.code}</div>
                                  <div className="text-sm text-muted-foreground">{currency.name}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        This currency will be used for reporting your total sent amount in the dashboard
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleProfileUpdate} className="bg-novapay-primary hover:bg-novapay-primary-600">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">First Name</Label>
                        <p className="font-medium text-gray-900">{profileData.firstName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Last Name</Label>
                        <p className="font-medium text-gray-900">{profileData.lastName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Email Address</Label>
                        <p className="font-medium text-gray-900">{profileData.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone Number</Label>
                        <p className="font-medium text-gray-900">{profileData.phone}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Base Currency</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div dangerouslySetInnerHTML={{ __html: getSelectedCurrency()?.flag || "" }} />
                        <span className="font-medium text-gray-900">{getSelectedCurrency()?.code}</span>
                        <span className="text-sm text-gray-500">- {getSelectedCurrency()?.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Used for reporting your total sent amount in the dashboard
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Password & Security
                  </CardTitle>
                  {!isChangingPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-transparent"
                    >
                      Change Password
                    </Button>
                  )}
                  {isChangingPassword && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelPasswordChange}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={
                          !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
                        }
                        className="bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        Update Password
                      </Button>
                      <Button variant="outline" onClick={handleCancelPasswordChange} className="bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-gray-600">Password last changed 30 days ago</p>
                    <p className="text-sm text-gray-500 mt-1">Keep your account secure by using a strong password</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Status Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span>Jan 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total transactions</span>
                    <span>47</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total sent</span>
                    <span>₦2,450,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Preference Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Currency Preference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-600 text-sm">Base Currency</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div dangerouslySetInnerHTML={{ __html: getSelectedCurrency()?.flag || "" }} />
                      <div>
                        <p className="font-medium text-gray-900">{getSelectedCurrency()?.code}</p>
                        <p className="text-xs text-gray-500">{getSelectedCurrency()?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      Your dashboard statistics and total sent amounts will be displayed in{" "}
                      <strong>{getSelectedCurrency()?.code}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
