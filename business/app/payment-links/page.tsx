"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockPaymentLinks, currencySymbols } from "@/lib/mock-data"
import { Plus, Copy, Check, Link2, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PaymentLinksPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newAmount, setNewAmount] = useState("")
  const [newCurrency, setNewCurrency] = useState("USD")
  const [newDescription, setNewDescription] = useState("")

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredLinks = mockPaymentLinks.filter(
    (link) =>
      link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", variant: "default" as const },
      expired: { label: "Expired", variant: "secondary" as const },
      paid: { label: "Paid", variant: "secondary" as const },
    }
    const c = config[status as keyof typeof config] || { label: status, variant: "secondary" as const }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payment links</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create shareable links for one-off payments
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create payment link</DialogTitle>
              <DialogDescription>
                Create a shareable link. Your customer can pay via bank transfer or stablecoin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={newCurrency} onValueChange={setNewCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="e.g. Consulting fee"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => setIsCreateOpen(false)}>
                Create link (Preview)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payment links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredLinks.length === 0 ? (
            <div className="py-12 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payment links found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search" : "Create your first payment link"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create link
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {currencySymbols[link.currency]}
                        {link.amount.toLocaleString()} • {link.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{link.id}</p>
                    </div>
                    {getStatusBadge(link.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {link.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(link.url, link.id)}
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
