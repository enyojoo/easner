import type { ProductPageContent } from "../types"
import { ACCESS_PATH, CONTACT_PATH } from "../constants"

export const apisContent: ProductPageContent = {
  metadata: {
    title: "Stablecoin API Infrastructure – Easner",
    description:
      "Embed compliant rails in your app. Easner APIs for KYC/KYB, accounts, payouts, wallets, and collections – stablecoin banking infrastructure for developers and platforms.",
    keywords: [
      "stablecoin API",
      "embedded payments API",
      "fintech infrastructure API",
    ],
  },
  hero: {
    h1: "Embed compliant rails in your app.",
    subhead:
      "Easner APIs give fintechs, marketplaces, and platforms access to verification, accounts, payouts, wallets, and collections – the same stablecoin banking infrastructure behind Easner Personal and Business.",
    visualSlot: "mkt-hero-apis-01",
    altText: "Developer reviewing Easner API documentation on dual monitors",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH },
      { label: "Get Started", href: ACCESS_PATH },
    ],
  },
  problem: {
    headline: "Building global payments from scratch is slow and risky.",
    body: "Verification, compliance operations, wallet infrastructure, corridor coverage, and reconciliation take years to assemble. Your roadmap cannot wait for a full banking stack, but cutting corners on KYC/AML is not an option.",
  },
  solution: {
    headline: "Plug into infrastructure that's already integrated.",
    body: "Easner offers API and agency models on top of a stablecoin banking stack: verification, fiat and stablecoin flows, accounts, payouts, and business collections patterns you can embed or white-label.",
    visualSlot: "mkt-hero-apis-01",
    altText: "Easner API integration diagram",
  },
  commercialModels: [
    {
      title: "Agency / white-label model",
      description:
        "For organizations that want branded setup, infrastructure maintenance, and processing on top of Easner rails.",
      icon: "mkt-icon-api-agency",
    },
    {
      title: "API integration model",
      description:
        "For developers building custom account, payout, wallet, and collection experiences with Easner APIs.",
      icon: "mkt-icon-api-integration",
    },
  ],
  capabilities: [
    {
      title: "Hosted KYC/KYB",
      description: "Identity and business verification flows inside your onboarding journey",
    },
    {
      title: "Accounts",
      description: "Multi-currency account details where supported",
    },
    {
      title: "Payouts",
      description: "Global and regional payout corridors where enabled",
    },
    {
      title: "Wallet infrastructure",
      description: "Deposit addresses and wallet-initiated sends where enabled",
    },
    {
      title: "Collections",
      description: "Invoicing, Terminal, and QR Pay patterns for merchant collections",
    },
    {
      title: "Cards",
      description: "Card program integration when Tier 3 is available",
    },
    {
      title: "Compliance webhooks",
      description: "Verification status, limits, screening outcomes, and operational events",
    },
  ],
  segments: [
    {
      title: "Fintech apps",
      description: "Neobank, remittance, or payroll products on Easner rails",
    },
    {
      title: "Marketplaces",
      description: "Seller payouts and buyer pay-in across borders",
    },
    {
      title: "SME platforms",
      description: "Embedded accounts and invoicing for your customers",
    },
    {
      title: "Agencies",
      description: "White-label banking for a vertical or corridor",
    },
  ],
  complianceNote:
    "API consumers must comply with Easner Terms, Privacy Policy, and KYC/KYB and AML Policy; end-user partner terms may apply at onboarding.",
  ctaBand: {
    headline: "Don't start from zero. Build with Us.",
    subhead: "Talk to Easner about API access, agency models, and embedded global money movement.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH }],
  },
  faq: [
    {
      question: "Is there public API documentation?",
      answer: "Book time with our team on the contact page for integration discussions and documentation access.",
    },
    {
      question: "Do you offer sandbox environments?",
      answer: "Provided as part of commercial onboarding – ask our team.",
    },
    {
      question: "Can I white-label Easner?",
      answer: "Yes. Easner supports agency and white-label models for approved commercial partners. Terms are customized per partnership.",
    },
    {
      question: "Which partners power the stack?",
      answer:
        "Regulated and infrastructure partners are disclosed in our Privacy Policy. Product UI remains Easner-branded.",
    },
    {
      question: "Do I need a money services license to use Easner APIs?",
      answer:
        "Your regulatory obligations depend on your business model and jurisdiction. Easner provides technology and partner integrations; counsel should review your use case.",
    },
  ],
}
