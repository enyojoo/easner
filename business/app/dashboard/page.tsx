"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  mockTransactions,
  mockAccounts,
  getTotalBalanceInDefaultCurrency,
  defaultCurrency,
  type Transaction,
} from "@/lib/mock-data"
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Send, ArrowDownCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangeFilter, type TimePeriod } from "@/components/date-range-filter"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const totalBalance = getTotalBalanceInDefaultCurrency()
  const recentTransactions = mockTransactions.slice(0, 6)

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
  const filteredTransactions = mockTransactions.filter((t) => {
    const txnDate = new Date(t.date)
    return txnDate >= start && txnDate <= end
  })

  const moneyIn = filteredTransactions.filter((t) => t.direction === "credit").reduce((sum, t) => sum + t.amount, 0)
  const moneyOut = filteredTransactions.filter((t) => t.direction === "debit").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome{user?.name ? `, ${user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1)}` : ''}
        </h1>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/30 dark:to-gray-900/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Balance</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-6xl font-bold tracking-tight text-foreground">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+2.4%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                In your base currency from all accounts
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/send" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Money
                </Link>
              </Button>
              <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
                <Link href="/invoices/create" className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex gap-12">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Money in</p>
                  <p className="text-lg font-bold text-green-600">
                    ${moneyIn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/20">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Money out</p>
                  <p className="text-lg font-bold text-red-600">
                    -${moneyOut.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <DateRangeFilter
              timePeriod={timePeriod}
              customDateRange={customDateRange}
              onTimePeriodChange={setTimePeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">View all</Link>
          </Button>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTransactions.map((txn) => (
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
          </CardContent>
        </Card>
      </div>

      <TransactionDetailsDialog
        open={transactionDetailsOpen}
        onOpenChange={setTransactionDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
