import type { AnswerDefinition, CardItem, Cta, FaqItem } from "../types"
import { EASNER_CANONICAL_DEFINITION } from "../constants"
import { DEFAULT_CTA_BAND } from "../shared-content"

export const homeDefinition: AnswerDefinition = {
  term: "Easner",
  question: "What is Easner?",
  answer: EASNER_CANONICAL_DEFINITION,
  facts: [
    {
      term: "Easner Personal Banking",
      definition:
        "The multi-currency account in the Easner app, on iPhone, Android, and the [web](https://app.easner.com). Hold USD and EUR, and GBP where supported, with account details in your name.",
    },
    {
      term: "Easner Business Banking",
      definition:
        "The web dashboard for a company. USD and EUR account details in the business name, collections, and payouts to suppliers in 80+ countries. Personal money stays in the Easner app.",
    },
    {
      term: "Not a bank",
      definition:
        "Easner is a financial technology company. Banking and payment services are provided by licensed partners.",
    },
    {
      term: "Where you can send",
      definition:
        "Bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe. Transfers typically arrive in minutes to hours.",
    },
  ],
}

export const homeMetadata = {
  title: "Easner | Stablecoin-Native Banking & Payment Infrastructure",
  description:
    "Stablecoin-native banking and payment infrastructure for individuals and businesses. Get paid, hold dollars, and pay people in 80+ countries.",
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
    "Stablecoin-native banking and payment infrastructure. Get paid, hold dollars, and pay people and businesses in 80+ countries, in minutes.",
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
      "Pay suppliers, contractors, and family across Africa, Latin America, Asia, the Middle East and Europe.",
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
      "Receive USDC, USDT and EURC alongside your currency balances, and send to wallets or local accounts.",
    icon: "pillar-stablecoin",
  },
]

export const solutionsPersonas = [
  {
    id: "sme",
    label: "Business Banking",
    headline: "Get paid. Pay your people. Keep track.",
    body: "Collect customer payments, pay suppliers and contractors in 80+ countries, and give your team the access they need. Run your business finances from one dashboard, whether you work locally or globally.",
    visualSlot: "mkt-persona-sme",
    altText: "A café owner at the counter taking a payment from a customer on a card terminal",
    ctas: [{ label: "Explore Business Banking", href: "/business", analyticsLocation: "homepage_persona_sme" }] satisfies Cta[],
  },
  {
    id: "connect",
    label: "Easner Connect",
    headline: "Pay the people who earn on your app.",
    body: "Add Easner to your withdraw page. Creators, sellers and freelancers link once, you pay them from your balance, and the money lands in their own Easner account in dollars, typically within seconds.",
    visualSlot: "mkt-persona-connect",
    altText: "A creator filming a cooking video in her kitchen, with a phone on a tripod in front of her",
    ctas: [{ label: "Explore Connect", href: "/connect", analyticsLocation: "homepage_persona_connect" }] satisfies Cta[],
  },
  {
    id: "diaspora",
    label: "Personal Banking",
    headline: "Get paid in dollars. Pay anyone, anywhere.",
    body: "Hold USD and EUR, get paid by clients and the apps you work with to account details in your name, and send to bank accounts and mobile money in 80+ countries – all from the Easner app.",
    visualSlot: "mkt-persona-diaspora",
    altText: "Remote professional using Easner on mobile",
    ctas: [{ label: "Explore Personal Banking", href: "/personal", analyticsLocation: "homepage_persona_diaspora" }] satisfies Cta[],
  },
  {
    id: "otc",
    label: "White-label",
    headline: "Cross-border payments under your brand",
    body: "Build a branded payment program with Easner handling the underlying infrastructure, verification flows, and supported payout connections.",
    visualSlot: "mkt-persona-otc",
    altText: "Partner operator managing branded cross-border transfers",
    ctas: [{ label: "Explore White-label", href: "/white-label", analyticsLocation: "homepage_persona_otc" }] satisfies Cta[],
  },
  {
    id: "dev",
    label: "Banking API",
    headline: "Build payments into your product",
    body: "Connect verification, accounts, collections, and international payouts to your platform through Easner APIs and webhooks.",
    visualSlot: "mkt-persona-dev",
    altText: "Developers integrating the Easner API",
    ctas: [{ label: "Explore Developers", href: "/developers", analyticsLocation: "homepage_persona_dev" }] satisfies Cta[],
  },
]

