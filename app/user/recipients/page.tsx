"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Send, Users } from "lucide-react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user-data"
import { userDataStore } from "@/lib/user-data-store"

export default function RecipientsPage() {
  const { data } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false)
  const [isEditRecipientOpen, setIsEditRecipientOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<any>(null)
  const [newRecipient, setNewRecipient] = useState({
    full_name: "",
    bank_name: "",
    account_number: "",
    currency: "RUB",
  })
  const [saving, setSaving] = useState(false)

  const recipients = data?.recipients || []
  const currencies = data?.currencies || []

  const filteredRecipients = recipients.filter(
    (recipient: any) =>
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.bank_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddRecipient = async () => {
    setSaving(true)
    try {
      await userDataStore.addRecipient(newRecipient)
      setNewRecipient({
        full_name: "",
        bank_name: "",
        account_number: "",
        currency: "RUB",
      })
      setIsAddRecipientOpen(false)
    } catch (error) {
      console.error("Error adding recipient:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditRecipient = async () => {
    if (!editingRecipient) return

    setSaving(true)
    try {
      await userDataStore.updateRecipient(editingRecipient.id, editingRecipient)
      setEditingRecipient(null)
      setIsEditRecipientOpen(false)
    } catch (error) {
      console.error("Error updating recipient:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRecipient = async (recipientId: string) => {
    if (!confirm("Are you sure you want to delete this recipient?")) return

    try {
      await userDataStore.deleteRecipient(recipientId)
    } catch (error) {
      console.error("Error deleting recipient:", error)
    }
  }

  const handleEditClick = (recipient: any) => {
    setEditingRecipient({ ...recipient })
    setIsEditRecipientOpen(true)
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
              <p className="text-gray-600">Manage your saved recipients for quick transfers</p>
            </div>
            <Dialog open={isAddRecipientOpen} onOpenChange={setIsAddRecipientOpen}>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newRecipient.full_name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, full_name: e.target.value })}
                      placeholder="Enter recipient's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={newRecipient.bank_name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, bank_name: e.target.value })}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={newRecipient.account_number}
                      onChange={(e) => setNewRecipient({ ...newRecipient, account_number: e.target.value })}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={newRecipient.currency}
                      onValueChange={(value) => setNewRecipient({ ...newRecipient, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency: any) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
                              <span>
                                {currency.code} - {currency.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setIsAddRecipientOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddRecipient}
                      disabled={
                        saving || !newRecipient.full_name || !newRecipient.bank_name || !newRecipient.account_number
                      }
                      className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                    >
                      {saving ? "Adding..." : "Add Recipient"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Recipient Dialog */}
            <Dialog open={isEditRecipientOpen} onOpenChange={setIsEditRecipientOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Recipient</DialogTitle>
                </DialogHeader>
                {editingRecipient && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editFullName">Full Name *</Label>
                      <Input
                        id="editFullName"
                        value={editingRecipient.full_name}
                        onChange={(e) => setEditingRecipient({ ...editingRecipient, full_name: e.target.value })}
                        placeholder="Enter recipient's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editBankName">Bank Name *</Label>
                      <Input
                        id="editBankName"
                        value={editingRecipient.bank_name}
                        onChange={(e) => setEditingRecipient({ ...editingRecipient, bank_name: e.target.value })}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editAccountNumber">Account Number *</Label>
                      <Input
                        id="editAccountNumber"
                        value={editingRecipient.account_number}
                        onChange={(e) => setEditingRecipient({ ...editingRecipient, account_number: e.target.value })}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCurrency">Currency *</Label>
                      <Select
                        value={editingRecipient.currency}
                        onValueChange={(value) => setEditingRecipient({ ...editingRecipient, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency: any) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <div dangerouslySetInnerHTML={{ __html: currency.flag_svg }} />
                                <span>
                                  {currency.code} - {currency.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={() => setIsEditRecipientOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditRecipient}
                        disabled={
                          saving ||
                          !editingRecipient.full_name ||
                          !editingRecipient.bank_name ||
                          !editingRecipient.account_number
                        }
                        className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipients Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.map((recipient: any) => (
                    <TableRow key={recipient.id}>
                      <TableCell>
                        <div className="font-medium">{recipient.full_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{recipient.bank_name}</div>
                          <div className="text-sm text-gray-500 font-mono">{recipient.account_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {currencies.find((c: any) => c.code === recipient.currency) && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: currencies.find((c: any) => c.code === recipient.currency)?.flag_svg,
                              }}
                            />
                          )}
                          <span className="font-medium">{recipient.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(recipient.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/user/send?recipient=${recipient.id}`}>
                              <Send className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(recipient)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRecipient(recipient.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRecipients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recipients found</p>
                  <p className="text-sm">Add recipients to start sending money</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
