"use client"

import { useState, useEffect, useMemo } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
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
import { Plus, Eye, Settings, Snowflake, ArrowUpRight, ArrowDownLeft, CreditCard, Copy, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface BridgeCard {
  id: string
  bridge_card_account_id: string
  card_number: string
  currency: string
  status: string
  balance: number
  last4: string
  expiry: string
  fundingAddress?: string
  fundingChain?: string
  fundingCurrency?: string
  created_at: string
}

interface CardTransaction {
  id: string
  amount: string
  currency: string
  status: string
  type: string
  merchant_name?: string
  created_at: string
  direction: "credit" | "debit"
  description: string
}

export default function CardsPage() {
  const { userProfile } = useAuth()
  
  // Initialize from cache synchronously to prevent reload flicker
  const getInitialCards = (): BridgeCard[] | null => {
    if (typeof window === "undefined") return null
    if (!userProfile?.id) return null
    try {
      const cached = localStorage.getItem(`easner_cards_${userProfile.id}`)
      if (!cached) return null
      const { value, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return value
      }
      return null
    } catch {
      return null
    }
  }

  const [cards, setCards] = useState<BridgeCard[]>(() => {
    const initial = getInitialCards()
    // If we have cached cards, return them immediately to prevent loading state
    return initial || []
  })
  const [selectedCard, setSelectedCard] = useState<BridgeCard | null>(() => {
    const initialCards = getInitialCards()
    return initialCards && initialCards.length > 0 ? initialCards[0] : null
  })
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(false) // Set to false since we're not fetching
  
  // Dialog states
  const [createCardOpen, setCreateCardOpen] = useState(false)
  const [cardDetailsOpen, setCardDetailsOpen] = useState(false)
  const [cardSettingsOpen, setCardSettingsOpen] = useState(false)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  
  // Card creation form
  const [newCardData, setNewCardData] = useState({
    chain: "stellar",
    currency: "usdc",
    firstName: "",
    lastName: "",
  })

  // Data fetching disabled - API not connected yet
  // useEffect(() => {
  //   // Card fetching logic commented out until API is connected
  // }, [userProfile?.id])

  // Handle copy to clipboard
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Handle card creation
  const handleCreateCard = async () => {
    if (!newCardData.firstName || !newCardData.lastName) {
      alert("Please enter first and last name")
      return
    }

    setIsCreatingCard(true)
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCardData),
      })

      if (response.ok) {
        const data = await response.json()
        // Reload cards and select the newly created card
        const response2 = await fetch("/api/cards", {
          credentials: "include",
        })
        if (response2.ok) {
          const data2 = await response2.json()
          const loadedCards = data2.cards || []
          setCards(loadedCards)
          // Update cache
          if (userProfile?.id) {
            const CACHE_KEY_CARDS = `easner_cards_${userProfile.id}`
            try {
              localStorage.setItem(CACHE_KEY_CARDS, JSON.stringify({
                value: loadedCards,
                timestamp: Date.now()
              }))
            } catch {}
          }
          
          // Select the newly created card
          const newCard = loadedCards.find((c: BridgeCard) => c.id === data.card.id)
          if (newCard) {
            setSelectedCard(newCard)
          } else if (loadedCards.length > 0) {
            setSelectedCard(loadedCards[0])
          }
        }
        setCreateCardOpen(false)
        setNewCardData({
          chain: "stellar",
          currency: "usdc",
          firstName: "",
          lastName: "",
        })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create card")
      }
    } catch (error) {
      console.error("Error creating card:", error)
      alert("Failed to create card")
    } finally {
      setIsCreatingCard(false)
    }
  }

  // Handle freeze/unfreeze
  const handleFreezeToggle = async () => {
    if (!selectedCard) return

    const action = selectedCard.status === "frozen" ? "unfreeze" : "freeze"
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        // Reload cards to get latest data from Bridge
        const response2 = await fetch("/api/cards", {
          credentials: "include",
        })
        if (response2.ok) {
          const data2 = await response2.json()
          const loadedCards = data2.cards || []
          setCards(loadedCards)
          // Update cache
          const CACHE_KEY_CARDS = `easner_cards_${userProfile?.id}`
          try {
            localStorage.setItem(CACHE_KEY_CARDS, JSON.stringify({
              value: loadedCards,
              timestamp: Date.now()
            }))
          } catch {}
          
          // Update selected card
          const updatedCard = loadedCards.find((c) => c.id === selectedCard.id)
          if (updatedCard) {
            setSelectedCard(updatedCard)
          }
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update card")
      }
    } catch (error) {
      console.error("Error updating card:", error)
      alert("Failed to update card")
    }
  }

  // Transaction fetching disabled - API not connected yet
  // useEffect(() => {
  //   if (!selectedCard) {
  //     setTransactions([])
  //     return
  //   }
  //   // Transaction fetching logic commented out until API is connected
  // }, [selectedCard])

  // Show all transactions (no filtering by date)
  const filteredTransactions = useMemo(() => {
    return transactions
  }, [transactions])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Cards</h1>
                <p className="text-base text-gray-500">Manage your virtual debit cards</p>
              </div>
              {cards.length > 0 && (
                <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-easner-primary hover:bg-easner-primary-600">
                      <Plus className="h-4 w-4" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardFirstName">First Name *</Label>
                  <Input
                    id="cardFirstName"
                    value={newCardData.firstName}
                    onChange={(e) =>
                      setNewCardData({ ...newCardData, firstName: e.target.value })
                    }
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardLastName">Last Name *</Label>
                  <Input
                    id="cardLastName"
                    value={newCardData.lastName}
                    onChange={(e) =>
                      setNewCardData({ ...newCardData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardChain">Blockchain *</Label>
                  <Select
                    value={newCardData.chain}
                    onValueChange={(value) => setNewCardData({ ...newCardData, chain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stellar">Stellar</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCurrency">Currency *</Label>
                  <Select
                    value={newCardData.currency}
                    onValueChange={(value) => setNewCardData({ ...newCardData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdc">USDC</SelectItem>
                      <SelectItem value="eurc">EURC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateCard}
                  disabled={isCreatingCard || !newCardData.firstName || !newCardData.lastName}
                  className="w-full bg-easner-primary hover:bg-easner-primary-600"
                >
                  {isCreatingCard ? "Creating..." : "Create Card"}
                </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr] lg:flex-1 lg:min-h-0 min-h-[600px]">
          {/* Left Column: Card Display and Actions */}
          <div className="space-y-6">
            {/* Card Carousel */}
            <div className="space-y-4">
              {cards.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Card Yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a card to start spending
                    </p>
                    <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-easner-primary hover:bg-easner-primary-600">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                cards.map((card) => (
                  <Card
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`cursor-pointer transition-all ${
                      selectedCard?.id === card.id
                        ? "border-easner-primary border-2 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Balance</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(card.balance, card.currency)}
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-easner-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Card Number</p>
                          <p className="text-sm font-mono">**** {card.last4}</p>
                        </div>
                        {card.expiry && (
                          <div>
                            <p className="text-xs text-gray-500">Expires</p>
                            <p className="text-sm font-medium">{card.expiry}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Card Actions */}
            {selectedCard && (
              <div className="flex flex-col gap-2">
                <Dialog open={cardDetailsOpen} onOpenChange={setCardDetailsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Card Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">**** {selectedCard.last4}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(`**** ${selectedCard.last4}`, "cardNumber")}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStates.cardNumber ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {selectedCard.expiry && (
                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <p className="text-sm">{selectedCard.expiry}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Balance</Label>
                        <p className="text-2xl font-bold">
                          {formatCurrency(selectedCard.balance, selectedCard.currency)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <p className="text-sm capitalize">{selectedCard.status}</p>
                      </div>
                      {selectedCard.fundingAddress && (
                        <div className="space-y-2">
                          <Label>Funding Address (Top-Up)</Label>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs break-all">{selectedCard.fundingAddress}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(selectedCard.fundingAddress || "", "fundingAddress")}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              {copiedStates.fundingAddress ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Send {selectedCard.fundingCurrency?.toUpperCase()} on {selectedCard.fundingChain} to fund this card
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={cardSettingsOpen} onOpenChange={setCardSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Settings className="h-4 w-4" />
                      Card Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Card Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <p className="text-sm font-mono">**** {selectedCard.last4}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <p className="text-sm capitalize">{selectedCard.status}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-4">
                          Card settings and preferences will be available here
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={handleFreezeToggle}
                >
                  <Snowflake className="h-4 w-4" />
                  {selectedCard.status === "frozen" ? "Unfreeze" : "Freeze"} Card
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Transactions */}
          {selectedCard && (
            <div className="flex flex-col lg:min-h-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction history</h2>
                <Link href="/user/card/transactions">
                  <button className="text-sm sm:text-base text-easner-primary font-medium hover:underline">
                    See all
                  </button>
                </Link>
              </div>

            <div className="space-y-4 sm:space-y-5">
              {filteredTransactions.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <p className="text-base text-gray-600">No transactions found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTransactions.map((transaction) => {
                  const statusColor = transaction.status === "success" || transaction.status === "completed" 
                    ? "#10b981" 
                    : transaction.status === "pending" 
                    ? "#f59e0b" 
                    : "#ef4444"
                  
                  return (
                    <Card
                      key={transaction.id}
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setTransactionDetailsOpen(true)
                      }}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`rounded-full p-2 flex-shrink-0 ${
                                transaction.direction === "credit"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {transaction.direction === "credit" ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {transaction.description || transaction.merchant_name || "Transaction"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {new Date(transaction.created_at).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                  })}
                                </p>
                                <span className="text-gray-400">•</span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                                  style={{
                                    backgroundColor: `${statusColor}20`,
                                    color: statusColor,
                                  }}
                                >
                                  {transaction.status === "success" || transaction.status === "completed" 
                                    ? "Success" 
                                    : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p
                            className={`text-sm sm:text-base font-semibold tabular-nums ml-4 ${
                              transaction.direction === "credit" ? "text-green-600" : "text-gray-900"
                            }`}
                          >
                            {transaction.direction === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.amount, transaction.currency || "USD")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
            </div>
          )}
          </div>

          {/* Transaction Details Dialog */}
          <Dialog open={transactionDetailsOpen} onOpenChange={setTransactionDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
              </DialogHeader>
              {selectedTransaction && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm font-medium">{selectedTransaction.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <p
                      className={`text-2xl font-bold ${
                        selectedTransaction.direction === "credit" ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {selectedTransaction.direction === "credit" ? "+" : "-"}
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <p className="text-sm">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <p className="text-sm capitalize">{selectedTransaction.status}</p>
                  </div>
                  {selectedTransaction.merchant_name && (
                    <div className="space-y-2">
                      <Label>Merchant</Label>
                      <p className="text-sm">{selectedTransaction.merchant_name}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <p className="text-sm capitalize">{selectedTransaction.type}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

