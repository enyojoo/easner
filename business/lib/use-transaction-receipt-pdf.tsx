"use client"

import { pdf } from "@react-pdf/renderer"
import { TransactionReceiptPDFDocument } from "@/components/transaction-receipt-pdf-document"
import type { Transaction } from "@/lib/mock-data"
import { PDF_LOGO_DATA_URL } from "@/lib/pdf-logo-base64"

async function getLogoDataUrl(): Promise<string> {
  if (typeof window === "undefined") return PDF_LOGO_DATA_URL
  try {
    const res = await fetch("/Easner%20Business.png")
    if (!res.ok) return PDF_LOGO_DATA_URL
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return PDF_LOGO_DATA_URL
  }
}

export async function downloadTransactionReceiptPdf(
  transaction: Transaction,
  cardLast4?: string
): Promise<void> {
  const logoUrl = await getLogoDataUrl()

  const blob = await pdf(
    <TransactionReceiptPDFDocument
      transaction={transaction}
      logoUrl={logoUrl}
      cardLast4={cardLast4}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `receipt-${transaction.id}-${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
