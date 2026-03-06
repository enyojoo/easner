import { renderToBuffer } from "@react-pdf/renderer"
import QRCode from "qrcode"
import { InvoicePDFDocument } from "@/components/invoice-pdf-document"
import { PDF_LOGO_DATA_URL } from "@/lib/pdf-logo-base64"
import type { Invoice } from "@/lib/mock-data"
import type { Account } from "@/lib/mock-data"
import type { StablecoinAccount } from "@/lib/mock-data"

export async function generateInvoicePdfBuffer(
  invoice: Invoice,
  bankAccount?: Account,
  stablecoinAccount?: StablecoinAccount
): Promise<Buffer> {
  const logoUrl = PDF_LOGO_DATA_URL

  let qrDataUrl: string | undefined
  if (stablecoinAccount) {
    try {
      qrDataUrl = await QRCode.toDataURL(stablecoinAccount.address, {
        width: 200,
        margin: 2,
      })
    } catch (err) {
      console.error("Failed to generate QR code:", err)
    }
  }

  return renderToBuffer(
    <InvoicePDFDocument
      invoice={invoice}
      bankAccount={bankAccount}
      stablecoinAccount={stablecoinAccount}
      logoUrl={logoUrl}
      qrDataUrl={qrDataUrl}
    />
  )
}
