import type { ProductPageContent } from "../types"

export const cardsContent: ProductPageContent = {
  metadata: {
    title: "Personal & Business Cards | Virtual & Physical",
    description:
      "Virtual and physical cards for personal and business spending, with monthly limits, merchant rules and cardholder controls – when available.",
    keywords: [
      "virtual and physical business cards",
      "card spend limits",
      "freeze a card",
      "personal debit card app",
      "corporate cards global business",
      "virtual cards SME",
      "spend controls",
      "business expense cards",
      "global corporate cards",
      "virtual cards cross-border",
      "corporate cards for distributed teams",
      "spend management for remote teams",
    ],
  },
  hero: {
    h1: "Manage spending with Easner cards",
    subhead:
      "Set spending limits, manage cardholders, and track purchases alongside your account activity. Personal and business cards are rolling out in phases, subject to availability and approval.",
    visualSlot: "mkt-hero-cards-01",
    altText: "Easner card faces marked Coming soon",
    ctas: [{ label: "Open Account", href: "#", action: "open-account", analyticsLocation: "cards_hero" }],
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
      altText: "A card spend preview listing purchases by card",
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
  faq: [
    {
      question: "When will Easner cards be available?",
      answer:
        "Cards are rolling out in phases. They appear in Easner Business and the Easner app once they're available for your account and you're approved.",
    },
    {
      question: "Are there personal and business cards?",
      answer:
        "Yes. Corporate cards are issued from Easner Business; personal cards come with Easner Personal Banking in the Easner app, when available.",
    },
    {
      question: "Can I get virtual and physical cards?",
      answer:
        "Both. Virtual cards are ready to use online, and physical cards are shipped to the cardholder, when available.",
    },
    {
      question: "What spending controls are there?",
      answer:
        "Monthly limits, merchant rules and team policies for each cardholder, plus the option to freeze or retire a card from the dashboard.",
    },
    {
      question: "Where do card purchases show up?",
      answer:
        "Alongside your payouts, collections and account activity in Easner Business, so finance reconciles everything in one place.",
    },
    {
      question: "Who issues Easner cards?",
      links: [{ label: "Read the Terms of Service", href: "/terms" }],
      answer:
        "Card products are issued by a third-party issuer and are subject to approval. Easner is a financial technology company, not a bank.",
    },
  ],
  ctaBand: {
    headline: "Add cards to your Easner account",
    subhead: "Corporate cards on Easner Business. Personal cards on Easner Mobile, when available.",
    ctas: [{ label: "Open Account", href: "#", action: "open-account", analyticsLocation: "cards_cta_band" }],
  },
}
