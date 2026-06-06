import type { ProductPageContent } from "../types"
import { ACCESS_PATH } from "../constants"

export const invoicingContent: ProductPageContent = {
  metadata: {
    title: "Invoicing",
    description:
      "Invoice globally and get paid by bank or stablecoin. Professional B2B invoicing on Easner Business with virtual accounts and stablecoin pay-in where enabled.",
    keywords: [
      "international invoicing",
      "invoice stablecoin pay-in",
      "global B2B collections",
    ],
  },
  hero: {
    h1: "Invoice globally. Get paid by bank or stablecoin.",
    subhead:
      "Create, send, and track invoices from Easner Business. Customers can pay with account details or a stablecoin deposit address where enabled, while your dashboard keeps status and reconciliation in one place.",
    visualSlot: "mkt-hero-invoicing-01",
    altText: "Business owner creating an international invoice in Easner Business",
    ctas: [
      { label: "Start invoicing", href: ACCESS_PATH },
      { label: "See Business banking", href: "/business" },
    ],
  },
  problem: {
    headline: "International invoices shouldn't mean payment chaos.",
    body: "Cross-border B2B payments often involve unclear instructions, slow settlement, missing references, and manual matching. Customers need a simple way to pay; finance teams need one ledger and audit trail.",
  },
  solution: {
    headline: "Professional invoices with flexible pay-in.",
    body: "Generate branded invoices, share hosted payment links, and track status from your dashboard. Customers pay using the methods you enable: bank transfer to account details or stablecoin to an address on the invoice.",
    visualSlot: "mkt-ui-invoice-editor",
    altText: "Easner invoice creation screen",
    reverse: true,
  },
  features: [
    {
      title: "Bank pay-in",
      description:
        "Account details on the invoice for USD, EUR, and other currencies where supported.",
      visualSlot: "mkt-ui-invoice-payin",
      altText: "Invoice payment page showing bank details and stablecoin address",
    },
    {
      title: "Stablecoin pay-in",
      description:
        "USDC or EURC deposit address and memo where enabled – same invoice, clearer customer choice.",
      visualSlot: "mkt-ui-invoice-payin",
      altText: "Invoice stablecoin pay-in options",
    },
    {
      title: "Customer directory",
      description: "Save invoice recipients, payer references, and repeat payment context for cleaner collections.",
    },
  ],
  useCases: [
    {
      title: "Tuition and education",
      description:
        "Invoice families and institutions across borders with clear payment instructions.",
    },
    {
      title: "Import / export services",
      description: "Bill international clients in their preferred funding method.",
    },
    {
      title: "Agencies and consultancies",
      description: "Retainer and project invoices with status tracking.",
    },
  ],
  tierNote:
    "Invoicing and virtual account pay-in require approved organization KYB (Tier 1 Global banking). Stablecoin pay-in on invoices requires enabled wallet features. See tier ladder for availability details.",
  complianceNote:
    "You are typically the controller of your customer data on invoices; Easner processes payer information to deliver collections and compliance functions.",
  ctaBand: {
    headline: "Send your next international invoice from Easner Business.",
    subhead: "One invoice flow for bank pay-in, stablecoin pay-in where enabled, status tracking, and reconciliation.",
    ctas: [{ label: "Get Started", href: ACCESS_PATH }],
  },
  faq: [
    {
      question: "Is invoicing available on Easner Personal?",
      answer: "Invoicing is a Easner Business feature on the web dashboard.",
    },
    {
      question: "Can payers use only bank transfer?",
      answer: "Yes. Stablecoin pay-in is optional where enabled.",
    },
    {
      question: "Are invoice pages public?",
      answer: "Customers receive a hosted payment experience to complete pay-in.",
    },
    {
      question: "How do fees work?",
      answer:
        "Fees and FX may apply to underlying payment rails. Display pricing on your invoice; Easner shows applicable transaction fees before confirmation in the dashboard.",
    },
    {
      question: "Do I need separate tools for QR or in-person pay?",
      answer: "For scan-to-pay and Terminal collections, see Stablecoin Payments.",
    },
  ],
}
