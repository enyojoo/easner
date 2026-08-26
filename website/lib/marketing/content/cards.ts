import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const cardsContent: ProductPageContent = {
  metadata: {
    title: "Business Cards | Virtual & Physical",
    description:
      "Issue virtual and physical cards on Easner. Set spend controls, manage cardholders, and reconcile spend with accounts and payouts.",
    keywords: [
      "corporate cards global business",
      "virtual cards SME",
      "spend controls",
      "business expense cards",
      "global corporate cards",
      "virtual cards cross-border",
    ],
  },
  hero: {
    h1: "Virtual and physical cards, one ledger",
    subhead:
      "Issue cards on Easner Business or Easner Mobile. Set spend controls, manage cardholders, and see every purchase in the same ledger as your accounts and payouts.",
    visualSlot: "mkt-hero-cards-01",
    altText: "Easner virtual and physical payment cards in the Business dashboard",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "cards_hero" }],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Virtual and physical cards",
      description:
        "Issue virtual cards when available or ship physical cards to cardholders – from Easner Business or Easner Mobile.",
      visualSlot: "mkt-ui-cards-issue",
      altText: "Easner issue card flow with virtual and physical options",
    },
    {
      title: "Spend controls",
      description:
        "Set monthly limits, merchant rules, and team policies by cardholder – so global spend stays inside guardrails finance can audit.",
      visualSlot: "mkt-ui-cards-controls",
      altText: "Easner card spend policy controls",
    },
    {
      title: "Cardholder management",
      description:
        "Add cardholders, assign cards, freeze spend, and retire cards from the dashboard – no separate card portal.",
      visualSlot: "mkt-ui-cards-cardholders",
      altText: "Easner cardholder roster with status controls",
    },
    {
      title: "Unified reporting",
      description:
        "Card purchases alongside payouts, collections, and account activity – one ledger for finance and ops.",
      visualSlot: "mkt-ui-cards-reporting",
      altText: "Easner unified activity feed with card and payout transactions",
    },
  ],
  useCasesHeadline: "Built for global spend",
  useCasesSubhead:
    "Easner cards for teams and individuals that pay across borders and need clear visibility into who spent what.",
  useCases: [
    {
      title: "Cross-border teams",
      description:
        "Give distributed staff cards for software, travel, and suppliers – with limits instead of personal reimbursements.",
    },
    {
      title: "Software and SaaS",
      description:
        "Issue virtual cards for subscriptions and vendor spend, then reconcile alongside payouts in Easner Business.",
    },
    {
      title: "Travel and field ops",
      description:
        "Equip sales and operations teams with physical cards and travel policies finance can monitor in one dashboard.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Separate client project spend from firm overhead with cardholders, limits, and reporting tied to your business account.",
    },
    {
      title: "Freelancers and remote workers",
      description:
        "Use a personal Easner card for global online spend while keeping send, receive, and card activity in one mobile account.",
    },
    {
      title: "Import and export operators",
      description:
        "Cover supplier deposits, logistics, and trade expenses from the same platform you use for international payouts.",
    },
  ],
  ctaBand: {
    headline: "Add cards to your Easner account",
    subhead: "Corporate cards on Easner Business. Personal cards on Easner Mobile.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "cards_cta_band" }],
  },
}
