/**
 * Server-side store for invoice view events (customer views).
 * In production, this would be a database.
 */
export interface InvoiceViewEvent {
  invoiceId: string
  viewedAt: string // ISO string
}

const viewEvents: InvoiceViewEvent[] = []

export function addInvoiceViewEvent(invoiceId: string): void {
  viewEvents.push({
    invoiceId,
    viewedAt: new Date().toISOString(),
  })
}

export function getInvoiceViewEvents(invoiceId: string): InvoiceViewEvent[] {
  return viewEvents
    .filter((e) => e.invoiceId === invoiceId)
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
}
