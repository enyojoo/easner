"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Globe } from "lucide-react"
import { currencies } from "@/utils/currency"

// Mock recipients data
const mockRecipients = [
  {
    id: "1",
    name: "John Doe",
    accountNumber: "1234567890",
    bankName: "First Bank",
    currency: "NGN",
    lastUsed: "2024-01-15",
    totalSent: "₦145,000.00",
  },
  {
    id: "2",
    name: "Jane Smith",
    accountNumber: "0987654321",
    bankName: "Sberbank",
    currency: "RUB",
    lastUsed: "2024-01-14",
    totalSent: "₽25,500.00",
  },
  {
    id: "3",
    name: "Mike Johnson",
    accountNumber: "1122334455",
    bankName: "GTBank",
    currency: "NGN",
    lastUsed: "2024-01-13",
    totalSent: "₦78,900.00",
  },
]

export default function UserRecipientsPage() {
  const [recipients, setRecipients] = useState(mockRecipients)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("All")
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
  })

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) || recipient.accountNumber.includes(searchTerm)
    const matchesCurrency = currencyFilter === "All" || recipient.currency === currencyFilter
    return matchesSearch && matchesCurrency
  })

  const handleAddRecipient = () => {
    const newRecipient = {
      id: Date.now().toString(),
      name: formData.name,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      currency: formData.currency,
      lastUsed: new Date().toISOString().split("T")[0],
      totalSent: formData.currency === "NGN" ? "₦0.00" : "₽0.00",
    }
    setRecipients([...recipients, newRecipient])
    setFormData({ name: "", accountNumber: "", bankName: "", currency: "NGN" })
    setIsAddDialogOpen(false)
  }

  const handleEditRecipient = (recipient: any) => {
    setEditingRecipient(recipient)
    setFormData({
      name: recipient.name,
      accountNumber: recipient.accountNumber,
      bankName: recipient.bankName,
      currency: recipient.currency,
    })
  }

  const handleUpdateRecipient = () => {
    setRecipients(recipients.map((r) => (r.id === editingRecipient.id ? { ...r, ...formData } : r)))
    setEditingRecipient(null)
    setFormData({ name: "", accountNumber: "", bankName: "", currency: "NGN" })
  }

  const handleDeleteRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id))
  }

  const RecipientForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter recipient's full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          placeholder="Enter account number"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          placeholder="Enter bank name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="NGN">NGN - Nigerian Naira</option>
          <option value="RUB">RUB - Russian Ruble</option>
        </select>
      </div>
      <Button
        onClick={isEdit ? handleUpdateRecipient : handleAddRecipient}
        className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
        disabled={!formData.name || !formData.accountNumber || !formData.bankName}
      >
        {isEdit ? "Update Recipient" : "Add Recipient"}
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

          {/* Currency Filter Badges */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrencyFilter("All")}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors outline-none ${
                currencyFilter === "All"
                  ? "bg-novapay-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="font-medium">All</span>
            </button>

            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setCurrencyFilter(currency.code)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors outline-none ${
                  currencyFilter === currency.code
                    ? "bg-novapay-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <img
                  src={`data:image/svg+xml,${encodeURIComponent(currency.flag)}`}
                  alt={`${currency.name} flag`}
                  className="w-4 h-3 mr-2 object-cover rounded-sm"
                />
                <span className="font-medium">{currency.code}</span>
              </button>
            ))}
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
                        {recipient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden">
                        <img
                          src={`data:image/svg+xml,${encodeURIComponent(
                            currencies.find((c) => c.code === recipient.currency)?.flag || "",
                          )}`}
                          alt={`${recipient.currency} flag`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{recipient.name}</p>
                      <p className="text-sm text-gray-500">
                        {recipient.bankName} - {recipient.accountNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Total sent: {recipient.totalSent}</span>
                      </div>
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
            {filteredRecipients.length === 0 && (
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
