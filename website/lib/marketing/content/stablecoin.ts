import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const stablecoinContent: ProductPageContent = {
  metadata: {
    title: "Stablecoin Payments | Receive, Send & QR Pay",
    description:
      "Stablecoin speed with familiar banking screens on Easner Business – receive, send, Terminal, and QR Pay, with compliance built in.",
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
    ],
  },
  hero: {
    h1: "Stablecoin payments",
    subhead:
      "Run receive, send, Terminal, and QR Pay on rails your team already understands – USDC and EURC settlement with KYC/KYB and compliance built in.",
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
    "Stablecoin infrastructure for teams that need faster cross-border pay-in and payout without exposing users to crypto complexity.",
  useCases: [
    {
      title: "Cross-border SMEs",
      description:
        "Settle supplier payments and customer collections on faster rails while finance keeps familiar banking screens and audit trails.",
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
        "Collect from buyers and pay sellers across borders with familiar pay-in and payout flows – one ledger for platform settlement and reconciliation.",
    },
    {
      title: "Import and export",
      description:
        "Reduce settlement lag on international deals with compliant stablecoin rails alongside traditional bank pay-in.",
    },
    {
      title: "Software and SaaS",
      description:
        "Collect global customer payments with stablecoin pay-in, Terminal, and QR Pay – familiar banking screens for finance, faster settlement.",
    },
  ],
  ctaBand: {
    headline: "Put stablecoin infrastructure to work",
    subhead: "Receive, send, Terminal, and QR Pay in familiar banking screens – without showing your users a crypto app.",
    ctas: [{ label: "Open Business account", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "stablecoin_cta_band" }],
  },
  complianceNote:
    "Stablecoin receive, send, Terminal, and QR Pay run through the same verification and screening as the rest of your Easner Business account.",
}
