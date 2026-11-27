/**
 * Comparison pages. Easner's side comes from Easner's own pages. Every competitor fact comes from that company's
 * public pages, with the URL and the date it was read. If a competitor fact cannot be confirmed, the row says so
 * or is left out. Re-check the dates before editing a figure, and update `lastChecked`.
 */
import type { FaqItem } from "../types"

export interface CompareRow {
  dimension: string
  easner: string
  other: string
  /** Official page the competitor cell comes from. */
  sourceUrl?: string
  /** Where the Easner cell links, if anywhere. */
  easnerHref?: string
}

export interface ComparePage {
  slug: string
  /** "Stripe Connect" */
  otherName: string
  /** Easner product on this page. */
  easnerName: string
  easnerHref: string
  metadata: { title: string; description: string; keywords: string[] }
  h1: string
  /** 40–70 words. The first sentence must stand alone. */
  answer: string
  /** ISO date the competitor facts were read. */
  lastChecked: string
  rows: CompareRow[]
  chooseEasner: string[]
  chooseOther: string[]
  faq: FaqItem[]
  /** Short note under the table about what was not compared or could not be confirmed. */
  note?: string
}

const CHECKED = "2026-11-27"

export const comparePages: ComparePage[] = [
  {
    slug: "easner-connect-vs-stripe-connect",
    otherName: "Stripe Connect",
    easnerName: "Easner Connect",
    easnerHref: "/connect",
    metadata: {
      title: "Easner Connect vs Stripe Connect | Paying the People on Your Platform",
      description:
        "How Easner Connect and Stripe Connect differ for platforms that pay sellers, creators, and freelancers: what the person needs, tax forms, countries, and timing. Sources and dates included.",
      keywords: [
        "Easner Connect vs Stripe Connect",
        "Stripe Connect alternative",
        "Stripe Connect alternative for payouts",
        "marketplace payout platform comparison",
      ],
    },
    h1: "Easner Connect vs Stripe Connect",
    answer:
      "Easner Connect pays people into their own Easner accounts in US dollars, and collects each person's tax form once for every platform they work with. Stripe Connect pays people through connected Stripe accounts and can also file 1099s for the platform. The right choice depends on where your people are and who files tax forms.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What the person needs",
        easner: "An Easner account. They link once in the Easner app and verify their identity.",
        other: "A connected account. Stripe handles onboarding and identity checks.",
        sourceUrl: "https://docs.stripe.com/connect/accounts",
      },
      {
        dimension: "How the person is paid",
        easner:
          "In US dollars, from your Easner Business balance into the person's own Easner account. They can keep dollars or cash out where Easner supports it.",
        other:
          "In local currencies. Self-serve cross-border payouts cover platforms and accounts in the US, UK, EEA, Canada, and Switzerland.",
        sourceUrl: "https://docs.stripe.com/connect/cross-border-payouts",
      },
      {
        dimension: "Countries",
        easner: "People in 158 countries can open the Easner app. Cash-out follows Easner's payout countries.",
        other: "Stripe's Connect page says it supports 46+ countries for onboarding.",
        sourceUrl: "https://stripe.com/connect",
        easnerHref: "/answers/connect",
      },
      {
        dimension: "Tax forms",
        easner:
          "The person signs a W-9 or W-8BEN once in the Easner app and shares it with each platform. The platform stays the filer. Easner does not file 1099s.",
        other:
          "Stripe's 1099 tax reporting lets platforms create, file, and deliver 1099-K, 1099-MISC, and 1099-NEC forms, for US-based payees.",
        sourceUrl: "https://docs.stripe.com/connect/tax-reporting",
      },
      {
        dimension: "Payout timing",
        easner: "Typically within seconds, into the person's Easner account.",
        other:
          "Standard payouts typically arrive 1–2 business days after submission. Instant payouts typically settle within 30 minutes, in supported countries.",
        sourceUrl: "https://docs.stripe.com/connect/instant-payouts",
      },
      {
        dimension: "Platform pricing",
        easner: "Set by your plan. Receiving into Easner is free for the person. See Pricing.",
        other:
          "On the pricing where you handle fees: $2 per monthly active account, plus 0.25% + 25¢ per payout. Stripe-handled pricing is also offered.",
        sourceUrl: "https://stripe.com/connect/pricing",
        easnerHref: "/pricing",
      },
    ],
    chooseEasner: [
      "Your people are happy to receive US dollars in an Easner account, and can keep them or cash out.",
      "You want each person's tax form collected once and shared with every platform they work with.",
      "You are a smaller platform that wants to start in test mode and go live after a program review.",
    ],
    chooseOther: [
      "You need payouts in the recipient's local currency across Stripe's supported countries.",
      "You want your payment provider to file 1099s on your behalf.",
      "You already take payments on Stripe and want everything in one place.",
    ],
    faq: [
      {
        question: "Is Easner Connect an alternative to Stripe Connect?",
        answer:
          "For paying the people on a platform, yes, with a different model. Easner Connect pays into each person's own Easner account in US dollars. Stripe Connect pays through connected Stripe accounts. Easner Connect is not a payment processor for collecting card payments.",
        links: [{ label: "Connect", href: "/connect" }],
      },
      {
        question: "Does Easner Connect file 1099s like Stripe does?",
        answer:
          "No. Easner does not file with the IRS and does not hold tax back from a Connect payout. The platform stays the filer and the withholding agent. Stripe offers a 1099 tax reporting product for platforms.",
        links: [{ label: "Connect answers", href: "/answers/connect" }],
      },
    ],
    note: "Stripe's pricing page offers more than one pricing model. The figures here are for the model where the platform handles fees. Stripe's Connect page and docs were read on the date above.",
  },
  {
    slug: "easner-business-vs-wise-business",
    otherName: "Wise Business",
    easnerName: "Easner Business",
    easnerHref: "/business",
    metadata: {
      title: "Easner Business vs Wise Business | Paying and Collecting Internationally",
      description:
        "How Easner Business and Wise Business differ for paying suppliers abroad and getting paid by customers: account details, reach, collection tools, and speed. Sources and dates included.",
      keywords: [
        "Easner Business vs Wise Business",
        "Wise Business alternative",
        "business account for international payments comparison",
        "pay suppliers abroad comparison",
      ],
    },
    h1: "Easner Business vs Wise Business",
    answer:
      "Easner Business gives a company USD and EUR account details, ways to collect from customers, and payouts to 80+ countries in one dashboard. Wise Business offers local account details in more currencies and sends to 70+ countries. The better fit depends on how many currencies you need and how you collect.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "Account details",
        easner: "USD and EUR in the business's name, and GBP where supported.",
        other: "Wise's US pricing page lists 22 currencies for receiving account details, with a one-time $31 fee to get started.",
        sourceUrl: "https://wise.com/us/pricing/business/receive",
      },
      {
        dimension: "Paying suppliers and staff abroad",
        easner: "Bank accounts, mobile money, and stablecoin wallets in 80+ countries.",
        other: "Wise says you can choose from 70+ countries to pay overseas staff or suppliers.",
        sourceUrl: "https://wise.com/us/send-money/international-business-payments",
        easnerHref: "/answers/business",
      },
      {
        dimension: "Collecting from customers",
        easner:
          "Share account details, or use invoices, Payment Links, Checkout, Terminal, and QR Pay. Every payment lands in one ledger.",
        other:
          "Receive with local account details. Wise lists domestic USD payments as free, and wire and SWIFT payments at a flat $6.11 each.",
        sourceUrl: "https://wise.com/us/pricing/business/receive",
      },
      {
        dimension: "Paying many people at once",
        easner: "Payroll pays employees and contractors in 80+ countries in one run that is reviewed and approved first.",
        other: "Wise says you can pay up to 1,000 contractors at once.",
        sourceUrl: "https://wise.com/us/business/",
        easnerHref: "/payroll",
      },
      {
        dimension: "Speed",
        easner: "Typically minutes to hours, same-day where supported.",
        other: "Wise says 96% of payments take less than 24 hours, and notes this may not apply to every transaction.",
        sourceUrl: "https://wise.com/us/business/",
      },
      {
        dimension: "Sending fees",
        easner: "The rate and fees are shown before you confirm. Plan fees are on Pricing.",
        other: "Wise says fees vary by currency and start from 0.23%.",
        sourceUrl: "https://wise.com/us/pricing/business",
        easnerHref: "/pricing",
      },
    ],
    chooseEasner: [
      "You want invoices, Checkout, Terminal, QR Pay, payouts, Payroll, and Connect in one account and one ledger.",
      "You pay suppliers by mobile money or to stablecoin wallets as well as to bank accounts.",
      "You need USD and EUR account details and a dashboard built for a team, with approvals on higher plans.",
    ],
    chooseOther: [
      "You need local account details in many more currencies than USD, EUR, and GBP.",
      "You mostly send to bank accounts and want a long-established transfer network.",
      "You need to pay up to 1,000 contractors in one batch.",
    ],
    faq: [
      {
        question: "Is Easner Business an alternative to Wise Business?",
        answer:
          "For a company that pays suppliers abroad and collects from customers, yes, with a wider set of collection tools. Wise Business offers local account details in more currencies. Easner is a financial technology company, not a bank, and banking services come from licensed partners.",
        links: [{ label: "Business Banking", href: "/business" }],
      },
    ],
    note: "Wise figures are from Wise's US pricing and business pages and can differ in other regions. Wise's list of account-detail currencies and its number of countries for opening an account were not confirmed, so they are not compared.",
  },
  {
    slug: "easner-connect-vs-paypal-payouts",
    otherName: "PayPal Payouts",
    easnerName: "Easner Connect",
    easnerHref: "/connect",
    metadata: {
      title: "Easner Connect vs PayPal Payouts | Paying Sellers, Creators, and Affiliates",
      description:
        "How Easner Connect and PayPal Payouts differ for platforms that pay people in other countries: what the person needs, tax forms, reach, and limits. Sources and dates included.",
      keywords: [
        "Easner Connect vs PayPal Payouts",
        "PayPal Payouts alternative",
        "PayPal mass payouts alternative",
        "affiliate payout platform comparison",
      ],
    },
    h1: "Easner Connect vs PayPal Payouts",
    answer:
      "Easner Connect pays people into their own Easner accounts in US dollars and collects each person's tax form once. PayPal Payouts sends money to a recipient's PayPal or Venmo account, identified by email, phone number, or PayPal ID. Both pay many people at once, with different recipient accounts and different tax-form support.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What the person needs",
        easner: "An Easner account. They link once in the Easner app and verify their identity.",
        other:
          "A PayPal or Venmo account. Recipients are identified by email, phone number, or PayPal ID, and people without an account are prompted to open one.",
        sourceUrl: "https://developer.paypal.com/docs/payouts/standard/",
      },
      {
        dimension: "Reach",
        easner: "People in 158 countries can open the Easner app. Cash-out follows Easner's payout countries.",
        other:
          "PayPal's Payouts page says multiple recipients in 96 countries and 24 currencies. A separate Enterprise Payouts product lists 240+ countries and regions.",
        sourceUrl: "https://developer.paypal.com/docs/payouts/",
        easnerHref: "/answers/connect",
      },
      {
        dimension: "Tax forms",
        easner:
          "The person signs a W-9 or W-8BEN once and shares it with each platform. The platform stays the filer. Easner does not file 1099s.",
        other: "PayPal's developer overview says Enterprise Payouts includes 1099 tax reporting. It does not list it for standard Payouts.",
        sourceUrl: "https://developer.paypal.com/docs/payouts/",
      },
      {
        dimension: "Who pays the fee",
        easner: "The platform pays, set by your plan. Receiving into Easner is free for the person. See Pricing.",
        other:
          "The sender pays, deducted from the sender's PayPal funding account. PayPal describes a percentage fee with a cap that varies by country.",
        sourceUrl: "https://developer.paypal.com/payouts/fees.md",
        easnerHref: "/pricing",
      },
      {
        dimension: "Timing",
        easner: "Typically within seconds, into the person's Easner account.",
        other: "PayPal's Payouts page says to send money immediately and does not state settlement times.",
        sourceUrl: "https://developer.paypal.com/docs/payouts/standard/",
      },
    ],
    chooseEasner: [
      "You want each person's tax form collected once, signed in an app, and shared with every platform they work with.",
      "You want people to hold US dollars in their own account, or cash out where Easner supports it.",
      "You are a smaller platform that wants to try test mode first and go live after a program review.",
    ],
    chooseOther: [
      "Your people already use PayPal or Venmo and prefer to be paid there.",
      "You need the widest country reach and Enterprise Payouts' 1099 tax reporting.",
      "You want recipients identified only by email address or phone number.",
    ],
    faq: [
      {
        question: "Is Easner Connect an alternative to PayPal Payouts?",
        answer:
          "For paying sellers, creators, affiliates, and freelancers, yes, with a different recipient account. Easner Connect pays into each person's own Easner account in US dollars after a one-time link in the Easner app. PayPal Payouts pays into a PayPal or Venmo account.",
        links: [{ label: "Connect", href: "/connect" }],
      },
    ],
    note: "PayPal's own fee pages were not available to read, so exact fee percentages and caps are not compared. PayPal also lists two products, standard Payouts and Enterprise Payouts. The rows say which one each fact belongs to.",
  },
]

export function findComparePage(slug: string) {
  return comparePages.find((page) => page.slug === slug)
}

export const comparePath = (page: Pick<ComparePage, "slug">) => `/compare/${page.slug}`
