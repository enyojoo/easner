import type { ProductPageContent } from "../types"
import { APP_LINK_URL, EASNER_SUPPORTED_LOCAL_MARKETS } from "../constants"

const downloadCta = [
  { label: "Download", href: APP_LINK_URL, store: "download" as const, analyticsLocation: "personal_hero" },
]

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Personal Banking | Global Money App",
    description:
      "Mobile banking for global money – send, receive, and manage funds in global and local currencies. Bank transfers and stablecoin.",
    keywords: [
      "global mobile banking",
      "multi-currency personal account",
      "cross-border personal payments",
      "personal international transfers",
      "freelancer global payments",
      "diaspora banking app",
      "international money transfer app",
      "send money to Nigeria",
      "send money to China",
      "send money to the Philippines",
      "send money to Mexico",
      "send money to India",
      "remittance app for diaspora",
      "app for Nigerians abroad",
      "app for Filipinos abroad",
      "UK to Africa money transfer",
      "US to Africa money transfer",
      "send money to Ghana",
      "send money to Pakistan",
      "send money to Bangladesh",
      "app for Ghanaians abroad",
      "app for Pakistanis abroad",
      "diaspora banking Middle East",
    ],
  },
  hero: {
    h1: "Bank globally with Ease",
    subhead:
      "Receive, send, and manage money across international corridors. Stablecoin speed behind familiar banking.",
    visualSlot: "mkt-hero-personal-01",
    altText: "Freelancer using Easner Mobile app to send money internationally",
    ctas: downloadCta,
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
    "Easner banking is for people who earn, send, and spend globally – whether you operate from Lagos, London, or anywhere in between.",
  useCases: [
    {
      title: "Freelancers and remote workers",
      description:
        "Get paid in USD or EUR, hold balances, and pay out on your schedule from one mobile account.",
    },
    {
      title: "Diaspora remittances",
      description: `Send support home to ${EASNER_SUPPORTED_LOCAL_MARKETS} on faster paths than legacy bank wires – with clear fees and status in the app.`,
    },
    {
      title: "Students and families",
      description:
        "Cover tuition and living expenses across borders with tracked transfers and saved recipients.",
    },
    {
      title: "Expats",
      description:
        "Manage money between your host country and home – send, receive, and spend money in one place.",
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
    ctas: [{ ...downloadCta[0], analyticsLocation: "personal_cta_band" }],
  },
}
