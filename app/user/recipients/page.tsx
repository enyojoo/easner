"use client"
import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { recipientService, currencyService } from "@/lib/database"
import type { Currency } from "@/types"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserRecipientsPage() {
  const { userProfile } = useAuth()
  const [recipients, setRecipients] = useState<any[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRecipient, setNewRecipient] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
    phoneNumber: "",
  })

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return

      try {
        const [recipientsData, currenciesData] = await Promise.all([
          recipientService.getByUserId(userProfile.id),
          currencyService.getAll(),
        ])

        if (recipientsData) setRecipients(recipientsData)
        if (currenciesData) setCurrencies(currenciesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userProfile?.id])

  const handleAddRecipient = async () => {
    if (!userProfile?.id) return

    try {
      const recipient = await recipientService.create(userProfile.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        currency: newRecipient.currency,
        phoneNumber: newRecipient.phoneNumber,
      })

      setRecipients((prev) => [recipient, ...prev])
      setNewRecipient({
        fullName: "",
        accountNumber: "",
        bankName: "",
        currency: "NGN",
        phoneNumber: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding recipient:", error)
    }
  }

  const handleDeleteRecipient = async (id: string) => {
    try {
      await recipientService.delete(id)
      setRecipients((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Error deleting recipient:", error)
    }
  }

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.account_number.includes(searchTerm) ||
      recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCurrencyFlag = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    if (currency?.flag && currency.flag.startsWith("<svg")) {
      return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
    }
    return <span className="text-xs">{currencyCode}</span>
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <UserDashboardLayout>
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </UserDashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
                <p className="text-gray-600">Manage your saved recipients for quick transfers</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Recipient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newRecipient.fullName}
                        onChange={(e) => setNewRecipient({ ...newRecipient, fullName: e.target.value })}
                        placeholder="Enter recipient's full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={newRecipient.accountNumber}
                        onChange={(e) => setNewRecipient({ ...newRecipient, accountNumber: e.target.value })}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={newRecipient.bankName}
                        onChange={(e) => setNewRecipient({ ...newRecipient, bankName: e.target.value })}
                        placeholder="Enter bank name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency *</Label>
                      <select
                        id="currency"
                        value={newRecipient.currency}
                        onChange={(e) => setNewRecipient({ ...newRecipient, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-novapay-primary focus:border-transparent"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                      <Input
                        id="phoneNumber"
                        value={newRecipient.phoneNumber}
                        onChange={(e) => setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <Button
                      onClick={handleAddRecipient}
                      disabled={!newRecipient.fullName || !newRecipient.accountNumber || !newRecipient.bankName}
                      className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                    >
                      Add Recipient
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search recipients by name, account number, or bank"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipients.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No recipients found" : "No recipients yet"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Add recipients to make sending money faster and easier"}
                      </p>
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Recipient
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredRecipients.map((recipient) => (
                  <Card key={recipient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center relative">
                            <span className="text-novapay-primary font-semibold text-sm">
                              {recipient.full_name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                            <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden">
                              {getCurrencyFlag(recipient.currency)}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{recipient.full_name}</h3>
                            <p className="text-sm text-gray-600">{recipient.currency}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Bank</p>
                          <p className="font-medium">{recipient.bank_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="font-mono text-sm">{recipient.account_number}</p>
                        </div>
                        {recipient.phone_number && (
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm">{recipient.phone_number}</p>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4 bg-novapay-primary hover:bg-novapay-primary-600">
                        Send Money
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
