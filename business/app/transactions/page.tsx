"use client"

import { useState, useMemo } from "react"
import { mockTransactions, type Transaction } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ChevronDown } from "lucide-react"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangeFilter, type TimePeriod } from "@/components/date-range-filter"
import { Button } from "@/components/ui/button"

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [displayCount, setDisplayCount] = useState(10)

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
    return mockTransactions.filter((txn) => {
      const matchesType = typeFilter === "all" || txn.type === typeFilter
      const matchesStatus = statusFilter === "all" || txn.status === statusFilter
      const txnDate = new Date(txn.date)
      const matchesDateRange = txnDate >= start && txnDate <= end
      return matchesType && matchesStatus && matchesDateRange
    })
  }, [typeFilter, statusFilter, start, end])

  const displayedTransactions = filteredTransactions.slice(0, displayCount)
  const hasMore = displayCount < filteredTransactions.length

  const totalCredit = filteredTransactions
    .filter((txn) => txn.direction === "credit")
    .reduce((sum, txn) => sum + txn.amount, 0)

  const totalDebit = filteredTransactions
    .filter((txn) => txn.direction === "debit")
    .reduce((sum, txn) => sum + txn.amount, 0)

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setDisplayCount(10)
  }

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    setDisplayCount(10)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all your account activity</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            timePeriod={timePeriod}
            customDateRange={customDateRange}
            onTimePeriodChange={handleTimePeriodChange}
            onCustomDateRangeChange={setCustomDateRange}
          />
          <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
            <SelectTrigger className="w-[100px] h-8 min-h-8 max-h-8 text-xs px-3 py-1.5 bg-transparent">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="ach">ACH</SelectItem>
              <SelectItem value="wire">Wire</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
            <SelectTrigger className="w-[120px] h-8 min-h-8 max-h-8 text-xs px-3 py-1.5 bg-transparent">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-sm text-muted-foreground">Money in</p>
              </div>
              <p className="text-3xl font-semibold tracking-tight text-green-600">
                +${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <p className="text-sm text-muted-foreground">Money out</p>
              </div>
              <p className="text-3xl font-semibold tracking-tight text-red-600">
                -${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {displayedTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => {
                      setSelectedTransaction(txn)
                      setTransactionDetailsOpen(true)
                    }}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${txn.direction === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                      >
                        {txn.direction === "credit" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {txn.type.toUpperCase()} • {new Date(txn.date).toLocaleDateString()} •{" "}
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold tabular-nums ${txn.direction === "credit" ? "text-green-600" : "text-foreground"}`}
                    >
                      {txn.direction === "credit" ? "+" : "-"}${txn.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="p-6 border-t flex justify-center">
                  <Button variant="ghost" className="gap-2" onClick={() => setDisplayCount((prev) => prev + 10)}>
                    Load More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        open={transactionDetailsOpen}
        onOpenChange={setTransactionDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
