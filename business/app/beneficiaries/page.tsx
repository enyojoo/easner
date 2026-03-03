"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreVertical, Edit, Trash2, User, ArrowRightLeft } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RecipientForm } from "@/components/recipient-form"

// Mock recipients data
const mockBeneficiaries = [
  {
    id: "1",
    name: "John Doe",
    bankName: "Chase Bank",
    accountNumber: "1234567891234",
    fullAccountNumber: "1234567891234",
    country: "United States",
    currency: "USD",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
  },
  {
    id: "2",
    name: "Maria Garcia",
    bankName: "Santander",
    accountNumber: "ES1234567890123456789012",
    fullAccountNumber: "ES1234567890123456789012",
    country: "Spain",
    currency: "EUR",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-18",
  },
  {
    id: "3",
    name: "David Smith",
    bankName: "Barclays",
    accountNumber: "12345678",
    fullAccountNumber: "12345678",
    country: "United Kingdom",
    currency: "GBP",
    email: "david.smith@email.com",
    phone: "+44 7700 900123",
    createdAt: "2024-01-05",
    lastUsed: "2024-01-12",
  },
  {
    id: "4",
    name: "Aisha Okafor",
    bankName: "Access Bank",
    accountNumber: "1234567893456",
    fullAccountNumber: "1234567893456",
    country: "Nigeria",
    currency: "NGN",
    email: "aisha.okafor@email.com",
    phone: "+234 801 234 5678",
    createdAt: "2024-01-08",
    lastUsed: "2024-01-15",
  },
]

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  NGN: "🇳🇬",
}

export default function RecipientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredBeneficiaries = mockBeneficiaries.filter((recipient) =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (recipient: any) => {
    setSelectedRecipient(recipient)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (recipientId: string) => {
    // Handle delete logic here
    console.log("Delete recipient:", recipientId)
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    // Refresh recipients list or show success message
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setSelectedRecipient(null)
    // Refresh recipients list or show success message
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your saved beneficiaries for quick transfers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Add New Beneficiary</DialogTitle>
              <DialogDescription>
                Enter the beneficiary's details to save them for future transfers.
              </DialogDescription>
            </DialogHeader>
            <RecipientForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filteredBeneficiaries.length === 0 ? (
            <div className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No beneficiaries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first beneficiary"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Beneficiary
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search beneficiaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="divide-y">
                {filteredBeneficiaries.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{recipient.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {recipient.bankName} • {recipient.fullAccountNumber} • {recipient.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {currencyFlags[recipient.currency]} {recipient.currency}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        Send
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(recipient)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(recipient.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Beneficiary</DialogTitle>
            <DialogDescription>
              Update the beneficiary's details.
            </DialogDescription>
          </DialogHeader>
          <RecipientForm 
            recipient={selectedRecipient} 
            onSuccess={handleEditSuccess}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
