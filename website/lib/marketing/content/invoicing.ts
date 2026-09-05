import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const invoicingContent: ProductPageContent = {
  metadata: {
    title: "Invoicing | Global B2B Collections",
    description:
      "Invoice globally and get paid online, by bank, or by stablecoin. B2B invoicing on Easner Business with card checkout, virtual accounts, and stablecoin pay-in.",
    keywords: [
      "international invoicing",
      "invoice online payment",
      "invoice stablecoin pay-in",
      "global B2B collections",
      "cross-border invoice payment",
      "B2B collections emerging markets",
      "invoice clients in Nigeria",
      "invoice clients in Mexico",
      "collect payments from China",
      "invoice customers in the Philippines",
      "invoice software for exporters",
    ],
  },
  hero: {
    h1: "Invoice globally and get paid",
    subhead:
      "Create, send, and track invoices from Easner Business. Customers can pay online by card, with account details, or with a stablecoin deposit address, while your dashboard keeps status and reconciliation in one place.",
    visualSlot: "mkt-hero-invoicing-01",
    altText: "Business owner creating an international invoice in Easner Business",
    ctas: [
      { label: "Start invoicing", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "invoicing_hero" },
      { label: "See Business banking", href: "/business", analyticsLocation: "invoicing_hero_business" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Create and send invoices",
      description:
        "Generate branded invoices, add line items, and share a hosted invoice page customers can pay directly.",
      visualSlot: "mkt-ui-invoice-editor",
      altText: "Easner invoice creation screen",
    },
    {
      title: "Pay online",
      description:
        "Customers pay by card, bank debit, or other supported methods on a hosted checkout page – no account details to copy.",
      visualSlot: "mkt-ui-invoice-online-payin",
      altText: "Invoice payment page showing pay-online card checkout",
    },
    {
      title: "Bank pay-in",
      description:
        "Account details on the invoice for USD, EUR, and other currencies where supported.",
      descriptionParts: [
        "Account details on the invoice for ",
        { badge: "USD" },
        ", ",
        { badge: "EUR" },
        ", and other currencies where supported.",
      ],
      visualSlot: "mkt-ui-invoice-bank-payin",
      altText: "Invoice payment page showing bank transfer details",
    },
    {
      title: "Stablecoin pay-in",
      description: "USDC or EURC deposit address and memo – same invoice, clearer customer choice.",
      descriptionParts: [
        { badge: "USDC" },
        " or ",
        { badge: "EURC" },
        " deposit address and memo – same invoice, clearer customer choice.",
      ],
      visualSlot: "mkt-ui-invoice-stablecoin-payin",
      altText: "Invoice stablecoin pay-in with deposit address and memo",
    },
    {
      title: "Customer directory",
      description:
        "Save invoice recipients, payer references, and repeat payment context for cleaner collections.",
      visualSlot: "mkt-ui-invoice-customers",
      altText: "Easner invoice customer directory",
    },
  ],
  useCasesHeadline: "Who invoices on Easner Business",
  useCasesSubhead:
    "Teams that bill internationally and need one ledger for bank and stablecoin collections.",
  useCases: [
    {
      title: "Tuition and education",
      description:
        "Collect tuition and fees from families abroad with bank or stablecoin pay-in on one hosted invoice link.",
    },
    {
      title: "Global trade operators",
      description:
        "Bill overseas buyers and track collections with virtual account details or stablecoin pay-in.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Send retainer and project invoices, track payment status, and save repeat clients for faster collections.",
    },
    {
      title: "Software and SaaS",
      description:
        "Bill customers in USD or EUR across borders, with status tracking and reconciliation on every invoice.",
    },
    {
      title: "Professional services",
      description:
        "Collect cross-border fees from clients with payer references your finance team can reconcile.",
    },
    {
      title: "Marketplaces and platforms",
      description:
        "Invoice international partners or wholesale buyers and collect by bank or stablecoin.",
    },
  ],
  faq: [
    {
      question: "Invoicing vs. Checkout vs. Payment Links?",
      answer:
        "Invoicing is for itemized bills to a named customer, with line items and payer records. Easner Payment Links is a no-code shareable page for quick one-time or recurring payments – no invoice needed. Easner Checkout is for embedding payments directly on your own website. All three settle in the same Easner Business ledger.",
    },
  ],
  ctaBand: {
    headline: "Invoice from Easner Business today",
    subhead: "One invoice flow for online, bank, and stablecoin pay-in, with status tracking and reconciliation.",
    ctas: [{ label: "Start invoicing", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "invoicing_cta_band" }],
  },
}
