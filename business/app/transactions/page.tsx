"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Transaction } from "@/lib/mock-data"
import { getDateRange, getTransactionsFiltered } from "@/lib/transactions"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ChevronDown, Search, Download, DollarSign } from "lucide-react"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangeFilter, type TimePeriod } from "@/components/date-range-filter"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"

function exportToCsv(transactions: { description: string; type: string; source: string; amount: number; direction: string; status: string; reference?: string; fee?: number; date: string }[]) {
  const headers = ["Date", "Description", "Type", "Source", "Amount", "Status", "Reference", "Fee"]
  const rows = transactions.map((t) => [
    formatDate(t.date),
    `"${t.description.replace(/"/g, '""')}"`,
    t.type.toUpperCase(),
    t.source === "account" ? "Account" : "Card",
    t.direction === "credit" ? `+${Math.abs(t.amount).toFixed(2)}` : `-${Math.abs(t.amount).toFixed(2)}`,
    t.status,
    t.reference ?? "",
    t.fee !== undefined && t.fee > 0 ? t.fee.toFixed(2) : "",
  ])
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const [sourceFilter, setSourceFilter] = useState<"all" | "account" | "card">("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    const source = searchParams.get("source")
    const status = searchParams.get("status")
    const period = searchParams.get("period")
    if (source === "card" || source === "account") setSourceFilter(source)
    if (status && ["completed", "pending", "failed"].includes(status)) setStatusFilter(status)
    if (period && ["7d", "30d", "90d", "1y", "custom"].includes(period)) setTimePeriod(period as TimePeriod)
  }, [searchParams])

  const { start, end } = getDateRange({ timePeriod, customDateRange })

  const filteredTransactions = useMemo(
    () =>
      getTransactionsFiltered({
        start,
        end,
        source: sourceFilter,
        type: "all",
        status: statusFilter,
        search: searchTerm.trim() || undefined,
        sortBy: "date",
        sortOrder: "desc",
      }),
    [start, end, sourceFilter, statusFilter, searchTerm]
  )

  const displayedTransactions = filteredTransactions.slice(0, displayCount)
  const hasMore = displayCount < filteredTransactions.length

  const totalCredit = filteredTransactions
    .filter((t) => t.direction === "credit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalDebit = filteredTransactions
    .filter((t) => t.direction === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setDisplayCount(10)
  }

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    setDisplayCount(10)
  }

  const handleExport = () => {
    exportToCsv(filteredTransactions)
  }

  const hasActiveFilters =
    sourceFilter !== "all" ||
    statusFilter !== "all" ||
    searchTerm.trim() !== ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all your account activity</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:flex-initial sm:min-w-[200px] sm:w-[200px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setDisplayCount(10)
              }}
              className="pl-9 h-8 text-xs bg-transparent"
            />
          </div>
          <DateRangeFilter
            timePeriod={timePeriod}
            customDateRange={customDateRange}
            onTimePeriodChange={handleTimePeriodChange}
            onCustomDateRangeChange={setCustomDateRange}
            triggerClassName="min-w-[140px]"
          />
          <Select value={sourceFilter} onValueChange={handleFilterChange(setSourceFilter as (v: string) => void)}>
            <SelectTrigger className="min-w-[130px] w-[130px] h-8 min-h-8 max-h-8 text-xs px-3 py-1.5 bg-transparent shrink-0">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
            <SelectTrigger className="min-w-[140px] w-[140px] h-8 min-h-8 max-h-8 text-xs px-3 py-1.5 bg-transparent shrink-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-2 shrink-0" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
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

      <Card>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "Try adjusting your filters or search terms" : "No activity yet"}
              </p>
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
                          {txn.type.toUpperCase()} • {txn.source === "card" ? "Card" : "Account"} •{" "}
                          {new Date(txn.date).toLocaleDateString()} •{" "}
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold tabular-nums ${txn.direction === "credit" ? "text-green-600" : "text-foreground"}`}
                    >
                      {txn.direction === "credit" ? "+" : "-"}{formatCurrency(Math.abs(txn.amount), "USD")}
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

      <div className="text-sm text-muted-foreground">
        {filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""}
      </div>

      <TransactionDetailsDialog
        open={transactionDetailsOpen}
        onOpenChange={setTransactionDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
