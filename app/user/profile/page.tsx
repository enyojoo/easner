"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, DollarSign, Activity, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { userService, transactionService, currencyService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export default function UserProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalSent: "₦0.00",
    memberSince: "",
  })

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    baseCurrency: "NGN",
  })

  const [editProfileData, setEditProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    baseCurrency: "NGN",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load currencies from database
        const currenciesData = await currencyService.getAll()
        setCurrencies(currenciesData)

        // Set profile data from context
        if (userProfile) {
          const profile = {
            firstName: userProfile.first_name || "",
            lastName: userProfile.last_name || "",
            phone: userProfile.phone || "",
            baseCurrency: userProfile.base_currency || "NGN",
          }
          setProfileData(profile)
          setEditProfileData(profile)

          // Load user statistics
          await loadUserStats()
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        // Fallback currencies if database fails
        setCurrencies([
          { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
          { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
          { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
          { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
        ])
      }
    }

    loadInitialData()
  }, [userProfile])

  const loadUserStats = async () => {
    if (!userProfile?.id) return

    try {
      // Get transaction count and total sent
      const transactions = await transactionService.getByUserId(userProfile.id)
      const totalTransactions = transactions.length
      const totalSent = transactions.reduce((sum, tx) => sum + Number.parseFloat(tx.amount || 0), 0)

      // Format total sent with currency symbol
      const currency = currencies.find((c) => c.code === userProfile.base_currency) || { symbol: "₦" }
      const formattedTotal = `${currency.symbol}${totalSent.toLocaleString()}`

      // Get member since date
      const memberSince = new Date(userProfile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      setStats({
        totalTransactions,
        totalSent: formattedTotal,
        memberSince,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!userProfile?.id) return

    setLoading(true)
    try {
      // Update profile in database
      await userService.updateProfile(userProfile.id, {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
        baseCurrency: editProfileData.baseCurrency,
      })

      // Update local state
      setProfileData(editProfileData)

      // Refresh user profile from auth context
      await refreshUserProfile()

      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("Password updated successfully!")
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getEmailVerificationStatus = () => {
    // Check verification status from user profile first, then fallback to Supabase Auth
    const isVerified = userProfile?.verification_status === "verified" || user?.email_confirmed_at

    return {
      status: isVerified ? "Verified" : "Pending",
      color: isVerified ? "text-green-600" : "text-yellow-600",
      bgColor: isVerified ? "bg-green-100" : "bg-yellow-100",
      iconColor: isVerified ? "text-green-600" : "text-yellow-600",
    }
  }

  const emailStatus = getEmailVerificationStatus()

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">First Name</Label>
                        <p className="mt-1 text-sm text-gray-900">{profileData.firstName || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                        <p className="mt-1 text-sm text-gray-900">{profileData.lastName || "Not set"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="mt-1 text-sm text-gray-900">{profileData.phone || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Base Currency</Label>
                      <div className="mt-1 flex items-center gap-2">
                        {currencies.find((c) => c.code === profileData.baseCurrency) && (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currencies.find((c) => c.code === profileData.baseCurrency)?.flag || "",
                            }}
                          />
                        )}
                        <span className="text-sm text-gray-900">
                          {currencies.find((c) => c.code === profileData.baseCurrency)?.name ||
                            profileData.baseCurrency}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-novapay-primary hover:bg-novapay-primary-600"
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
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
                                <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
                                <div className="font-medium">{currency.name}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Stats & Status */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="font-semibold">{stats.totalTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sent</span>
                  <span className="font-semibold">{stats.totalSent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold text-sm">{stats.memberSince}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className={`h-4 w-4 ${emailStatus.iconColor}`} />
                    <span className="text-sm text-gray-600">Email Verification</span>
                  </div>
                  <Badge className={`${emailStatus.bgColor} ${emailStatus.color} border-0`}>{emailStatus.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Account Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-600 border-0">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
