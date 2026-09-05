import type { ProductPageContent } from "../types"
import {
  BUSINESS_SIGNUP_URL,
  EASNER_DEVELOPED_MARKET_KEYWORDS,
  EASNER_TRADE_AND_OUTSOURCING_KEYWORDS,
} from "../constants"

export const businessContent: ProductPageContent = {
  metadata: {
    title: "Easner Business Banking | Accounts, Payments & Payouts",
    description:
      "Manage multi-currency accounts, collect customer payments, send invoices, and pay suppliers and teams with Easner Business Banking, in the US and globally.",
    keywords: [
      "business account for startups",
      "business financial management",
      "cross-border B2B payouts",
      "pay international suppliers",
      "multi-currency business account",
      "business banking cross-border",
      "SME global payments",
      "cross-border payroll",
      "multi-currency SME account",
      "pay suppliers in Nigeria",
      "pay suppliers in Mexico",
      "pay suppliers in the Philippines",
      "pay suppliers in India",
      "US business account for global suppliers",
      "EU business account for cross-border trade",
      ...EASNER_DEVELOPED_MARKET_KEYWORDS,
      ...EASNER_TRADE_AND_OUTSOURCING_KEYWORDS,
    ],
  },
  hero: {
    h1: "Global banking for business",
    subhead:
      "Bring accounts, customer payments, invoices, and payouts into one dashboard. Stablecoin settlement carries cross-border payments to suppliers and teams in 80+ countries.",
    visualSlot: "mkt-hero-business-01",
    altText: "Easner Business dashboard showing currency balances, an invoice payment, and a supplier payout",
    ctas: [
      { label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "business_hero" },
      { label: "See invoicing", href: "/invoicing", analyticsLocation: "business_hero_invoicing" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Named Accounts",
      description:
        "Share USD, EUR, and GBP account details so customers pay you directly. Stablecoin deposits land in the same place.",
      visualSlot: "mkt-ui-business-accounts",
      altText: "Easner Business account details showing account name, account number, and routing number",
    },
    {
      title: "Supplier payments",
      description:
        "Pay suppliers and contractors by bank transfer, stablecoin, or local payment methods in 80+ countries.",
      visualSlot: "mkt-ui-business-send",
      altText: "Easner Business send and payout screen",
    },
    {
      title: "Collections",
      description:
        "Invoice customers, embed Checkout, share a Payment Link, or collect in person with Terminal and QR Pay.",
      visualSlot: "mkt-ui-business-collections",
      altText: "Easner Business invoicing, Checkout, Payment Links, Terminal, and QR Pay collections",
    },
    {
      title: "Team access",
      description:
        "Set the right level of access for each teammate, with payment history and reports for the whole team.",
      visualSlot: "mkt-ui-business-team",
      altText: "Easner Business team and reporting dashboard",
    },
  ],
  useCasesHeadline: "Who runs finance on Easner Business",
  useCasesSubhead:
    "For US startups, growing businesses, and established teams working locally and around the world.",
  useCases: [
    {
      title: "Startups and growing businesses",
      description: "Keep customer payments, vendor bills, and team access together as your business grows.",
    },
    {
      title: "Global trade operators",
      description:
        "Pay international suppliers and collect from buyers with virtual accounts, payouts, and audit-ready reporting.",
    },
    {
      title: "Import and export",
      description:
        "Move money across corridors for procurement and sales without juggling multiple bank portals and spreadsheets.",
    },
    {
      title: "Faith and nonprofit organizations",
      description:
        "Collect donations and mission support, then pay teams and partners from one Easner Business account.",
    },
    {
      title: "Team payments",
      description: "Run payroll for contractors and employees from the same account – approvals, pay stubs, and reconciliation.",
      link: "/payroll",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Manage client invoicing, supplier payouts, and team permissions without separate tools for each workflow.",
    },
    {
      title: "Software and SaaS",
      description:
        "Manage USD and EUR balances, pay vendors, and collect customer payments from one business account.",
    },
    {
      title: "Selling on your own website",
      description: "Embed Checkout for one-time, subscription, and custom payments, with Easner as the merchant on record.",
      link: "/checkout",
    },
    {
      title: "No website yet",
      description: "Share a Payment Link to collect customer payments without a website or code.",
      link: "/payment-links",
    },
  ],
  ctaBand: {
    headline: "Open your Easner Business account",
    subhead: "Accounts, payments, collections, and team controls for your next stage of growth.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "business_cta_band" }],
  },
}
