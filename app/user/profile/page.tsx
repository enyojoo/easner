"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/database"
import { useUserData } from "@/hooks/use-user-data"

export default function UserProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { transactions, currencies, exchangeRates } = useUserData()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
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
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditProfileData(profileData)
    setIsEditingProfile(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile</CardTitle>
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
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs font-normal text-gray-500 uppercase tracking-wide">First Name</Label>
                        <Input
                          id="firstName"
                          value={editProfileData.firstName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, firstName: e.target.value })}
                          disabled={loading}
                          className="font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editProfileData.lastName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, lastName: e.target.value })}
                          disabled={loading}
                          className="font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Email Address</Label>
                        <Input id="email" type="email" value={editProfileData.email} disabled className="bg-gray-50 font-medium" />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editProfileData.phone}
                          onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                          disabled={loading}
                          className="font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="baseCurrency" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Base Currency</Label>
                      <Select
                        value={editProfileData.baseCurrency}
                        onValueChange={(value) => setEditProfileData({ ...editProfileData, baseCurrency: value })}
                        disabled={loading}
                      >
                        <SelectTrigger className="font-medium">
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
                        Used for reporting your total sent amount
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="bg-easner-primary hover:bg-easner-primary-600"
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="bg-transparent"
                      >
                        Discard
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">First Name</Label>
                        <p className="font-medium text-gray-900">{profileData.firstName || "Not set"}</p>
                      </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Last Name</Label>
                        <p className="font-medium text-gray-900">{profileData.lastName || "Not set"}</p>
                      </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Email Address</Label>
                        <p className="font-medium text-gray-900">{profileData.email}</p>
                      </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Phone Number</Label>
                        <p className="font-medium text-gray-900">{profileData.phone || "Not set"}</p>
                      </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Base Currency</Label>
                      <div className="flex items-center gap-2">
                        <div dangerouslySetInnerHTML={{ __html: getSelectedCurrency()?.flag_svg || "" }} />
                        <span className="font-semibold text-gray-900">{getSelectedCurrency()?.code}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Used for reporting your total sent amount
                      </p>
                    </div>
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
