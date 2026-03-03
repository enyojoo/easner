"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAccounts } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

export function TransferForm() {
  const router = useRouter()
  const [transferType, setTransferType] = useState<"ach" | "wire" | "book">("ach")
  const [amount, setAmount] = useState("")
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock transfer - in production, this would call Column API
    console.log("[v0] Transfer initiated:", { transferType, amount, fromAccount })
    alert(`${transferType.toUpperCase()} transfer of $${amount} initiated successfully!`)
    router.push("/dashboard")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Transfer</CardTitle>
        <CardDescription>Send money via ACH, Wire, or Book Transfer</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={transferType} onValueChange={(v: string) => setTransferType(v as "ach" | "wire" | "book")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ach">ACH Transfer</TabsTrigger>
            <TabsTrigger value="wire">Wire Transfer</TabsTrigger>
            <TabsTrigger value="book">Book Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="ach" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-account">From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountName} {acc.accountNumber} - ${acc.balance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input
                  id="recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input
                    id="routing"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="121000248"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-1">
                <p className="text-sm font-medium">ACH Transfer Details</p>
                <p className="text-xs text-muted-foreground">Processing time: 1-3 business days</p>
                <p className="text-xs text-muted-foreground">Fee: $0.00</p>
              </div>

              <Button type="submit" className="w-full">
                Initiate ACH Transfer
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="wire" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-account-wire">From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountName} {acc.accountNumber} - ${acc.balance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-name-wire">Recipient Name</Label>
                <Input
                  id="recipient-name-wire"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routing-wire">Routing Number</Label>
                  <Input
                    id="routing-wire"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="121000248"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-wire">Account Number</Label>
                  <Input
                    id="account-wire"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount-wire">Amount</Label>
                <Input
                  id="amount-wire"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-wire">Description</Label>
                <Input
                  id="description-wire"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-1">
                <p className="text-sm font-medium">Wire Transfer Details</p>
                <p className="text-xs text-muted-foreground">Processing time: Same day</p>
                <p className="text-xs text-muted-foreground">Fee: $25.00</p>
              </div>

              <Button type="submit" className="w-full">
                Initiate Wire Transfer
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="book" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-account-book">From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountName} {acc.accountNumber} - ${acc.balance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-account-book">To Account</Label>
                <Select value={toAccount} onValueChange={setToAccount} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts
                      .filter((acc) => acc.id !== fromAccount)
                      .map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountName} {acc.accountNumber} - ${acc.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount-book">Amount</Label>
                <Input
                  id="amount-book"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-book">Description</Label>
                <Input
                  id="description-book"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Transfer note..."
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-1">
                <p className="text-sm font-medium">Book Transfer Details</p>
                <p className="text-xs text-muted-foreground">Processing time: Instant</p>
                <p className="text-xs text-muted-foreground">Fee: $0.00</p>
              </div>

              <Button type="submit" className="w-full">
                Transfer Between Accounts
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
