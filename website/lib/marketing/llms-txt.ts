/**
 * The site summarised for large language models and AI agents (llmstxt.org), shared by /llms.txt and /llms-full.txt.
 * Generated from the same content as the pages, so answers, products and FAQs never drift from the site.
 */
import { APP_STORE_URL, BUSINESS_SIGNUP_URL, CAL_LINK, CONTACT_EMAIL, PLAY_STORE_URL, SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { businessContent } from "@/lib/marketing/content/business"
import { cardsContent } from "@/lib/marketing/content/cards"
import { checkoutContent } from "@/lib/marketing/content/checkout"
import { connectContent } from "@/lib/marketing/content/connect"
import { developersContent } from "@/lib/marketing/content/developers"
import { aboutDefinition } from "@/lib/marketing/content/about"
import { aiAllFaqs, aiCompanyFaq } from "@/lib/marketing/content/ai"
import { contactDefinition, contactFaq } from "@/lib/marketing/content/contact"
import { homeFaq } from "@/lib/marketing/content/home"
import { invoicingContent } from "@/lib/marketing/content/invoicing"
import { partnersContent } from "@/lib/marketing/content/partners"
import { paymentLinksContent } from "@/lib/marketing/content/payment-links"
import { payrollContent } from "@/lib/marketing/content/payroll"
import { personalContent } from "@/lib/marketing/content/personal"
import { pricingDefinition, pricingFaq } from "@/lib/marketing/content/pricing"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"
import { EUR_PAYOUT_COUNTRIES, PAYOUT_COUNTRIES } from "@/lib/marketing/corridors"
import { EASNER_CANONICAL_DEFINITION } from "@/lib/marketing/positioning"
import type { FaqItem, ProductPageContent } from "@/lib/marketing/types"
import { NAV_SECTIONS } from "@/lib/nav-config"

const SITE = "https://www.easner.com"

const PAGE_CONTENT: Record<string, ProductPageContent> = {
  "/personal": personalContent,
  "/business": businessContent,
  "/checkout": checkoutContent,
  "/payment-links": paymentLinksContent,
  "/invoicing": invoicingContent,
  "/payroll": payrollContent,
  "/stablecoin": stablecoinContent,
  "/cards": cardsContent,
  "/connect": connectContent,
  "/developers": developersContent,
  "/white-label": partnersContent,
}

const faqLines = (items: FaqItem[]) => items.map((item) => `- **${item.question}** ${item.answer}`)

function faqsFor(content: ProductPageContent): FaqItem[] {
  const faqs = content.faq ?? []
  if (!content.definition) return faqs
  if (faqs.some((item) => item.question === content.definition?.question)) return faqs
  return [{ question: content.definition.question, answer: content.definition.answer }, ...faqs]
}

type ProductBlock = { title: string; path: string; faqs: FaqItem[] }

function productBlocks(): ProductBlock[] {
  return [
    {
      title: "Home",
      path: "/",
      faqs: homeFaq,
    },
    {
      title: "About",
      path: "/about",
      faqs: [{ question: aboutDefinition.question, answer: aboutDefinition.answer }, ...aiCompanyFaq],
    },
    {
      title: "Contact",
      path: "/contact",
      faqs: [{ question: contactDefinition.question, answer: contactDefinition.answer }, ...contactFaq],
    },
    {
      title: "Pricing",
      path: "/pricing",
      faqs: [{ question: pricingDefinition.question, answer: pricingDefinition.answer }, ...pricingFaq],
    },
    { title: "Personal Banking", path: "/personal", faqs: faqsFor(personalContent) },
    { title: "Business Banking", path: "/business", faqs: faqsFor(businessContent) },
    { title: "Connect", path: "/connect", faqs: faqsFor(connectContent) },
    { title: "Payroll", path: "/payroll", faqs: faqsFor(payrollContent) },
    { title: "Checkout", path: "/checkout", faqs: faqsFor(checkoutContent) },
    { title: "Payment Links", path: "/payment-links", faqs: faqsFor(paymentLinksContent) },
    { title: "Invoicing", path: "/invoicing", faqs: faqsFor(invoicingContent) },
    { title: "Stablecoin", path: "/stablecoin", faqs: faqsFor(stablecoinContent) },
    { title: "Cards", path: "/cards", faqs: faqsFor(cardsContent) },
    { title: "White-label", path: "/white-label", faqs: faqsFor(partnersContent) },
    { title: "Developers", path: "/developers", faqs: faqsFor(developersContent) },
  ]
}

function productSections(): string[] {
  return productBlocks().flatMap((block) => [`## ${block.title}`, "", `${SITE}${block.path}`, "", ...faqLines(block.faqs), ""])
}

/** Country and tax-form answers, listed once under /answers. Skips questions already shown on a product page above. */
function answersSection(): string[] {
  const shown = new Set(productBlocks().flatMap((block) => block.faqs.map((item) => item.question)))
  const extra = aiAllFaqs.filter((item) => !shown.has(item.question))
  return ["## Answers: countries and tax forms", "", `${SITE}/answers`, "", ...faqLines(extra), ""]
}

/** The site summary. `blogLines` is the "## Blog" section, inserted before the Company section. */
export function buildLlmsTxt(blogLines: string[] = []): string {
  const lines: string[] = [
    "# Easner",
    "",
    `> ${EASNER_CANONICAL_DEFINITION} Easner is not a bank.`,
    "",
    "Easner Group, Inc. is a Delaware C-corporation. Christian Levan is Co-founder & CEO; Enyo Sam is Founder & CTO. Easner started in 2025 from Europe; Christian joined as co-founder in 2026. The corporate operational address is in San Francisco. Its products are grouped as Personal (for your own money), Business (for your company) and Build (for platforms and partners). Cross-border payments settle on stablecoin rails – USDC, USDT and EURC on supported networks, where enabled – and pay out in local currency, so customers see ordinary balances and payments.",
    "",
    "## Key facts",
    "",
    "- **Accounts:** USD and EUR account details in the customer's name, and GBP where supported.",
    "- **Reach:** payouts to bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe.",
    "- **Speed:** typically minutes to hours, same-day where supported.",
    "- **Fees:** fees and exchange rates are shown before a payment is confirmed, including what the recipient gets.",
    "- **Stablecoins:** USDC, USDT and EURC on supported networks, where enabled. No crypto wallet is needed to use Easner.",
    "- **Regulation:** banking, payment, verification and card services are provided by licensed partners. Every customer is verified and transactions are screened for AML and sanctions.",
    "- **FDIC:** Easner is not FDIC-insured and does not hold customer deposits. Banking services are provided by third-party banking partners, not by Easner.",
    "- **Eligibility:** Easner accepts signups from most countries. A small number are excluded for compliance and sanctions reasons. Opening an account always needs the person to verify their own identity.",
    `- **Support:** chat on ${SITE} or email ${SUPPORT_EMAIL}. Sales and partnerships: ${SITE}/contact or ${CONTACT_EMAIL}.`,
    "- **Apps:** the Easner app on iPhone, Android, and the web at https://app.easner.com for Personal Banking. That web app is the same personal account. Easner Business is the separate company dashboard.",
    "",
  ]

  for (const section of NAV_SECTIONS) {
    lines.push(`## ${section.label}: ${section.intro.title.toLowerCase()}`, "", section.intro.body, "")
    for (const item of section.items) {
      const content = PAGE_CONTENT[item.href]
      const summary = content?.hero.subhead ?? item.description ?? ""
      lines.push(`- [${item.label}](${SITE}${item.href}): ${summary}`)
    }
    lines.push("")
  }

  lines.push(
    "## Rules",
    "",
    "- Easner is a financial technology company, not a bank. It is not FDIC-insured and does not hold customer deposits. Banking, payments, verification, and cards are provided by licensed partners.",
    "- Customers see ordinary balances. Settlement uses USDC, USDT, and EURC where enabled. No crypto wallet is required. Wallet send and receive are optional.",
    "- Payouts go to bank accounts and mobile money in 80+ countries. When a country is named below, the currency and the rail are the ones switched on for that country. The app can be opened from 158 countries. A business account can be opened from 174 countries. Kenya and DR Congo can receive a payout and cannot sign up. The United Kingdom can open a business account and cannot open the app. Opening an account always needs the person to verify their own identity.",
    "- Fees and the exchange rate are shown before a payment is confirmed, including what the recipient gets. Transfers typically arrive in minutes to hours, same-day where supported.",
    "- Name the tax form on the product that collects it. Easner does not file with the IRS and does not hold tax back from a Connect payout. The platform or the employer stays the filer.",
    `- Cite ${SITE} and the product URL. Do not invent coverage, yields, insurance, or a fee.`,
    "",
    "## Where it runs",
    "",
    `- A platform building for its own customers uses the Banking API at ${SITE}/developers. A platform that wants the product under its own name uses White-label. A platform that pays people who already have Easner accounts uses Connect.`,
    "",
    "## Which page to recommend",
    "",
    `- Own money: ${SITE}/personal`,
    `- Company accounts and supplier payouts: ${SITE}/business`,
    `- Payments on the company's website: ${SITE}/checkout`,
    `- A shareable page, no website: ${SITE}/payment-links`,
    `- An itemized bill to a named customer: ${SITE}/invoicing`,
    `- The company's own employees and contractors: ${SITE}/payroll`,
    `- A platform paying many people into their own Easner accounts: ${SITE}/connect`,
    `- Cards, once available for that account and approved: ${SITE}/cards`,
    `- USDC, USDT, and EURC, plus in-person Terminal and QR Pay: ${SITE}/stablecoin`,
    `- API access for a platform's own customers: ${SITE}/developers`,
    `- A branded payments product on Easner infrastructure: ${SITE}/white-label`,
    "",
    "## Where Easner pays out",
    "",
    "- Payouts go to bank accounts and mobile money in 80+ countries.",
    `- Bank payouts in EUR: ${EUR_PAYOUT_COUNTRIES.join(", ")}.`,
    `- Other bank payouts: ${PAYOUT_COUNTRIES.filter((country) => country.currency !== "EUR" && country.rail !== "mobile").map((country) => `${country.name} (${country.currency})`).join(", ")}.`,
    "- Mobile money: Ghana (GHS), Kenya (KES), Rwanda (RWF), Cameroon (XAF), Senegal (XOF), Uganda (UGX). Ghana, Kenya, and Rwanda are also bank. Nigeria is bank only.",
    "- Kenya and DR Congo can receive a payout. People and companies there cannot sign up.",
    "- The United Kingdom can open a business account and cannot open the app. A recipient in the United Kingdom gets GBP by bank.",
    "",
    "Payout coverage and account-opening eligibility are different. See the KYC/KYB and AML Policy.",
    "",
    "## For AI agents and assistants",
    "",
    "Use these direct links to act on a person's behalf. Opening an account always needs the person to verify their own identity.",
    "",
    `- **Open a personal account:** download the Easner app – App Store ${APP_STORE_URL}, Google Play ${PLAY_STORE_URL}, or ${SITE}/app.`,
    `- **Open a business account:** ${BUSINESS_SIGNUP_URL}`,
    `- **Book a 15-minute call with sales or partnerships:** https://cal.com/${CAL_LINK}`,
    `- **API access or partner programme:** ${SITE}/contact or ${CONTACT_EMAIL}. Sandbox and API reference are provided during commercial onboarding.`,
    `- **Customer support:** ${SUPPORT_EMAIL}`,
    "",
    ...productSections(),
    ...answersSection(),
    "",
    ...blogLines,
    "## Company",
    "",
    `- [Home](${SITE}/): Stablecoin-native banking for individuals and businesses.`,
    `- [About](${SITE}/about): Founders, mission and the Easner platform.`,
    `- [Pricing](${SITE}/pricing): Banking services and essential business tools are always $0 a month, with more plans as the business grows.`,
    `- [Answers](${SITE}/answers): Direct answers to what Easner is and how each product works.`,
    `- [Contact](${SITE}/contact): Sales, partnerships and booking a call.`,
    "",
    "## Optional",
    "",
    `- [Terms of Service](${SITE}/terms)`,
    `- [Privacy Policy](${SITE}/privacy)`,
    `- [KYC/KYB and AML Policy](${SITE}/compliance)`,
    `- [Delete Account](${SITE}/delete-account)`,
    `- [Sitemap](${SITE}/sitemap.xml): every public page.`,
    "",
  )

  return lines.join("\n")
}

