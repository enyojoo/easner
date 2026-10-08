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
      "Get account details in your name, collect customer payments, send invoices, and pay suppliers in 80+ countries from one Easner Business dashboard.",
    keywords: [
      "business account details in your name",
      "accept invoice and checkout payments",
      "team access business account",
      "pay suppliers with stablecoin",
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
      "Account details in your business's name, customer payments, invoices and payouts to 80+ countries – in one dashboard, on stablecoin-native rails.",
    visualSlot: "mkt-hero-business-01",
    altText: "Easner Business total balance with recent activity: an invoice paid, a local transfer and a payroll run",
    ctas: [
      { label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "business_hero" },
      { label: "See invoicing", href: "/invoicing", analyticsLocation: "business_hero_invoicing" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Accounts in your name",
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
      title: "Agencies and consultancies",
      description:
        "Manage client invoicing, supplier payouts, and team permissions without separate tools for each workflow.",
    },
    {
      title: "Software and SaaS",
      description:
        "Manage USD and EUR balances, pay vendors, and collect customer payments from one business account.",
    },
  ],
  useCaseLinks: [
    { label: "Run payroll", href: "/payroll" },
    { label: "Sell on your website", href: "/checkout" },
    { label: "Get paid with a link", href: "/payment-links" },
  ],
  faq: [
    {
      question: "Who can open an Easner Business account?",
      links: [{ label: "Verification requirements", href: "/compliance" }],
      answer:
        "Startups, small businesses and established companies from most countries. A small number of jurisdictions are excluded for compliance and sanctions reasons.",
    },
    {
      question: "What do I need to verify my business?",
      answer:
        "Your business registration details, the people who own and control it, and identity verification for each owner. You can track every step from your dashboard.",
    },
    {
      question: "Which currencies can my business hold?",
      answer:
        "USD and EUR account details in your business's name, plus GBP and other currencies where supported for your organisation. Stablecoin deposits land in the same place where enabled.",
    },
    {
      question: "How do I pay suppliers and contractors abroad?",
      answer:
        "Send from your balance to bank accounts, mobile money or stablecoin wallets in 80+ countries. The rate and fees are shown before you confirm, and each payment carries its own status.",
    },
    {
      question: "Can my team use the account?",
      answer:
        "Yes. Invite teammates and give each one the access they need, with payment history and reports for the whole team.",
    },
    {
      question: "How do customers pay my business?",
      links: [{ label: "Invoicing", href: "/invoicing" }, { label: "Payment Links", href: "/payment-links" }, { label: "Checkout", href: "/checkout" }],
      answer:
        "Send an invoice, share a payment link, embed Checkout on your website, or collect in person with Terminal and QR Pay. Every payment lands in the same Easner Business ledger.",
    },
  ],
  ctaBand: {
    headline: "Open your Easner Business account",
    subhead: "Accounts, collections, payouts and team controls – set up in one place.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "business_cta_band" }],
  },
}
