import {
  mockTransactions,
  mockCardTransactions,
  type Transaction,
} from "@/lib/mock-data"
import type { TimePeriod } from "@/components/date-range-filter"

export type TransactionSource = "account" | "card"

export interface TransactionWithSource extends Transaction {
  source: TransactionSource
}

export type TransactionSortBy = "date" | "amount"

export interface GetTransactionsFilteredOptions {
  start: Date
  end: Date
  source?: "all" | TransactionSource
  type?: string
  status?: string
  search?: string
  cardId?: string
  sortBy?: TransactionSortBy
  sortOrder?: "asc" | "desc"
}

export interface DateRangeOptions {
  timePeriod: TimePeriod
  customDateRange: { from: Date | undefined; to: Date | undefined }
}

/**
 * Compute date range from time period and custom range.
 * Shared across dashboard, cards, and transactions pages.
 */
export function getDateRange(options: DateRangeOptions): { start: Date; end: Date } {
  const { timePeriod, customDateRange } = options
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

/**
 * Merge account and card transactions, add source, sort by date desc.
 */
export function getAllTransactions(): TransactionWithSource[] {
  const accountTxns: TransactionWithSource[] = mockTransactions.map((t) => ({
    ...t,
    source: "account" as TransactionSource,
  }))
  const cardTxns: TransactionWithSource[] = mockCardTransactions.map((t) => ({
    ...t,
    source: "card" as TransactionSource,
  }))
  const merged = [...accountTxns, ...cardTxns]
  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Filter transactions by date range, source, type, status, search, and cardId.
 */
export function getTransactionsFiltered(
  options: GetTransactionsFilteredOptions
): TransactionWithSource[] {
  let result = getAllTransactions()

  const {
    start,
    end,
    source,
    type,
    status,
    search,
    cardId,
    sortBy = "date",
    sortOrder = "desc",
  } = options

  result = result.filter((txn) => {
    const txnDate = new Date(txn.date)
    if (txnDate < start || txnDate > end) return false
    if (source && source !== "all" && txn.source !== source) return false
    if (type && type !== "all" && txn.type !== type) return false
    if (status && status !== "all" && txn.status !== status) return false
    if (cardId && txn.cardId !== cardId) return false
    if (search) {
      const term = search.toLowerCase()
      const matches =
        txn.description.toLowerCase().includes(term) ||
        (txn.reference?.toLowerCase().includes(term) ?? false) ||
        txn.id.toLowerCase().includes(term)
      if (!matches) return false
    }
    return true
  })

  result = [...result].sort((a, b) => {
    if (sortBy === "date") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortOrder === "desc" ? -diff : diff
    }
    const diff = Math.abs(a.amount) - Math.abs(b.amount)
    return sortOrder === "desc" ? -diff : diff
  })

  return result
}

/**
 * Get most recent N transactions within date range. For dashboard.
 */
export function getRecentTransactions(
  count: number,
  dateRange: { start: Date; end: Date }
): TransactionWithSource[] {
  const filtered = getTransactionsFiltered({
    start: dateRange.start,
    end: dateRange.end,
  })
  return filtered.slice(0, count)
}
