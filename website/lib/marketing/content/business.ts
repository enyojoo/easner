import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const businessContent: ProductPageContent = {
  metadata: {
    title: "Business Banking | Multi-Currency & Payouts",
    description:
      "Cross-border business banking on one dashboard – multi-currency accounts, payouts, invoicing, and team access. Operate internationally or pay teams in supported local markets, with KYC/KYB built in.",
    keywords: [
      "cross-border B2B payouts",
      "pay international suppliers",
      "multi-currency business account",
      "business banking cross-border",
      "SME global payments",
      "cross-border payroll",
      "multi-currency SME account",
      "pay suppliers in Nigeria",
    ],
  },
  hero: {
    h1: "Global banking for business",
    subhead:
      "One dashboard for accounts, payouts, and collections across global and local corridors – whether you operate internationally or pay teams in supported markets, with KYC/KYB and compliance built in.",
    visualSlot: "mkt-hero-business-01",
    altText: "Small business founder reviewing Easner Business dashboard",
    ctas: [
      { label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true },
      { label: "See invoicing", href: "/invoicing" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Multi-currency accounts",
      description:
        "Stablecoin powered accounts with pay-in via virtual account details and stablecoin flows.",
      visualSlot: "mkt-ui-business-accounts",
      altText: "Easner Business multi-currency accounts",
    },
    {
      title: "Send and payouts",
      description:
        "Pay suppliers, contractors, and business counterparties globally through bank, stablecoin, and regional rails where available.",
      visualSlot: "mkt-ui-business-send",
      altText: "Easner Business send and payout screen",
    },
    {
      title: "Collections",
      description:
        "Invoice customers, collect in person with Terminal, and offer QR Pay – all connected to your business dashboard.",
      visualSlot: "mkt-ui-business-collections",
      altText: "Easner Business invoicing, Terminal, and QR Pay collections",
    },
    {
      title: "Team and reporting",
      description:
        "Role-based access, customer records, transaction history, and clean reporting for finance operations.",
      visualSlot: "mkt-ui-business-team",
      altText: "Easner Business team and reporting dashboard",
    },
  ],
  useCasesHeadline: "Who runs finance on Easner Business",
  useCasesSubhead:
    "Local-market operators running global ops and US, EU, and UK companies paying suppliers and teams in supported corridors – all from one dashboard.",
  useCases: [
    {
      title: "Pay into local markets",
      description:
        "US, EU, and UK companies pay contractors and suppliers in Nigeria, Ghana, Kenya, and other supported corridors – with clear fees, status tracking, and one ledger.",
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
        "Collect diaspora donations and mission support from abroad, then pay field teams and partners across borders – from one Easner Business account.",
    },
    {
      title: "Cross-border payroll",
      description:
        "Pay contractors and employees in supported corridors with clear fees, status tracking, and reconciliation in one ledger.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Manage client invoicing, supplier payouts, and team permissions without separate tools for each workflow.",
    },
    {
      title: "Software and SaaS",
      description:
        "Hold USD or EUR balances, pay global vendors, and collect from international customers where Easner is enabled.",
    },
  ],
  ctaBand: {
    headline: "Open your Easner Business account",
    subhead: "Accounts, payouts, collections, and team controls for cross-border operators.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true }],
  },
}
