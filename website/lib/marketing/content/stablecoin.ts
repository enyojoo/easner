import type { ProductPageContent } from "../types"
import { ACCESS_PATH, CONTACT_PATH } from "../constants"

export const stablecoinContent: ProductPageContent = {
  metadata: {
    title: "Stablecoin Payments – Easner",
    description:
      "Stablecoin speed with banking screens. Easner powers receive, send, Terminal, and QR Pay flows where enabled.",
    keywords: [
      "stablecoin payments infrastructure",
      "USDC business payments",
      "invisible stablecoin",
    ],
  },
  hero: {
    h1: "Stablecoin speed. Banking screens.",
    subhead:
      "Easner turns stablecoin settlement into familiar payment flows. Users see account details, receive options, quotes, statuses, Terminal, and QR Pay where enabled – not crypto complexity.",
    visualSlot: "mkt-hero-stablecoin-01",
    altText: "Easner dashboard showing bank and stablecoin payment options",
    ctas: [
      { label: "Get Started", href: ACCESS_PATH },
      { label: "Contact sales", href: CONTACT_PATH },
    ],
  },
  problem: {
    headline: "Settlement improved. UX and compliance lagged.",
    body: "Stablecoins improved settlement speed and cost, but many products still feel like crypto tools. Businesses need familiar screens, clear controls, and compliance workflows on top of modern rails.",
  },
  solution: {
    headline: "What users see vs what moves underneath",
    body: "Customers and teams see amounts in familiar fiat terms, account details, quotes, and payment status. Where enabled, Easner supports stablecoin deposit addresses and wallet-initiated sends through approved corridors, primarily in Easner Business.",
    visualSlot: "mkt-diagram-invisible-rails",
    altText:
      "Diagram comparing legacy 5-day bank transfer path with Easner stablecoin settlement flow",
    bullets: [
      "Users are not asked to trade or speculate on crypto",
      "Deposit addresses and transaction hashes may be public on blockchain networks",
      "Digital assets are not bank deposits and may involve public, irreversible transactions",
    ],
    reverse: true,
  },
  extraSections: [
    {
      headline: "One Receive experience. Two funding paths.",
      body: "Fund an account by bank transfer to account details, or share a stablecoin deposit address where enabled. Same account flow, same compliance controls, same dashboard visibility.",
      visualSlot: "mkt-ui-stablecoin-receive",
      altText: "Receive screen with Bank and Stablecoin tabs",
    },
    {
      headline: "Terminal – collect in person, reconcile in Easner Business.",
      body: "Accept in-person payments with Easner Terminal where enabled. Collections, payouts, and reporting stay in your business dashboard alongside invoices and transfers.",
      visualSlot: "mkt-ui-terminal",
      altText: "Merchant using Easner Terminal for in-person payment",
    },
    {
      headline: "QR Pay – scan, pay, done.",
      body: "Generate QR payment flows for events, retail, or field collections, with funds routed through Easner Business and account-level controls.",
      visualSlot: "mkt-ui-qrpay",
      altText: "Customer scanning QR code to pay a business via Easner",
    },
    {
      headline: "Wallet-initiated sends for approved corridors.",
      body: "Organizations can initiate wallet sends through approved corridors in Easner Business, with quotes, status tracking, and signing flows. Availability depends on verification, destination, and product rules.",
      visualSlot: "mkt-ui-business-send",
      altText: "Easner Business wallet send flow",
    },
  ],
  ctaBand: {
    headline:
      "Put stablecoin infrastructure to work – without showing your users a crypto app.",
    subhead: "Banking-simple receive, send, Terminal, and QR Pay flows where enabled.",
    ctas: [
      { label: "Get Started", href: ACCESS_PATH },
      { label: "Contact", href: CONTACT_PATH },
    ],
  },
  faq: [
    {
      question: "Do my customers need a crypto wallet to pay me?",
      answer:
        "No. They can pay by bank transfer where available. Stablecoin pay-in is an additional option where enabled.",
    },
    {
      question: "Which stablecoins are supported?",
      answer: "USDC and EURC on supported networks where enabled for your profile.",
    },
    {
      question: "Is stablecoin required?",
      answer: "No. Fiat rails remain available. Stablecoin is an efficiency layer where enabled.",
    },
    {
      question: "What are Terminal and QR Pay?",
      answer:
        "Business collection tools for in-person and scan-to-pay flows, integrated with Easner Business reporting.",
    },
    {
      question: "Who holds wallet keys?",
      answer:
        "Wallet and key management are handled by infrastructure providers. Easner is not a direct custodian.",
    },
  ],
}
