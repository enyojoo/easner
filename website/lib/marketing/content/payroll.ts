import type { AnswerDefinition, ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const payrollDefinition: AnswerDefinition = {
  term: "Easner Payroll",
  question: "What is Easner Payroll?",
  answer:
    "Easner Payroll pays employees and contractors in 80+ countries from your Easner Business balance, with approvals, pay stubs, and payment records on the same ledger.",
  facts: [
    {
      term: "Who you can pay",
      definition: "Employees and contractors in 80+ countries, paid from your Easner Business balance.",
    },
    {
      term: "Approvals",
      definition: "Each payday is reviewed before money moves. Maker-checker means the drafter is not the only signer.",
    },
  ],
}

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
        "Payees connect and manage how they receive funds from the Easner app – no back-and-forth to collect payment details.",
      visualSlot: "mkt-ui-payroll-mobile",
      altText: "Easner app payee payroll connection screen",
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
  definition: payrollDefinition,
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
    {
      question: "How do I pay contractors in another country?",
      answer:
        "Add them in Easner Business and pay them from the business balance in 80+ countries. In the Easner app, on iPhone, Android, or the web, each person chooses an EASETAG, a bank account, or mobile money. A second person approves the payday before money moves.",
    },
    {
      question: "Does Easner payroll have approvals and pay stubs?",
      answer:
        "Yes. A second person approves each payday before money moves, and a pay stub is generated for every payment. Finance sees the run on the same ledger.",
    },
    {
      question: "Does Easner payroll collect a W-4?",
      answer:
        "A US employee provides a W-4 and an I-9 before the first payday, and can update the W-4 in the Easner app. This is for the company's own employees, not for Connect payees.",
    },
    {
      question: "Do contractors get a 1099-NEC?",
      answer:
        "When a year-end form applies, a contractor receives a 1099-NEC in the Easner app, with their pay stubs. A US contractor provides a W-9. Easner does not file with the IRS. The employer stays the filer.",
    },
    {
      question: "Do employees get a W-2?",
      answer:
        "When a year-end form applies, an employee receives a W-2 in the Easner app, with their pay stubs. The employer stays the filer.",
    },
    {
      question: "Which tax form does an international contractor sign?",
      answer:
        "A contractor outside the US provides a W-8BEN. A US contractor provides a W-9.",
    },
    {
      question: "Easner Payroll vs Easner Connect?",
      answer:
        "Payroll pays the company's own employees and contractors, with approvals and pay stubs. Connect pays people who are not employees into their own Easner accounts. Unlimited payroll is on Ease Pro.",
      links: [{ label: "Connect", href: "/connect" }],
    },
    {
      question: "Can I pay contractors by direct deposit?",
      answer:
        "Yes. Payroll pays the company's own contractors from the Easner Business balance in 80+ countries. Each person connects in the Easner app on iPhone, Android, or the web and chooses an EASETAG, a bank account, or mobile money.",
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
