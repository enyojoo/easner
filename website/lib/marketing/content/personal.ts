import type { ProductPageContent } from "../types"
import { APP_LINK_URL } from "../constants"

const downloadCta = [
  { label: "Download", href: APP_LINK_URL, store: "download" as const, analyticsLocation: "personal_hero" },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Easner Personal Banking | Multi-Currency Money App",
    description:
      "Manage everyday money with Easner Personal Banking. Hold multiple currencies, receive payments, and send money in the US and internationally from one mobile app.",
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
      "Get paid, send money, and keep your finances in view. Easner brings your everyday payments and multiple currencies together in one simple app.",
    visualSlot: "mkt-hero-personal-01",
    altText: "Easner Mobile account and receive money screens",
    ctas: downloadCta,
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Send money",
      description:
        "Pay people and businesses through supported bank accounts, wallets, and mobile money services. Keep every payment in view from your app.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner Mobile send money screen",
    },
    {
      title: "Receive money",
      description:
        "Share your available account details or a supported stablecoin deposit address, with clear instructions for the person paying you.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner Mobile receive options",
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
    "For your everyday finances in the US and the connections you make around the world.",
  useCases: [
    {
      title: "Everyday money",
      description:
        "Receive money, manage your balances, and pay the people in your life from one mobile account.",
    },
    {
      title: "Friends and family",
      description: "Send money to the people who matter, whether they are nearby or on another continent.",
    },
    {
      title: "Students and families",
      description:
        "Manage school and living expenses with payment records and saved recipients.",
    },
    {
      title: "Life in more than one country",
      description:
        "Keep multiple currencies in one account and manage your money as you move between places.",
    },
    {
      title: "Freelancers and independent professionals",
      description:
        "Receive client payments and manage your earnings, whether your next project is local or international.",
    },
    {
      title: "Staying organized",
      description:
        "Save recipients, connect with people using EASETAG, and keep a clear record of your payments.",
    },
  ],
  ctaBand: {
    headline: "Wherever life takes you.",
    ctas: [{ ...downloadCta[0], analyticsLocation: "personal_cta_band" }],
  },
}
