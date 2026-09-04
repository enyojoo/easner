import type { ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL } from "../constants"

export const checkoutContent: ProductPageContent = {
  metadata: {
    title: "Checkout | Embed Payments on Your Website",
    description:
      "Add checkout to your own website – one-time, subscription, and custom payments. Easner is the merchant on record, reconciled in one ledger in Easner Business.",
    keywords: [
      "merchant of record checkout",
      "checkout API",
      "embed payment checkout",
      "website checkout integration",
      "sell software online payments",
      "subscription billing API",
      "online checkout for SaaS",
      "sub-merchant payouts",
    ],
  },
  hero: {
    h1: "Checkout, embedded on your site",
    subhead:
      "Add card, bank, and wallet payments to your own website – one-time, subscription, or custom charges, with Easner as the merchant on record.",
    visualSlot: "mkt-hero-checkout-01",
    altText: "Easner Checkout embedded on a merchant's own website",
    ctas: [
      { label: "Start with Easner Checkout", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "checkout_hero" },
      { label: "See how it works", href: "#integration", analyticsLocation: "checkout_hero_integration" },
    ],
  },
  integrationStepsHeadline: "Live in three steps",
  integrationSteps: [
    { title: "Connect your site", description: "Register your website so a checkout session can run there." },
    { title: "Integrate", description: "Add the payment form with a publishable key and a few lines of code – your page stays yours." },
    { title: "Verify and go live", description: "Confirm your webhook, run a test payment, then start charging real customers." },
  ],
  integrationStepsFootnote: "No separate merchant account or payment processor to set up.",
  featuresLayout: "bento",
  features: [
    {
      title: "One-time, subscription, or custom",
      description:
        "Charge once, bill on a schedule, or key a charge to your own record id for bookings and gated access – all through the same checkout session.",
      visualSlot: "mkt-ui-checkout-hosted",
      altText: "Easner hosted checkout page embedded on a website",
    },
    {
      title: "Global payment methods",
      description:
        "Accept cards, bank payments, and digital wallets, with stablecoin settlement available where enabled – one checkout for global customers.",
      visualSlot: "mkt-ui-checkout-methods",
      altText: "Easner Checkout global payment method selection",
    },
    {
      title: "One ledger",
      description:
        "Every checkout and subscription payment settles alongside your invoices, payouts, and card activity in Easner Business – one place to reconcile.",
      visualSlot: "mkt-ui-checkout-ledger",
      altText: "Easner Business unified ledger with checkout activity",
    },
  ],
  useCasesHeadline: "Built for platforms with their own website",
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
        "Collect from buyers and route funds to sellers, with Easner as the merchant on record and one ledger for platform reconciliation.",
    },
    {
      title: "Bookings and gated access",
      description:
        "Charge for a class, a download, or gated access, keyed to your own record ids – built for pay-for-access flows.",
    },
  ],
  faq: [
    {
      question: "Do I need my own payment processor?",
      answer:
        "No. Easner is the merchant on record for checkout – you don't need to set up or maintain a separate payment account.",
    },
    {
      question: "Do I need to write code?",
      answer:
        "Yes – Checkout embeds on your own website with a publishable key, a short integration, and a webhook. If you don't have a website, Easner Payment Links is a no-code alternative.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Card, bank payment methods, and digital wallets, with stablecoin settlement available where enabled. Fees are shown before your customer confirms.",
    },
    {
      question: "How do payouts work?",
      answer:
        "Checkout and subscription payments settle into your Easner Business account and reconcile alongside your other activity in one ledger.",
    },
  ],
  ctaBand: {
    headline: "Add checkout to your website",
    subhead: "One-time, subscription, and custom payments, on Easner Business.",
    ctas: [{ label: "Start with Easner Checkout", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "checkout_cta_band" }],
  },
  complianceNote:
    "Checkout sessions and subscriptions run through the same verification and screening as the rest of your Easner Business account.",
}
