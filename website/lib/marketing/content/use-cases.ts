/**
 * Use-case pages: one page per job a product does for a type of customer, under the product that does it.
 * Every answer here is lifted from the parent product's own FAQ by question, so the wording cannot drift.
 * Connect and Business lead, because those are the two products the site is built to rank for.
 */
import type { FaqItem, ProductPageContent } from "../types"
import { businessContent } from "./business"
import { connectContent, connectTaxFaqs } from "./connect"
import { corridorCards, corridorLinks, corridorPages } from "./corridor-pages"
import { invoicingContent } from "./invoicing"

export type UseCaseParent = "connect" | "business"

export interface UseCasePage {
  parent: UseCaseParent
  slug: string
  /** Label for the link on the parent product page. */
  linkLabel: string
  content: ProductPageContent
}

const REVIEWED = "2026-11-27"

function pick(source: FaqItem[], question: string): FaqItem {
  const found = source.find((item) => item.question === question)
  if (!found) throw new Error(`Use-case page needs the FAQ "${question}", which is missing from its source`)
  return found
}

const connectFaqs = [...(connectContent.faq ?? []), ...connectTaxFaqs]
const businessFaqs = businessContent.faq ?? []
const invoicingFaqs = invoicingContent.faq ?? []

const connectSteps = (people: string, earned: string) => [
  { title: "Turn on Connect", description: "Switch it on in Console. Easner reviews your program first." },
  { title: `Register ${people}`, description: "Add each person with your own user id, using the API." },
  {
    title: "They approve once",
    description:
      "They tap Get paid with Easner and approve in the app with Face ID or a PIN, after a QR scan, an 8-character code or a tap on a phone.",
  },
  { title: "Record earnings", description: `Add ${earned}, or let people withdraw and make one API call.` },
  {
    title: "Money moves",
    description: "It goes from your Easner Business balance to the person's own Easner account, typically within seconds.",
  },
]

const connectFacts = (who: string) => [
  { label: "Who it's for", value: who },
  { label: "Paid in", value: "US dollars, from your Easner Business balance" },
  { label: "The person paid", value: "Links once in the Easner app and verifies their identity" },
  { label: "Arrives", value: "Typically within seconds, into the person's own Easner account" },
  { label: "Tax forms", value: "Signed once by the person and shared with each platform. The platform stays the filer" },
  { label: "Getting started", value: "Test mode first. Easner reviews your program before live access" },
  { label: "Pricing", value: "See plans and fees", href: "/pricing" },
]

const connectHero = (slug: string) =>
  connectContent.hero.ctas.map((cta) => ({ ...cta, analyticsLocation: `connect_${slug}_hero` }))

const connectPage = (
  slug: string,
  content: Pick<ProductPageContent, "metadata" | "definition" | "keyFacts" | "integrationSteps" | "faq"> & {
    h1: string
    subhead: string
  },
): ProductPageContent => ({
  metadata: content.metadata,
  keyFacts: content.keyFacts,
  lastReviewed: REVIEWED,
  hero: {
    h1: content.h1,
    subhead: content.subhead,
    visualSlot: connectContent.hero.visualSlot,
    altText: connectContent.hero.altText,
    ctas: connectHero(slug),
  },
  integrationStepsHeadline: "How it works",
  integrationSteps: content.integrationSteps,
  useCaseLinks: [{ label: "All Connect use cases", href: "/connect" }],
  definition: content.definition,
  faq: content.faq,
  ctaBand: connectContent.ctaBand,
  complianceNote: connectContent.complianceNote,
})

const businessHero = (slug: string) =>
  businessContent.hero.ctas.map((cta) => ({ ...cta, analyticsLocation: `business_${slug}_hero` }))

