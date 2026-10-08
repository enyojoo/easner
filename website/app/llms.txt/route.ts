/**
 * /llms.txt – the site summarised for large language models and AI agents (llmstxt.org).
 * Generated from the same content as the pages, so answers, products and FAQs never drift from the site.
 */
import { APP_STORE_URL, BUSINESS_SIGNUP_URL, CAL_LINK, CONTACT_EMAIL, PLAY_STORE_URL, SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { businessContent } from "@/lib/marketing/content/business"
import { cardsContent } from "@/lib/marketing/content/cards"
import { checkoutContent } from "@/lib/marketing/content/checkout"
import { developersContent } from "@/lib/marketing/content/developers"
import { homeFaq } from "@/lib/marketing/content/home"
import { invoicingContent } from "@/lib/marketing/content/invoicing"
import { partnersContent } from "@/lib/marketing/content/partners"
import { paymentLinksContent } from "@/lib/marketing/content/payment-links"
import { payrollContent } from "@/lib/marketing/content/payroll"
import { personalContent } from "@/lib/marketing/content/personal"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"
import { EASNER_CANONICAL_DEFINITION } from "@/lib/marketing/positioning"
import type { FaqItem, ProductPageContent } from "@/lib/marketing/types"
import { NAV_SECTIONS } from "@/lib/nav-config"

export const dynamic = "force-static"

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
  "/developers": developersContent,
  "/partners": partnersContent,
}

const faqLines = (items: FaqItem[]) => items.map((item) => `- **${item.question}** ${item.answer}`)

function build(): string {
  const lines: string[] = [
    "# Easner",
    "",
    `> ${EASNER_CANONICAL_DEFINITION} Easner is not a bank.`,
    "",
    "Easner Group, Inc. is a financial technology company. Its products are grouped as Personal (for your own money), Business (for your company) and Build (for platforms and partners). Cross-border payments settle on stablecoin rails – USDC, USDT and EURC on supported networks, where enabled – and pay out in local currency, so customers see ordinary balances and payments.",
    "",
    "## Key facts",
    "",
    "- **Accounts:** USD and EUR account details in the customer's name, and GBP where supported.",
    "- **Reach:** payouts to bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe.",
    "- **Speed:** typically minutes to hours, same-day where supported.",
    "- **Fees:** fees and exchange rates are shown before a payment is confirmed.",
    "- **Stablecoins:** USDC, USDT and EURC on supported networks, where enabled. No crypto wallet is needed to use Easner.",
    "- **Regulation:** banking, payment, verification and card services are provided by licensed partners. Every customer is verified and transactions are screened for AML and sanctions.",
    "- **Apps:** the Easner app (iPhone and Android) for Personal Banking; Easner Business on the web for companies.",
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
    "## Where Easner pays out",
    "",
    "- **North America (US):** personal and business accounts, USD balances, domestic and international payments.",
    "- **Europe (EU, UK):** EUR and GBP balances, business collections, invoicing and EURC settlement.",
    "- **Africa:** including Nigeria, Ghana, Kenya, South Africa, Egypt, Rwanda, Uganda, Tanzania, Senegal and Zambia.",
    "- **Latin America:** including Mexico, Brazil, Colombia, Peru, Guatemala, Ecuador and Jamaica.",
    "- **Asia-Pacific and South Asia:** including India, China, the Philippines, Indonesia, Vietnam, Pakistan, Bangladesh, Sri Lanka, Thailand, Malaysia, Singapore and Hong Kong.",
    "- **Middle East:** including the United Arab Emirates and Israel.",
    "",
    "Payout coverage and account-opening eligibility are different: Easner accepts signups from most countries, and a small number are excluded for compliance and sanctions reasons (see the KYC/KYB and AML Policy).",
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
    "## Frequently asked",
    "",
    ...faqLines(homeFaq),
    "",
  )

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      const faq = PAGE_CONTENT[item.href]?.faq
      if (!faq?.length) continue
      lines.push(`### ${item.label}`, "", ...faqLines(faq), "")
    }
  }

  lines.push(
    "## Company",
    "",
    `- [Home](${SITE}/): Stablecoin-native banking for individuals and businesses.`,
    `- [About](${SITE}/about): Founders, mission and the Easner platform.`,
    `- [Contact](${SITE}/contact): Sales, partnerships and booking a call.`,
    "",
    "## Legal",
    "",
    `- [Terms of Service](${SITE}/terms)`,
    `- [Privacy Policy](${SITE}/privacy)`,
    `- [KYC/KYB and AML Policy](${SITE}/compliance)`,
    `- [Delete Account](${SITE}/delete-account)`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${SITE}/sitemap.xml): every public page.`,
    "",
  )

  return lines.join("\n")
}

export function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
