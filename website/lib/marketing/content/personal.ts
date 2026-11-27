import type { AnswerDefinition, ProductPageContent } from "../types"
import { APP_LINK_URL } from "../constants"

export const personalDefinition: AnswerDefinition = {
  term: "Easner Personal Banking",
  question: "What is Easner Personal Banking?",
  answer:
    "Easner Personal Banking is the multi-currency account in the Easner app, on iPhone, Android, and the web at https://app.easner.com. Hold USD and EUR, and GBP where supported, with account details in your name, and send to bank accounts and mobile money in 80+ countries.",
  facts: [
    {
      term: "Currencies",
      definition: "USD and EUR, and GBP where supported for your profile, with account details in your name.",
    },
    {
      term: "How to add money",
      definition:
        "Top up by card, Apple Pay, Google Pay, or ACH. An instant top-up is an express deposit at 4.04%. You can also receive a bank transfer, or use a stablecoin deposit where enabled.",
    },
  ],
  stepsHeadline: "How to open an Easner Personal Banking account",
  steps: [
    { name: "Download the app", text: "Get the Easner app on iPhone or Android, or start from easner.com/app." },
    { name: "Verify your identity", text: "Sign up with your email and complete identity verification." },
    { name: "Get paid or send", text: "Share your account details, or send to bank accounts and mobile money." },
  ],
}

const downloadCta = [
  { label: "Download", href: APP_LINK_URL, store: "download" as const, analyticsLocation: "personal_hero" },
]

export type PersonalInterval = "annual" | "monthly"

export interface PersonalPlanPrice {
  /** Whole dollars, or cents when the amount is not a whole dollar. Null is unused. Zero is Free. */
  amount: number | null
  interval?: string
}

export interface PersonalPlan {
  id: string
  name: string
  sentence: string
  features: string[]
  highlighted?: boolean
  annual: PersonalPlanPrice
  monthly: PersonalPlanPrice
}

