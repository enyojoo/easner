"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mockCards, type Transaction } from "@/lib/mock-data"
import { getDateRange, getTransactionsFiltered } from "@/lib/transactions"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Settings, Snowflake, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react"
import { CardCarousel } from "@/components/card-carousel"
import { CardSettingsDialog } from "@/components/card-settings-dialog"
import { CardDetailsDialog } from "@/components/card-details-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangeFilter, type TimePeriod } from "@/components/date-range-filter"
import { formatCurrency } from "@/lib/utils"

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

  const { start, end } = getDateRange({ timePeriod, customDateRange })
  const filteredTransactions = useMemo(
    () =>
      getTransactionsFiltered({
        start,
        end,
        source: "card",
        cardId: selectedCard.id,
      }),
    [start, end, selectedCard.id]
  )

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your virtual debit and credit cards</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr] flex-1 min-h-0">
        {/* Left Column: 440px = 400px card + 20px each side for nav arrows at card edges */}
        <div className="space-y-6 flex-shrink-0 lg:flex-shrink">
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
            {selectedCard.form === "physical" && (
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <AlertCircle className="h-4 w-4" />
                Report Lost
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Transactions - frame extends to edge of page content */}
        <div className="flex flex-col min-h-0 flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-foreground">Transactions</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/transactions?source=card">View all</Link>
              </Button>
              <DateRangeFilter
                timePeriod={timePeriod}
                customDateRange={customDateRange}
                onTimePeriodChange={setTimePeriod}
                onCustomDateRangeChange={setCustomDateRange}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto divide-y">
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
                        {transaction.cardId
                          ? `•••• ${mockCards.find((c) => c.id === transaction.cardId)?.last4 ?? "----"}`
                          : transaction.category?.toUpperCase() ?? "UNKNOWN"}{" "}
                        • {new Date(transaction.date).toLocaleDateString()} •{" "}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      transaction.direction === "credit" ? "text-green-600" : "text-foreground"
                    }`}
                  >
                    {transaction.direction === "credit" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount), "USD")}
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
      <CardSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} cardLast4={selectedCard.last4} cardForm={selectedCard.form} />

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