/** The infrastructure story, in three steps. This is where stablecoins are named and explained. */
export const homeHowItWorks = {
  headline: "How it works",
  steps: [
    {
      title: "Money comes in",
      description: "Get account details in your name, take payments with Checkout and Payment Links, and send invoices.",
    },
    {
      title: "Stablecoins move it",
      description: "Payments settle on stablecoin rails, so money moves all day, every day, without the chain of banks that slows transfers down.",
    },
    {
      title: "Money goes out",
      description: "Pay bank accounts and mobile money in 80+ countries, in minutes to hours, same-day where supported.",
    },
  ],
  footnote: "You see dollars and normal accounts. Stablecoins do the moving underneath.",
}

export const corridorContent = {
  headline: "At home. Around the world.",
  body: "Hold USD and EUR, and GBP where supported. Pay out to bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe, typically within minutes to hours.",
  bullets: [],
  visualSlot: "mkt-map-corridors",
  altText:
    "Map showing payment corridors between US, EU, UK, and supported local markets including Nigeria, Mexico, Philippines, India, and Brazil",
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
      "Choose Easner Personal Banking for your own money. It runs in the Easner app on iPhone, Android, and the [web](https://app.easner.com). Choose Easner Business Banking for company accounts, customer payments, invoicing, payroll and team access on the company dashboard. The app can be opened from 158 countries. A business account can be opened from 174 countries. A listed set of countries is closed.",
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
      "To bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe. Transfers typically arrive in minutes to hours, same-day where supported, and the fee, the rate and what your recipient gets are shown before you confirm.",
    links: [{ label: "Check eligibility and restrictions", href: "/compliance" }],
  },
  {
    question: "Do I need to understand crypto to use Easner?",
    answer:
      "No. You see ordinary balances. Settlement uses USDC, USDT, and EURC where enabled. No crypto wallet is required. Wallet send and receive are optional.",
    links: [{ label: "How stablecoin payments work", href: "/stablecoin" }],
  },
  {
    question: "Is Easner an app or a website?",
    answer:
      "Both. The Easner app runs on iPhone, Android, and the [web](https://app.easner.com) for a person's own money. Easner Business is a separate company dashboard on the web for accounts, invoices, Checkout, Payment Links, Payroll, and Connect.",
  },
  {
    question: "Where do I manage my company?",
    answer:
      "In Easner Business, the company web dashboard: accounts, send, invoices, Checkout, Payment Links, Payroll, Connect, cards, Terminal, QR Pay, team access, API keys, and webhooks. Personal money stays in the Easner app.",
    links: [{ label: "Business Banking", href: "/business" }],
  },
  {
    question: "Where do I sign a W-9?",
    answer:
      "A person signs a W-9 in the Easner app, on iPhone, Android, or the [web](https://app.easner.com). A business payee signs in Easner Business. On Connect the platform stays the filer. On Payroll the employer stays the filer. Easner does not file with the IRS.",
  },
  {
    question: "Which Easner product do I need?",
    answer:
      "Own money, in the Easner app on iPhone, Android, and the [web](https://app.easner.com): [Personal Banking](/personal). Company accounts and supplier payouts: [Business](/business). Payments on the company's website: [Checkout](/checkout). A shareable page: [Payment Links](/payment-links). An itemized bill: [Invoicing](/invoicing). Employees and contractors: [Payroll](/payroll). A platform paying many people into their own Easner accounts: [Connect](/connect). Cards, once available and approved: [Cards](/cards). USDC, USDT, and EURC, plus Terminal and QR Pay: [Stablecoin](/stablecoin). Accounts inside another company's product: the [Banking API](/developers). A branded payments product: [White-label](/white-label). All business collections and payouts use one Easner Business ledger.",
  },
]
