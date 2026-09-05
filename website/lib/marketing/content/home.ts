import type { CardItem, Cta, FaqItem } from "../types"
import {
  EASNER_AUDIENCE_A,
  EASNER_AUDIENCE_B,
  EASNER_CANONICAL_DEFINITION,
  EASNER_CORRIDOR_COVERAGE_FAQ,
  EASNER_SIGNUP_ELIGIBILITY_FAQ,
} from "../constants"
import { DEFAULT_CTA_BAND } from "../shared-content"

export const homeMetadata = {
  title: "Easner | Global Banking, Payments & Multi-Currency Accounts",
  description:
    "Personal and business banking with multi-currency accounts, customer payments, cards, and global payouts. Manage everyday money and business finances with Easner.",
  keywords: [
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
    "Bank, spend, and send with Easner Personal Banking. Bring your business accounts, customer payments, cards, and payouts together with Easner Business Banking.",
  visualSlot: "mkt-hero-home-01",
  altText: "Easner dashboard showing currency accounts, an incoming payment, and a supplier payment",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account", analyticsLocation: "homepage_hero" },
    { label: "Explore products", href: "#products" },
  ] satisfies Cta[],
}

export const whyEasnerHeadline = "Why choose Easner"

export const whyEasnerPillars: CardItem[] = [
  {
    title: "Add money fast",
    description:
      "Fund your balance with card, Apple Pay, Google Pay, or ACH Direct, then send from the same account.",
    icon: "mkt-icon-pillar-ux",
  },
  {
    title: "Send to 80+ countries",
    description:
      "Pay people and businesses across Africa, Latin America, Asia, and Europe. Coverage varies by destination.",
    icon: "mkt-icon-pillar-invisible",
  },
  {
    title: "Less lost to fees",
    description:
      "Stablecoin settlement can cut cross-border cost by up to ~60% in supported corridors.",
    icon: "mkt-icon-pillar-cost",
  },
  {
    title: "Compliance built in",
    description:
      "Verification, screening, and limits come standard, not bolted on later.",
    icon: "mkt-icon-pillar-compliance",
  },
]

export const solutionsPersonas = [
  {
    id: "diaspora",
    label: "Personal Banking",
    headline: "Your everyday. Your next big thing.",
    body: "Get paid, send money, and keep track of your balances in one account. Easner Personal fits your everyday finances and the places life takes you.",
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
    headline: "Cross-border payments under your brand.",
    body: "Build a branded payment program with Easner handling the underlying infrastructure, verification flows, and supported payout connections.",
    visualSlot: "mkt-persona-otc",
    altText: "Partner operator managing branded cross-border transfers",
    ctas: [{ label: "Explore Partners", href: "/partners", analyticsLocation: "homepage_persona_otc" }] satisfies Cta[],
  },
  {
    id: "dev",
    label: "Easner API",
    headline: "Build payments into your product.",
    body: "Connect verification, accounts, collections, and international payouts to your platform through Easner APIs and webhooks.",
    visualSlot: "mkt-persona-dev",
    altText: "Developer integrating payments API",
    ctas: [{ label: "Explore Developers", href: "/developers", analyticsLocation: "homepage_persona_dev" }] satisfies Cta[],
  },
]

export const corridorContent = {
  headline: "At home. Around the world.",
  body: "Hold a balance in USD and other major currencies, then pay people and businesses in 80+ countries. Payment methods and coverage vary by destination.",
  bullets: [],
  visualSlot: "mkt-map-corridors",
  altText:
    "Map showing payment corridors between US, EU, UK, and supported local markets including Nigeria, Mexico, Philippines, India, and China",
  ctas: [{ label: "Open Account", href: "#", action: "open-account", analyticsLocation: "homepage_corridor" }] satisfies Cta[],
}

export const homeCtaBand = DEFAULT_CTA_BAND

export const homeFaq: FaqItem[] = [
  {
    question: "How can I receive international payments?",
    answer: "Use the account details or stablecoin deposit address available in your Easner account and follow the Receive instructions. Businesses can also use invoices, Checkout, and Payment Links. Available currencies and payment methods depend on your account, location, and verification.",
    links: [{ label: "Receive with Easner Personal", href: "/personal" }, { label: "Invoice international customers", href: "/invoicing" }],
  },
  {
    question: "How long does an international transfer take?",
    answer: "Timing depends on the payment method, destination, banking hours, and any verification or partner checks. Review the information available for your transfer before confirming, and follow its status in your account. There is no single delivery time for every route.",
    links: [{ label: "Contact support", href: "/contact" }],
  },
  {
    question: "What is Easner?",
    answer: EASNER_CANONICAL_DEFINITION,
  },
  {
    question: "Who is Easner for?",
    answer: `${EASNER_AUDIENCE_A} ${EASNER_AUDIENCE_B}`,
    links: [{ label: "Explore Personal", href: "/personal" }, { label: "Explore Business", href: "/business" }],
  },
  {
    question: "Is Easner a bank?",
    answer:
      "No. Easner is a financial technology company. Regulated banking, payment, and verification services are provided by licensed partners.",
  },
  {
    question: "Do I need to understand crypto to use Easner?",
    answer:
      "No. You see balances, payments, and recipients, the same as any banking app. There are no wallets or networks to manage. Stablecoin settlement runs behind the scenes.",
  },
  {
    question: "What products does Easner offer?",
    answer:
      "Easner has two core products: Easner Personal Banking for accounts, cards, and sending and receiving money; and Easner Business Banking for accounts, payment collections, cards, and payouts. Business capabilities include Invoicing, Checkout, Payment Links, and Payroll. Partners and developers can also build with Easner.",
  },
  {
    question: "What fees and exchange rates apply?",
    answer:
      "Fees and exchange rates may apply depending on product and corridor. Applicable fees are shown before you confirm a transaction.",
  },
  {
    question: "Where can I send money with Easner?",
    answer: EASNER_CORRIDOR_COVERAGE_FAQ,
    links: [{ label: "Check eligibility and restrictions", href: "/compliance" }],
  },
  {
    question: "Can I sign up for Easner from any country?",
    answer: EASNER_SIGNUP_ELIGIBILITY_FAQ,
    links: [{ label: "Verification requirements", href: "/compliance" }],
  },
  {
    question: "Can I use Easner for everyday finances in the US?",
    answer:
      "Yes. Easner serves personal and business customers in the US. Manage balances, receive payments, and pay people and businesses, with international capabilities when you need them.",
  },
  {
    question: "Does Easner offer both personal and business accounts?",
    answer:
      "Yes. Easner Personal is for your own money and everyday payments. Easner Business brings company accounts, customer payments, invoicing, payroll, and team access together. Choose the account that fits how you plan to use Easner.",
  },
]
