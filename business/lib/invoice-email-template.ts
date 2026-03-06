import { businessInfo } from "@/lib/business-info"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Invoice } from "@/lib/mock-data"

export interface InvoiceEmailData {
  invoice: Invoice
  invoiceViewUrl: string
  businessName: string
}

/** Status-specific email copy */
const EMAIL_BY_STATUS: Record<
  string,
  { subject: string; bodyIntro: string; bodyIntroPlain: string }
> = {
  draft: {
    subject: "Invoice from",
    bodyIntro: "has sent you an invoice.",
    bodyIntroPlain: "has sent you an invoice.",
  },
  open: {
    subject: "Invoice from",
    bodyIntro: "has sent you an invoice.",
    bodyIntroPlain: "has sent you an invoice.",
  },
  sent: {
    subject: "Invoice from",
    bodyIntro: "has sent you an invoice.",
    bodyIntroPlain: "has sent you an invoice.",
  },
  past_due: {
    subject: "Reminder: Your invoice from",
    bodyIntro: "This is a reminder that your invoice is past due.",
    bodyIntroPlain: "This is a reminder that your invoice is past due.",
  },
  paid: {
    subject: "Your invoice from",
    bodyIntro: "Your invoice has been marked as paid.",
    bodyIntroPlain: "Your invoice has been marked as paid.",
  },
  void: {
    subject: "Your invoice from",
    bodyIntro: "Your invoice has been voided.",
    bodyIntroPlain: "Your invoice has been voided.",
  },
  failed: {
    subject: "Invoice from",
    bodyIntro: "has sent you an invoice.",
    bodyIntroPlain: "has sent you an invoice.",
  },
}

const defaultEmail = EMAIL_BY_STATUS.sent

export function getInvoiceEmailSubject(data: InvoiceEmailData): string {
  const { invoice, businessName } = data
  const config = EMAIL_BY_STATUS[invoice.status] ?? defaultEmail
  return `${config.subject} ${businessName} — ${invoice.invoiceNumber}`
}

function getBodyIntro(data: InvoiceEmailData): string {
  const { invoice, businessName } = data
  const config = EMAIL_BY_STATUS[invoice.status] ?? defaultEmail
  return config.bodyIntro.includes("has sent")
    ? `${businessName} ${config.bodyIntro}`
    : config.bodyIntro
}

function getBodyIntroPlain(data: InvoiceEmailData): string {
  const { invoice, businessName } = data
  const config = EMAIL_BY_STATUS[invoice.status] ?? defaultEmail
  return config.bodyIntroPlain.includes("has sent")
    ? `${businessName} ${config.bodyIntroPlain}`
    : config.bodyIntroPlain
}

export function generateInvoiceEmailHtml(data: InvoiceEmailData): string {
  const { invoice, invoiceViewUrl, businessName } = data
  const dueDate = formatDate(invoice.dueDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const amount = formatCurrency(invoice.total, invoice.currency)
  const bodyIntro = getBodyIntro(data)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber} - ${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 30px; }
    .logo { max-width: 140px; height: auto; margin-bottom: 24px; display: block; }
    .business-info { font-size: 14px; color: #4a5568; margin-bottom: 32px; }
    .business-info p { margin-bottom: 4px; }
    .greeting { font-size: 18px; font-weight: 500; color: #1a202c; margin-bottom: 20px; }
    .body-text { font-size: 16px; color: #4a5568; margin-bottom: 24px; line-height: 1.7; }
    .invoice-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .invoice-details h3 { font-size: 14px; color: #2d3748; margin-bottom: 12px; font-weight: 600; }
    .invoice-details p { font-size: 16px; margin-bottom: 8px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #007ACC 0%, #0056b3 100%); color: #fff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #718096; }
    .footer p { margin-bottom: 12px; }
    .copyright { font-size: 12px; color: #a0aec0; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Business.png" alt="Easner Business" class="logo" width="140" />
    
    <div class="business-info">
      <p><strong>${businessInfo.name}</strong></p>
      <p>${businessInfo.address}</p>
      <p>${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}</p>
      <p>${businessInfo.country}</p>
      <p>${businessInfo.email} | ${businessInfo.phone}</p>
    </div>

    <p class="greeting">Dear ${invoice.customerName},</p>
    
    <p class="body-text">${bodyIntro}</p>

    <div class="invoice-details">
      <h3>Invoice details</h3>
      <p><strong>Invoice #${invoice.invoiceNumber}</strong> — ${amount} ${invoice.currency}</p>
      <p>Due: ${dueDate}</p>
    </div>

    <a href="${invoiceViewUrl}" class="cta">View Invoice</a>

    <div class="footer">
      <p>You're receiving this email because ${businessName} uses Easner Business Banking services to manage their business processes.</p>
      <p>If you have any questions or think an error was made, please contact Easner Banking at <a href="mailto:support@easner.com">support@easner.com</a>.</p>
      <p class="copyright">© 2026 Easner, Inc.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateInvoiceEmailText(data: InvoiceEmailData): string {
  const { invoice, invoiceViewUrl, businessName } = data
  const dueDate = formatDate(invoice.dueDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const amount = formatCurrency(invoice.total, invoice.currency)
  const bodyIntro = getBodyIntroPlain(data)

  return `
Dear ${invoice.customerName},

${bodyIntro}

Invoice #${invoice.invoiceNumber} — ${amount} ${invoice.currency}
Due: ${dueDate}

View Invoice: ${invoiceViewUrl}

---

You're receiving this email because ${businessName} uses Easner Business Banking services to manage their business processes. If you have any questions or think an error was made, please contact Easner Banking at support@easner.com.

© 2026 Easner, Inc.
  `.trim()
}
