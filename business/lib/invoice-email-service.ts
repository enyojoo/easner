import sgMail from "@sendgrid/mail"
import {
  generateInvoiceEmailHtml,
  generateInvoiceEmailText,
  getInvoiceEmailSubject,
  type InvoiceEmailData,
} from "@/lib/invoice-email-template"
import { businessInfo } from "@/lib/business-info"
import type { Invoice } from "@/lib/mock-data"

let apiKeyInitialized = false

function ensureSendGridInitialized() {
  if (!apiKeyInitialized) {
    const key = process.env.SENDGRID_API_KEY
    if (!key) {
      throw new Error("SENDGRID_API_KEY environment variable is required")
    }
    sgMail.setApiKey(key)
    apiKeyInitialized = true
  }
}

export interface SendInvoiceEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendInvoiceEmail(
  invoice: Invoice,
  invoiceViewUrl: string,
  pdfBuffer: Buffer
): Promise<SendInvoiceEmailResult> {
  if (!invoice.customerEmail?.trim()) {
    return { success: false, error: "Invoice has no customer email" }
  }

  try {
    ensureSendGridInitialized()

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || "invoices@easner.com"
    const fromName = process.env.SENDGRID_FROM_NAME || "Easner Business"
    const businessName = businessInfo.name

    const data: InvoiceEmailData = {
      invoice,
      invoiceViewUrl,
      businessName,
    }

    const html = generateInvoiceEmailHtml(data)
    const text = generateInvoiceEmailText(data)
    const subject = getInvoiceEmailSubject(data)

    const msg = {
      to: invoice.customerEmail,
      from: { email: fromEmail, name: fromName },
      subject,
      html,
      text,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    }

    const [response] = await sgMail.send(msg)
    const messageId = response.headers["x-message-id"] as string | undefined

    return { success: true, messageId }
  } catch (err) {
    console.error("Failed to send invoice email:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
