import type { AnswerDefinition, FaqItem } from "../types"
import { BUSINESS_SIGNUP_URL, CONTACT_PATH } from "../constants"

export const pricingMetadata = {
  title: "Pricing | Accounts, Payouts, Invoicing & Payroll",
  description:
    "Banking services and essential business tools are always $0 a month – with more plans available as your business grows. Card payments and transfers have a processing fee.",
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
    "Banking services and essential business tools are always $0 a month, with more plans available as the business grows. Ease Plus is $39 a month billed yearly, or $49 a month, and saves $120 a year on annual billing. Ease Pro is $159 a month billed yearly, or $199 a month, and saves $480 a year. Ease Gold is agreed with Easner. Card payments and transfers have a processing fee.",
  facts: [
    {
      term: "Ease",
      definition:
        "$0 a month. Priority support, USD, EUR, GBP, and Stablecoin, 1 virtual card, a team of 1, and 10 invoices a month. 0 Included Free payouts a month.",
    },
    {
      term: "Ease Plus",
      definition:
        "$39 a month, billed yearly, or $49 a month. Saves $120 a year on annual billing. Team of 5 with approvals, 5 cards, unlimited invoices, and 5 Included Free payouts a month.",
    },
    {
      term: "Ease Pro",
      definition:
        "$159 a month, billed yearly, or $199 a month. Saves $480 a year on annual billing. A relationship with Easner, an unlimited team, a card for each person, unlimited payroll, and 15 Included Free payouts a month.",
    },
    {
      term: "Ease Gold",
      definition: "A contracted plan. Talk to us. It is not a public price and not a checkout button.",
    },
    {
      term: "Included Free payouts",
      definition:
        "The monthly payout allowance: 0 on Ease, 5 on Ease Plus, 15 on Ease Pro, and Contract on Ease Gold. The word Free names the allowance. It does not mean a transfer has no fee.",
    },
  ],
}

export const pricingFaq: FaqItem[] = [
  {
    question: "How much does an Easner business plan cost?",
    answer: pricingDefinition.answer,
  },
  {
    question: "What does Ease include?",
    answer:
      "Priority support, USD, EUR, GBP, and Stablecoin, 1 virtual card, a team of 1, and 10 invoices a month. Ease includes 0 Included Free payouts a month.",
  },
  {
    question: "What do Ease Plus and Ease Pro add?",
    answer:
      "Ease Plus is for a business that invoices and pays a team: a team of 5 with approvals, 5 cards, unlimited invoices, and 5 Included Free payouts a month. Ease Pro is for a larger team: a relationship with Easner, an unlimited team, a card for each person, unlimited payroll, and 15 Included Free payouts a month.",
  },
  {
    question: "How do I choose Ease Gold?",
    answer:
      "Ease Gold is agreed with us. Talk to us from the pricing page. Opening an account does not pre-select Ease Plus, Ease Pro, or Ease Gold.",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    question: "Do card payments and transfers have a fee?",
    answer:
      "Yes. Card payments and transfers have a processing fee. Included Free payouts is the monthly allowance on a plan. It does not mean a transfer has no fee.",
  },
  {
    question: "Is a personal subscription covered by a business account?",
    answer:
      "A $57.48/year subscription is covered with an Easner Business account. Ease and Ease Plus for personal banking are chosen in Easner Mobile.",
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
      "Priority support",
      "USD, EUR, GBP, and Stablecoin",
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
      "Everything in Ease",
      "Team of 5, with approvals",
      "5 cards, virtual or physical",
      "Unlimited invoices",
      "5 Included Free payouts a month",
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
      "Everything in Ease Plus",
      "A relationship with Easner",
      "Unlimited team, with approvals",
      "A card for each person, virtual or physical",
      "Unlimited payroll",
      "15 Included Free payouts a month",
    ],
    cta: openAccount("ease_pro"),
    annual: { amount: 159, interval: "a month, billed yearly", save: "Saves $480 a year" },
    monthly: { amount: 199, interval: "a month" },
  },
  {
    id: "ease_gold",
    name: "Ease Gold",
    sentence: "A contracted plan for a business that needs its own terms.",
    features: [
      "Everything in Ease Pro",
      "Team, payouts, and pricing agreed with us",
      "Cards agreed with us",
      "API and webhooks",
    ],
    cta: {
      label: "Talk to us",
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
    rows: [{ label: "USD, EUR, GBP, and Stablecoin", cells: ["Yes", "Yes", "Yes", "Yes"] }],
  },
  {
    id: "cards",
    label: "Cards",
    rows: [{ label: "Cards", cells: ["1 virtual", "5, virtual or physical", "1 per person, virtual or physical", "Contract"] }],
  },
  {
    id: "send-and-payouts",
    label: "Send and payouts",
    rows: [
      { label: "Included Free payouts a month", cells: ["0", "5", "15", "Contract"] },
      { label: "Batch payouts", cells: ["No", "Yes", "Yes", "Yes"] },
    ],
  },
  {
    id: "invoicing-and-checkout",
    label: "Invoicing and checkout",
    rows: [
      { label: "Invoices a month", cells: ["10", "Unlimited", "Unlimited", "Contract"] },
      { label: "Recurring invoices and reminders", cells: ["No", "Yes", "Yes", "Yes"] },
      { label: "Payment links a month", cells: ["10", "Unlimited", "Unlimited", "Contract"] },
      { label: "Subscriptions and customer portal", cells: ["No", "Yes", "Yes", "Yes"] },
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
      { label: "Approvals", cells: ["No", "One step", "Several steps", "Contract"] },
    ],
  },
  {
    id: "api",
    label: "API",
    rows: [
      { label: "API keys and webhooks", cells: ["No", "Yes", "Yes", "Yes"] },
      { label: "Accounting export", cells: ["Statements", "Yes", "Yes", "Yes"] },
    ],
  },
  {
    id: "support",
    label: "Support",
    rows: [
      { label: "Priority support", cells: ["Yes", "Yes", "Yes", "Yes"] },
      { label: "A relationship with Easner", cells: ["No", "No", "Yes", "Yes"] },
    ],
  },
]

export const pricingFeeLine = "Card payments and transfers have a processing fee."
