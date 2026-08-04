import founderChristianPhoto from "@/assets/founder-christian.png"
import founderEnyoPhoto from "@/assets/founder-enyo.png"
import { CONTACT_PATH } from "../constants"
import type { CardItem, CtaBandContent, Founder } from "../types"

export const aboutMetadata = {
  title: "About Easner | Founders, Mission & Global Payment Infrastructure",
  description:
    "Meet the Easner founders and learn how we're building stablecoin-powered banking and payments for emerging markets – accounts, payouts, collections, and local rails.",
  keywords: [
    "Easner founders",
    "Easner company",
    "stablecoin payment infrastructure",
    "cross-border payments Africa",
    "fintech emerging markets",
  ],
}

export const aboutHero = {
  headline: "Making global money work locally",
  subhead:
    "Easner is a financial technology company building stablecoin-powered banking and payment infrastructure for individuals and businesses across emerging and underserved markets – where legacy rails are slowest and costliest.",
  microLine: "Familiar banking screens. Stablecoin speed behind the scenes. No crypto complexity.",
}

export const aboutMission = {
  headline: "Built for the corridors legacy rails serve worst",
  paragraphs: [
    "Most providers quote a fee and bury the rest in the FX spread. The real cost of moving money into an emerging market sits in four places: the on-ramp, the FX markup, prefunded local liquidity, and the last-mile payout.",
    "Stablecoins collapse settlement time in the middle of that stack. Cost is won or lost at the off-ramp. Easner focuses on that last mile – turning access to a digital dollar into functioning local financial utility.",
  ],
  emphasis: "Cost is won or lost at the off-ramp.",
}

export const aboutPillarsHeadline = "One platform. Global in. Local out."

export const aboutPillars: CardItem[] = [
  {
    title: "Accounts & money movement",
    description:
      "USD, EUR, and GBP accounts, payouts, and collections – for freelancers, diaspora, SMEs, and partners.",
    link: "/personal",
  },
  {
    title: "Stablecoin settlement",
    description:
      "USDC/EURC speed behind fiat-native send, receive, invoice, and manage-money flows.",
    link: "/stablecoin",
  },
  {
    title: "Compliance by design",
    description:
      "KYC/KYB, AML screening, limits, and partner-licensed banking, payment, verification, and card services.",
    link: "/compliance",
  },
]

export const aboutFoundersHeadline = "Meet the founders"

export const aboutFoundersSubhead =
  "Easner was founded in 2025 to make cross-border money practical for the people and businesses legacy infrastructure leaves behind."

export const aboutFounders: Founder[] = [
  {
    name: "Christian Levan",
    title: "Co-founder & CEO",
    tagline: "Making global money work locally in the Global South.",
    bio: [
      "Christian is Co-founder and CEO of Easner, building stablecoin-powered banking and payment infrastructure for emerging and underserved markets – compliant onboarding, fiat and stablecoin conversion, cross-border payments, and local payout rails. His focus is the last mile: turning a digital dollar into real local financial utility.",
      "Before Easner, he drove growth at venture-backed and private-market companies, with earlier grounding as a financial advisor at Morgan Stanley and Merrill Lynch. He also serves as an enlisted Reconnaissance Marine in the U.S. Marine Corps Reserve – bringing discipline, discretion, and outcomes-over-narrative to how Easner is built.",
    ],
    image: founderChristianPhoto,
    linkedin: "https://www.linkedin.com/in/christianlevan/",
  },
  {
    name: "Enyo Sam",
    title: "Founder & CTO",
    tagline: "Building secure financial infrastructure that makes stablecoins practical.",
    bio: [
      "Enyo is Founder and CTO of Easner, a stablecoin-powered banking and payments platform expanding access to global financial services across emerging and underserved markets.",
      "Since founding Easner in 2025, he has led technical architecture, stablecoin payment infrastructure, and partner integrations – validating market demand through early real-world payment flows. He focuses on product and technical vision, engineering leadership, security, and infrastructure for compliant, scalable cross-border payments.",
      "His background spans International Management, Mathematics, Artificial Intelligence, and Computer Science.",
    ],
    image: founderEnyoPhoto,
    linkedin: "https://www.linkedin.com/in/enyosam/",
    x: "https://x.com/enyosaam",
  },
]

export const aboutPrinciplesHeadline = "How we build"

export const aboutPrinciples: CardItem[] = [
  {
    title: "Last mile first",
    description:
      "Settlement speed means nothing if local payout doesn’t work. We optimize where cost and access actually break.",
  },
  {
    title: "Invisible rails",
    description:
      "Stablecoin infrastructure stays behind familiar banking screens – no crypto complexity for users.",
  },
  {
    title: "Compliance from day one",
    description:
      "Verification, screening, and controls are product features, not afterthoughts.",
  },
  {
    title: "Outcomes over narrative",
    description:
      "High standards, low theatrics. We ship real payment flows and measure what matters.",
  },
]

export const aboutTrust = {
  headline: "Trust, by design",
  body: "Easner Group, Inc. is a financial technology company, not a bank. Banking, payment, verification, and card services are provided by licensed partners. We build the product experience, compliance flows, and stablecoin settlement layer that connects global money to local utility.",
  bullets: [
    "KYC/KYB onboarding built into the product",
    "AML and sanctions screening",
    "Partner-licensed banking and payment rails",
    "Jurisdiction and verification-based access",
  ],
  learnMoreHref: "/compliance",
  learnMoreLabel: "Learn more",
}

export const aboutCtaBand: CtaBandContent = {
  headline: "Ready to move money globally?",
  subhead: "Open an Easner account, explore our products, or talk to us about partnerships.",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account" },
    { label: "Contact", href: CONTACT_PATH },
    { label: "Explore products", href: "/#products" },
  ],
}
