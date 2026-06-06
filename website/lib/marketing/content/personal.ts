import type { ProductPageContent } from "../types"
import { ACCESS_PATH, APP_STORE_URL, PLAY_STORE_URL } from "../constants"

export const personalContent: ProductPageContent = {
  metadata: {
    title: "Personal Banking – Easner",
    description:
      "Global banking in your pocket. Receive, send, and manage money across supported global and African corridors with Easner Personal.",
    keywords: [
      "personal international transfers",
      "diaspora banking app",
      "global mobile banking",
    ],
  },
  hero: {
    h1: "Global banking in your pocket.",
    subhead:
      "Easner Personal gives global earners a mobile account experience for receiving, sending, and managing money across supported corridors – with bank and stablecoin options where enabled.",
    visualSlot: "mkt-hero-personal-01",
    altText: "Freelancer using Easner Personal app to send money internationally",
    ctas: [
      { label: "Download on the App Store", href: APP_STORE_URL },
      { label: "Get it on Google Play", href: PLAY_STORE_URL },
      { label: "Get Started", href: ACCESS_PATH },
    ],
  },
  problem: {
    headline: "Formal rails are slow. Informal FX is risky.",
    body: "Cross-border corridors can take days to settle and charge double-digit fees. Informal FX may feel faster, but it is hard to track and risky to rely on. Global earners need a cleaner way to receive, hold, and move money.",
    stat: "Some regions remain among the world's most expensive remittance corridors – fees can exceed 12% with multiple intermediaries.",
  },
  solution: {
    headline: "Banking-simple. Built for your life abroad.",
    body: "Easner Personal brings account details, pay-in, pay-out, recipients, Easner tags, and stablecoin receive where enabled into one mobile app. Verify once, then manage cross-border money movement without learning crypto.",
    visualSlot: "mkt-ui-personal-receive",
    altText: "Easner Personal Receive screen showing Bank and Stablecoin options",
    reverse: true,
  },
  features: [
    {
      title: "Send money",
      description:
        "Send by supported bank, stablecoin, open banking, or mobile money routes where enabled. Review fees and rates before you confirm.",
      visualSlot: "mkt-ui-personal-send",
      altText: "Easner Personal send money screen",
    },
    {
      title: "Receive money",
      description:
        "Get paid with account details or a stablecoin deposit address where enabled, all from one Receive experience.",
      visualSlot: "mkt-ui-personal-receive",
      altText: "Easner Personal receive options",
    },
    {
      title: "Recipients and Easner tag",
      description:
        "Save recipients, send to Easner tags, and keep repeat transfers clean and easy to track.",
      visualSlot: "mkt-ui-personal-recipients",
      altText: "Easner Personal recipients and Easner tag",
    },
    {
      title: "Security",
      description:
        "Use multi-factor authentication, PIN, and biometric unlock where supported on your device.",
      visualSlot: "mkt-icon-security",
      altText: "Security features illustration",
    },
  ],
  useCases: [
    {
      title: "Diaspora remittances",
      description:
        "Send support home on faster rails than legacy bank wires where available.",
    },
    {
      title: "Freelancers and remote workers",
      description:
        "Invoice abroad, receive USD/EUR, convert and payout on your schedule.",
    },
    {
      title: "Students and families",
      description:
        "Pay tuition and living expenses across borders with clear tracking.",
    },
  ],
  ctaBand: {
    headline: "Take Easner Personal with you.",
    subhead: "Mobile banking for global earners, supported corridors, and real-world money movement.",
    ctas: [
      { label: "Download on the App Store", href: APP_STORE_URL },
      { label: "Get it on Google Play", href: PLAY_STORE_URL },
    ],
  },
  faq: [
    {
      question: "Who is Easner Personal for?",
      answer:
        "Individuals 18 or older in supported jurisdictions who want a mobile way to receive, send, and manage money across borders.",
    },
    {
      question: "Do I need a crypto wallet?",
      answer:
        "No. Easner provides banking-simple screens. Stablecoin receive and send features appear only where enabled for your profile.",
    },
    {
      question: "How long do transfers take?",
      answer:
        "Processing times vary by corridor, partner, and compliance review – often minutes to hours, not guaranteed.",
    },
    {
      question: "Is Easner Personal available on web?",
      answer:
        "Easner Personal is a mobile application. Businesses use Easner Business on the web.",
    },
    {
      question: "What is Tier 2 African banking?",
      answer:
        "NGN and regional pay-in and pay-out where we launch, subject to additional eligibility beyond Tier 1.",
    },
  ],
}
