import type { CardItem, CtaBandContent } from "./types"
import { CONTACT_PATH } from "./constants"

export const COMPLIANCE_STRIP = {
  headline: "Compliance is built in, not added later.",
  subhead:
    "Verification, screening, limits, and transaction controls are part of the Easner account flow – so money movement can scale with confidence.",
  bullets: [
    "KYC/KYB onboarding built into the product experience",
    "AML and sanctions screening on customers and transactions",
    "Banking, wallet, and payment rails connected",
    "Access based on verification, jurisdiction, and product availability",
  ],
}

export const DEFAULT_CTA_BAND: CtaBandContent = {
  headline: "Ready to move money globally?",
  subhead:
    "Open an Easner account, or talk to us about building on Easner APIs.",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account" },
    { label: "Contact", href: CONTACT_PATH },
  ],
}

export const PERSONAL_TIERS: CardItem[] = [
  {
    title: "Global banking",
    description:
      "USD and EUR account details, pay-in and pay-out, and stablecoin flows.",
  },
  {
    title: "African banking",
    description: "NGN and regional pay-in and pay-out in local markets where we launch.",
  },
  {
    title: "Cards",
    description:
      "Your access to personal debit/credit cards for your online and physical payments.",
  },
]

export const BUSINESS_TIERS: CardItem[] = [
  {
    title: "Global banking",
    description:
      "USD and EUR account details, pay-in and pay-out, and stablecoin flows, plus other currencies where supported for your organization.",
  },
  {
    title: "African banking",
    description:
      "NGN and regional pay-in and pay-out for your business operations where we launch – local African banking for your organization.",
  },
  {
    title: "Cards",
    description:
      "Your access to corporate debit/credit cards for your business needs, spend controls, and cardholder management when approved.",
  },
]

export const TIER_FOOTNOTE =
  "Availability depends on verification, jurisdiction, approval, and product enablement."

export const PRODUCT_CARDS: CardItem[] = [
  {
    title: "Personal Banking",
    description:
      "Mobile banking for global earners – receive, send, and manage money across supported corridors.",
    link: "/personal",
    icon: "mkt-thumb-personal",
  },
  {
    title: "Business Banking",
    description:
      "A web control center for accounts, payouts, invoicing, Terminal, QR Pay, teams, and reporting.",
    link: "/business",
    icon: "mkt-thumb-business",
  },
  {
    title: "Developer APIs",
    description:
      "Embed accounts, payouts, wallets, collections, and compliance-ready workflows in your product.",
    link: "/apis",
    icon: "mkt-thumb-apis",
  },
]

export const SECONDARY_PRODUCT_CARDS: CardItem[] = [
  {
    title: "Stablecoin",
    description:
      "Stablecoin speed with banking screens – receive, send, Terminal, and QR Pay.",
    link: "/stablecoin",
    icon: "mkt-thumb-stablecoin",
  },
  {
    title: "Invoicing",
    description:
      "Invoice globally and get paid by bank or stablecoin – with status and reconciliation in one dashboard.",
    link: "/invoicing",
    icon: "mkt-thumb-invoicing",
  },
  {
    title: "Cards",
    description:
      "Corporate and personal cards with spend controls, cardholder management, and reporting built in",
    link: "/cards",
    icon: "mkt-thumb-cards",
  },
]

export const ALL_PRODUCT_CARDS: CardItem[] = [...PRODUCT_CARDS, ...SECONDARY_PRODUCT_CARDS]
