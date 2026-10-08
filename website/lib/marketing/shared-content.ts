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
  headline: "Verification at every step",
  subhead:
    "Easner verifies every individual and business and screens transactions for AML and sanctions. Banking and payment services are provided by licensed partners.",
  bullets: [
    "Identity and business verification during onboarding",
    "AML and sanctions screening on customers and transactions",
    "Banking and payment services through licensed partners",
    "Access based on verification, jurisdiction, and product availability",
  ],
}

export const DEFAULT_CTA_BAND: CtaBandContent = {
  headline: "One account. 80+ countries.",
  subhead:
    "Open Easner Personal Banking in the app or Easner Business Banking on the web – or talk to us about building on Easner.",
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
      "Hold USD and EUR, get paid to account details in your name, and send to 80+ countries.",
    link: "/personal",
    icon: "mkt-thumb-personal",
  },
  {
    title: "Business Banking",
    description:
      "Business accounts, customer payments and supplier payouts in one dashboard.",
    link: "/business",
    icon: "mkt-thumb-business",
  },
  {
    title: "Checkout",
    description:
      "Card, bank and stablecoin payments on your own site, with Easner as merchant of record.",
    link: "/checkout",
    icon: "mkt-thumb-checkout",
  },
  {
    title: "Payment Links",
    description:
      "Get paid with a link – one-time or recurring, no website needed.",
    link: "/payment-links",
    icon: "mkt-thumb-paylinks",
  },
  {
    title: "Whitelabel programs",
    description:
      "Launch cross-border payments under your own brand on Easner infrastructure.",
    link: "/partners",
    icon: "mkt-thumb-partners",
  },
]

export const SECONDARY_PRODUCT_CARDS: CardItem[] = [
  {
    title: "Stablecoin Payments",
    description:
      "Send and receive stablecoins such as USDC and EURC, where enabled, alongside your currency balances.",
    link: "/stablecoin",
    icon: "mkt-thumb-stablecoin",
  },
  {
    title: "Invoicing",
    description:
      "Invoices your customers can pay by card, bank transfer or stablecoin.",
    link: "/invoicing",
    icon: "mkt-thumb-invoicing",
  },
  {
    title: "Payroll",
    description:
      "Pay your team in 80+ countries, with approvals before any money moves.",
    link: "/payroll",
    icon: "mkt-thumb-payroll",
  },
  {
    title: "Cards",
    description:
      "Spend controls for you and your team – when available.",
    link: "/cards",
    icon: "mkt-thumb-cards",
  },
]

export const ALL_PRODUCT_CARDS: CardItem[] = [...PRODUCT_CARDS, ...SECONDARY_PRODUCT_CARDS]
