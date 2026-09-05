import type { ProductPageContent } from "../types"
import { APP_LINK_URL } from "../constants"

const downloadCta = [
  { label: "Download", href: APP_LINK_URL, store: "download" as const, analyticsLocation: "personal_hero" },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Easner Personal Banking | Multi-Currency Money App",
    description:
      "Manage everyday money with Easner Personal Banking. Hold a multi-currency balance, top up by card or bank, and send money to 80+ countries from one app.",
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
      "Hold a balance in USD and other major currencies. Top up with card, Apple Pay, Google Pay, or ACH Direct, and send to 80+ countries.",
    visualSlot: "mkt-hero-personal-01",
    altText: "Easner Mobile account and receive money screens",
    ctas: downloadCta,
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Send money",
      description:
        "Pay people and businesses through supported bank accounts, wallets, and mobile money services. Stablecoin settlement carries it across borders; you just see the payment.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner Mobile send money screen",
    },
    {
      title: "Named Accounts",
      description:
        "Share your own account details so clients and family can pay you directly, or receive to a stablecoin deposit address instead.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner Mobile receive screen showing shareable account details",
    },
    {
      title: "Quick sending",
      description:
        "Save family, friends, and other recipients. Use an EASETAG to find people on Easner without entering their account details again.",
      visualSlot: "mkt-ui-personal-recipients",
      altText: "Easner Mobile recipients and EASETAG",
    },
    {
      title: "Account security",
      description:
        "Protect your account with multi-factor authentication, PIN, and biometric unlock on your device.",
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
  ctaBand: {
    headline: "Wherever life takes you.",
    ctas: [{ ...downloadCta[0], analyticsLocation: "personal_cta_band" }],
  },
}
