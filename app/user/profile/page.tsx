"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Pencil, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/database"
import { useUserData } from "@/hooks/use-user-data"

export default function UserProfilePage() {
  const router = useRouter()
  const { user, userProfile, refreshUserProfile, signOut } = useAuth()
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
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const month = date.toLocaleString("en-US", { month: "short" })
        const day = date.getDate().toString().padStart(2, "0")
        const year = date.getFullYear()
        // Format: "Nov 07, 2025"
        return `${month} ${day}, ${year}`
      }

      const memberSince = userProfile?.created_at
        ? formatDate(userProfile.created_at)
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

  const formatNumber = (num: number) => {
    // Values less than 1,000: show with decimals (e.g., 12.50)
    if (num < 1000) {
      return num.toFixed(2)
    }
    
    // Values 1,000 to 9,999: show as whole numbers (e.g., 1,000, 1,500)
    if (num < 10000) {
      return Math.round(num).toLocaleString()
    }
    
    // Values 10,000 and above: apply K/M/B/T rounding
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencies.find((c) => c.code === currency)
    const formattedNumber = formatNumber(amount)
    return `${currencyInfo?.symbol || ""}${formattedNumber}`
  }

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut()
      router.push("/auth/user/login")
    }
  }

  const handleSupport = () => {
    router.push("/user/support")
  }

  const handlePrivacy = () => {
    window.open("https://www.easner.com/privacy", "_blank")
  }

  const handleTerms = () => {
    window.open("https://www.easner.com/terms", "_blank")
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-base text-gray-500">Manage your account information</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Profile</CardTitle>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                  >
                    <Pencil className="h-4 w-4 mr-2 text-easner-primary" />
                    <span className="text-easner-primary font-semibold">Edit</span>
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="bg-gray-50"
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="bg-easner-primary hover:bg-easner-primary-600"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {isEditingProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-normal text-gray-500 uppercase tracking-wide">Email Address</Label>
                    <Input id="email" type="email" value={editProfileData.email} disabled className="bg-gray-50 font-medium" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Used for reporting your total sent amount
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">First Name</Label>
                    <p className="text-base font-medium text-gray-900 pt-2">{profileData.firstName || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Last Name</Label>
                    <p className="text-base font-medium text-gray-900 pt-2">{profileData.lastName || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Email Address</Label>
                    <p className="text-base font-medium text-gray-900 pt-2">{profileData.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Phone Number</Label>
                    <p className="text-base font-medium text-gray-900 pt-2">{profileData.phone || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-normal text-gray-500 uppercase tracking-wide">Base Currency</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <div dangerouslySetInnerHTML={{ __html: getSelectedCurrency()?.flag_svg || "" }} />
                      <span className="text-base font-semibold text-gray-900">{getSelectedCurrency()?.code}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Used for reporting your total sent amount
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </div>
                <Badge className={`${user?.email_confirmed_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} hover:bg-opacity-100`}>
                  {user?.email_confirmed_at ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Member since</span>
                  <span className="text-sm font-medium text-gray-900">{userStats.memberSince}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total transactions</span>
                  <span className="text-sm font-medium text-gray-900">{userStats.totalTransactions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total sent</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(userStats.totalSent, profileData.baseCurrency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4">
              <button
                onClick={handleSupport}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Support</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={handlePrivacy}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Privacy Policy</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={handleTerms}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base text-gray-900">Terms of Service</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* Sign Out Section - Mobile Only */}
          <Card className="lg:hidden">
            <CardContent className="pt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between py-4"
              >
                <span className="text-base text-red-600 font-medium">Sign Out</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* App Version */}
          <div className="text-center py-5">
            <p className="text-sm text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
