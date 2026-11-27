import type { AnswerDefinition, ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const checkoutDefinition: AnswerDefinition = {
  term: "Easner Checkout",
  question: "What is Easner Checkout?",
  answer:
    "Easner Checkout is a payment form for a business's own website, run from Easner Business. The business is the merchant of record, and its name appears on the customer's statement. Customers can pay by card, bank, wallet, or stablecoin where enabled, once or on a subscription.",
  facts: [
    {
      term: "Do you need a processor?",
      definition: "The business using Checkout is the merchant of record. The customer's statement shows that business's name.",
    },
    {
      term: "No website?",
      definition: "Use Easner Payment Links, a no-code shareable page, instead of embedding Checkout.",
    },
  ],
}

export const checkoutContent: ProductPageContent = {
  metadata: {
    title: "Online Checkout | Accept Payments & Subscriptions",
    description:
      "Accept card, bank, wallet and stablecoin payments on your own website, one-time or by subscription. Your business is the merchant of record, and your name is on the statement.",
    keywords: [
      "accept stablecoin payments",
      "stablecoin checkout",
      "USDC and USDT checkout",
      "Apple Pay and card checkout",
      "hosted checkout page",
      "merchant of record checkout",
      "checkout API",
      "embed payment checkout",
      "website checkout integration",
      "sell software online payments",
      "subscription billing API",
      "online checkout for SaaS",
      "sub-merchant payouts",
      "checkout for US startups",
      "checkout for European startups",
      "checkout for African startups",
      "global SaaS payment infrastructure",
    ],
  },
  keyFacts: [
    { label: "Merchant of record", value: "The business using Checkout, with its name on the customer's statement" },
    { label: "Payment methods", value: "Card, bank, wallet, or stablecoin where enabled" },
    { label: "Billing", value: "One-time or subscription" },
    { label: "Settles to", value: "Your Easner Business ledger" },
    { label: "No website?", value: "Use Payment Links", href: "/payment-links" },
    { label: "Pricing", value: "See plans and fees", href: "/pricing" },
  ],
  lastReviewed: "2026-11-27",
  hero: {
    h1: "Accept payments on your website",
    subhead:
      "Take card, bank and stablecoin payments on your site, one-time or by subscription. Your business is the merchant of record, and your name is on the statement. Every payment lands in Easner Business.",
    visualSlot: "mkt-hero-checkout-01",
    altText: "An Easner hosted checkout page with Apple Pay, card, bank and stablecoin options beside the order summary",
    ctas: [
      { label: "Get started", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "checkout_hero" },
      { label: "See how it works", href: "#integration", analyticsLocation: "checkout_hero_integration" },
    ],
  },
  integrationStepsHeadline: "Live in three steps",
  integrationSteps: [
    { title: "Connect your site", description: "Register your website so a checkout session can run there." },
    { title: "Integrate", description: "Add the payment form with a publishable key and a few lines of code – your page stays yours." },
    { title: "Verify and go live", description: "Confirm your webhook, run a test payment, then start charging real customers." },
  ],
  featuresLayout: "bento",
  features: [
    {
      title: "Collect one-time payments",
      description:
        "Let customers pay once for a product, service, or project fee through your checkout.",
      visualSlot: "mkt-ui-checkout-onetime",
      altText: "Easner Checkout one-time payment page",
    },
    {
      title: "Collect subscriptions",
      description:
        "Bill on a recurring schedule – set the interval once and Easner handles renewals from the same checkout session.",
      visualSlot: "mkt-ui-checkout-subscription",
      altText: "Easner Checkout subscription billing page",
    },
    {
      title: "Global payment methods",
      description:
        "Accept cards, bank payments, and digital wallets, with stablecoin settlement available where enabled – one checkout for global customers.",
      visualSlot: "mkt-ui-checkout-methods",
      altText: "Easner Checkout global payment method selection",
    },
    {
      title: "Payments in one place",
      description:
        "Every checkout and subscription payment settles directly to your Easner Balance, reconciled alongside your other Easner Business activity.",
      visualSlot: "mkt-ui-checkout-ledger",
      altText: "Recent checkout payments with their status",
    },
  ],
  useCasesHeadline: "Built for your website or app",
  useCasesSubhead:
    "Easner Checkout is for teams that already have a website or product and want to add payments without building their own processor integration.",
  useCases: [
    {
      title: "SaaS and software sellers",
      description:
        "Charge one-time or recurring fees for your product without setting up a separate merchant account.",
    },
    {
      title: "Digital products and creators",
      description:
        "Sell digital goods, courses, or licenses with a hosted checkout that matches your brand.",
    },
    {
      title: "Marketplaces and platforms",
      description:
        "Collect from buyers and route funds to sellers, with your business as the merchant of record and one ledger for platform reconciliation.",
    },
  ],
  definition: checkoutDefinition,
  faq: [
    {
      question: "Who is the merchant of record on Easner Checkout?",
      answer:
        "The business using Checkout is the merchant of record. The customer's statement shows that business's name. Easner is not the merchant of record.",
    },
    {
      question: "How do I accept card and stablecoin payments on my site?",
      answer:
        "Embed Easner Checkout on your website from Easner Business. It takes card, bank, and wallet payments, and stablecoins where enabled. The integration uses a publishable key, a server call to create a session, and a signed webhook. Payments settle into the Easner Business account.",
    },
    {
      question: "What is the Easner checkout fee?",
      answer:
        "Card payments are 3.50% + $1.00 on Ease and Ease Plus, and 3.30% + $1.00 on Ease Pro. Bank payments are 1.40% + $1.00 on Ease and Ease Plus, and 1.20% + $0.70 on Ease Pro. On those plans, 0.80% of the bank rate is capped at $5. Ease Gold is Contract. The customer pays the listed price. The fee comes out of what the business receives.",
      links: [{ label: "Pricing", href: "/pricing" }],
    },
    {
      question: "Do I need to write code?",
      links: [{ label: "Collect payments without code", href: "/payment-links" }],
      answer:
        "Yes – Checkout embeds on your own website with a publishable key, a short integration, and a webhook. If you don't have a website, Easner Payment Links is a no-code alternative.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Card, bank payment methods, and digital wallets, with stablecoin settlement available where enabled. Fees are shown before your customer confirms.",
    },
    {
      question: "How do Checkout payouts work?",
      answer:
        "Checkout and subscription payments settle into your Easner Business account and reconcile alongside your other activity in one ledger.",
    },
    {
      question: "Can customers pay with stablecoins?",
      answer:
        "Yes, where enabled. A stablecoin option sits beside card and bank, and the payment lands in Easner Business like any other.",
    },
    {
      question: "Can I bill subscriptions with Easner?",
      answer:
        "Yes. Set a billing interval and an optional free trial; customers see when they'll be charged before they pay.",
    },
    {
      question: "How does Easner Checkout compare with Paddle?",
      answer:
        "On Easner Checkout your business is the merchant of record. The comparison page sets out the differences with Paddle, which is the merchant of record on its side, with a source and a date for every Paddle fact.",
      links: [
        { label: "Checkout vs Paddle", href: "/compare/easner-checkout-vs-paddle" },
      ],
    },
  ],
  ctaBand: {
    headline: "Add checkout to your website",
    subhead: "One-time, subscription, and custom payments, on Easner Business.",
    ctas: [{ label: "Get started", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "checkout_cta_band" }],
  },
  complianceNote:
    "Checkout sessions and subscriptions run through the same verification and screening as the rest of your Easner Business account.",
}
