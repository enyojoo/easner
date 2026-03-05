"use client"

import { pdf } from "@react-pdf/renderer"
import QRCode from "qrcode"
import { InvoicePDFDocument } from "@/components/invoice-pdf-document"
import type { Invoice } from "@/lib/mock-data"
import type { Account } from "@/lib/mock-data"
import type { StablecoinAccount } from "@/lib/mock-data"
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

export async function downloadInvoicePdf(
  invoice: Invoice,
  bankAccount: Account | undefined,
  stablecoinAccount: StablecoinAccount | undefined
): Promise<void> {
  const logoUrl = await getLogoDataUrl()

  let qrDataUrl: string | undefined
  if (stablecoinAccount && typeof window !== "undefined") {
    try {
      qrDataUrl = await QRCode.toDataURL(stablecoinAccount.address, {
        width: 200,
        margin: 2,
      })
    } catch (err) {
      console.error("Failed to generate QR code:", err)
    }
  }

  const blob = await pdf(
    <InvoicePDFDocument
      invoice={invoice}
      bankAccount={bankAccount}
      stablecoinAccount={stablecoinAccount}
      logoUrl={logoUrl}
      qrDataUrl={qrDataUrl}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Invoice-${invoice.invoiceNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
