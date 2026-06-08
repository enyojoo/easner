import type { ProductPageContent } from "../types"
import { APP_STORE_URL, PLAY_STORE_URL } from "../constants"

const storeCtas = [
  { label: "App Store", href: APP_STORE_URL, store: "app-store" as const },
  { label: "Google Play", href: PLAY_STORE_URL, store: "google-play" as const },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Personal Banking",
    description:
      "Global banking in your pocket. Send and receive money across US, EU, and African corridors with Easner Personal.",
    keywords: [
      "personal international transfers",
      "diaspora banking app",
      "global mobile banking",
    ],
  },
  hero: {
    h1: "Global banking in your pocket",
    subhead:
      "Receive, send, and manage money across global and African corridors. Stablecoin speed behind familiar banking.",
    visualSlot: "mkt-hero-personal-01",
    altText: "Freelancer using Easner Mobile app to send money internationally",
    ctas: storeCtas,
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Send money",
      description:
        "Pay across supported corridors by bank, stablecoin, open banking, or mobile money – fees and rates shown before you confirm.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner Mobile send money screen",
    },
    {
      title: "Receive money",
      description:
        "Get paid by account details or stablecoin deposit address – one Receive flow with clear pay-in instructions.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner Mobile receive options",
    },
    {
      title: "Recipients and EASETAG",
      description:
        "Save people you pay often and send to Easetags without re-entering details every time.",
      visualSlot: "mkt-ui-personal-recipients",
      altText: "Easner Mobile recipients and EASETAG",
    },
    {
      title: "Security",
      description:
        "Protect your account with multi-factor authentication, PIN, and biometric unlock on your device.",
      visualSlot: "mkt-ui-personal-security",
      altText: "Easner Mobile security settings",
    },
  ],
  useCasesHeadline: "Built for life across borders",
  useCasesSubhead:
    "Easner banking is for people who earn, send, and spend globally. You don't need to juggle multiple apps again.",
  useCases: [
    {
      title: "Diaspora remittances",
      description:
        "Send support home on faster paths than legacy bank wires – with clear fees and status in the app.",
    },
    {
      title: "Freelancers and remote workers",
      description:
        "Get paid in USD or EUR, hold balances, and pay out on your schedule from one mobile account.",
    },
    {
      title: "Students and families",
      description:
        "Cover tuition and living expenses across borders with tracked transfers and saved recipients.",
    },
    {
      title: "Expats",
      description:
        "Manage money between your host country and home – send, receive, and review activity in one place.",
    },
    {
      title: "Cross-border gig workers",
      description:
        "Collect client pay-in globally and move earnings to local accounts or mobile money when you need to.",
    },
    {
      title: "Families abroad",
      description:
        "Support relatives back home with repeat transfers, EASETAG, and a clear record of every payment.",
    },
  ],
  ctaBand: {
    headline: "Take Easner banking with you.",
    subhead: "Download the app and start banking globally from your phone.",
    ctas: storeCtas,
  },
}
