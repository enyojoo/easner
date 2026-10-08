import type { ProductPageContent } from "../types"
import { CONTACT_PATH } from "../constants"

export const developersContent: ProductPageContent = {
  metadata: {
    title: "Embedded Banking & Payments API",
    description:
      "Build accounts, customer collections, and global payouts into your product with Easner APIs, verification workflows, and webhooks.",
    keywords: [
      "payout quote API",
      "signed webhooks",
      "sandbox payments API",
      "stablecoin deposit address API",
      "stablecoin API",
      "embedded payments API",
      "fintech infrastructure API",
      "embedded finance API",
      "cross-border payout API",
      "embedded payouts API",
      "remittance API",
      "payouts API Africa",
      "payments API Latin America",
      "KYC and KYB API",
      "payouts API MENA",
      "payments API Southeast Asia",
    ],
  },
  hero: {
    h1: "Build international payments into your product",
    subhead:
      "Connect customer verification, accounts, collections, and payouts to your platform, built on Easner's stablecoin infrastructure. APIs and webhooks help your team build and track cross-border payment flows.",
    visualSlot: "mkt-hero-apis-01",
    altText: "The Easner developer Workbench creating a payout through the API",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "developers_hero_contact" },
      { label: "Agency Model", href: "/partners", analyticsLocation: "developers_hero_partners" },
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
    "Connect onboarding and money movement through one integration, with events your backend can follow.",
  features: [
    {
      title: "Hosted KYC/KYB",
      description:
        "Run identity and business verification inside your onboarding – create customers, link accounts, and keep verification status in sync.",
      visualSlot: "mkt-ui-api-identity",
      altText: "Customers with their verification status in the developer console",
    },
    {
      title: "Accounts and pay-in",
      description:
        "Issue multi-currency account details, virtual bank pay-in, and stablecoin deposit addresses from one API.",
      visualSlot: "mkt-ui-api-payin",
      altText: "A customer's receive details: a US account and a USDC deposit address",
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
      altText: "API keys in the developer console with a sample request",
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
  faq: [
    {
      question: "How do I get access to the Easner API?",
      links: [{ label: "Talk to our team", href: "/contact" }],
      answer:
        "Talk to our team. API credentials and sandbox access are provided during commercial onboarding.",
    },
    {
      question: "What can I build with the API?",
      answer:
        "Customer verification, multi-currency accounts and pay-in details, stablecoin deposit addresses, payout quotes and cross-border payouts, all with webhooks for every status change.",
    },
    {
      question: "Is there a sandbox?",
      answer:
        "Yes. Test keys and a sandbox let you run verification, pay-in, payout and webhook flows before you go live.",
    },
    {
      question: "How are webhooks secured?",
      answer:
        "Every webhook payload is signed, so your backend can verify it came from Easner before acting on it.",
    },
    {
      question: "Do my customers need a crypto wallet?",
      answer:
        "No. Settlement runs on stablecoin rails behind the API; your customers see balances and payments in regular currencies.",
    },
    {
      question: "How is the API priced?",
      links: [{ label: "Contact sales", href: "/contact" }],
      answer:
        "Pricing depends on your use case and volumes. Contact our team for commercial terms.",
    },
  ],
  ctaBand: {
    headline: "Don't start from zero. Build with us.",
    subhead: "Talk to Easner about the Developer Model and embedded global money movement.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "developers_cta_band" }],
  },
}
