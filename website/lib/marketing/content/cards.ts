import type { ProductPageContent } from "../types"
import { ACCESS_PATH } from "../constants"

export const cardsContent: ProductPageContent = {
  metadata: {
    title: "Cards – Easner",
    description:
      "Corporate and personal cards for global businesses and individuals. Spend controls, cardholder management, and reporting – alongside your Easner accounts and payouts.",
    keywords: ["corporate cards global business", "spend controls"],
  },
  hero: {
    h1: "Corporate and personal cards, built into Easner.",
    subhead:
      "Issue virtual and physical cards from the same dashboard you use for accounts, payouts, and collections. Set spend controls, manage cardholders, and see every transaction in one place.",
    visualSlot: "mkt-hero-cards-01",
    altText: "Professional holding Easner-branded payment card",
    ctas: [
      { label: "Get Started", href: ACCESS_PATH },
      { label: "Open Business account", href: ACCESS_PATH },
    ],
  },
  problem: {
    headline: "Global operations need global spend.",
    body: "Cross-border teams pay for software, travel, and suppliers with personal cards, reimbursements, and ad-hoc approvals. Spend controls work best when card activity sits beside accounts, payouts, and reporting.",
  },
  solution: {
    headline: "Cards on the same platform as your accounts and payouts.",
    body: "Personal cards on Easner Personal. Corporate cards on Easner Business. One verification flow, one dashboard, and one ledger – so team spend stays connected to the accounts and payouts you already run.",
    visualSlot: "mkt-ui-cards-controls",
    altText: "Card spend controls dashboard mockup",
    reverse: true,
  },
  features: [
    {
      title: "Virtual and physical cards",
      description:
        "Issue cards for yourself or approved team members – virtual for instant access, physical for everyday spend.",
      visualSlot: "mkt-ui-cards-issue",
      altText: "Virtual and physical Easner card mockup",
    },
    {
      title: "Spend controls",
      description: "Set limits and policies by cardholder, team, or spending context.",
      visualSlot: "mkt-ui-cards-controls",
      altText: "Card spend controls dashboard mockup",
    },
    {
      title: "Cardholder management",
      description: "Add, freeze, and retire cardholders from the Easner dashboard.",
      visualSlot: "mkt-ui-cards-cardholders",
      altText: "Easner cardholder management dashboard mockup",
    },
    {
      title: "Unified reporting",
      description: "See card spend alongside account, payout, and collection activity.",
      visualSlot: "mkt-ui-cards-reporting",
      altText: "Unified card and account reporting mockup",
    },
  ],
  ctaBand: {
    headline: "Spend globally from your Easner account.",
    subhead: "Open a Personal or Business account and add cards alongside accounts, payouts, and invoicing.",
    ctas: [{ label: "Get Started", href: ACCESS_PATH }],
  },
  faq: [
    {
      question: "Who can use Easner cards?",
      answer:
        "Easner offers personal cards through Easner Personal and corporate cards through Easner Business – each tied to the account you already use.",
    },
    {
      question: "Who issues the cards?",
      answer:
        "Cards are issued or facilitated by licensed card program partners. Easner provides the dashboard, controls, and reporting experience.",
    },
    {
      question: "Will there be personal and corporate cards?",
      answer:
        "Yes. Personal cards for individuals on Easner Personal; corporate cards for organizations on Easner Business.",
    },
    {
      question: "Is credit required?",
      answer:
        "Card products may require partner underwriting and credit review depending on the card program and your profile.",
    },
    {
      question: "Can I use Easner without cards?",
      answer:
        "Yes. Accounts, payouts, and invoicing work on their own – cards add spend controls on top of the same platform.",
    },
  ],
}
