import {
  mockTransactions,
  mockCardTransactions,
  mockStablecoinDeposits,
  type Invoice,
  type Transaction,
  type StablecoinDeposit,
} from "@/lib/mock-data"

export type InboundDepositSource = "bank" | "stablecoin"

export interface InboundDeposit {
  id: string
  amount: number
  currency: string
  date: string
  source: InboundDepositSource
  /** Display label: bank = description; stablecoin = "USDC on Solana" etc */
  label: string
  reference?: string
}

function bankTransactionToDeposit(t: Transaction): InboundDeposit | null {
  if (t.direction !== "credit") return null
  if (t.type === "card") return null
  const method =
    t.type === "ach" ? "ACH" : t.type === "wire" ? "Wire" : t.type === "book" ? "Book" : t.type
  return {
    id: t.id,
    amount: t.amount,
    currency: "USD",
    date: t.date,
    source: "bank",
    label: t.description || `${method} Transfer`,
    reference: t.reference,
  }
}

function stablecoinToDeposit(d: StablecoinDeposit): InboundDeposit {
  const label = `${d.stablecoin} on ${d.chain}`
  return {
    id: d.id,
    amount: d.amount,
    currency: d.currency,
    date: d.date,
    source: "stablecoin",
    label,
    reference: d.reference ?? d.memo,
  }
}

/**
 * Get inbound deposits (bank credits + stablecoin) for linking to an invoice.
 * Filters by currency, amount >= invoice total, and optional search term.
 */
export function getInboundDeposits(
  invoice: Invoice,
  search?: string
): InboundDeposit[] {
  const bankDeposits = mockTransactions
    .map(bankTransactionToDeposit)
    .filter((d): d is InboundDeposit => d !== null)

  const stableDeposits = mockStablecoinDeposits.map(stablecoinToDeposit)

  let merged: InboundDeposit[] = [...bankDeposits, ...stableDeposits]

  merged = merged.filter((d) => {
    if (d.currency !== invoice.currency) return false
    if (d.amount < invoice.total) return false
    if (search) {
      const term = search.toLowerCase()
      const matches =
        d.id.toLowerCase().includes(term) ||
        d.label.toLowerCase().includes(term) ||
        (d.reference?.toLowerCase().includes(term) ?? false)
      if (!matches) return false
    }
    return true
  })

  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return merged
}

function findTransactionById(id: string): Transaction | undefined {
  const t = mockTransactions.find((x) => x.id === id)
  if (t) return t
  return mockCardTransactions.find((x) => x.id === id)
}

function findStablecoinDepositById(id: string): StablecoinDeposit | undefined {
  return mockStablecoinDeposits.find((d) => d.id === id)
}

export interface PaymentRecordDisplay {
  method: "easner" | "cash"
  paidAt: string
  /** For easner: payment method label (ACH, Wire, USDC on Solana, etc.) */
  paymentMethod?: string
  /** For easner: transaction/deposit amount */
  amount?: number
  /** For easner: transaction/deposit currency */
  currency?: string
  /** For easner: transaction/deposit date */
  date?: string
  /** For easner: reference or memo */
  reference?: string
  /** For easner: description (e.g. "Client Payment") */
  description?: string
  /** For easner: transaction ID */
  transactionId?: string
  /** For cash: optional note */
  cashNote?: string
}

/**
 * Get payment record display info for a paid invoice.
 */
export function getPaymentRecordDisplay(invoice: Invoice): PaymentRecordDisplay | null {
  const info = invoice.paymentInfo
  if (!info || invoice.status !== "paid") return null

  if (info.method === "cash") {
    return {
      method: "cash",
      paidAt: info.paidAt,
      cashNote: info.cashNote,
    }
  }

  if (info.method === "easner" && info.transactionId) {
    const txn = findTransactionById(info.transactionId)
    const deposit = findStablecoinDepositById(info.transactionId)

    if (txn) {
      const method =
        txn.type === "ach"
          ? "ACH"
          : txn.type === "wire"
            ? "Wire"
            : txn.type === "book"
              ? "Book"
              : txn.type.toUpperCase()
      return {
        method: "easner",
        paidAt: info.paidAt,
        paymentMethod: method,
        amount: txn.amount,
        currency: "USD",
        date: txn.date,
        reference: txn.reference,
        description: txn.description,
        transactionId: txn.id,
      }
    }

    if (deposit) {
      const methodLabel = `${deposit.stablecoin} on ${deposit.chain}`
      return {
        method: "easner",
        paidAt: info.paidAt,
        paymentMethod: methodLabel,
        amount: deposit.amount,
        currency: deposit.currency,
        date: deposit.date,
        reference: deposit.reference ?? deposit.memo,
        description: methodLabel,
        transactionId: deposit.id,
      }
    }

    return {
      method: "easner",
      paidAt: info.paidAt,
      transactionId: info.transactionId,
    }
  }

  return null
}
