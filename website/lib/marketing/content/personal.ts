import type { ProductPageContent } from "../types"
import { APP_LINK_URL } from "../constants"

const downloadCta = [
  { label: "Download", href: APP_LINK_URL, store: "download" as const, analyticsLocation: "personal_hero" },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Easner Personal Banking | Multi-Currency Money App",
    description:
      "Get account details in your name, hold a multi-currency balance, and top up by card, Apple Pay, or ACH Direct. Send money to 80+ countries from one app.",
    keywords: [
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
      "Hold USD and EUR, and GBP where supported. Top up with card, Apple Pay, Google Pay or ACH, and send to 80+ countries.",
    visualSlot: "mkt-hero-personal-01",
    altText: "The Easner app home screen beside a transfer review showing the fee, rate and amount received",
    ctas: downloadCta,
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Send money",
      description:
        "Pay people and businesses by bank transfer, wallet, or mobile money. Stablecoin settlement moves it across borders.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner Mobile send money screen",
    },
    {
      title: "Accounts in your name",
      description:
        "Share account details in your own name so clients and family can pay you, or use a stablecoin deposit address.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner Mobile receive screen showing shareable account details",
    },
    {
      title: "Quick sending",
      description:
        "Save the people you pay often, and use an EASETAG to reach them without entering details each time.",
      visualSlot: "mkt-ui-personal-recipients",
      altText: "Easner Mobile recipients and EASETAG",
    },
    {
      title: "Account security",
      description:
        "Authenticator, PIN and Face ID protect every sign-in and every new recipient.",
      visualSlot: "mkt-ui-personal-security",
      altText: "Easner Mobile security settings",
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
  faq: [
    {
      question: "How do I open an Easner Personal Banking account?",
      links: [{ label: "Download the app", href: "/app" }],
      answer:
        "Download the Easner app on iPhone or Android, sign up with your email, and verify your identity. Once you're verified, your account details are ready to share.",
    },
    {
      question: "Which currencies can I hold?",
      answer:
        "USD and EUR, and GBP where supported for your profile. Each balance gets account details in your name, so you can get paid directly.",
    },
    {
      question: "How do I add money to my account?",
      answer:
        "Top up by card, Apple Pay, Google Pay or ACH, or receive a bank transfer to your account details. Stablecoin deposits are also supported where enabled.",
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
  ],
  ctaBand: {
    headline: "Wherever life takes you",
    ctas: [{ ...downloadCta[0], analyticsLocation: "personal_cta_band" }],
  },
}
