import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const businessContent: ProductPageContent = {
  metadata: {
    title: "Business Banking",
    description:
      "Cross-border business banking on one dashboard. Multi-currency accounts, payouts, invoicing, Terminal, QR Pay, and team access – with KYC/KYB and compliance built in.",
    keywords: [
      "business banking cross-border",
      "SME global payments",
      "multi-currency business account",
    ],
  },
  hero: {
    h1: "Global banking for business",
    subhead:
      "Manage multi-currency accounts, payouts, team access, and collections across global and African corridors. Stablecoin speed behind familiar banking.",
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
  useCasesHeadline: "Built for cross-border operators",
  useCasesSubhead:
    "Easner Business for SMEs that pay suppliers, collect from customers, and run finance ops across borders from one dashboard.",
  useCases: [
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
        "Collect diaspora donations and mission support from abroad, then pay field teams and partners across borders – by bank or stablecoin, with one ledger your finance team can audit.",
    },
    {
      title: "OTC and remittance agents",
      description:
        "Collect client pay-in by bank or stablecoin, execute corridor payouts, and reconcile every transaction in one ledger.",
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