const businessPage = (
  slug: string,
  content: Pick<ProductPageContent, "metadata" | "definition" | "keyFacts" | "integrationSteps" | "faq"> & {
    h1: string
    subhead: string
    /** Cards and links under the steps, for a page that lists other pages. */
    more?: Pick<ProductPageContent, "useCases" | "useCasesHeadline" | "useCasesSubhead" | "useCaseLinks">
  },
): ProductPageContent => ({
  metadata: content.metadata,
  keyFacts: content.keyFacts,
  lastReviewed: REVIEWED,
  hero: {
    h1: content.h1,
    subhead: content.subhead,
    visualSlot: businessContent.hero.visualSlot,
    altText: businessContent.hero.altText,
    ctas: businessHero(slug),
  },
  integrationStepsHeadline: "How it works",
  integrationSteps: content.integrationSteps,
  useCaseLinks: [{ label: "All Business Banking use cases", href: "/business" }],
  ...content.more,
  definition: content.definition,
  faq: content.faq,
  ctaBand: businessContent.ctaBand,
  complianceNote: businessContent.complianceNote,
})

export const useCasePages: UseCasePage[] = [
  {
    parent: "connect",
    slug: "marketplace-seller-payouts",
    linkLabel: "Pay marketplace sellers",
    content: connectPage("marketplace-seller-payouts", {
      metadata: {
        title: "Marketplace Seller Payouts | Pay Sellers in USD",
        description:
          "Pay marketplace sellers into their own Easner accounts, in US dollars, from your Easner Business balance. Sellers link once. Try it in test mode.",
        keywords: [
          "marketplace seller payouts",
          "pay marketplace sellers",
          "marketplace payout API",
          "pay sellers in US dollars",
          "seller payout platform",
        ],
      },
      h1: "Pay your marketplace sellers",
      subhead:
        "Sellers link their Easner account once. You pay what they earned from your Easner Business balance, in US dollars, into their own account.",
      definition: {
        term: "Marketplace seller payouts with Easner Connect",
        question: "How do I pay marketplace sellers with Easner Connect?",
        answer:
          "Turn on Connect in Console, register each seller with your own user id, and have them approve once in the Easner app. Record what each seller earned, or let them withdraw and make one API call. The money moves from your Easner Business balance into the seller's own Easner account, in US dollars.",
      },
      keyFacts: connectFacts("Marketplaces with many sellers to pay, not a company paying its own team"),
      integrationSteps: connectSteps("your sellers", "what each seller earned"),
      faq: [
        pick(connectFaqs, "How do I pay marketplace sellers or affiliates into their own accounts?"),
        pick(connectFaqs, "Do the people we pay need an Easner account?"),
        pick(connectFaqs, "Which currency do you pay in?"),
        pick(connectFaqs, "What if our balance is low or a tax form is missing?"),
        pick(connectFaqs, "Does Easner collect a W-9?"),
        pick(connectFaqs, "Can we try it first?"),
      ],
    }),
  },
  {
    parent: "connect",
    slug: "creator-and-affiliate-payouts",
    linkLabel: "Pay creators and affiliates",
    content: connectPage("creator-and-affiliate-payouts", {
      metadata: {
        title: "Creator and Affiliate Payouts | Pay What They Earned",
        description:
          "Pay creators, authors, artists, and affiliates into their own Easner accounts, in US dollars. They link once. Pay on request or keep balances with Easner.",
        keywords: [
          "creator payouts",
          "affiliate payouts",
          "pay affiliates in US dollars",
          "royalty payouts platform",
          "course platform payouts",
        ],
      },
      h1: "Pay creators and affiliates what they earned",
      subhead:
        "Music distributors, course platforms, and referral programs add Easner to their withdraw page. People link once, and you pay them into their own Easner account.",
      definition: {
        term: "Creator and affiliate payouts with Easner Connect",
        question: "How do I pay creators and affiliates with Easner Connect?",
        answer:
          "Add Easner to your withdraw page. Creators and affiliates link once in the Easner app, and you pay them from your Easner Business balance, in US dollars, into their own Easner accounts. Either record earnings as they accrue, or let the person tap Withdraw and make one API call.",
      },
      keyFacts: connectFacts("Platforms that owe money to creators, artists, authors, and affiliates"),
      integrationSteps: connectSteps("creators and affiliates", "what each person earned"),
      faq: [
        pick(connectFaqs, "How do people link their account?"),
        pick(connectFaqs, "Do we have to move our ledger?"),
        pick(connectFaqs, "Which currency do you pay in?"),
        pick(connectFaqs, "Do foreign payees fill out a W-8BEN?"),
        pick(connectFaqs, "What happens if a payee has no tax form?"),
        pick(connectFaqs, "Does Easner file 1099s for my platform?"),
      ],
    }),
  },
  {
    parent: "connect",
    slug: "freelance-and-gig-payouts",
    linkLabel: "Pay freelancers and gig workers",
    content: connectPage("freelance-and-gig-payouts", {
      metadata: {
        title: "Freelancer and Gig Worker Payouts | Direct Deposit",
        description:
          "Pay freelancers, drivers, and gig workers who are not employees into their own Easner accounts, in US dollars, from your Easner Business balance.",
        keywords: [
          "freelancer payouts",
          "gig worker payouts",
          "pay contractors by direct deposit",
          "freelance marketplace payout API",
          "pay independent contractors",
        ],
      },
      h1: "Pay freelancers and gig workers",
      subhead:
        "Talent marketplaces and gig apps pay the people who work on them into their own Easner accounts. Each person links once, and tax forms are collected once.",
      definition: {
        term: "Freelancer and gig worker payouts with Easner Connect",
        question: "How do I pay freelancers and gig workers with Easner Connect?",
        answer:
          "Connect pays freelancers, drivers, and other people who earn on your platform, but are not your employees, into their own Easner accounts. They link once in the Easner app, you pay from your Easner Business balance in US dollars, and each person signs a tax form once. This is not Payroll.",
      },
      keyFacts: connectFacts("Freelance marketplaces and gig apps paying people who are not employees"),
      integrationSteps: connectSteps("your freelancers", "what each person earned"),
      faq: [
        pick(connectFaqs, "Can I pay contractors by direct deposit?"),
        pick(connectFaqs, "Who handles tax forms?"),
        pick(connectFaqs, "Which Easner tax form do I sign?"),
        pick(connectFaqs, "Does Easner collect a W-9?"),
        pick(connectFaqs, "Do foreign payees fill out a W-8BEN?"),
        pick(connectFaqs, "Does Easner withhold 30%?"),
      ],
    }),
  },
  {
    parent: "business",
    slug: "pay-overseas-suppliers",
    linkLabel: "Pay suppliers abroad",
    content: businessPage("pay-overseas-suppliers", {
      metadata: {
        title: "Pay Overseas Suppliers | International Supplier Payments",
        description:
          "Pay suppliers and contractors abroad from one Easner Business balance, by bank, mobile money, or stablecoin wallet in 80+ countries. Fees shown first.",
        keywords: [
          "pay overseas suppliers",
          "international supplier payments",
          "pay suppliers abroad from the US",
          "pay vendors in other countries",
          "business payouts to 80+ countries",
        ],
      },
      h1: "Pay suppliers abroad from one balance",
      subhead:
        "Send from your Easner Business balance to bank accounts, mobile money, and stablecoin wallets in 80+ countries. The rate and fees are shown before you confirm.",
      definition: {
        term: "Paying overseas suppliers with Easner Business",
        question: "How do I pay overseas suppliers with Easner Business?",
        answer:
          "Open an Easner Business account, verify the business, and pay each supplier from your balance. Send to bank accounts, mobile money, or stablecoin wallets in 80+ countries. The rate and fees are shown before you confirm, and each payment carries its own status.",
      },
      keyFacts: [
        { label: "Reach", value: "Bank accounts, mobile money, and stablecoin wallets in 80+ countries" },
        { label: "Before you confirm", value: "The rate and fees are shown, and each payment carries its own status" },
        { label: "Account details", value: "USD and EUR in the business's name, and GBP where supported" },
        { label: "Who can open", value: "Companies from 174 countries, subject to verification" },
        { label: "Your team", value: "Invite teammates with the access each one needs" },
        { label: "Pricing", value: "See plans and fees", href: "/pricing" },
      ],
      integrationSteps: [
        { title: "Open Easner Business", description: "Start on the web and create a company account." },
        {
          title: "Verify your business",
          description:
            "Provide your business registration details, the people who own and control it, and identity verification for each owner. You can track every step from your dashboard.",
        },
        {
          title: "Pay from your balance",
          description:
            "Send to bank accounts, mobile money, or stablecoin wallets. The rate and fees are shown before you confirm, and each payment carries its own status.",
        },
      ],
      faq: [
        pick(businessFaqs, "How do I pay suppliers and contractors abroad?"),
        pick(businessFaqs, "How do I pay suppliers in Nigeria, Mexico, the Philippines, or India?"),
        pick(businessFaqs, "Which countries can my business pay?"),
        pick(businessFaqs, "What do I need to verify my business?"),
        pick(businessFaqs, "Who can open an Easner Business account?"),
        pick(businessFaqs, "Can my team use the account?"),
      ],
      more: {
        useCasesHeadline: "Pay contractors in a specific country",
        useCasesSubhead: "What your contractor needs to give you, and what is good to know, country by country.",
        useCases: corridorCards,
        useCaseLinks: [...corridorLinks, { label: "All Business Banking use cases", href: "/business" }],
      },
    }),
  },
  {
    parent: "business",
    slug: "get-paid-by-international-customers",
    linkLabel: "Get paid by customers abroad",
    content: businessPage("get-paid-by-international-customers", {
      metadata: {
        title: "Get Paid by International Customers | USD and EUR",
        description:
          "Get USD and EUR account details in your business's name, and collect by invoice, Payment Link, Checkout, Terminal, or QR Pay. Every payment lands in one ledger.",
        keywords: [
          "get paid by international customers",
          "USD account details for my company",
          "collect international payments",
          "accept payments from abroad",
          "business account with USD and EUR details",
        ],
      },
      h1: "Get paid by customers abroad",
      subhead:
        "Share USD and EUR account details in your business's name, send invoices, or take payments on your site. Every payment lands in the same ledger.",
      definition: {
        term: "Getting paid by international customers with Easner Business",
        question: "How do I get paid by international customers with Easner Business?",
        answer:
          "Open Easner Business, verify the business, and share USD or EUR account details in the business's name. Customers can also pay an invoice, a Payment Link, or Checkout on your website, or pay in person with Terminal and QR Pay. Every payment lands in the same Easner Business ledger.",
      },
      keyFacts: [
        { label: "Account details", value: "USD and EUR in the business's name, and GBP where supported" },
        { label: "Ways to collect", value: "Invoices, Payment Links, Checkout, Terminal, and QR Pay" },
        { label: "How customers pay", value: "Card, Apple Pay or Google Pay, bank transfer, or stablecoin where enabled" },
        { label: "Settles to", value: "The same Easner Business ledger, whichever way they pay" },
        { label: "Who can open", value: "Companies from 174 countries, subject to verification" },
        { label: "Pricing", value: "See plans and fees", href: "/pricing" },
      ],
      integrationSteps: [
        { title: "Open Easner Business", description: "Start on the web and create a company account." },
        {
          title: "Verify your business",
          description:
            "Provide your business registration details, the people who own and control it, and identity verification for each owner.",
        },
        {
          title: "Share how to pay",
          description:
            "Share your account details, send an invoice, share a Payment Link, embed Checkout on your website, or collect in person with Terminal and QR Pay.",
        },
        {
          title: "Track every payment",
          description: "Every payment lands in the same Easner Business ledger, so you see who has paid and who owes.",
        },
      ],
      faq: [
        pick(businessFaqs, "How do I get USD account details for my company?"),
        pick(businessFaqs, "Which currencies can my business hold?"),
        pick(businessFaqs, "How do customers pay my business?"),
        pick(invoicingFaqs, "Can I send a stablecoin invoice?"),
        pick(businessFaqs, "What do I need to verify my business?"),
        pick(businessFaqs, "Who can open an Easner Business account?"),
      ],
    }),
  },
]

useCasePages.push(...corridorPages)

export function useCasesFor(parent: UseCaseParent) {
  return useCasePages.filter((page) => page.parent === parent)
}

export function findUseCase(parent: UseCaseParent, slug: string) {
  return useCasePages.find((page) => page.parent === parent && page.slug === slug)
}

export const useCasePath = (page: Pick<UseCasePage, "parent" | "slug">) => `/${page.parent}/${page.slug}`
