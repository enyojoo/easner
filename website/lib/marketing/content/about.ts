import founderChristianPhoto from "@/assets/founder-christian.png"
import founderEnyoPhoto from "@/assets/founder-enyo.png"
import { CONTACT_PATH } from "../constants"
import type { CardItem, CtaBandContent, Founder } from "../types"

export const aboutMetadata = {
  title: "About Easner | Our Founders & Mission",
  description:
    "Meet the founders behind Easner and the mission to make global money work locally, through multi-currency accounts, payments, and stablecoin rails.",
  keywords: [
    "Easner founders",
    "Easner company",
    "stablecoin payment infrastructure",
    "global cross-border payments",
    "international business banking",
    "fintech cross-border infrastructure",
  ],
}

export const aboutHero = {
  headlineLines: ["Built for your money.", "Ready for your world."],
  subhead:
    "Easner brings personal and business banking into one connected platform. We are building for everyday life in the US and a world where work, business, and personal connections reach far beyond one place.",
}

export const aboutMission = {
  headlineLines: ["Your finances, connected.", "Your possibilities, open."],
  paragraphs: [
    "Managing money should fit the way you live and work. Personal payments, business operations, and international connections should feel like parts of the same experience.",
    "Easner brings accounts, payments, and financial tools together through modern infrastructure and licensed banking partners. Our ambition is simple: make everyday finances easier and give people and businesses room to grow.",
  ],
  emphasis: "Built for everyday life and global ambition.",
}

export const aboutPillarsHeadline = "One platform. Personal and business."

export const aboutPillars: CardItem[] = [
  {
    title: "Personal Banking",
    description:
      "Everyday money, payments, and multiple currencies together in the Easner app.",
    link: "/personal",
  },
  {
    title: "Business Banking",
    description:
      "Accounts, customer payments, and team finances together on Easner Business.",
    link: "/business",
  },
]

export const aboutFoundersHeadline = "Who's building this"

export const aboutFoundersSubhead =
  "Easner started in 2025 with a vision for more connected personal and business finances, built for people and companies with local roots and global ambitions."

export const aboutFounders: Founder[] = [
  {
    name: "Christian Levan",
    title: "Co-founder & CEO",
    tagline: "Connecting global and local financial rails.",
    bio: [
      "Christian is Co-founder and CEO of Easner, building stablecoin-powered banking and payment infrastructure that connects global and local financial rails – compliant onboarding, fiat and stablecoin conversion, cross-border payments, and local payout coverage. His focus is the last mile: turning stablecoin settlement into real local financial utility.",
      "Before Easner, he drove growth at venture-backed and private-market companies, with earlier grounding as a financial advisor at Morgan Stanley and Merrill Lynch. He also serves as an enlisted Reconnaissance Marine in the U.S. Marine Corps Reserve – bringing discipline, discretion, and outcomes-over-narrative to how Easner is built.",
    ],
    image: founderChristianPhoto,
    linkedin: "https://www.linkedin.com/in/christianlevan/",
  },
  {
    name: "Enyo Sam",
    title: "Founder & CTO",
    tagline: "Building secure financial infrastructure with stablecoins.",
    bio: [
      "Enyo is Founder and CTO of Easner, building stablecoin-powered banking and payment infrastructure that connects global and local financial rails – technical architecture, stablecoin settlement, partner integrations, and secure cross-border coverage. His focus is making stablecoins practical: expanding access to global financial services without crypto complexity.",
      "Since founding Easner in 2025, he has led product and technical vision, engineering leadership, security, and infrastructure for compliant, scalable payments – validating market demand through early real-world payment flows. His multidisciplinary background spans International Management, Mathematics, Artificial Intelligence, and Computer Science.",
    ],
    image: founderEnyoPhoto,
    linkedin: "https://www.linkedin.com/in/enyosam/",
    x: "https://x.com/enyosaam",
  },
]

export const aboutTrust = {
  headline: "Trust, by design",
  body: "Easner is a financial technology company, not a bank. Banking, payment, verification, and card services are provided by licensed partners. We built the software and compliance layer that makes global money work locally – accounts, payouts, and settlement in one place.",
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
  subhead: "Open an Easner account, or talk to us about partnerships.",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account", analyticsLocation: "about_cta_band" },
    { label: "Contact", href: CONTACT_PATH, analyticsLocation: "about_cta_band_contact" },
  ],
}
