import type { CardItem, CtaBandContent } from "./types"
import { CONTACT_PATH } from "./constants"

export const REGULATORY_FOOTER_PARAGRAPHS = [
  'Easner Group, Inc. ("Easner") is a financial technology company, not a bank or investment adviser. Banking, payment, verification, and card services available through Easner Mobile (Easner Personal Banking) and Easner Business (Easner Business Banking) are provided by licensed partners. Easner does not provide investment, legal, tax, or financial advice.',
  "Easner is not FDIC-insured and does not hold customer deposits. Banking services are provided by third-party banking partners, not by Easner.",
  "Where enabled, stablecoin and wallet features are supported through infrastructure partners and may operate on public blockchains. Digital assets are not legal tender, are not backed by a government, and are not FDIC-insured or protected by SIPC. Blockchain transactions may be public and irreversible.",
  "Corporate and personal card products, when available, are issued by a third-party issuer and are subject to credit approval.",
  "Easner may receive compensation from third-party service providers.",
  "Use of the Easner platform is subject to the Terms of Service, Privacy Policy, and KYC/KYB and AML Policy, which include limitations of liability, a class action waiver, and mandatory arbitration.",
]

export const COMPLIANCE_STRIP = {
  headline: "Compliance is built in, not added later.",
  subhead:
    "Verification, screening, limits, and transaction controls are part of the Easner account flow – so money movement can scale with confidence.",
  bullets: [
    "KYC/KYB onboarding built into the product experience",
    "AML and sanctions screening on customers and transactions",
    "Banking, wallet, and payment rails connected",
    "Access based on verification, jurisdiction, and product availability",
  ],
}

export const DEFAULT_CTA_BAND: CtaBandContent = {
  headline: "Ready to move money globally?",
  subhead:
    "Open an Easner account, or talk to us about Easner for Partners.",
  ctas: [
    { label: "Open Account", href: "#", action: "open-account", analyticsLocation: "homepage_cta_band" },
    { label: "Contact", href: CONTACT_PATH, analyticsLocation: "homepage_cta_band_contact" },
  ],
}

export const PERSONAL_TIERS: CardItem[] = [
  {
    title: "Global banking",
    description:
      "USD and EUR account details, pay-in and pay-out, and stablecoin flows.",
  },
  {
    title: "Local & regional banking",
    description: "NGN and regional pay-in and pay-out in supported local markets where we launch.",
  },
  {
    title: "Cards",
    description:
      "Your access to personal debit/credit cards for your online and physical payments.",
  },
]

export const BUSINESS_TIERS: CardItem[] = [
  {
    title: "Global banking",
    description:
      "USD and EUR account details, pay-in and pay-out, and stablecoin flows, plus other currencies where supported for your organization.",
  },
  {
    title: "Local & regional banking",
    description:
      "NGN and regional pay-in and pay-out for your business operations where we launch – local and regional rails for your organization.",
  },
  {
    title: "Cards",
    description:
      "Your access to corporate debit/credit cards for your business needs, spend controls, and cardholder management when approved.",
  },
]

export const TIER_FOOTNOTE =
  "Availability depends on verification, jurisdiction, approval, and product enablement."

export const PRODUCT_CARDS: CardItem[] = [
  {
    title: "Personal Banking",
    description:
      "Global personal banking for earners across borders – receive, send, and manage money on supported international corridors.",
    link: "/personal",
    icon: "mkt-thumb-personal",
  },
  {
    title: "Business Banking",
    description:
      "Cross-border business banking – accounts, payouts, invoicing, Terminal, QR Pay, teams, and reporting from one dashboard.",
    link: "/business",
    icon: "mkt-thumb-business",
  },
  {
    title: "Whitelabel programs",
    description:
      "Launch branded cross-border products with compliance, corridors, and operational support.",
    link: "/partners",
    icon: "mkt-thumb-partners",
  },
]

export const SECONDARY_PRODUCT_CARDS: CardItem[] = [
  {
    title: "Stablecoin Payments",
    description:
      "Stablecoin speed with banking screens – receive, send, Terminal, and QR Pay.",
    link: "/stablecoin",
    icon: "mkt-thumb-stablecoin",
  },
  {
    title: "Invoicing",
    description:
      "Invoice globally and get paid by bank or stablecoin – with status and reconciliation in one dashboard.",
    link: "/invoicing",
    icon: "mkt-thumb-invoicing",
  },
  {
    title: "Cards",
    description:
      "Corporate and personal cards with spend controls, cardholder management, and reporting built in.",
    link: "/cards",
    icon: "mkt-thumb-cards",
  },
]

export const ALL_PRODUCT_CARDS: CardItem[] = [...PRODUCT_CARDS, ...SECONDARY_PRODUCT_CARDS]
