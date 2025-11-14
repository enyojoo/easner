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
import {
  getAccountTypeConfigFromCurrency,
  formatFieldValue,
} from "@/lib/currency-account-types"

const RecipientForm = ({ isEdit = false, formData, setFormData, error, isSubmitting, currencies, onSubmit }) => {
  const selectedCurrency = currencies.find((c) => c.code === formData.currency)
  const accountConfig = formData.currency ? getAccountTypeConfigFromCurrency(formData.currency) : null

  // Map snake_case field names from config to camelCase form field names
  const mapFieldName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      account_name: "name",
      routing_number: "routingNumber",
      account_number: "accountNumber",
      bank_name: "bankName",
      sort_code: "sortCode",
      iban: "iban",
      swift_bic: "swiftBic",
    }
    return fieldMap[fieldName] || fieldName
  }

  const isFormValid = () => {
    if (!formData.name || !formData.bankName || isSubmitting) return false

    if (!accountConfig) return false

    const requiredFields = accountConfig.requiredFields
    for (const field of requiredFields) {
      const formFieldName = mapFieldName(field)
      const fieldValue = formData[formFieldName as keyof typeof formData]
      if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
        return false
      }
    }

    return true
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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

      <div className="space-y-2">
        <Label htmlFor="name">Account Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter account name"
          disabled={isSubmitting}
        />
      </div>

      {accountConfig && (
        <>
          {/* Bank Name - Always required */}
          <div className="space-y-2">
            <Label htmlFor="bankName">
              {accountConfig.fieldLabels.bank_name} *
            </Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder={accountConfig.fieldPlaceholders.bank_name}
          disabled={isSubmitting}
        />
      </div>

          {/* US Account Fields */}
          {accountConfig.accountType === "us" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">
                  {accountConfig.fieldLabels.routing_number} *
                </Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                    setFormData({ ...formData, routingNumber: value })
                  }}
                  placeholder={accountConfig.fieldPlaceholders.routing_number}
                  maxLength={9}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  {accountConfig.fieldLabels.account_number} *
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder={accountConfig.fieldPlaceholders.account_number}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* UK Account Fields */}
          {accountConfig.accountType === "uk" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortCode">
                    {accountConfig.fieldLabels.sort_code} *
                  </Label>
                  <Input
                    id="sortCode"
                    value={formData.sortCode || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setFormData({ ...formData, sortCode: value })
                    }}
                    placeholder={accountConfig.fieldPlaceholders.sort_code}
                    maxLength={6}
                    disabled={isSubmitting}
                  />
                </div>
      <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    {accountConfig.fieldLabels.account_number} *
                  </Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder={accountConfig.fieldPlaceholders.account_number}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">
                  {accountConfig.fieldLabels.iban}
                </Label>
                <Input
                  id="iban"
                  value={formData.iban || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value.toUpperCase() })
                  }
                  placeholder={accountConfig.fieldPlaceholders.iban}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftBic">
                  {accountConfig.fieldLabels.swift_bic} (Optional)
                </Label>
                <Input
                  id="swiftBic"
                  value={formData.swiftBic || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, swiftBic: e.target.value.toUpperCase() })
                  }
                  placeholder={accountConfig.fieldPlaceholders.swift_bic}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* EURO Account Fields */}
          {accountConfig.accountType === "euro" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="iban">
                  {accountConfig.fieldLabels.iban} *
                </Label>
                <Input
                  id="iban"
                  value={formData.iban || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value.toUpperCase() })
                  }
                  placeholder={accountConfig.fieldPlaceholders.iban}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftBic">
                  {accountConfig.fieldLabels.swift_bic} (Optional)
                </Label>
                <Input
                  id="swiftBic"
                  value={formData.swiftBic || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, swiftBic: e.target.value.toUpperCase() })
                  }
                  placeholder={accountConfig.fieldPlaceholders.swift_bic}
          disabled={isSubmitting}
        />
      </div>
            </>
          )}

          {/* Generic Account Fields */}
          {accountConfig.accountType === "generic" && (
      <div className="space-y-2">
              <Label htmlFor="accountNumber">
                {accountConfig.fieldLabels.account_number} *
              </Label>
        <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder={accountConfig.fieldPlaceholders.account_number}
          disabled={isSubmitting}
        />
      </div>
          )}
        </>
      )}

      {!accountConfig && formData.currency && (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          Please select a currency first to see the required fields
        </div>
      )}

      <Button
        onClick={onSubmit}
        className="w-full bg-easner-primary hover:bg-easner-primary-600"
        disabled={!isFormValid()}
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
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const [deleteErrors, setDeleteErrors] = useState({})

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.account_number.includes(searchTerm)
    return matchesSearch
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
        routingNumber: formData.routingNumber || undefined,
        sortCode: formData.sortCode || undefined,
        iban: formData.iban || undefined,
        swiftBic: formData.swiftBic || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()

      // Reset form and close dialog
      resetForm()
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
      accountNumber: recipient.account_number || "",
      bankName: recipient.bank_name,
      currency: recipient.currency,
      routingNumber: recipient.routing_number || "",
      sortCode: recipient.sort_code || "",
      iban: recipient.iban || "",
      swiftBic: recipient.swift_bic || "",
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
        routingNumber: formData.routingNumber || undefined,
        sortCode: formData.sortCode || undefined,
        iban: formData.iban || undefined,
        swiftBic: formData.swiftBic || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()

      // Reset form and close dialog
      setEditingRecipient(null)
      resetForm()
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

  const resetForm = () => {
    setFormData({
      name: "",
      accountNumber: "",
      bankName: "",
      currency: "NGN",
      routingNumber: "",
      sortCode: "",
      iban: "",
      swiftBic: "",
    })
    setError("")
  }

  const handleAddDialogOpenChange = (open) => {
    setIsAddDialogOpen(open)
    if (open) {
      // Reset form and clear edit state when opening Add dialog
      setEditingRecipient(null)
      resetForm()
    }
  }

  return (
    <UserDashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
            <p className="text-gray-600">Manage your saved recipients</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-easner-primary hover:bg-easner-primary-600 w-full sm:w-auto">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-easner-primary-200 transition-colors gap-4 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-easner-primary-100 rounded-full flex items-center justify-center relative flex-shrink-0">
                      <span className="text-easner-primary font-semibold text-sm">
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
                      <div className="text-sm text-gray-500 space-y-0.5">
                        {(() => {
                          const accountConfig = getAccountTypeConfigFromCurrency(recipient.currency)
                          const accountType = accountConfig.accountType

                          return (
                            <>
                              {/* Show account number for US/UK/Generic, or IBAN for EURO */}
                              {accountType === "euro" && recipient.iban ? (
                                <p className="font-mono text-xs truncate">
                                  {formatFieldValue(accountType, "iban", recipient.iban)}
                                </p>
                              ) : recipient.account_number ? (
                                <p className="font-mono text-xs truncate">
                                  {recipient.account_number}
                      </p>
                              ) : null}
                              <p className="truncate">{recipient.bank_name}</p>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-2 sm:justify-start">
                      <Dialog
                        open={!!editingRecipient}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingRecipient(null)
                            resetForm()
                          }
                        }}
                      >
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
                  {searchTerm
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
