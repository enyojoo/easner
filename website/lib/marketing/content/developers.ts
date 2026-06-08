import type { ProductPageContent } from "../types"
import { CONTACT_PATH } from "../constants"

export const developersContent: ProductPageContent = {
  metadata: {
    title: "Developers | Embedded Payments API",
    description:
      "Embed compliant global money rails via API. KYC/KYB, accounts, pay-in, payouts, collections, and webhooks with compliance built in.",
    keywords: [
      "stablecoin API",
      "embedded payments API",
      "fintech infrastructure API",
      "embedded finance API",
      "cross-border payout API",
      "remittance API",
    ],
  },
  hero: {
    h1: "Compliant rails in your product",
    subhead:
      "The Developer Model gives fintechs, marketplaces, and platforms API access to Easner's stablecoin banking stack – verification, accounts, pay-in, payouts, collections, and webhooks with compliance built in.",
    visualSlot: "mkt-hero-apis-01",
    altText: "Developer reviewing Easner API documentation on dual monitors",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH },
      { label: "Agency Model", href: "/partners" },
    ],
  },
  integrationStepsHeadline: "From first API call to live money movement",
  integrationSteps: [
    {
      title: "Onboard your platform",
      description: "Get API credentials and sandbox access during commercial onboarding with our team.",
    },
    {
      title: "Verify end users",
      description: "Embed hosted KYC/KYB or sync verification status for individuals and businesses.",
    },
    {
      title: "Fund and collect",
      description: "Provision accounts, virtual pay-in details, and stablecoin deposit addresses.",
    },
    {
      title: "Pay out and reconcile",
      description: "Quote FX, send payouts, and reconcile with webhooks and reporting APIs.",
    },
  ],
  featuresLayout: "bento",
  featuresHeadline: "What you can build on",
  featuresSubhead:
    "Identity, accounts, money movement, and platform tooling – one integration surface for embedded banking.",
  features: [
    {
      title: "Hosted KYC/KYB",
      description:
        "Run identity and business verification inside your onboarding – create customers, link accounts, and keep verification status in sync.",
      visualSlot: "mkt-ui-api-identity",
      altText: "Easner API customer verification flow",
    },
    {
      title: "Accounts and pay-in",
      description:
        "Issue multi-currency account details, virtual bank pay-in, and stablecoin deposit addresses from one API.",
      visualSlot: "mkt-ui-api-payin",
      altText: "Easner API accounts and pay-in provisioning",
    },
    {
      title: "Payouts and FX",
      description:
        "Quote cross-border payouts before you confirm – global and regional corridors with clear rates and status.",
      visualSlot: "mkt-ui-api-payouts",
      altText: "Easner API payout quote response",
    },
    {
      title: "Webhooks and events",
      description:
        "Get real-time signals for verification, pay-in, payouts, limits, and screening – signed payloads your backend can verify.",
      visualSlot: "mkt-ui-api-webhooks",
      altText: "Easner API webhook event log",
    },
  ],
  extraSections: [
    {
      headline: "Built for developers who ship",
      body: "Authenticated REST APIs, signed webhooks, and a developer workspace for keys, events, and logs – sandbox and API reference provided during commercial onboarding. After onboarding, access the in-app developer workspace in Easner Business at /developers.",
      bullets: [
        "Scoped API keys for server-to-server calls",
        "Sandbox for verification, pay-in, payout, and webhook flows",
        "Signed webhook payloads for backend verification",
      ],
      visualSlot: "mkt-ui-api-dev-panel",
      altText: "Easner developer workspace showing API keys, webhooks, and event logs",
    },
  ],
  useCasesHeadline: "Built for platforms that move money",
  useCasesSubhead:
    "Develop products that need embedded accounts, cross-border pay-in and payout, and compliance without building a banking stack from scratch.",
  useCases: [
    {
      title: "Fintech apps",
      description:
        "Launch neobank, remittance, or payroll products on Easner rails with verification and money movement in one integration.",
    },
    {
      title: "Marketplaces",
      description:
        "Pay sellers and collect from buyers across borders – one ledger for platform pay-in and corridor payouts with our API integration.",
    },
    {
      title: "SME platforms",
      description:
        "Give your customers embedded accounts, invoicing, and collections without standing up separate payment infrastructure.",
    },
    {
      title: "Global trade platforms",
      description:
        "Provision accounts and payouts for buyers and suppliers moving money internationally from your product.",
    },
    {
      title: "Remittance and payroll",
      description:
        "Quote FX, route corridor payouts, and reconcile pay-in and disbursement flows with webhooks and reporting APIs.",
    },
    {
      title: "Embedded finance providers",
      description:
        "Ship accounts, verification, and cross-border pay-in and payout inside your product – compliance and webhooks built in.",
    },
  ],
  ctaBand: {
    headline: "Don't start from zero. Build with us.",
    subhead: "Talk to Easner about the Developer Model and embedded global money movement.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH }],
  },
}
