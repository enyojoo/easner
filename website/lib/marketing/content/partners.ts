import type { ProductPageContent } from "../types"
import { CONTACT_PATH } from "../constants"

export const partnersContent: ProductPageContent = {
  metadata: {
    title: "White-Label Payments | Easner for Partners",
    description:
      "Launch a branded global payments product with Easner for Partners. Get accounts, collections, payouts, verification workflows, and operational support.",
    keywords: [
      "white-label remittance",
      "OTC money transfer",
      "branded cross-border payments",
      "agency banking infrastructure",
      "white-label money transfer",
      "OTC compliance platform",
      "agent banking platform",
      "embedded payouts API",
      "global partner payment infrastructure",
      "faith-based remittance",
      "church diaspora giving",
      "nonprofit cross-border payouts",
      "white-label remittance Africa",
      "agency banking Latin America",
      "white-label payments Asia",
      "white-label remittance MENA",
      "agency banking South Asia",
      "white-label payments Southeast Asia",
    ],
  },
  hero: {
    h1: "Build cross-border payments under your brand.",
    subhead:
      "Offer your customers an international payment experience under your own name. Easner provides the infrastructure, verification workflows, payout connections, and operational support.",
    visualSlot: "mkt-hero-partners-01",
    altText: "Branded partner portal showing cross-border transactions and compliance status on Easner infrastructure",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "partners_hero_contact" },
      { label: "Developer Model", href: "/developers", analyticsLocation: "partners_hero_developers" },
    ],
  },
  integrationStepsHeadline: "From first conversation to live operations",
  integrationSteps: [
    {
      title: "Talk to our team",
      description: "Qualify your use case and corridor needs",
    },
    {
      title: "Complete KYB/KYC",
      description: "Business verification and compliance onboarding with Easner",
    },
    {
      title: "Branded deployment",
      description: "Configure your product under your name on Easner infrastructure",
    },
    {
      title: "Go live",
      description: "Operate with ongoing infrastructure and operational support from Easner",
    },
  ],
  featuresLayout: "bento",
  featuresHeadline: "What Easner provides",
  featuresSubhead:
    "Branded product deployment, backend infrastructure, orchestration, APIs, provider connectivity, and ongoing operational support – so you can launch and run your product.",
  features: [
    {
      title: "Branded deployment",
      description: "Live product under your name on Easner infrastructure",
      visualSlot: "mkt-ui-partners-branded",
      altText: "Branded partner portal configuration on Easner",
    },
    {
      title: "Compliance built in",
      description: "KYC/KYB, AML screening, limits, and audit trails",
      visualSlot: "mkt-ui-partners-compliance",
      altText: "Partner compliance queue with verification and screening status",
    },
    {
      title: "Global rails",
      description: "Accounts, pay-in, payouts, and corridor connectivity via Easner orchestration",
      visualSlot: "mkt-ui-partners-rails",
      altText: "Partner corridor payouts and collections dashboard",
    },
    {
      title: "Operational support",
      description: "Infrastructure maintenance and ongoing partner operations",
      visualSlot: "mkt-ui-partners-operations",
      altText: "Partner operations console with infrastructure and support status",
    },
  ],
  extraSections: [
    {
      headline: "Full-stack branded deployment",
      body: "The Agency Model is a live, branded money-movement product on Easner – not a DIY integration. Easner runs backend infrastructure, orchestration, provider connectivity, and compliance; you operate under your brand.",
      visualSlot: "mkt-ui-partners-agency",
      altText: "Agency Model diagram showing branded partner layer on Easner infrastructure",
    },
    {
      headline: "Branded programs for faith & mission",
      body: "Large churches and nonprofits often move money across borders for diaspora giving, branch support, and field missions. The Agency Model lets you run that program on Easner without building a banking stack from scratch.",
      visualSlot: "mkt-ui-partners-faith",
      altText: "Branded faith-based organization portal showing diaspora giving and mission payout activity",
    },
  ],
  useCasesHeadline: "Built for how you move money",
  useCasesSubhead:
    "OTC and money transfer operators, and faith-based and nonprofit networks that need branded, compliant cross-border products.",
  useCases: [
    {
      title: "Money transfer agents",
      description:
        "Launch or upgrade a branded remittance operation with compliant rails and audit-ready records in your brand name for your business",
    },
    {
      title: "OTC agents",
      description:
        "Run counter transactions through a built-in compliance system instead of manual, undocumented flows",
    },
    {
      title: "Faith-based & nonprofit networks",
      description:
        "Launch branded diaspora giving and mission payout programs under your organization's name – for churches, nonprofits and more.",
    },
  ],
  ctaBand: {
    headline: "Ready to launch under your brand?",
    subhead:
      "Talk to Easner about the Agency Model, KYB/KYC, and getting set up in your customized name.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "partners_cta_band" }],
  },
}
