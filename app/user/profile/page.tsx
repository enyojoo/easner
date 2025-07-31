"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Shield, Eye, EyeOff, Edit, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/database"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/hooks/use-user-data"

export default function UserProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { transactions, currencies, exchangeRates } = useUserData()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalTransactions: 0,
    totalSent: 0,
    memberSince: "",
  })

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    baseCurrency: "NGN",
  })

  const [editProfileData, setEditProfileData] = useState(profileData)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      const data = {
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        baseCurrency: userProfile.base_currency || "NGN",
      }
      setProfileData(data)
      setEditProfileData(data)
    }
  }, [userProfile])

  // Load user statistics
  useEffect(() => {
    if (!user || !transactions.length || !exchangeRates.length) return

    const calculateUserStats = () => {
      const baseCurrency = userProfile?.base_currency || "NGN"
      let totalSentInBaseCurrency = 0

      // Calculate total sent in base currency for completed transactions
      for (const transaction of transactions) {
        if (transaction.status === "completed") {
          let amountInBaseCurrency = transaction.send_amount

          // If transaction currency is different from base currency, convert it
          if (transaction.send_currency !== baseCurrency) {
            // Find exchange rate from transaction currency to base currency
            const rate = exchangeRates.find(
              (r) => r.from_currency === transaction.send_currency && r.to_currency === baseCurrency,
            )

            if (rate) {
              amountInBaseCurrency = transaction.send_amount * rate.rate
            } else {
              // If direct rate not found, try reverse rate
              const reverseRate = exchangeRates.find(
                (r) => r.from_currency === baseCurrency && r.to_currency === transaction.send_currency,
              )
              if (reverseRate && reverseRate.rate > 0) {
                amountInBaseCurrency = transaction.send_amount / reverseRate.rate
              }
            }
          }

          totalSentInBaseCurrency += amountInBaseCurrency
        }
      }

      // Get member since date
      const memberSince = userProfile?.created_at
        ? new Date(userProfile.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "N/A"

      setUserStats({
        totalTransactions: transactions.filter((t) => t.status === "completed").length,
        totalSent: totalSentInBaseCurrency,
        memberSince,
      })
    }

    calculateUserStats()
  }, [user, userProfile, transactions, exchangeRates])

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update profile in database
      await userService.updateProfile(user.id, {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
        baseCurrency: editProfileData.baseCurrency,
      })

      // Update local state
      setProfileData(editProfileData)

      // Refresh user profile from auth context to get updated data
      if (refreshUserProfile) {
        await refreshUserProfile()
      }

      setIsEditingProfile(false)
      // alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditProfileData(profileData)
    setIsEditingProfile(false)
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    setPasswordLoading(true)
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      alert("Password updated successfully!")

      // Reset form and close password change section
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsChangingPassword(false)

      // Reset visibility states
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsChangingPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordLoading(false)
  }

  const getSelectedCurrency = () => {
    return currencies.find((c) => c.code === profileData.baseCurrency)
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencies.find((c) => c.code === currency)
    return `${currencyInfo?.symbol || ""}${amount.toLocaleString()}`
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
                    Personal
                  </CardTitle>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editProfileData.lastName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, lastName: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={editProfileData.email} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editProfileData.phone}
                          onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseCurrency">Base Currency</Label>
                      <Select
                        value={editProfileData.baseCurrency}
                        onValueChange={(value) => setEditProfileData({ ...editProfileData, baseCurrency: value })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select base currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-3">
                                <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
                                <div className="font-medium">{currency.code}</div>
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
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">First Name</Label>
                        <p className="font-medium text-gray-900">{profileData.firstName || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Last Name</Label>
                        <p className="font-medium text-gray-900">{profileData.lastName || "Not set"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Email Address</Label>
                        <p className="font-medium text-gray-900">{profileData.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone Number</Label>
                        <p className="font-medium text-gray-900">{profileData.phone || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Base Currency</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div dangerouslySetInnerHTML={{ __html: getSelectedCurrency()?.flag_svg || "" }} />
                        <span className="font-medium text-gray-900">{getSelectedCurrency()?.code}</span>
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
                    Password
                  </CardTitle>
                  {!isChangingPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-transparent"
                    >
                      Change
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
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          disabled={passwordLoading}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={passwordLoading}
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
                          disabled={passwordLoading}
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={passwordLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelPasswordChange}
                        disabled={passwordLoading}
                        className="bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-gray-600">Manage your account password</p>
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
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {user?.email_confirmed_at ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span>{userStats.memberSince}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total transactions</span>
                    <span>{userStats.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total sent</span>
                    <span>{formatCurrency(userStats.totalSent, profileData.baseCurrency)}</span>
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
