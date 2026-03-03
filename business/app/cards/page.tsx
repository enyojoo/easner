"use client"

import { useState, useMemo } from "react"
import { mockCards, mockCardTransactions, type Transaction, type Card } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Settings, Snowflake, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { CardCarousel } from "@/components/card-carousel"
import { CardSettingsDialog } from "@/components/card-settings-dialog"
import { CardDetailsDialog } from "@/components/card-details-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangeFilter, type TimePeriod } from "@/components/date-range-filter"

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState(mockCards[0])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [frozenCardIds, setFrozenCardIds] = useState<Set<string>>(new Set())
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const toggleFreeze = () => {
    setFrozenCardIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(selectedCard.id)) {
        newSet.delete(selectedCard.id)
      } else {
        newSet.add(selectedCard.id)
      }
      return newSet
    })
  }

  const isCurrentCardFrozen = frozenCardIds.has(selectedCard.id)

  const getDateRange = () => {
    const now = new Date()
    const startDate = new Date()

    if (timePeriod === "all") {
      return { start: new Date(0), end: now }
    }

    if (timePeriod === "custom" && customDateRange.from && customDateRange.to) {
      return { start: customDateRange.from, end: customDateRange.to }
    }

    switch (timePeriod) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return { start: startDate, end: now }
  }

  const { start, end } = getDateRange()

  const filteredTransactions = useMemo(() => {
    return mockCardTransactions.filter((txn) => {
      const txnDate = new Date(txn.date)
      return txnDate >= start && txnDate <= end
    })
  }, [start, end])

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your virtual debit and credit cards</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr] lg:flex-1 lg:min-h-0 min-h-[600px]">
        {/* Left Column: Card Carousel and Actions */}
        <div className="space-y-6">
          <CardCarousel cards={mockCards} onCardChange={setSelectedCard} frozenCardIds={frozenCardIds} />

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => setDetailsOpen(true)}>
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
              Card Settings
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={toggleFreeze}>
              <Snowflake className="h-4 w-4" />
              {isCurrentCardFrozen ? "Unfreeze" : "Freeze"} Card
            </Button>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="flex flex-col lg:min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Transactions</h2>
            <DateRangeFilter
              timePeriod={timePeriod}
              customDateRange={customDateRange}
              onTimePeriodChange={setTimePeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />
          </div>

          <div className="rounded-lg border bg-card overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 max-h-[500px] lg:max-h-none">
            <div className="flex-1 overflow-y-auto divide-y">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => {
                    setSelectedTransaction(transaction)
                    setTransactionDetailsOpen(true)
                  }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.direction === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {transaction.direction === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category?.toUpperCase() || 'UNKNOWN'} • {new Date(transaction.date).toLocaleDateString()} •{" "}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      transaction.direction === "credit" ? "text-green-600" : "text-foreground"
                    }`}
                  >
                    {transaction.direction === "credit" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Details Dialog */}
      <CardDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} card={selectedCard} />

      {/* Card Settings Dialog */}
      <CardSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} cardLast4={selectedCard.last4} />

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={transactionDetailsOpen}
        onOpenChange={setTransactionDetailsOpen}
        transaction={selectedTransaction}
        hideType={true}
      />
    </div>
  )
}
