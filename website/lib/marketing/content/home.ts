import type { CardItem, Cta, FaqItem } from "../types"
import { EASNER_CANONICAL_DEFINITION } from "../constants"
import { DEFAULT_CTA_BAND } from "../shared-content"

export const homeMetadata = {
  title: "Easner | Stablecoin-Native Banking & Payment Infrastructure",
  description:
    "Stablecoin-native banking and payment infrastructure with account details in your name, multi-currency balances, and payouts to 80+ countries.",
  keywords: [
    "stablecoin-native banking infrastructure",
    "personal banking app",
    "business banking United States",
    "multi-currency personal account",
    "multi-currency business account",
    "USD accounts",
    "business payments",
    "send and receive money",
    "global banking platform",
    "invoicing and payroll",
    "international payments",
  ],
}

export const homeHero = {
  h1Lines: ["Your Money.", "Moved with Ease."],
  subhead:
    "Stablecoin-native banking and payment infrastructure that lets you bank, spend, and send money to people and businesses in 80+ countries.",
  visualSlot: "mkt-hero-home-01",
  altText: "Easner Business home showing a total balance, money in and out, and recent payments with their status",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account", analyticsLocation: "homepage_hero" },
    { label: "Explore products", href: "#products" },
  ] satisfies Cta[],
}

export const whyEasnerHeadline = "Why choose Easner"

export const whyEasnerPillars: CardItem[] = [
  {
    title: "An account in your name",
    description:
      "USD, EUR, and GBP details in your name once verified. Top up by card, Apple Pay, or ACH Direct.",
    icon: "pillar-account",
  },
  {
    title: "Reach 80+ countries",
    description:
      "Pay suppliers, contractors, and family across Africa, Latin America, Asia, and Europe.",
    icon: "pillar-reach",
  },
  {
    title: "Money that moves fast",
    description:
      "Payouts typically land in minutes to hours, same-day where supported, and you can follow each one in your account.",
    icon: "pillar-speed",
  },
  {
    title: "Dollars or stablecoins",
    description:
      "Receive USDC and EURC alongside your currency balances, and send to wallets or local accounts.",
    icon: "pillar-stablecoin",
  },
]

export const solutionsPersonas = [
  {
    id: "diaspora",
    label: "Personal Banking",
    headline: "Get paid in dollars. Pay anyone, anywhere.",
    body: "Hold USD and EUR, get paid to account details in your name, and send to bank accounts and mobile money in 80+ countries – all from the Easner app.",
    visualSlot: "mkt-persona-diaspora",
    altText: "Remote professional using Easner on mobile",
    ctas: [{ label: "Explore Personal Banking", href: "/personal", analyticsLocation: "homepage_persona_diaspora" }] satisfies Cta[],
  },
  {
    id: "sme",
    label: "Business Banking",
    headline: "Get paid. Pay your people. Keep track.",
    body: "Collect customer payments, pay suppliers and contractors, and give your team the access they need. Run your business finances from one dashboard, whether you work locally or globally.",
    visualSlot: "mkt-persona-sme",
    altText: "Small business owner managing international payments",
    ctas: [{ label: "Explore Business Banking", href: "/business", analyticsLocation: "homepage_persona_sme" }] satisfies Cta[],
  },
  {
    id: "otc",
    label: "Deploy Easner",
    headline: "Cross-border payments under your brand",
    body: "Build a branded payment program with Easner handling the underlying infrastructure, verification flows, and supported payout connections.",
    visualSlot: "mkt-persona-otc",
    altText: "Partner operator managing branded cross-border transfers",
    ctas: [{ label: "Explore Partners", href: "/partners", analyticsLocation: "homepage_persona_otc" }] satisfies Cta[],
  },
  {
    id: "dev",
    label: "Easner API",
    headline: "Build payments into your product",
    body: "Connect verification, accounts, collections, and international payouts to your platform through Easner APIs and webhooks.",
    visualSlot: "mkt-persona-dev",
    altText: "Developers integrating the Easner API",
    ctas: [{ label: "Explore Developers", href: "/developers", analyticsLocation: "homepage_persona_dev" }] satisfies Cta[],
  },
]

export const corridorContent = {
  headline: "At home. Around the world.",
  body: "Hold USD and EUR, and GBP where supported. Pay out to bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia and Europe, typically within minutes to hours.",
  bullets: [],
  visualSlot: "mkt-map-corridors",
  altText:
    "Map showing payment corridors between US, EU, UK, and supported local markets including Nigeria, Mexico, Philippines, India, and China",
  ctas: [{ label: "Open Account", href: "#", action: "open-account", analyticsLocation: "homepage_corridor" }] satisfies Cta[],
}

export const homeCtaBand = DEFAULT_CTA_BAND

export const homeFaq: FaqItem[] = [
  {
    question: "What is Easner?",
    answer: EASNER_CANONICAL_DEFINITION,
  },
  {
    question: "Is Easner a bank?",
    answer:
      "No. Easner is a financial technology company. Banking and payment services are provided by licensed partners, and every customer is verified and screened before money moves.",
    links: [{ label: "KYC/KYB and AML Policy", href: "/compliance" }],
  },
  {
    question: "Should I open a personal or a business account?",
    answer:
      "Choose Easner Personal Banking for your own money – it runs in the Easner app on iPhone and Android. Choose Easner Business Banking for company accounts, customer payments, invoicing, payroll and team access on the web. Easner accepts signups from most countries; a small number are excluded for compliance and sanctions reasons.",
    links: [
      { label: "Personal Banking", href: "/personal" },
      { label: "Business Banking", href: "/business" },
    ],
  },
  {
    question: "How do I get paid from abroad?",
    answer:
      "Share the USD or EUR account details in your name – or GBP where supported – and payments land in your balance. You can also receive stablecoins to a deposit address where enabled, and businesses can collect with invoices, Checkout and Payment Links.",
    links: [
      { label: "Receive with Personal Banking", href: "/personal" },
      { label: "Invoice international customers", href: "/invoicing" },
    ],
  },
  {
    question: "Where can I send money, and how long does it take?",
    answer:
      "To bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia and Europe. Transfers typically arrive in minutes to hours, same-day where supported, and the fee, the rate and what your recipient gets are shown before you confirm.",
    links: [{ label: "Check eligibility and restrictions", href: "/compliance" }],
  },
  {
    question: "Do I need to understand crypto to use Easner?",
    answer:
      "No. You see balances, payments and recipients, the same as any banking app – there are no wallets or networks to manage. Settlement runs on stablecoin rails behind the scenes, which is how Easner moves money across borders faster.",
    links: [{ label: "How stablecoin payments work", href: "/stablecoin" }],
  },
]
