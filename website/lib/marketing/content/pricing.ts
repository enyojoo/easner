import type { AnswerDefinition, FaqItem } from "../types"
import { BUSINESS_SIGNUP_URL, CONTACT_PATH } from "../constants"

export const pricingMetadata = {
  title: "Pricing | Accounts, Payouts, Invoicing & Payroll",
  description:
    "Banking services and essential business tools are always $0 a month – with more plans available as your business grows.",
  keywords: [
    "Easner business pricing",
    "Ease plan",
    "Ease Plus",
    "Ease Pro",
    "Ease Gold",
    "business account $0 a month",
    "business banking plans",
    "invoicing plan",
    "payroll plan",
    "business payout pricing",
    "annual business account",
  ],
}

export const pricingDefinition: AnswerDefinition = {
  term: "Easner business plans",
  question: "How much does Easner Business cost?",
  answer:
    "Banking services and essential business tools are always $0 a month, with more plans available as the business grows. Ease Plus is $39 a month billed yearly, or $49 a month, and saves $120 a year on annual billing. Ease Pro is $159 a month billed yearly, or $199 a month, and saves $480 a year. Ease Gold is agreed in a contract.",
  facts: [
    {
      term: "Ease",
      definition:
        "$0 a month. Transfer fee 1%, deposit fee 0.50%, express deposit 4.04%, checkout card payments 3.50% + $1.00, checkout bank payments 1.40% + $1.00, standard support, USD, EUR, GBP, and Stablecoin, 1 virtual card, a team of 1, 10 invoices a month, and API keys and webhooks.",
    },
    {
      term: "Ease Plus",
      definition:
        "$39 a month, billed yearly, or $49 a month. Saves $120 a year on annual billing. Transfer fee 0.5%, deposit fee 0.40%, everything in Ease, a team of 5 with approvals, 5 cards, and unlimited invoices.",
    },
    {
      term: "Ease Pro",
      definition:
        "$159 a month, billed yearly, or $199 a month. Saves $480 a year on annual billing. Transfer fee 0.25%, deposit fee 0.35%, checkout card payments 3.30% + $1.00, checkout bank payments 1.20% + $0.70, Connect at $0.50 + 0.50% capped at $15, priority support, a relationship with Easner, an unlimited team, a card for each person, and unlimited payroll.",
    },
    {
      term: "Ease Gold",
      definition:
        "Talk to us. Including pricing for Banking API, Connect, Checkout, and White-label. Transfer fee and deposit fee are Contract. Higher limits for API and webhooks.",
    },
    {
      term: "Easner Connect",
      definition:
        "The live fee for paying a payee. Ease and Ease Plus do not include it. On Ease Pro each payment costs $0.50 plus 0.50%, capped at $15. On Ease Gold the fee is Contract.",
    },
  ],
}

export const pricingFaq: FaqItem[] = [
  {
    question: "How much does an Easner business plan cost?",
    answer:
      "Ease is $0 a month. Ease Plus is $39 a month billed yearly, or $49 a month. Ease Pro is $159 a month billed yearly, or $199 a month. Ease Gold is agreed in a contract.",
  },
  {
    question: "What does Ease include?",
    answer:
      "Transfer fee 1%, deposit fee 0.50%, express deposit 4.04%, checkout card payments 3.50% + $1.00, checkout bank payments 1.40% + $1.00, standard support, USD, EUR, GBP, and Stablecoin, 1 virtual card, a team of 1, 10 invoices a month, and API keys and webhooks.",
  },
  {
    question: "What do Ease Plus and Ease Pro add?",
    answer:
      "Ease Plus is for a business that invoices and pays a team: transfer fee 0.5%, deposit fee 0.40%, everything in Ease, a team of 5 with approvals, 5 cards, and unlimited invoices. Ease Pro is for a larger team: transfer fee 0.25%, deposit fee 0.35%, checkout card payments 3.30% + $1.00, checkout bank payments 1.20% + $0.70, Connect at $0.50 + 0.50% capped at $15, priority support, a relationship with Easner, an unlimited team, a card for each person, and unlimited payroll.",
  },
  {
    question: "How do I choose Ease Gold?",
    answer:
      "Ease Gold is agreed in a contract. Talk to us from the pricing page. Opening an account does not pre-select Ease Plus, Ease Pro, or Ease Gold.",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    question: "What is the checkout fee?",
    answer:
      "Card payments are 3.50% + $1.00 on Ease and Ease Plus, and 3.30% + $1.00 on Ease Pro. Bank payments are 1.40% + $1.00 on Ease and Ease Plus, and 1.20% + $0.70 on Ease Pro. On those plans, 0.80% of the bank rate is capped at $5. Ease Gold is Contract. Customers pay the listed price. The fee comes out of what the business receives.",
  },
  {
    question: "What does Easner Connect cost?",
    answer:
      "Connect fee is the live fee for paying a payee. Ease and Ease Plus do not include it. On Ease Pro each payment costs $0.50 plus 0.50%, capped at $15. Ease Gold is Contract.",
    links: [{ label: "Easner Connect", href: "/connect" }, { label: "Talk to us", href: "/contact" }],
  },
  {
    question: "Which plan should I choose?",
    answer:
      "Ease is for accounts, payouts, and collections to get started. Ease Plus is for a business that invoices and pays a team. Ease Pro is for a larger team. Choose Ease Gold when you need terms agreed in a contract.",
  },
  {
    question: "Can I change plans?",
    answer:
      "Yes. Moving to a higher plan starts straight away. Moving to a lower plan takes effect at your next billing date.",
  },
  {
    question: "Is a personal subscription covered by a business account?",
    answer:
      "Yes. The Ease Plus subscription ($4.79 a month, billed yearly at $57.48 a year, or $5.99 a month) is covered by an Ease Plus account or above — a free Ease account does not cover it. Ease and Ease Plus for personal banking are chosen in the Easner app.",
    links: [{ label: "Personal Banking", href: "/personal" }],
  },
]

