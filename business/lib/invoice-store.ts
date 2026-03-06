import { mockInvoices, type Invoice } from "./mock-data"

/**
 * Shared invoice store for public view page.
 * mockInvoices + any invoices created during the session.
 */
let store: Invoice[] = [...mockInvoices]

export function getInvoices(): Invoice[] {
  return store
}

export function getInvoiceById(id: string): Invoice | undefined {
  return store.find((inv) => inv.id === id)
}

export function addInvoiceToStore(invoice: Invoice) {
  store = [invoice, ...store]
}

export function updateInvoiceInStore(id: string, updates: Partial<Invoice>) {
  store = store.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
}

export function removeInvoiceFromStore(id: string) {
  store = store.filter((inv) => inv.id !== id)
}

export function syncInvoicesFromMock() {
  store = [...mockInvoices]
}
