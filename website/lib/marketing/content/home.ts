import type { CardItem, Cta, FaqItem } from "../types"
import { APP_STORE_URL, BUSINESS_SIGNUP_URL, CONTACT_PATH, PLAY_STORE_URL } from "../constants"
import { DEFAULT_CTA_BAND } from "../shared-content"

export const homeMetadata = {
  title: "Easner – Stablecoin Banking Infrastructure for Global Businesses",
  description:
    "Stablecoin banking infrastructure for global money movement. Accounts, payouts, invoicing, collections, cards, and APIs with banking-simple UX and compliance built in.",
  keywords: [
    "stablecoin banking infrastructure",
    "cross-border payments",
    "global business banking",
  ],
}

export const homeHero = {
  h1Lines: ["Global banking,", "Simplified for you."],
  subhead: "Stablecoin-powered accounts, cards, payouts, collections and APIs.",
  visualSlot: "mkt-hero-home-01",
  altText: "Business professional reviewing global payments on laptop and Easner mobile app",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account" },
    { label: "Explore products", href: "#products" },
  ] satisfies Cta[],
}

export const whyEasnerPillars: CardItem[] = [
  {
    title: "Banking-simple UX",
    description:
      "Users get familiar accounts, transfers, invoices, and dashboards – not crypto complexity.",
    icon: "mkt-icon-pillar-ux",
  },
  {
    title: "Lower-cost rails",
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
    title: "Invisible infrastructure",
    description:
      "Stablecoin speed and global reach sit behind fiat-native screens where enabled.",
    icon: "mkt-icon-pillar-invisible",
  },
]

export const solutionsPersonas = [
  {
    id: "diaspora",
    label: "Freelancers, remote workers, and diaspora",
    headline: "Get paid globally. Keep more locally.",
    body: "Receive in supported global currencies, move money home on faster paths where available, and keep a clean record of every transfer with Easner Personal Banking.",
    visualSlot: "mkt-persona-diaspora",
    altText: "Remote professional using Easner on mobile",
    ctas: [
      { label: "App Store", href: APP_STORE_URL, store: "app-store" },
      { label: "Google Play", href: PLAY_STORE_URL, store: "google-play" },
    ] satisfies Cta[],
  },
  {
    id: "sme",
    label: "Cross-border SMEs and trade",
    headline: "Run global operations from one dashboard.",
    body: "Manage accounts, payouts, invoicing, collections, team access, and reporting for import/export, supplier, and contractor payments with Easner Business Banking.",
    visualSlot: "mkt-persona-sme",
    altText: "Small business owner managing international payments",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true }] satisfies Cta[],
  },
  {
    id: "dev",
    label: "Developers and platforms",
    headline: "Embed global rails without building compliance.",
    body: "Build with Easner APIs for verification, accounts, payouts, wallets, and collections, then focus your roadmap on the customer experience.",
    visualSlot: "mkt-persona-dev",
    altText: "Developer integrating payments API",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH },
    ] satisfies Cta[],
  },
]

export const corridorContent = {
  headline: "Expanding where global business meets emerging markets",
  body: "Hold USD, EUR, and GBP from global markets, then pay out locally across Africa and the region – for salaries, supplier payments, and cross-border trade, where Easner is enabled.",
  bullets: [],
  visualSlot: "mkt-map-corridors",
  altText: "Map showing payment corridors between US, EU, and African markets",
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
      "No. Easner is designed around banking-simple screens. Stablecoin infrastructure may power settlement behind the scenes where enabled.",
  },
  {
    question: "What products does Easner offer?",
    answer:
      "Easner Personal (mobile app for individuals), Easner Business (web dashboard for organizations), and Easner APIs for developers and platforms.",
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