export const pricingHero = {
  h1: "Pricing that fits your business",
  subhead:
    "Banking services and essential business tools are always $0 a month – with more plans available as your business grows.",
}

export type PricingInterval = "annual" | "monthly"

export interface PricingPrice {
  /** Whole dollars. Null is the Talk to us price. */
  amount: number | null
  /** Beside the amount. Omitted when there is no dollar price. */
  interval?: string
  /** Annual savings line. Omitted on monthly. */
  save?: string
  /** Shown under the price. Omitted when the card has no fee line. */
  fee?: string
}

export interface PricingPlan {
  id: string
  name: string
  sentence: string
  features: string[]
  highlighted?: boolean
  cta: { label: string; href: string; external?: boolean; analyticsLocation: string }
  annual: PricingPrice
  monthly: PricingPrice
}

const openAccount = (id: string): PricingPlan["cta"] => ({
  label: "Open account",
  href: BUSINESS_SIGNUP_URL,
  external: true,
  analyticsLocation: `pricing_plan_${id}`,
})

export const pricingPlans: PricingPlan[] = [
  {
    id: "ease",
    name: "Ease",
    sentence: "Accounts, payouts, and collections to get started.",
    features: [
      "Transfer fee 1%",
      "Deposit fee 0.50%*",
      "1 virtual card",
      "Team of 1",
      "10 invoices a month",
    ],
    cta: openAccount("ease"),
    annual: { amount: 0, interval: "a month" },
    monthly: { amount: 0, interval: "a month" },
  },
  {
    id: "ease_plus",
    name: "Ease Plus",
    sentence: "For a business that invoices and pays a team.",
    features: [
      "Transfer fee 0.5%",
      "Deposit fee 0.40%*",
      "Team of 5, with approvals",
      "5 cards, virtual or physical",
      "Unlimited invoices",
    ],
    highlighted: true,
    cta: openAccount("ease_plus"),
    annual: { amount: 39, interval: "a month, billed yearly", save: "Saves $120 a year" },
    monthly: { amount: 49, interval: "a month" },
  },
  {
    id: "ease_pro",
    name: "Ease Pro",
    sentence: "For a larger team.",
    features: [
      "Transfer fee 0.25%",
      "Deposit fee 0.35%*",
      "Unlimited team, with approvals",
      "Unlimited payroll",
      "Priority support",
      "A relationship with Easner",
    ],
    cta: openAccount("ease_pro"),
    annual: {
      amount: 159,
      interval: "a month, billed yearly",
      save: "Saves $480 a year",
    },
    monthly: { amount: 199, interval: "a month" },
  },
  {
    id: "ease_gold",
    name: "Ease Gold",
    sentence: "A contracted plan for a business that needs its own terms.",
    features: [
      "Everything in Ease Pro",
      "Including pricing for Banking API, Connect, Checkout, and White-label",
      "Transfer fee and deposit fee are Contract",
      "Higher limits for API and webhooks",
    ],
    cta: {
      label: "Book a call",
      href: CONTACT_PATH,
      analyticsLocation: "pricing_plan_ease_gold",
    },
    annual: { amount: null },
    monthly: { amount: null },
  },
]

