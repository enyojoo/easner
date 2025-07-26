"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, User, Clock } from "lucide-react"

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

const recentRecipients = mockRecipients.slice(0, 2)

export default function UserRecipientsPage() {
  const [recipients, setRecipients] = useState(mockRecipients)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
  })

  const handleAddRecipient = () => {
    const newRecipient = {
      id: Date.now().toString(),
      ...formData,
      lastUsed: new Date().toISOString().split("T")[0],
      totalSent: "₦0.00",
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

        {/* Recent Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-novapay-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-novapay-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{recipient.name}</p>
                        <p className="text-sm text-gray-500">{recipient.bankName}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {recipient.currency}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Last used: {recipient.lastUsed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>All Recipients ({recipients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-novapay-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{recipient.name}</h3>
                      <p className="text-sm text-gray-500">{recipient.bankName}</p>
                      <p className="text-sm text-gray-500 font-mono">{recipient.accountNumber}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {recipient.currency}
                        </Badge>
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
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
