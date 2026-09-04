import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const paymentLinksContent: ProductPageContent = {
  metadata: {
    title: "Payment Links | Get Paid With a Link",
    description:
      "Create a shareable payment link and get paid – no website or code needed. One-time or recurring, card and bank, reconciled in one ledger in Easner Business.",
    keywords: [
      "payment link generator",
      "get paid with a link",
      "no code payment page",
      "collect payment without a website",
      "recurring payment link",
      "share a payment link",
      "small business payment link",
    ],
  },
  hero: {
    h1: "Get paid with a link",
    subhead:
      "Create a shareable payment page in minutes – no website or code needed. One-time or recurring, card and bank, with Easner as the merchant on record.",
    visualSlot: "mkt-hero-paylinks-01",
    altText: "Easner Payment Links hosted pay page",
    ctas: [
      { label: "Create a payment link", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "paylinks_hero" },
      { label: "See how it works", href: "#features", analyticsLocation: "paylinks_hero_features" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "One-time or recurring",
      description:
        "Charge once, or set a billing interval with an optional free trial – customers see a clear renewal disclosure before they pay.",
      visualSlot: "mkt-ui-paylinks-create",
      altText: "Easner Payment Links create link dialog",
    },
    {
      title: "Share anywhere",
      description:
        "Send your link by email, chat, or social – no website required. Customers pay on a page that's ready to go.",
      visualSlot: "mkt-ui-paylinks-share",
      altText: "Easner Payment Links share link screen",
    },
    {
      title: "Reusable until you close it",
      description:
        "One link can take payment from many customers – track every payment and the total collected in one place.",
      visualSlot: "mkt-ui-paylinks-stats",
      altText: "Easner Payment Links payment count and totals",
    },
    {
      title: "One ledger",
      description:
        "Every payment link settles alongside your invoices, payouts, and card activity in Easner Business – one place to reconcile.",
      visualSlot: "mkt-ui-paylinks-ledger",
      altText: "Easner Business unified ledger with payment link activity",
    },
  ],
  useCasesHeadline: "Built for anyone who needs to get paid",
  useCasesSubhead:
    "Easner Payment Links is for teams and individuals who want to collect money today – no website, no code.",
  useCases: [
    {
      title: "Freelancers and consultants",
      description: "Send a client a link for a retainer or project fee – no invoice required.",
    },
    {
      title: "Coaches and creators",
      description: "Charge for sessions, programs, or digital products with a link that matches what you sell.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Bill clients online with a link instead of chasing bank transfers, alongside invoicing in Easner Business.",
    },
    {
      title: "Small businesses without a website",
      description: "Start collecting online payments today – add Easner Checkout later if you build a site.",
    },
    {
      title: "Community and mission collections",
      description: "Collect donations and mission support with a link you can share anywhere.",
    },
  ],
  faq: [
    {
      question: "Do I need a website?",
      answer:
        "No. Payment Links is Easner's no-code option – you get a shareable hosted page with no website or code required. If you already have a website, Easner Checkout lets you embed payments directly.",
    },
    {
      question: "Can a payment link be reused?",
      answer: "Yes. A link stays open and can take payment from multiple customers until you close it.",
    },
    {
      question: "Can a payment link recur?",
      answer:
        "Yes. Set a billing interval and an optional free trial – customers see a renewal disclosure before they pay.",
    },
    {
      question: "How do payouts work?",
      answer:
        "Payments settle into your Easner Business account and reconcile alongside your other activity in one ledger.",
    },
  ],
  ctaBand: {
    headline: "Create your first payment link",
    subhead: "No website or code needed – on Easner Business.",
    ctas: [{ label: "Create a payment link", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "paylinks_cta_band" }],
  },
  complianceNote:
    "Payment links run through the same verification and screening as the rest of your Easner Business account.",
}