/** Ease / Ease Plus for personal banking. Chosen and billed in the Easner app, not on the website. */
export const personalPlans: PersonalPlan[] = [
  {
    id: "personal_ease",
    name: "Ease",
    sentence: "Everyday banking for your own money.",
    features: [
      "Transfer fee 1%",
      "Deposit fee 0.50%*",
      "1 virtual card",
    ],
    annual: { amount: 0, interval: "a month" },
    monthly: { amount: 0, interval: "a month" },
  },
  {
    id: "personal_ease_plus",
    name: "Ease Plus",
    sentence: "For people who send more often.",
    features: ["Transfer fee 0.5%", "Deposit fee 0.40%*", "5 cards, virtual or physical"],
    highlighted: true,
    annual: { amount: 4.79, interval: "a month, billed yearly" },
    monthly: { amount: 5.99, interval: "a month" },
  },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Easner Personal Banking | Multi-Currency Money App",
    description:
      "Get account details in your name, hold a multi-currency balance, and top up by card, Apple Pay, Google Pay or ACH. Send money to 80+ countries from one app.",
    keywords: [
      "receive money from abroad",
      "USD and EUR account details",
      "send money to 80+ countries",
      "EASETAG payments",
      "money transfer app with Face ID",
      "personal banking app",
      "personal finance app USA",
      "multi-currency personal account",
      "USD personal account",
      "send and receive money",
      "global mobile banking",
      "freelancer payments",
      "international money transfer app",
    ],
  },
  hero: {
    h1: "Bank globally with Ease",
    subhead:
      "Hold USD and EUR, and GBP where supported, in the Easner app on iPhone, Android, and the web. Top up with card, Apple Pay, Google Pay or ACH, and send to 80+ countries.",
    visualSlot: "mkt-hero-personal-01",
    altText: "The Easner app home screen beside a transfer review showing the fee, rate and amount received",
    ctas: downloadCta,
    note: {
      lead: "A $57.48/year subscription, covered with an ",
      linkLabel: "Easner Business account",
      href: "/pricing",
      trail: ".",
    },
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Send money",
      description:
        "Pay people and businesses by bank transfer, wallet, or mobile money. Stablecoin settlement moves it across borders.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner app send money screen",
    },
    {
      title: "Accounts in your name",
      description:
        "Share account details in your own name so clients and family can pay you, or use a stablecoin deposit address.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner app receive screen showing shareable account details",
    },
    {
      title: "Quick sending",
      description:
        "Save the people you pay often, and use an EASETAG to reach them without entering details each time.",
      visualSlot: "mkt-ui-personal-recipients",
      altText: "Easner app recipients and EASETAG",
    },
    {
      title: "Account security",
      description:
        "Authenticator, PIN and Face ID protect every sign-in and every new recipient.",
      visualSlot: "mkt-ui-personal-security",
      altText: "Easner app security settings",
    },
  ],
  useCasesHeadline: "Built for the way you live",
  useCasesSubhead:
    "For your money at home, and the payments that cross borders.",
  useCases: [
    {
      title: "Everyday money",
      description:
        "Receive, spend, and send from one account you actually use day to day.",
    },
    {
      title: "Getting paid from abroad",
      description:
        "Take client and employer payments from other countries, by bank transfer or stablecoin deposit.",
    },
    {
      title: "Family and friends abroad",
      description:
        "Send support to people in 80+ countries, with fees and rates shown before you confirm.",
    },
    {
      title: "Students and families",
      description:
        "Cover tuition and living costs across countries, with a record of every payment.",
    },
    {
      title: "Freelancers and creators",
      description:
        "Get paid by clients at home or overseas, then move earnings when you need them.",
    },
    {
      title: "Living between countries",
      description:
        "Keep a multi-currency balance as you move between places, and top it up from either side.",
    },
  ],
  definition: personalDefinition,
  faq: [
    {
      question: "How do I open an Easner Personal Banking account?",
      links: [{ label: "Download the app", href: "/app" }],
      answer:
        "Open the Easner app on iPhone, Android, or the web at https://app.easner.com, sign up with your email, and verify your identity. Once you're verified, your account details are ready to share.",
    },
    {
      question: "Which currencies can I hold?",
      answer:
        "USD and EUR, and GBP where supported for your profile. Each balance gets account details in your name, so you can get paid directly.",
    },
    {
      question: "What does Ease Plus cost?",
      answer:
        "Ease Plus is $4.79 a month, billed yearly at $57.48 a year, or $5.99 a month. The transfer fee is 0.5% and the deposit fee is 0.40%. Ease is $0 a month, with a transfer fee of 1% and a deposit fee of 0.50%. Express deposit is 4.04%, an instant deposit by card, Apple Pay, Google Pay, or ACH. An Easner Business account on Ease Plus or above covers that personal subscription. A free Ease business account does not. You choose the plan in the app, including the web app.",
      links: [{ label: "Pricing", href: "/pricing" }],
    },
    {
      question: "How do I add money to my account?",
      answer:
        "Top up by card, Apple Pay, Google Pay or ACH, or receive a bank transfer to your account details. An instant top-up by card, Apple Pay, Google Pay, or ACH is an express deposit at 4.04%. Stablecoin deposits are also supported where enabled. A local currency deposit to your USD balance adds a little fee for that country.",
    },
    {
      question: "Where can I send money?",
      links: [{ label: "Check eligibility and restrictions", href: "/compliance" }],
      answer:
        "To bank accounts and mobile money in 80+ countries, and to other Easner users by EASETAG. You see the fee, the rate and what your recipient gets before you confirm.",
    },
    {
      question: "How long does a transfer take?",
      answer:
        "Typically minutes to hours, same-day where supported. Every transfer shows its status in the app until it's completed.",
    },
    {
      question: "How is my account protected?",
      answer:
        "An authenticator, your PIN and Face ID protect every sign-in and every new recipient, and a first payment to someone new can be held for your review. Easner verifies every customer and screens transactions; banking services are provided by licensed partners.",
    },
    {
      question: "What is the Easner app?",
      answer:
        "The Easner app is where a person manages their own money, on iPhone, Android, and the web at https://app.easner.com. It is the same personal account, not the Easner Business dashboard. Company money stays in Easner Business.",
    },
    {
      question: "How do I get USD account details in my name?",
      answer:
        "Open the Easner app, verify your identity, and share the USD account details in your name. You can also hold EUR, and GBP where supported.",
    },
    {
      question: "How do I send money to Nigeria or Mexico?",
      answer:
        "From the Easner app, send from a USD balance. A recipient in Nigeria gets NGN by bank only. A recipient in Mexico gets MXN by bank. Fees and the exchange rate are shown before you confirm, including what the recipient gets.",
    },
    {
      question: "What is an EASETAG?",
      answer:
        "An EASETAG is how you pay another Easner user. You send to their tag from the Easner app instead of typing bank details.",
    },
  ],
  ctaBand: {
    headline: "Wherever life takes you",
    ctas: [{ ...downloadCta[0], analyticsLocation: "personal_cta_band" }],
  },
}
