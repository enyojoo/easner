"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { recipientService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"

const RecipientForm = ({ isEdit = false, formData, setFormData, error, isSubmitting, currencies, onSubmit }) => {
  const selectedCurrency = currencies.find((c) => c.code === formData.currency)

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter recipient's full name"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          placeholder="Enter account number"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          placeholder="Enter bank name"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => setFormData({ ...formData, currency: value })}
          disabled={isEdit || isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedCurrency && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-4 rounded-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: selectedCurrency.flag_svg }}
                  />
                  <span>
                    {selectedCurrency.code} - {selectedCurrency.name}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-4 rounded-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: currency.flag_svg }}
                  />
                  <span>
                    {currency.code} - {currency.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
        disabled={!formData.name || !formData.accountNumber || !formData.bankName || isSubmitting}
      >
        {isSubmitting ? "Saving..." : isEdit ? "Update Recipient" : "Add Recipient"}
      </Button>
    </div>
  )
}

export default function UserRecipientsPage() {
  const { userProfile } = useAuth()
  const { recipients, currencies, refreshRecipients } = useUserData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const [deleteErrors, setDeleteErrors] = useState({})

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.account_number.includes(searchTerm)
    const matchesCurrency = currencyFilter === "all" || recipient.currency === currencyFilter
    return matchesSearch && matchesCurrency
  })

  const handleAddRecipient = async () => {
    if (!userProfile?.id) return

    try {
      setIsSubmitting(true)
      setError("")

      await recipientService.create(userProfile.id, {
        fullName: formData.name,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        currency: formData.currency,
      })

      // Refresh recipients data
      await refreshRecipients()
      setError("")

      // Reset form and close dialog
      setFormData({ name: "", accountNumber: "", bankName: "", currency: "NGN" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding recipient:", error)
      setError("Failed to add recipient")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRecipient = (recipient) => {
    setEditingRecipient(recipient)
    setFormData({
      name: recipient.full_name,
      accountNumber: recipient.account_number,
      bankName: recipient.bank_name,
      currency: recipient.currency,
    })
  }

  const handleUpdateRecipient = async () => {
    if (!editingRecipient) return

    try {
      setIsSubmitting(true)
      setError("")

      await recipientService.update(editingRecipient.id, {
        fullName: formData.name,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
      })

      // Refresh recipients data
      await refreshRecipients()
      setError("")

      // Reset form and close dialog
      setEditingRecipient(null)
      setFormData({ name: "", accountNumber: "", bankName: "", currency: "NGN" })
    } catch (error) {
      console.error("Error updating recipient:", error)
      setError("Failed to update recipient")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecipient = async (id) => {
    try {
      setDeletingId(id)
      setDeleteErrors((prev) => ({ ...prev, [id]: "" }))
      await recipientService.delete(id)
      await refreshRecipients()
      setDeleteErrors((prev) => ({ ...prev, [id]: "" }))
    } catch (error) {
      console.error("Error deleting recipient:", error)
      const errorMessage = error.message?.includes("linked to a transaction")
        ? "Failed to delete - linked to a transaction"
        : "Failed to delete - linked to a transaction"
      setDeleteErrors((prev) => ({ ...prev, [id]: errorMessage }))
    } finally {
      setDeletingId(null)
    }
  }

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }

  const getCurrencyFlag = (currencyCode) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency?.flag_svg || ""
  }

  return (
    <UserDashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
            <p className="text-gray-600">Manage your saved recipients</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Recipient</DialogTitle>
              </DialogHeader>
              <RecipientForm
                formData={formData}
                setFormData={setFormData}
                error={error}
                isSubmitting={isSubmitting}
                currencies={currencies}
                onSubmit={handleAddRecipient}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currency</SelectItem>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-novapay-primary-200 transition-colors gap-4 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center relative flex-shrink-0">
                      <span className="text-novapay-primary font-semibold text-sm">
                        {recipient.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden">
                        <div
                          dangerouslySetInnerHTML={{ __html: getCurrencyFlag(recipient.currency) }}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{recipient.full_name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {recipient.bank_name} - {recipient.account_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-2 sm:justify-start">
                      <Dialog open={!!editingRecipient} onOpenChange={(open) => !open && setEditingRecipient(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecipient(recipient)}
                            className="h-10 w-10 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md mx-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Recipient</DialogTitle>
                          </DialogHeader>
                          <RecipientForm
                            isEdit
                            formData={formData}
                            setFormData={setFormData}
                            error={error}
                            isSubmitting={isSubmitting}
                            currencies={currencies}
                            onSubmit={handleUpdateRecipient}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecipient(recipient.id)}
                        disabled={deletingId === recipient.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                      >
                        {deletingId === recipient.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {deleteErrors[recipient.id] && <p className="text-xs text-red-600">{deleteErrors[recipient.id]}</p>}
                  </div>
                </div>
              ))}
            </div>
            {filteredRecipients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm px-4">
                  {searchTerm || currencyFilter !== "all"
                    ? "No recipients found matching your criteria."
                    : "No recipients added yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
