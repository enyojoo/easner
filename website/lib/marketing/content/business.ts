import type { ProductPageContent } from "../types"
import { ACCESS_PATH } from "../constants"

export const businessContent: ProductPageContent = {
  metadata: {
    title: "Business Banking – Easner",
    description:
      "Cross-border business banking on one dashboard. Multi-currency accounts, payouts, invoicing, Terminal, QR Pay, and team access – with KYC/KYB and compliance built in.",
    keywords: [
      "business banking cross-border",
      "SME global payments",
      "multi-currency business account",
    ],
  },
  hero: {
    h1: "Business banking built on Stablecoin",
    subhead:
      "Easner Business gives organizations one web control center for onboarding, accounts, payouts, team access, reporting, and collections – including invoicing, Terminal, and QR Pay where enabled.",
    visualSlot: "mkt-hero-business-01",
    altText: "Small business founder reviewing Easner Business dashboard",
    ctas: [
      { label: "Open Business account", href: ACCESS_PATH },
      { label: "See invoicing", href: "/invoicing" },
    ],
  },
  problem: {
    headline: "Global trade shouldn't mean fragmented tools.",
    body: "Cross-border SMEs juggle bank portals, spreadsheets, informal FX, and manual reconciliation to pay suppliers, collect from customers, and manage treasury. Slow settlement and unclear fees can quietly eat into every deal.",
  },
  features: [
    {
      title: "Multi-currency accounts",
      description:
        "USD, EUR, and other supported currencies, with virtual account details and stablecoin flows where enabled.",
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
        "Create invoices, collect in person with Terminal, and offer QR Pay where enabled – all connected to your business dashboard.",
    },
    {
      title: "Team and reporting",
      description:
        "Role-based access, customer records, transaction history, and clean reporting for finance operations.",
    },
  ],
  useCases: [
    {
      title: "Import / export",
      description:
        "Pay international suppliers and collect from buyers with clear audit trails.",
    },
    {
      title: "Tuition and services",
      description:
        "Invoice overseas clients; accept bank or stablecoin pay-in on one invoice.",
    },
    {
      title: "Distributed teams",
      description:
        "Payout contractors across corridors from a single business account.",
    },
  ],
  ctaBand: {
    headline: "Open your Easner Business account.",
    subhead: "Accounts, payouts, collections, and team controls for cross-border operators.",
    ctas: [{ label: "Get Started", href: ACCESS_PATH }],
  },
  faq: [
    {
      question: "Who can use Easner Business?",
      answer:
        "Registered businesses in supported jurisdictions that complete organization KYB.",
    },
    {
      question: "Can I invite team members?",
      answer: "Yes. Account owners control who can access the organization dashboard.",
    },
    {
      question: "Does Easner Business include invoicing?",
      answer:
        "Yes. See our Invoicing page. Terminal and QR Pay are part of our stablecoin collections infrastructure.",
    },
    {
      question: "Are stablecoin features required?",
      answer:
        "No. Use fiat rails where available. Stablecoin pay-in and wallet features are optional where enabled.",
    },
    {
      question: "How are fees structured?",
      answer:
        "Fees and FX may apply by product and corridor. Amounts are shown before you confirm transactions.",
    },
  ],
}
