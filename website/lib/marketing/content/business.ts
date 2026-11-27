import type { AnswerDefinition, ProductPageContent } from "../types"
import {
  BUSINESS_SIGNUP_URL,
  EASNER_DEVELOPED_MARKET_KEYWORDS,
  EASNER_TRADE_AND_OUTSOURCING_KEYWORDS,
} from "../constants"

export const businessDefinition: AnswerDefinition = {
  term: "Easner Business Banking",
  question: "What is Easner Business Banking?",
  answer:
    "Easner Business Banking is the web dashboard for a company. Get USD and EUR account details in the business's name, and GBP where supported, collect by invoice, Payment Link, Checkout, Terminal, or QR Pay, and pay suppliers in 80+ countries. Personal money stays in the Easner app.",
  facts: [
    {
      term: "Who it's for",
      definition: "Startups, small businesses, and established companies from most countries, subject to verification.",
    },
    {
      term: "How customers pay you",
      definition: "Invoices, Payment Links, Checkout, Terminal, and QR Pay all settle into the same Easner Business ledger.",
    },
  ],
}

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
  definition: businessDefinition,
  faq: [
    {
      question: "Who can open an Easner Business account?",
      links: [{ label: "Verification requirements", href: "/compliance" }],
      answer:
        "Startups, small businesses, and established companies. Business accounts can be opened from 174 countries. A listed set of countries is closed for compliance and sanctions. The person who opens the account verifies their own identity.",
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
        "Yes. Invite teammates and give each one the access they need. Ease Plus adds a team of 5 with approvals. Ease Pro adds an unlimited team. Payment history and reports are for the whole team.",
    },
    {
      question: "How do customers pay my business?",
      links: [{ label: "Invoicing", href: "/invoicing" }, { label: "Payment Links", href: "/payment-links" }, { label: "Checkout", href: "/checkout" }],
      answer:
        "Send an invoice, share a payment link, embed Checkout on your website, or collect in person with Terminal and QR Pay. Every payment lands in the same Easner Business ledger.",
    },
    {
      question: "What is Easner Business?",
      answer:
        "Easner Business is the web dashboard for a company: accounts, send, invoices, Checkout, Payment Links, Payroll, Connect, cards, Terminal, QR Pay, team access, API keys, and webhooks. It is not the personal Easner app.",
    },
    {
      question: "Is Easner a business bank account?",
      answer:
        "Easner Business gives a company USD and EUR account details in its own name, and GBP where supported. Easner is a financial technology company, not a bank. It is not FDIC-insured and does not hold customer deposits. Banking services are provided by licensed partners.",
    },
    {
      question: "How do I get USD account details for my company?",
      answer:
        "Open Easner Business on the web, verify the business, and share the USD account details in the business's name. EUR account details are available too, and GBP where supported.",
    },
    {
      question: "How do I pay suppliers in Nigeria, Mexico, the Philippines, or India?",
      answer:
        "From Easner Business, pay the supplier from the company balance. Nigeria receives NGN by bank only. Mexico receives MXN by bank. The Philippines receives PHP by bank. India receives INR by bank. Fees and the exchange rate are shown before you confirm.",
    },
    {
      question: "Can my team share one business account?",
      answer:
        "Yes. Ease includes a team of 1. Ease Plus adds a team of 5 with approvals. Ease Pro adds an unlimited team. Ease is $0 a month. Ease Plus is $39 a month billed yearly, or $49 a month. Ease Pro is $159 a month billed yearly, or $199 a month. Ease Gold is agreed in a contract.",
      links: [{ label: "Pricing", href: "/pricing" }],
    },
    {
      question: "Which countries can my business pay?",
      answer:
        "Country-by-country answers for Business Banking, including the currency and payout rail for each country, are on the Answers page.",
      links: [{ label: "Answers", href: "/answers#easner-business-banking" }],
    },
  ],
  ctaBand: {
    headline: "Open your Easner Business account",
    subhead: "Accounts, collections, payouts and team controls – set up in one place.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "business_cta_band" }],
  },
}
