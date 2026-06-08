import type { CardItem, Cta, FaqItem } from "../types"
import { DEFAULT_CTA_BAND } from "../shared-content"

export const homeMetadata = {
  title: "Easner | Cross-Border Banking, Payouts & Stablecoin Rails",
  description:
    "Stablecoin-powered accounts, payouts, collections, cards, and partner programs. Familiar banking screens with compliance built in. Easner is a fintech company, not a bank.",
  keywords: [
    "stablecoin banking infrastructure",
    "cross-border payments",
    "global business banking",
    "Africa cross-border payments",
    "diaspora banking",
    "white-label remittance",
  ],
}

export const homeHero = {
  h1Lines: ["Global banking,", "Simplified."],
  subhead:
    "Stablecoin-powered accounts, payouts, collections, cards, and partner programs. Hold USD and EUR, pay out across Africa and global corridors. Familiar banking screens with compliance built in.",
  visualSlot: "mkt-hero-home-01",
  altText: "Easner Business dashboard overview",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account" },
    { label: "Explore products", href: "#products" },
  ] satisfies Cta[],
}

export const whyEasnerHeadline = "Why teams choose Easner"

export const whyEasnerPillars: CardItem[] = [
  {
    title: "No crypto complexity",
    description:
      "Send, receive, invoice, and manage money in screens that feel like banking – not a trading app.",
    icon: "mkt-icon-pillar-ux",
  },
  {
    title: "Move more, spend less",
    description:
      "Modern settlement can reduce cross-border cost vs legacy paths – up to ~60% in supported flows.",
    icon: "mkt-icon-pillar-cost",
  },
  {
    title: "Compliance-ready",
    description:
      "KYC/KYB, AML screening, limits, and transaction controls are built in from day one.",
    icon: "mkt-icon-pillar-compliance",
  },
  {
    title: "Speed without the noise",
    description:
      "Stablecoin speed and global reach sit behind fiat-native screens.",
    icon: "mkt-icon-pillar-invisible",
  },
]

export const solutionsPersonas = [
  {
    id: "diaspora",
    label: "Freelancers, remote workers, and diaspora",
    headline: "Get paid globally. Keep more locally.",
    body: "Receive in supported global currencies, move money home on faster paths, and keep a clean record of every transfer with Easner Personal Banking.",
    visualSlot: "mkt-persona-diaspora",
    altText: "Remote professional using Easner on mobile",
    ctas: [{ label: "Explore Personal Banking", href: "/personal" }] satisfies Cta[],
  },
  {
    id: "sme",
    label: "Cross-border SMEs and trade",
    headline: "Run global operations from one dashboard.",
    body: "Manage accounts, payouts, invoicing, collections, team access, and reporting for import/export, supplier, and contractor payments with Easner Business Banking.",
    visualSlot: "mkt-persona-sme",
    altText: "Small business owner managing international payments",
    ctas: [{ label: "Explore Business Banking", href: "/business" }] satisfies Cta[],
  },
  {
    id: "otc",
    label: "OTC and money transfer agents",
    headline: "Compliant transfers under your brand.",
    body: "Run OTC and money transfer flows on Easner infrastructure under the hood. Move away from undocumented transactions with a built-in compliance and a full audit trail on transfers.",
    visualSlot: "mkt-persona-otc",
    altText: "Money transfer agent at service counter",
    ctas: [{ label: "Explore Partners", href: "/partners" }] satisfies Cta[],
  },
  {
    id: "dev",
    label: "Developers and platforms",
    headline: "Embed global rails. Compliance included.",
    body: "Build with Easner's embedded payments API for verification, accounts, payouts, wallets, and collections, then focus your roadmap on the customer experience.",
    visualSlot: "mkt-persona-dev",
    altText: "Developer integrating payments API",
    ctas: [{ label: "Explore Developers", href: "/developers" }] satisfies Cta[],
  },
]

export const corridorContent = {
  headline: "Expanding where global business meets emerging markets",
  body: "Hold USD, EUR, and GBP from global markets, then pay out locally across Africa and the region – for salaries, supplier payments, and cross-border trade.",
  bullets: [],
  visualSlot: "mkt-map-corridors",
  altText: "Map showing payment corridors between US, EU, and African markets",
  ctas: [{ label: "Open Account", href: "#", action: "open-account" }] satisfies Cta[],
}

export const homeCtaBand = DEFAULT_CTA_BAND

export const homeFaq: FaqItem[] = [
  {
    question: "Is Easner a bank?",
    answer:
      "No. Easner is a financial technology company. Regulated banking, payment, and verification services are provided by licensed partners.",
  },
  {
    question: "Do I need to understand crypto to use Easner?",
    answer:
      "No. Easner is designed around familiar banking screens. Stablecoin infrastructure may power settlement behind the scenes.",
  },
  {
    question: "What products does Easner offer?",
    answer:
      "Easner Personal Banking (Easner Mobile), Easner Business Banking (Easner Business), and Easner for Partners (Agency Model and Developer Model).",
  },
  {
    question: "Are fees zero?",
    answer:
      "Fees and exchange rates may apply depending on product and corridor. Applicable fees are shown before you confirm a transaction.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "Availability varies by jurisdiction, verification tier, and partner rules. See our KYC/KYB and AML Policy for eligibility details.",
  },
]
