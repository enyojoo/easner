import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL, EASNER_SUPPORTED_LOCAL_MARKETS } from "../constants"

export const payrollContent: ProductPageContent = {
  metadata: {
    title: "Payroll | Cross-Border Payroll & Approvals",
    description:
      "Pay contractors and employees across borders with approvals, pay stubs, and reconciliation built in – on one ledger with Easner Business.",
    keywords: [
      "cross-border payroll",
      "international contractor payroll",
      "global payroll platform",
      "pay international contractors",
      "payroll approvals software",
      "multi-currency payroll",
    ],
  },
  hero: {
    h1: "Payroll for cross-border teams",
    subhead:
      "Run payroll for contractors and employees in supported corridors – approvals, pay stubs, and reconciliation on the same ledger as your accounts and payouts.",
    visualSlot: "mkt-hero-payroll-01",
    altText: "Easner Business payroll run overview",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "payroll_hero" }],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Approvals built in",
      description:
        "Set up maker-checker approvals so payroll runs are reviewed and authorized before funds move – no separate approval tool.",
      visualSlot: "mkt-ui-payroll-approvals",
      altText: "Easner Business payroll approval flow",
    },
    {
      title: "Pay stubs and records",
      description:
        "Generate pay stubs automatically for every run, with a clear record for your team and your payees.",
      visualSlot: "mkt-ui-payroll-stubs",
      altText: "Easner Business payroll pay stub",
    },
    {
      title: "Payee self-service",
      description:
        "Payees connect and manage how they receive funds from Easner Mobile – no back-and-forth to collect payment details.",
      visualSlot: "mkt-ui-payroll-mobile",
      altText: "Easner Mobile payee payroll connection screen",
    },
    {
      title: "Reconciliation on one ledger",
      description:
        "Payroll runs settle alongside your other payouts, invoices, and card activity in Easner Business – one place for finance to reconcile.",
      visualSlot: "mkt-ui-payroll-reconcile",
      altText: "Easner Business payroll reconciled in the unified ledger",
    },
  ],
  useCasesHeadline: "Built for distributed teams",
  useCasesSubhead: `Pay contractors and employees in ${EASNER_SUPPORTED_LOCAL_MARKETS} with clear fees and status tracking.`,
  useCases: [
    {
      title: "Remote-first companies",
      description:
        "Run payroll for a distributed team without a separate contractor-payments tool for every corridor.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Pay contractors and freelancers on the same account you use for client invoicing and supplier payouts.",
    },
    {
      title: "Cross-border SMEs",
      description:
        "Add payroll to the accounts and payouts you already run in Easner Business, with one ledger for finance.",
    },
  ],
  ctaBand: {
    headline: "Add payroll to your Easner Business account",
    subhead: "Approvals, pay stubs, and reconciliation for cross-border teams.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "payroll_cta_band" }],
  },
  complianceNote:
    "Payees go through the same verification as any Easner account before they can receive a payroll run.",
}
