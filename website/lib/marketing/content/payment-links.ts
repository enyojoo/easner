import type { AnswerDefinition, ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const paymentLinksDefinition: AnswerDefinition = {
  term: "Easner Payment Links",
  question: "What are Easner Payment Links?",
  answer:
    "Easner Payment Links are shareable payment pages for collecting one-time or recurring payments without a website or code. Payments settle into your Easner Business account.",
  facts: [
    {
      term: "Do you need a website?",
      definition: "No. Payment Links is the no-code option. Use Checkout if you already have a website.",
    },
    {
      term: "How customers pay",
      definition: "Card, Apple Pay or Google Pay, a US bank account, or stablecoins where enabled.",
    },
  ],
}

export const paymentLinksContent: ProductPageContent = {
  metadata: {
    title: "Payment Links | Get Paid Without a Website",
    description:
      "Create a shareable payment link with Easner Business. Collect one-time or recurring payments without a website or code, and track what you receive.",
    keywords: [
      "payment link for events and classes",
      "stablecoin payment link",
      "QR code payment link",
      "limit payments on a link",
      "payment link generator",
      "get paid with a link",
      "no code payment page",
      "collect payment without a website",
      "recurring payment link",
      "share a payment link",
      "small business payment link",
      "payment link Nigeria",
      "get paid in China",
      "freelancer payment link Africa",
      "payment link for consultants",
    ],
  },
  keyFacts: [
    { label: "Website or code needed", value: "No" },
    { label: "Payment methods", value: "Card, Apple Pay or Google Pay, a US bank account, or stablecoin where enabled" },
    { label: "Billing", value: "One-time or recurring" },
    { label: "Settles to", value: "Your Easner Business account" },
    { label: "Have a website?", value: "Use Checkout", href: "/checkout" },
    { label: "Pricing", value: "See plans and fees", href: "/pricing" },
  ],
  lastReviewed: "2026-11-27",
  integrationStepsHeadline: "How it works",
  integrationSteps: [
    { title: "Open Easner Business", description: "Payment Links run on an eligible Easner Business account." },
    { title: "Create a link", description: "Create a one-time or recurring payment page, with an optional free trial and a renewal disclosure before customers pay." },
    { title: "Share it", description: "Send the link by email, chat, or social media. Payments settle into your Easner Business account." },
  ],
  hero: {
    h1: "Get paid with a link",
    subhead:
      "Create a payment page and share it by email, message, or social media. Collect one-time or recurring payments through Easner Business, without a website or code, on stablecoin infrastructure.",
    visualSlot: "mkt-hero-paylinks-01",
    altText: "Easner Payment Links hosted pay page",
    ctas: [
      { label: "Create a payment link", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "paylinks_hero" },
      { label: "See how it works", href: "#features", analyticsLocation: "paylinks_hero_features" },
    ],
  },
  featuresLayout: "bento",
  features: [
    {
      title: "One-time or recurring",
      description:
        "Charge once, or set a billing interval with an optional free trial – customers see a clear renewal disclosure before they pay.",
      visualSlot: "mkt-ui-paylinks-create",
      altText: "Easner Payment Links create link dialog",
    },
    {
      title: "Share anywhere",
      description:
        "Send your link by email, chat, or social – no website required. Customers pay on a page that's ready to go.",
      visualSlot: "mkt-ui-paylinks-share",
      altText: "Easner Payment Links share link screen",
    },
    {
      title: "Reusable until you close it",
      description:
        "One link can take payment from many customers – track every payment and the total collected in one place.",
      visualSlot: "mkt-ui-paylinks-stats",
      altText: "Easner Payment Links payment count and totals",
    },
    {
      title: "To your Easner Balance",
      description:
        "Every payment link settles directly to your Easner Balance, reconciled alongside your invoices, payouts, and card activity.",
      visualSlot: "mkt-ui-paylinks-ledger",
      altText: "Easner Balance showing payment link activity",
    },
  ],
  useCasesHeadline: "Built for anyone to get paid",
  useCasesSubhead:
    "For freelancers, creators, and businesses collecting customer payments through an eligible Easner Business account.",
  useCases: [
    {
      title: "Freelancers and consultants",
      description: "Send a client a link for a retainer or project fee – no invoice required.",
    },
    {
      title: "Coaches and creators",
      description: "Charge for sessions, programs, or digital products with a link that matches what you sell.",
    },
    {
      title: "Agencies and consultancies",
      description:
        "Bill clients online with a link instead of chasing bank transfers, alongside invoicing in Easner Business.",
    },
    {
      title: "Small businesses without a website",
      description: "Collect online payments with a link, and add Easner Checkout when you build a website.",
    },
    {
      title: "Community and mission collections",
      description: "Collect donations and mission support with a link you can share anywhere.",
    },
    {
      title: "Events and classes",
      description: "Sell seats for a class, workshop or event, cap the number of payments, and close the link when you're full.",
    },
  ],
  definition: paymentLinksDefinition,
  faq: [
    {
      question: "Do I need a website?",
      links: [{ label: "Explore website Checkout", href: "/checkout" }],
      answer:
        "No. Payment Links is Easner's no-code option – you get a shareable hosted page with no website or code required. If you already have a website, Easner Checkout lets you embed payments directly.",
    },
    {
      question: "Can a payment link be reused?",
      answer: "Yes. A link stays open and can take payment from multiple customers until you close it.",
    },
    {
      question: "Can a payment link recur?",
      answer:
        "Yes. Set a billing interval and an optional free trial – customers see a renewal disclosure before they pay.",
    },
    {
      question: "How do Payment Link payouts work?",
      answer:
        "Payments settle into your Easner Business account and reconcile alongside your other activity in one ledger.",
    },
    {
      question: "How can customers pay a link?",
      answer:
        "By card, Apple Pay or Google Pay, by US bank account, or with stablecoins where enabled.",
    },
    {
      question: "Can I limit or close a link?",
      answer:
        "Yes. Cap the number of payments, let customers choose a quantity, or close the link whenever you're done.",
    },
    {
      question: "How do I get paid with a link?",
      answer:
        "Create a Payment Link in Easner Business and share it. No website or code is required. Customers pay by card, Apple Pay or Google Pay, a US bank account, or stablecoins where enabled. Payments settle into the Easner Business account.",
    },
    {
      question: "Can I charge a subscription without a website?",
      answer:
        "Yes. A Payment Link can be recurring, with an optional free trial and a renewal disclosure before the customer pays. Use Checkout when the payment should sit on your own website.",
      links: [{ label: "Checkout", href: "/checkout" }],
    },
    {
      question: "Easner payment link vs invoice vs checkout?",
      answer:
        "Payment Links are a no-code page. Invoicing is an itemized bill to a named customer. Checkout is embedded on your website. All three settle into the same Easner Business ledger.",
      links: [{ label: "Invoicing", href: "/invoicing" }, { label: "Checkout", href: "/checkout" }],
    },
    {
      question: "How do Easner Payment Links compare with Square Payment Links?",
      answer:
        "Easner Payment Links need no website or code and settle into Easner Business. The comparison page sets out the differences with Square Payment Links, with a source and a date for every Square fact.",
      links: [
        { label: "Payment Links vs Square", href: "/compare/easner-payment-links-vs-square" },
      ],
    },
  ],
  ctaBand: {
    headline: "Create your first payment link",
    subhead: "No website or code needed – on Easner Business.",
    ctas: [{ label: "Create a payment link", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "paylinks_cta_band" }],
  },
  complianceNote:
    "Payment links run through the same verification and screening as the rest of your Easner Business account.",
}