export const pricingPlanNames = ["Ease", "Ease Plus", "Ease Pro", "Ease Gold"] as const

/** Plus, Pro, and Gold each take one existing brand color. Ease stays neutral. */
export const pricingPlanAccent: Record<
  string,
  { name: string; card: string; header: string; mark: string }
> = {
  ease_plus: {
    name: "text-brand-primary",
    card: "border-brand-primary",
    header: "border-b-2 border-brand-primary text-brand-primary",
    mark: "bg-brand-tint-blue shadow-[inset_0_0_0_1.5px_var(--brand-primary)]",
  },
  ease_pro: {
    name: "text-brand-navy",
    card: "border-brand-navy",
    header: "border-b-2 border-brand-navy text-brand-navy",
    mark: "bg-web-band shadow-[inset_0_0_0_1.5px_var(--brand-navy)]",
  },
  ease_gold: {
    name: "text-brand-amber",
    card: "border-brand-amber",
    header: "border-b-2 border-brand-amber text-brand-amber",
    mark: "bg-web-band shadow-[inset_0_0_0_1.5px_var(--brand-amber)]",
  },
}

const accentByName: Record<string, (typeof pricingPlanAccent)[string]> = {
  "Ease Plus": pricingPlanAccent.ease_plus,
  "Ease Pro": pricingPlanAccent.ease_pro,
  "Ease Gold": pricingPlanAccent.ease_gold,
}

export function pricingAccentForName(name: string) {
  return accentByName[name]
}

export interface PricingComparisonRow {
  label: string
  cells: readonly [string, string, string, string]
}

export interface PricingComparisonGroup {
  id: string
  label: string
  rows: PricingComparisonRow[]
}

export const pricingComparison: PricingComparisonGroup[] = [
  {
    id: "accounts",
    label: "Accounts",
    rows: [
      { label: "USD, EUR, GBP, and Stablecoin", cells: ["Yes", "Yes", "Yes", "Yes"] },
      { label: "Transfer fee", cells: ["1%", "0.5%", "0.25%", "Contract"] },
      { label: "Deposit fee*", cells: ["0.50%", "0.40%", "0.35%", "Contract"] },
      { label: "Express deposit**", cells: ["4.04%", "4.04%", "4.04%", "4.04%"] },
    ],
  },
  {
    id: "cards",
    label: "Cards",
    rows: [{ label: "Cards", cells: ["1 virtual", "5, virtual or physical", "1 per person, virtual or physical", "Contract"] }],
  },
  {
    id: "invoicing-and-checkout",
    label: "Invoicing and checkout",
    rows: [
      { label: "Invoices a month", cells: ["10", "Unlimited", "Unlimited", "Contract"] },
      { label: "Recurring invoices and reminders", cells: ["No", "Yes", "Yes", "Yes"] },
      { label: "Payment links a month", cells: ["10", "Unlimited", "Unlimited", "Contract"] },
      { label: "Websites", cells: ["1", "5", "Unlimited", "Unlimited"] },
      { label: "Subscriptions and customer portal", cells: ["No", "Yes", "Yes", "Yes"] },
      { label: "Checkout, card payments", cells: ["3.50% + $1.00", "3.50% + $1.00", "3.30% + $1.00", "Contract"] },
      { label: "Checkout, bank payments", cells: ["1.40% + $1.00", "1.40% + $1.00", "1.20% + $0.70", "Contract"] },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    rows: [{ label: "Payroll people", cells: ["No", "15", "Unlimited", "Contract"] }],
  },
  {
    id: "team",
    label: "Team",
    rows: [
      { label: "Team", cells: ["1 person", "5 people", "Unlimited", "Contract"] },
      { label: "Approvals", cells: ["No", "Yes", "Yes", "Contract"] },
    ],
  },
  {
    id: "api",
    label: "API",
    rows: [
      { label: "API keys and webhooks", cells: ["Yes", "Yes", "Yes", "Yes"] },
      { label: "Account statements", cells: ["Yes", "Yes", "Yes", "Yes"] },
      { label: "Connect fee", cells: ["No", "No", "$0.50 + 0.50%, capped at $15", "Contract"] },
    ],
  },
  {
    id: "support",
    label: "Support",
    rows: [
      { label: "Support", cells: ["Standard", "Standard", "Priority", "Priority"] },
      { label: "A relationship with Easner", cells: ["No", "No", "Yes", "Yes"] },
    ],
  },
]

