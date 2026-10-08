/**
 * Social share cards (Open Graph and X). One entry per public page: where the image file goes, a headline of two or three short lines, one line written for sharing (never truncated),
 * and the visual on the right. Cards are drawn by app/og/[slug] and captured by scripts/generate-og-images.mjs.
 */

export type OgVisual =
  | { kind: "screen"; slot: string }
  | { kind: "home" }
  | { kind: "phone" }
  | { kind: "shield" }
  | { kind: "mark" }

export interface OgCard {
  slug: string
  /** Route directory under app/(marketing) that receives opengraph-image.jpg ("" = home). */
  route: string
  headline: string[]
  /** Index of a headline line set in light blue. */
  accentLine?: number
  line: string
  visual: OgVisual
  alt: string
}

export const OG_CARDS: OgCard[] = [
  {
    slug: "home",
    route: "",
    headline: ["Your Money.", "Moved with Ease."],
    accentLine: 1,
    line: "Bank, spend and send money to people and businesses in 80+ countries.",
    visual: { kind: "home" },
    alt: "Easner – Your Money. Moved with Ease. Easner Business home with balances and recent payments.",
  },
  {
    slug: "personal",
    route: "personal",
    headline: ["Bank globally", "with Ease"],
    accentLine: 1,
    line: "Hold USD and EUR, get paid, and send to 80+ countries from the Easner app.",
    visual: { kind: "screen", slot: "mkt-hero-personal-01" },
    alt: "Easner Personal Banking – the Easner app home screen and a transfer review.",
  },
  {
    slug: "business",
    route: "business",
    headline: ["Global banking", "for business"],
    accentLine: 1,
    line: "Accounts, customer payments and payouts to 80+ countries in one dashboard.",
    visual: { kind: "screen", slot: "mkt-hero-business-01" },
    alt: "Easner Business Banking – total balance and recent activity.",
  },
  {
    slug: "checkout",
    route: "checkout",
    headline: ["Accept payments", "on your website"],
    accentLine: 1,
    line: "Card, bank and stablecoin payments, with Easner as merchant of record.",
    visual: { kind: "screen", slot: "mkt-hero-checkout-01" },
    alt: "Easner Checkout – a hosted checkout page with Apple Pay, card, bank and stablecoin.",
  },
  {
    slug: "payment-links",
    route: "payment-links",
    headline: ["Get paid", "with a link"],
    accentLine: 1,
    line: "One-time or recurring payments. No website or code needed.",
    visual: { kind: "screen", slot: "mkt-hero-paylinks-01" },
    alt: "Easner Payment Links – a hosted payment page.",
  },
  {
    slug: "invoicing",
    route: "invoicing",
    headline: ["Send an invoice.", "Get paid."],
    accentLine: 1,
    line: "Customers pay by card, bank transfer or stablecoin, on one hosted page.",
    visual: { kind: "screen", slot: "mkt-hero-invoicing-01" },
    alt: "Easner Invoicing – an invoice beside its payment panel.",
  },
  {
    slug: "payroll",
    route: "payroll",
    headline: ["Your team.", "Your payroll."],
    accentLine: 1,
    line: "Pay your team in 80+ countries, with approvals before any money moves.",
    visual: { kind: "screen", slot: "mkt-hero-payroll-01" },
    alt: "Easner Payroll – the next payday and recent paydays.",
  },
  {
    slug: "cards",
    route: "cards",
    headline: ["Manage spending", "with Easner cards"],
    accentLine: 1,
    line: "Virtual and physical cards with limits and spend controls.",
    visual: { kind: "screen", slot: "mkt-hero-cards-01" },
    alt: "Easner cards – two Easner card faces.",
  },
  {
    slug: "stablecoin",
    route: "stablecoin",
    headline: ["Stablecoin speed.", "Banking simplicity."],
    accentLine: 1,
    line: "Send and receive USDC, USDT and EURC, where enabled, beside your accounts.",
    visual: { kind: "screen", slot: "mkt-hero-stablecoin-01" },
    alt: "Easner stablecoin payments – a stablecoin deposit address with its QR code.",
  },
  {
    slug: "developers",
    route: "developers",
    headline: ["Build payments", "into your product"],
    accentLine: 1,
    line: "APIs for verification, accounts, payouts and webhooks.",
    visual: { kind: "screen", slot: "mkt-hero-developers-01" },
    alt: "Easner for developers – the Workbench creating a payout through the API.",
  },
  {
    slug: "partners",
    route: "partners",
    headline: ["Payments under", "your brand"],
    accentLine: 1,
    line: "Launch cross-border payments on Easner infrastructure, with our support.",
    visual: { kind: "screen", slot: "mkt-hero-partners-01" },
    alt: "Easner for Partners – the Easner app under a partner's brand.",
  },
  {
    slug: "app",
    route: "app",
    headline: ["Download", "the Easner app"],
    accentLine: 1,
    line: "Easner Personal Banking on iPhone and Android.",
    visual: { kind: "phone" },
    alt: "Download the Easner app – the app home screen.",
  },
  {
    slug: "about",
    route: "about",
    headline: ["Built for your money.", "Ready for your world."],
    accentLine: 1,
    line: "Stablecoin-native banking and payments for individuals and businesses.",
    visual: { kind: "mark" },
    alt: "About Easner.",
  },
  {
    slug: "contact",
    route: "contact",
    headline: ["Let's talk"],
    accentLine: 0,
    line: "Book a call about accounts, payments, partnerships or the API.",
    visual: { kind: "mark" },
    alt: "Contact Easner.",
  },
  {
    slug: "compliance",
    route: "compliance",
    headline: ["KYC/KYB and", "AML Policy"],
    accentLine: 1,
    line: "How Easner verifies customers and screens transactions.",
    visual: { kind: "shield" },
    alt: "Easner KYC/KYB and AML Policy.",
  },
  {
    slug: "privacy",
    route: "privacy",
    headline: ["Privacy Policy"],
    accentLine: 0,
    line: "How Easner collects, uses and protects your information.",
    visual: { kind: "shield" },
    alt: "Easner Privacy Policy.",
  },
  {
    slug: "terms",
    route: "terms",
    headline: ["Terms of Service"],
    accentLine: 0,
    line: "The terms for using Easner's websites, apps and services.",
    visual: { kind: "mark" },
    alt: "Easner Terms of Service.",
  },
  {
    slug: "delete-account",
    route: "delete-account",
    headline: ["Delete your account"],
    accentLine: 0,
    line: "How to close your Easner account and what happens to your data.",
    visual: { kind: "mark" },
    alt: "Delete your Easner account.",
  },
]
