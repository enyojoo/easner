"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { recipientService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function UserRecipientsPage() {
  const { userProfile } = useAuth()
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("All")
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currencies, setCurrencies] = useState([])

  // Load recipients from database
  useEffect(() => {
    if (userProfile?.id) {
      loadRecipients()
      loadCurrencies()
    }
  }, [userProfile?.id])

  const loadRecipients = async () => {
    try {
      const data = await recipientService.getByUserId(userProfile.id)
      setRecipients(data || [])
    } catch (error) {
      console.error("Error loading recipients:", error)
      setError("Failed to load recipients")
    } finally {
    }
  }

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase.from("currencies").select("*").eq("status", "active").order("code")

      if (error) throw error
      setCurrencies(data || [])
    } catch (error) {
      console.error("Error loading currencies:", error)
    }
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.account_number.includes(searchTerm)
    const matchesCurrency = currencyFilter === "All" || recipient.currency === currencyFilter
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

      // Reload recipients
      await loadRecipients()

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

      // Reload recipients
      await loadRecipients()

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
    if (!confirm("Are you sure you want to delete this recipient?")) return

    try {
      await recipientService.delete(id)
      await loadRecipients()
    } catch (error) {
      console.error("Error deleting recipient:", error)
      setError("Failed to delete recipient")
    }
  }

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }

  const getCurrencyFlag = (currencyCode) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return currency?.flag || ""
  }

  const formatTotalSent = (recipient) => {
    // This would come from transaction data in a real implementation
    const symbol = getCurrencySymbol(recipient.currency)
    return `${symbol}0.00`
  }

  const RecipientForm = ({ isEdit = false }) => (
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
        <select
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={isEdit || isSubmitting}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={isEdit ? handleUpdateRecipient : handleAddRecipient}
        className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
        disabled={!formData.name || !formData.accountNumber || !formData.bankName || isSubmitting}
      >
        {isSubmitting ? "Saving..." : isEdit ? "Update Recipient" : "Add Recipient"}
      </Button>
    </div>
  )

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
            <p className="text-gray-600">Manage your saved recipients</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-novapay-primary hover:bg-novapay-primary-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Recipient</DialogTitle>
              </DialogHeader>
              <RecipientForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search recipients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-novapay-primary focus:ring-novapay-primary"
            />
          </div>

          {/* Currency Filter Dropdown */}
          <div className="min-w-[200px]">
            <div className="relative">
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-novapay-primary focus:ring-novapay-primary text-gray-700 appearance-none"
              >
                <option value="All">All Currencies</option>
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients List */}
        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-novapay-primary-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center relative">
                      <span className="text-novapay-primary font-semibold text-sm">
                        {recipient.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden border border-white">
                        <img
                          src={getCurrencyFlag(recipient.currency) || "/placeholder.svg"}
                          alt={`${recipient.currency} flag`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{recipient.full_name}</p>
                        <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
                          <img
                            src={getCurrencyFlag(recipient.currency) || "/placeholder.svg"}
                            alt={`${recipient.currency} flag`}
                            className="w-4 h-3 mr-1 object-cover rounded-sm"
                          />
                          <span className="text-xs font-medium">{recipient.currency}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {recipient.bank_name} - {recipient.account_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleEditRecipient(recipient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Recipient</DialogTitle>
                        </DialogHeader>
                        <RecipientForm isEdit />
                      </DialogContent>
                    </Dialog>
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
              ))}
            </div>
            {filteredRecipients.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {searchTerm || currencyFilter !== "All"
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
