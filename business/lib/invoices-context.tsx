"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { mockInvoices, type Invoice } from "@/lib/mock-data"
import { addInvoiceToStore } from "@/lib/invoice-store"

interface InvoicesContextValue {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
}

const InvoicesContext = createContext<InvoicesContextValue | null>(null)

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  const addInvoice = useCallback((invoice: Invoice) => {
    addInvoiceToStore(invoice)
    setInvoices((prev) => [invoice, ...prev])
  }, [])

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    )
  }, [])

  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoice }}>
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoices() {
  const ctx = useContext(InvoicesContext)
  if (!ctx) {
    throw new Error("useInvoices must be used within InvoicesProvider")
  }
  return ctx
}
