import { NextRequest, NextResponse } from "next/server"
import { mockAccounts, mockStablecoinAccounts } from "@/lib/mock-data"
import { generateInvoicePdfBuffer } from "@/lib/generate-invoice-pdf"
import { sendInvoiceEmail } from "@/lib/invoice-email-service"
import type { Invoice } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const invoice = body.invoice as Invoice | undefined

    if (!invoice?.id) {
      return NextResponse.json(
        { error: "Invoice is required" },
        { status: 400 }
      )
    }

    if (!invoice.customerEmail?.trim()) {
      return NextResponse.json(
        { error: "Invoice has no customer email" },
        { status: 400 }
      )
    }

    const bankAccount = mockAccounts.find((a) => a.currency === invoice.currency)
    const stablecoinAccount = mockStablecoinAccounts.find(
      (s) => s.currency === invoice.currency
    )

    const pdfBuffer = await generateInvoicePdfBuffer(
      invoice,
      bankAccount,
      stablecoinAccount
    )

    const origin =
      request.headers.get("origin") ||
      request.headers.get("x-forwarded-host") ||
      "http://localhost:3000"
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`
    const invoiceViewUrl = `${baseUrl}/invoice-view/${invoice.id}`

    const result = await sendInvoiceEmail(invoice, invoiceViewUrl, pdfBuffer)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${invoice.customerEmail}`,
    })
  } catch (err) {
    console.error("Send invoice email error:", err)
    return NextResponse.json(
      {
        error: "Failed to send invoice email",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
