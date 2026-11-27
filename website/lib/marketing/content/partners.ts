import type { AnswerDefinition, ProductPageContent } from "../types"
import { CONTACT_PATH } from "../constants"

export const partnersDefinition: AnswerDefinition = {
  term: "Easner White-label",
  question: "What is Easner White-label?",
  answer:
    "Easner White-label is a live payments product on Easner infrastructure, under the partner's name, logo, and colour. The Developer API Model is the Banking API, without that branded deployment.",
  facts: [
    {
      term: "What Easner runs",
      definition: "Infrastructure, verification, screening, payout connections, and ongoing operational support.",
    },
    {
      term: "What you run",
      definition: "The brand and the relationship with your customers. The product can carry your name, logo, and colour.",
    },
  ],
}

export const partnersContent: ProductPageContent = {
  metadata: {
    title: "Easner White-label | Launch Payments Under Your Brand",
    description:
      "Launch a branded global payments product with Easner White-label. Get accounts, collections, payouts, verification workflows, and operational support.",
    keywords: [
      "white-label banking app",
      "branded money transfer app",
      "Easner White-label",
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
    h1: "Build cross-border payments under your brand",
    subhead:
      "Launch a payments product under your name, logo, and colour. Easner runs the stablecoin infrastructure, verification, screening, payout connections, and operations. You run the brand and the customer relationship.",
    visualSlot: "mkt-hero-partners-01",
    altText: "The Easner app under a fictional partner's brand, beside the brand settings a partner chooses",
    ctas: [
      { label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "partners_hero_contact" },
      { label: "Developer API Model", href: "/developers", analyticsLocation: "partners_hero_developers" },
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
      altText: "The Easner app beside the same app under a partner's brand",
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
      altText: "A partner programme overview with customers, payouts and the Easner partner team",
    },
  ],
  extraSections: [
    {
      headline: "Full-stack branded deployment",
      body: "White-label is a live, branded money-movement product on Easner – not a DIY integration. Easner runs backend infrastructure, orchestration, provider connectivity, and compliance; you operate under your brand.",
      visualSlot: "mkt-ui-partners-agency",
      altText: "A partner's branded app on top of the accounts, payouts, verification and rails Easner runs",
    },
    {
      headline: "Branded programs for faith & mission",
      body: "Large churches and nonprofits often move money across borders for diaspora giving, branch support, and field missions. White-label lets you run that program on Easner without building a banking stack from scratch.",
      visualSlot: "mkt-ui-partners-faith",
      altText: "A faith organisation's branded app showing diaspora giving and branch support",
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
  definition: partnersDefinition,
  faq: [
    {
      question: partnersDefinition.question,
      answer: partnersDefinition.answer,
      links: [{ label: "Developer API Model", href: "/developers" }],
    },
    {
      question: "What does Easner run, and what do I run?",
      answer:
        "Easner runs the infrastructure, verification, screening, payout connections and ongoing operational support. You run the brand and the relationship with your customers.",
    },
    {
      question: "Can the product carry my own brand?",
      answer:
        "Yes. Your customers use a product under your name, logo and colour, built on Easner infrastructure.",
    },
    {
      question: "Who is the programme for?",
      answer:
        "Money transfer agents, OTC agents, and faith and nonprofit networks moving money across borders, among others.",
    },
    {
      question: "How do I get started?",
      links: [{ label: "Talk to our team", href: "/contact" }],
      answer:
        "Talk to our team about your use case and corridors, complete business verification with Easner, configure your branded product, then go live with ongoing support.",
    },
    {
      question: "How is the partner programme priced?",
      links: [{ label: "Pricing", href: "/pricing" }, { label: "Contact us", href: "/contact" }],
      answer:
        "Commercial terms depend on your model, corridors and volumes. Ease Gold includes White-label pricing in the contract.",
    },
    {
      question: "Can I white-label Easner?",
      answer:
        "Yes. Easner White-label is a live payments product on Easner infrastructure under your name, logo, and colour. Easner runs infrastructure, verification, screening, payout connections, and operations. You run the brand and the customer relationship.",
    },
    {
      question: "Can I launch a white-label remittance app?",
      answer:
        "Yes. Easner White-label is a live payments product under your name, logo, and colour, including for an aggregator. Easner runs the infrastructure. You run the brand.",
    },
    {
      question: "How is White-label different from the Developer API Model?",
      answer:
        "White-label is the branded deployment. Your customers use a product under your name, built on Easner. The Developer API Model is separate: it is the Banking API, without that branded product.",
      links: [{ label: "Banking API", href: "/developers" }],
    },
    {
      question: "Can the app use my logo?",
      answer:
        "Yes. White-label carries your name, logo, and colour. Easner runs the infrastructure behind it.",
    },
    {
      question: "How is White-label priced?",
      answer:
        "Commercial terms depend on the model, the corridors, and the volume. Ease Gold includes White-label pricing in the contract.",
      links: [{ label: "Pricing", href: "/pricing" }],
    },
    {
      question: "Which countries can I offer payouts in?",
      answer:
        "Country-by-country answers for White-label, including the currency and payout rail for each country, are on the Answers page.",
      links: [{ label: "Answers", href: "/answers/white-label" }],
    },
  ],
  ctaBand: {
    headline: "Ready to launch under your brand?",
    subhead:
      "Talk to Easner about White-label, KYB/KYC, and getting set up in your customized name.",
    ctas: [{ label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "partners_cta_band" }],
  },
}
