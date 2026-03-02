"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/database"
import { useUserData } from "@/hooks/use-user-data"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { currencies } = useUserData()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      await userService.updateProfile(user.id, {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phone: editProfileData.phone,
        baseCurrency: editProfileData.baseCurrency,
      })

      setProfileData(editProfileData)

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // TODO: Implement account deletion API call
      // await deleteAccount(user.id)
      alert("Account deletion is not yet implemented")
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getSelectedCurrency = () => {
    return currencies.find((c) => c.code === profileData.baseCurrency)
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-1">
              <Link href="/user/more">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            </div>
            <p className="text-base text-gray-500 ml-12">Manage your personal information</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
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

          {/* Delete Account */}
          <div className="pt-6">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2"
              >
                <span>Delete Account</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. All your data, transactions, and account information will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserDashboardLayout>
  )
}

