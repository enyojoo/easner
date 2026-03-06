"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { mockInvoices, type Invoice } from "@/lib/mock-data"
import { addInvoiceToStore, updateInvoiceInStore, removeInvoiceFromStore } from "@/lib/invoice-store"

interface InvoicesContextValue {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
}

const InvoicesContext = createContext<InvoicesContextValue | null>(null)

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  const addInvoice = useCallback((invoice: Invoice) => {
    addInvoiceToStore(invoice)
    setInvoices((prev) => [invoice, ...prev])
  }, [])

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    updateInvoiceInStore(id, updates)
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    )
  }, [])

  const deleteInvoice = useCallback((id: string) => {
    removeInvoiceFromStore(id)
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
  }, [])

  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice }}>
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
