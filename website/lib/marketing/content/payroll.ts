import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const payrollContent: ProductPageContent = {
  metadata: {
    title: "Global Payroll | Pay Employees & Contractors",
    description:
      "Pay employees and contractors in 80+ countries, with approvals, pay stubs, and payment records on the same balance as the rest of Easner Business.",
    keywords: [
      "payroll approvals before payday",
      "contractor pay stubs",
      "off-cycle payments and bonuses",
      "pay employees to mobile money",
      "cross-border payroll",
      "international contractor payroll",
      "global payroll platform",
      "pay international contractors",
      "payroll approvals software",
      "multi-currency payroll",
      "pay contractors in Nigeria",
      "pay contractors in the Philippines",
      "pay contractors in China",
      "remote team payroll Africa",
      "contractor payments Latin America",
      "pay remote employees globally",
      "offshore outsourcing payments",
      "nearshore payroll Latin America",
      "pay overseas contractors",
      "cross-border payroll for agencies",
      "payroll for offshore teams",
      "payroll for nearshore teams",
    ],
  },
  hero: {
    h1: "Your team. Your payroll. Together.",
    subhead:
      "Pay contractors and employees in supported markets from Easner Business, on stablecoin infrastructure. Review and approve each payroll run, generate pay stubs, and keep your payment records together.",
    visualSlot: "mkt-hero-payroll-01",
    altText: "The next payday with funding and approval status, above recent paydays",
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
      altText: "A pay stub in the Easner app with pay items and net pay",
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
      altText: "Recent paydays with totals and status",
    },
  ],
  useCasesHeadline: "Built for distributed teams",
  useCasesSubhead: "Pay contractors and employees with approvals, pay stubs, and payment records in one place.",
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
  faq: [
    {
      question: "Who can I pay with Easner Payroll?",
      answer:
        "Employees and contractors in 80+ countries, paid from your Easner Business balance.",
    },
    {
      question: "How do people choose how they get paid?",
      answer:
        "Each person connects to your payroll in the Easner app and chooses where they're paid – an EASETAG, a bank account or mobile money – so you don't collect payment details by hand.",
    },
    {
      question: "How do approvals work?",
      answer:
        "Each payday is reviewed and approved before any money moves. Maker-checker approvals mean the person who drafts a run isn't the only one who signs it off.",
    },
    {
      question: "Do people get pay stubs?",
      answer:
        "Yes. A pay stub is generated for every payment, with pay items and net pay, and people can download it from the Easner app.",
    },
    {
      question: "Can I run off-cycle payments and bonuses?",
      answer:
        "Yes. Add an off-cycle payment, such as a bonus, alongside your regular paydays, with the same approvals and records.",
    },
    {
      question: "Where do payroll payments show up for finance?",
      answer:
        "Payroll settles alongside your other payouts, invoices and card activity in Easner Business, so finance reconciles in one place.",
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
