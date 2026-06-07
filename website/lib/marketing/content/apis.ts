import type { ProductPageContent } from "../types"
import { CONTACT_PATH } from "../constants"

export const apisContent: ProductPageContent = {
  metadata: {
    title: "Stablecoin API Infrastructure – Easner",
    description:
      "Embed compliant global money rails in your app. Easner APIs for KYC/KYB, accounts, pay-in, FX quotes, payouts, collections, and webhooks.",
    keywords: [
      "stablecoin API",
      "embedded payments API",
      "fintech infrastructure API",
    ],
  },
  hero: {
    h1: "Compliant rails in your product",
    subhead:
      "Easner APIs give fintechs, marketplaces, and platforms the same stablecoin banking stack behind Easner Personal and Business – verification, accounts, pay-in, payouts, collections, and webhooks with compliance built in.",
    visualSlot: "mkt-hero-apis-01",
    altText: "Developer reviewing Easner API documentation on dual monitors",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH }],
  },
  integrationStepsHeadline: "From first API call to live money movement",
  integrationSteps: [
    {
      title: "Onboard your platform",
      description: "Get API credentials and sandbox access with our team.",
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
      body: "Authenticated REST APIs, signed webhooks, and a developer workspace for keys, events, and logs – provisioned during commercial onboarding.",
      bullets: [
        "Scoped API keys for server-to-server calls",
        "Sandbox for verification, pay-in, payout, and webhook flows",
        "Signed webhook payloads for backend verification",
      ],
      visualSlot: "mkt-ui-api-dev-panel",
      altText: "Easner developer panel showing API keys, webhook configuration, and event log",
    },
  ],
  commercialModels: [
    {
      title: "Agency / white-label",
      description:
        "Branded setup, infrastructure maintenance, and volume-based processing – embed Easner as your banking layer.",
      icon: "mkt-icon-api-agency",
    },
    {
      title: "API integration",
      description:
        "Platform access and API fees on volume – for teams building custom experiences on Easner rails.",
      icon: "mkt-icon-api-integration",
    },
  ],
  useCasesHeadline: "Built for platforms that move money",
  useCasesSubhead:
    "Easner APIs for products that need embedded accounts, cross-border pay-in and payout, and compliance without building a banking stack from scratch.",
  useCases: [
    {
      title: "Fintech apps",
      description:
        "Launch neobank, remittance, or payroll products on Easner rails with verification and money movement in one integration.",
    },
    {
      title: "Marketplaces",
      description:
        "Pay sellers and collect from buyers across borders – one ledger for platform pay-in and corridor payouts.",
    },
    {
      title: "SME platforms",
      description:
        "Give your customers embedded accounts, invoicing, and collections without standing up separate payment infrastructure.",
    },
    {
      title: "Agencies",
      description:
        "White-label banking for a vertical or corridor – branded setup on Easner with agency commercial terms.",
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
  ],
  ctaBand: {
    headline: "Don't start from zero. Build with us.",
    subhead: "Talk to Easner about API access, agency models, and embedded global money movement.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH }],
  },
}
