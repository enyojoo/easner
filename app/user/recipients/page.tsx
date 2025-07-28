"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, User, Building, CreditCard, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { recipientService, currencyService } from "@/lib/database"

export default function UserRecipientsPage() {
  const { user, userProfile } = useAuth()
  const [recipients, setRecipients] = useState<any[]>([])
  const [currencies, setCurrencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [newRecipient, setNewRecipient] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
    currency: "",
  })

  const [editRecipient, setEditRecipient] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
    currency: "",
  })

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userProfile?.id) return

      try {
        setLoading(true)

        // Load currencies first
        const currenciesData = await currencyService.getAll()
        setCurrencies(currenciesData)

        // Set default currency for new recipient form
        if (currenciesData.length > 0) {
          setNewRecipient((prev) => ({ ...prev, currency: currenciesData[0].code }))
        }

        // Load recipients
        const recipientsData = await recipientService.getByUserId(userProfile.id)
        setRecipients(recipientsData || [])
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback currencies if database fails
        setCurrencies([
          { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
          { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
          { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
          { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
        ])
        setNewRecipient((prev) => ({ ...prev, currency: "NGN" }))
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [userProfile])

  const handleAddRecipient = async () => {
    if (!userProfile?.id) return

    if (!newRecipient.fullName || !newRecipient.accountNumber || !newRecipient.bankName) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      await recipientService.create(userProfile.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        phoneNumber: newRecipient.phoneNumber,
        currency: newRecipient.currency,
      })

      // Reload recipients
      const recipientsData = await recipientService.getByUserId(userProfile.id)
      setRecipients(recipientsData || [])

      // Reset form
      setNewRecipient({
        fullName: "",
        accountNumber: "",
        bankName: "",
        phoneNumber: "",
        currency: currencies[0]?.code || "NGN",
      })
      setIsAddDialogOpen(false)
      alert("Recipient added successfully!")
    } catch (error) {
      console.error("Error adding recipient:", error)
      alert("Failed to add recipient. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditRecipient = async () => {
    if (!editingRecipient) return

    if (!editRecipient.fullName || !editRecipient.accountNumber || !editRecipient.bankName) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      await recipientService.update(editingRecipient.id, {
        fullName: editRecipient.fullName,
        accountNumber: editRecipient.accountNumber,
        bankName: editRecipient.bankName,
        phoneNumber: editRecipient.phoneNumber,
      })

      // Reload recipients
      if (userProfile?.id) {
        const recipientsData = await recipientService.getByUserId(userProfile.id)
        setRecipients(recipientsData || [])
      }

      setIsEditDialogOpen(false)
      setEditingRecipient(null)
      alert("Recipient updated successfully!")
    } catch (error) {
      console.error("Error updating recipient:", error)
      alert("Failed to update recipient. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteRecipient = async (recipientId: string) => {
    if (!confirm("Are you sure you want to delete this recipient?")) return

    try {
      await recipientService.delete(recipientId)

      // Reload recipients
      if (userProfile?.id) {
        const recipientsData = await recipientService.getByUserId(userProfile.id)
        setRecipients(recipientsData || [])
      }

      alert("Recipient deleted successfully!")
    } catch (error) {
      console.error("Error deleting recipient:", error)
      alert("Failed to delete recipient. Please try again.")
    }
  }

  const openEditDialog = (recipient: any) => {
    setEditingRecipient(recipient)
    setEditRecipient({
      fullName: recipient.full_name,
      accountNumber: recipient.account_number,
      bankName: recipient.bank_name,
      phoneNumber: recipient.phone_number || "",
      currency: recipient.currency,
    })
    setIsEditDialogOpen(true)
  }

  const getCurrencyInfo = (currencyCode: string) => {
    return currencies.find((c) => c.code === currencyCode)
  }

  // Filter recipients based on search and currency
  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.account_number.includes(searchTerm) ||
      recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCurrency = selectedCurrency === "all" || recipient.currency === selectedCurrency

    return matchesSearch && matchesCurrency
  })

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipients...</p>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
            <p className="text-gray-600">Manage your saved recipients for quick transfers</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Recipient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Recipient</DialogTitle>
                <DialogDescription>Add a new recipient to your saved list for quick transfers.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newRecipient.fullName}
                    onChange={(e) => setNewRecipient({ ...newRecipient, fullName: e.target.value })}
                    placeholder="Enter recipient's full name"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={newRecipient.accountNumber}
                    onChange={(e) => setNewRecipient({ ...newRecipient, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={newRecipient.bankName}
                    onChange={(e) => setNewRecipient({ ...newRecipient, bankName: e.target.value })}
                    placeholder="Enter bank name"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newRecipient.phoneNumber}
                    onChange={(e) => setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })}
                    placeholder="Enter phone number (optional)"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={newRecipient.currency}
                    onValueChange={(value) => setNewRecipient({ ...newRecipient, currency: value })}
                    disabled={formLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddRecipient}
                  disabled={formLoading}
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  {formLoading ? "Adding..." : "Add Recipient"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search recipients by name, account number, or bank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCurrency === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCurrency("all")}
                  className={selectedCurrency === "all" ? "bg-novapay-primary hover:bg-novapay-primary-600" : ""}
                >
                  All
                </Button>
                {currencies.map((currency) => (
                  <Button
                    key={currency.code}
                    variant={selectedCurrency === currency.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCurrency(currency.code)}
                    className={
                      selectedCurrency === currency.code ? "bg-novapay-primary hover:bg-novapay-primary-600" : ""
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
                      {currency.code}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients List */}
        {filteredRecipients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipients found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCurrency !== "all"
                  ? "No recipients match your current search or filter criteria."
                  : "You haven't added any recipients yet. Add your first recipient to get started."}
              </p>
              {!searchTerm && selectedCurrency === "all" && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Recipient
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipients.map((recipient) => {
              const currencyInfo = getCurrencyInfo(recipient.currency)
              return (
                <Card key={recipient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-novapay-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-novapay-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{recipient.full_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {currencyInfo && <div dangerouslySetInnerHTML={{ __html: currencyInfo.flag }} />}
                            <Badge variant="secondary" className="text-xs">
                              {recipient.currency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(recipient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecipient(recipient.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{recipient.account_number}</p>
                          <p className="text-gray-600">{recipient.bank_name}</p>
                        </div>
                      </div>
                      {recipient.phone_number && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-600">{recipient.phone_number}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-600">Added {new Date(recipient.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Recipient</DialogTitle>
              <DialogDescription>Update recipient information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName">Full Name *</Label>
                <Input
                  id="editFullName"
                  value={editRecipient.fullName}
                  onChange={(e) => setEditRecipient({ ...editRecipient, fullName: e.target.value })}
                  placeholder="Enter recipient's full name"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAccountNumber">Account Number *</Label>
                <Input
                  id="editAccountNumber"
                  value={editRecipient.accountNumber}
                  onChange={(e) => setEditRecipient({ ...editRecipient, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBankName">Bank Name *</Label>
                <Input
                  id="editBankName"
                  value={editRecipient.bankName}
                  onChange={(e) => setEditRecipient({ ...editRecipient, bankName: e.target.value })}
                  placeholder="Enter bank name"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhoneNumber">Phone Number</Label>
                <Input
                  id="editPhoneNumber"
                  value={editRecipient.phoneNumber}
                  onChange={(e) => setEditRecipient({ ...editRecipient, phoneNumber: e.target.value })}
                  placeholder="Enter phone number (optional)"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCurrency">Currency</Label>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                  {getCurrencyInfo(editRecipient.currency) && (
                    <div dangerouslySetInnerHTML={{ __html: getCurrencyInfo(editRecipient.currency)?.flag || "" }} />
                  )}
                  <span className="font-medium">{editRecipient.currency}</span>
                  <span className="text-sm text-gray-500 ml-auto">Cannot be changed</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleEditRecipient}
                disabled={formLoading}
                className="bg-novapay-primary hover:bg-novapay-primary-600"
              >
                {formLoading ? "Updating..." : "Update Recipient"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserDashboardLayout>
  )
}
