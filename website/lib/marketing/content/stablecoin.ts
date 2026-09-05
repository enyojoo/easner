import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL, EASNER_EMERGING_MARKET_KEYWORDS } from "../constants"

export const stablecoinContent: ProductPageContent = {
  metadata: {
    title: "Stablecoin Payments | Send & Receive USDC and EURC",
    description:
      "Send and receive supported stablecoins with Easner. View network details, review quotes, and track payments alongside your business account activity.",
    keywords: [
      "stablecoin payments",
      "stablecoin payments infrastructure",
      "USDC business payments",
      "invisible stablecoin",
      "USDC business account",
      "stablecoin invoicing",
      "USDC payments Africa",
      "stablecoin settlement Nigeria",
      "USDC business China",
      "EURC payments Europe",
      "stablecoin payments Asia",
      "USDC payments Latin America",
      "stablecoin payments MENA",
      "USDC business Pakistan",
      ...EASNER_EMERGING_MARKET_KEYWORDS,
    ],
  },
  hero: {
    h1: "Stablecoin speed. Banking simplicity.",
    subhead:
      "Easner settles on stablecoin rails, so cross-border money moves faster. Your team works in dollars and euros, on the same dashboard as every other payment.",
    visualSlot: "mkt-hero-stablecoin-01",
    altText: "Easner Business dashboard showing stablecoin settlement activity",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "stablecoin_hero" }],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "Stablecoin receive",
      description:
        "Deposit USDC and EURC to your Business account – deposit address, network details, and ledger visibility in one place.",
      visualSlot: "mkt-ui-stablecoin-receive",
      altText: "Easner Business stablecoin receive screen",
    },
    {
      title: "Terminal collections",
      description:
        "Take in-person payments. Tap, card, or scan – every collection posts to your Business ledger alongside invoices and payouts.",
      visualSlot: "mkt-ui-stablecoin-terminal",
      altText: "Merchant using Easner Terminal for in-person payment",
    },
    {
      title: "QR Pay",
      description:
        "Share a scan-to-pay QR for retail, events, or field collections. Payers scan once; you reconcile in Easner Business with account-level controls.",
      visualSlot: "mkt-ui-stablecoin-qrpay",
      altText: "Customer scanning QR code to pay a business via Easner",
    },
    {
      title: "Corridor sends",
      description:
        "Send to supported wallets on approved networks with live quotes, clear status, and signing flows.",
      visualSlot: "mkt-ui-stablecoin-send",
      altText: "Easner Business wallet send flow",
    },
  ],
  useCasesHeadline: "Where faster settlement matters",
  useCasesSubhead:
    "For teams receiving stablecoin payments or sending funds on supported networks, with transaction records alongside their other business activity.",
  useCases: [
    {
      title: "Cross-border SMEs",
      description:
        "Settle supplier payments and customer collections on faster rails, while finance keeps the same dashboard and audit trail as every other payment.",
    },
    {
      title: "Remittance settlement",
      description:
        "Route client pay-in and corridor payouts through stablecoin settlement, with one ledger for reconciliation.",
    },
    {
      title: "Global trade operators",
      description:
        "Move funds across borders for procurement and sales without forcing counterparties into wallet-first workflows.",
    },
    {
      title: "Marketplaces and platforms",
      description:
        "Collect from buyers and pay sellers across borders without asking either side to touch a wallet – one ledger for platform settlement and reconciliation.",
    },
    {
      title: "Import and export",
      description:
        "Reduce settlement lag on international deals with compliant stablecoin rails alongside traditional bank pay-in.",
    },
    {
      title: "Software and SaaS",
      description:
        "Collect global customer payments with stablecoin pay-in, Terminal, and QR Pay – faster settlement, with every payment on one dashboard.",
    },
  ],
  faq: [
    {
      question: "How does Easner move money internationally?",
      answer:
        "Easner settles cross-border payments on stablecoin rails – primarily USDC and EURC – then pays out in local currency at the destination. You send dollars and your recipient is paid in their own currency. The settlement step happens in between, and you never handle it.",
    },
    {
      question: "Do I need a crypto wallet to use Easner?",
      answer:
        "No. Stablecoin settlement runs behind your account. You can receive to a deposit address or send to supported wallets if you want to, but everyday accounts, invoices, and payouts work in regular currencies.",
    },
    {
      question: "Why is stablecoin settlement faster than a bank wire?",
      answer:
        "A traditional wire passes through several correspondent banks, each adding a step. Stablecoin settlement shortens that path between Easner and its payout partners. Timing still depends on destination, banking hours, and verification checks.",
    },
    {
      question: "Which stablecoins does Easner support?",
      answer:
        "USDC and EURC on supported networks. Deposit addresses and network details are shown in your Easner Business account before you send or receive.",
    },
  ],
  ctaBand: {
    headline: "Put stablecoin infrastructure to work",
    subhead: "Manage stablecoin payments and supported in-person collections alongside your business accounts.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "stablecoin_cta_band" }],
  },
  complianceNote:
    "Stablecoin receive, send, Terminal, and QR Pay run through the same verification and screening as the rest of your Easner Business account.",
}
