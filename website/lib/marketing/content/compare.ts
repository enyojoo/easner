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
      title: "Easner Connect vs Stripe Connect | Platform Payouts",
      description:
        "Easner Connect and Stripe Connect compared for platforms that pay people: what the person needs, tax forms, countries, and timing. Sourced and dated.",
      keywords: [
        "Easner Connect vs Stripe Connect",
        "Stripe Connect alternative",
        "Stripe Connect alternative for payouts",
        "marketplace payout platform comparison",
      ],
    },
    h1: "Easner Connect vs Stripe Connect",
    answer:
      "Easner Connect pays people into their own Easner accounts in US dollars, and collects each person's tax form once for every platform they work with. Stripe Connect pays people through connected Stripe accounts. Both let a platform pay many people.",
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
          "The person signs a W-9 or W-8BEN once in the Easner app and shares it with each platform. The platform stays the filer.",
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
    faq: [
      {
        question: "Is Easner Connect an alternative to Stripe Connect?",
        answer:
          "For paying the people on a platform, yes, with a different model. Easner Connect pays into each person's own Easner account in US dollars. Stripe Connect pays through connected Stripe accounts.",
        links: [{ label: "Connect", href: "/connect" }],
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
      title: "Easner Business vs Wise Business | International Payments",
      description:
        "Easner Business and Wise Business compared for paying suppliers abroad and getting paid: account details, reach, collection tools, and speed. Sourced.",
      keywords: [
        "Easner Business vs Wise Business",
        "Wise Business alternative",
        "business account for international payments comparison",
        "pay suppliers abroad comparison",
      ],
    },
    h1: "Easner Business vs Wise Business",
    answer:
      "Easner Business gives a company USD and EUR account details, ways to collect from customers, and payouts to 80+ countries in one dashboard. Wise Business offers local account details in 22 currencies on its US pricing page and says it sends to 70+ countries.",
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
    faq: [
      {
        question: "Is Easner Business an alternative to Wise Business?",
        answer:
          "For a company that pays suppliers abroad and collects from customers, yes. Easner Business combines accounts, collection tools, and payouts in one dashboard. Easner is a financial technology company, not a bank, and banking services come from licensed partners.",
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
      title: "Easner Connect vs PayPal Payouts | Platform Payouts",
      description:
        "Easner Connect and PayPal Payouts compared for platforms paying people in other countries: recipient account, tax forms, and reach. Sourced and dated.",
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
          "The person signs a W-9 or W-8BEN once and shares it with each platform. The platform stays the filer.",
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
  {
    slug: "easner-payroll-vs-deel",
    otherName: "Deel",
    easnerName: "Easner Payroll",
    easnerHref: "/payroll",
    metadata: {
      title: "Easner Payroll vs Deel | Paying Teams Abroad",
      description:
        "Easner Payroll and Deel compared for paying employees and contractors abroad: what each does, countries, prices, and payout methods. Sourced and dated.",
      keywords: ["Easner Payroll vs Deel", "Deel alternative", "Deel alternative for paying contractors", "international payroll comparison"],
    },
    h1: "Easner Payroll vs Deel",
    answer:
      "Easner Payroll pays a company's own employees and contractors in 80+ countries from the Easner Business balance, with approvals and pay stubs. Deel is a broader platform that also offers an employer-of-record service and says it covers 150+ countries.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What it does",
        easner: "Pays the company's own employees and contractors from your Easner Business balance, with approvals, pay stubs, and records on one ledger.",
        other: "Offers contractor payments, global payroll, and an employer-of-record service in which Deel employs the worker on paper.",
        sourceUrl: "https://www.deel.com/solutions/payroll/eor/",
        easnerHref: "/payroll",
      },
      {
        dimension: "Countries",
        easner: "Employees and contractors in 80+ countries.",
        other: "Deel says its global payroll covers 150+ countries.",
        sourceUrl: "https://www.deel.com/global-payroll/",
        easnerHref: "/answers/payroll",
      },
      {
        dimension: "How people get paid",
        easner: "Each person chooses an EASETAG, a bank account, or mobile money in the Easner app.",
        other: "Deel's blog lists local bank, SWIFT, PayPal, Payoneer, and Deel Card, with fees paid by the contractor.",
        sourceUrl: "https://www.deel.com/blog/how-to-pay-contractors-with-deel/",
      },
      {
        dimension: "Published prices",
        easner: "Set by your plan. Unlimited payroll is on Ease Pro. See Pricing.",
        other: "The contractor plan starts at $49 per contractor per month, and employer of record starts at $599 per employee per month. Global payroll has no published price.",
        sourceUrl: "https://www.deel.com/pricing/",
        easnerHref: "/pricing",
      },
    ],
    chooseEasner: ["You already employ or contract people and want to pay them from your Easner Business balance, with approvals and pay stubs.", "You want payroll next to invoices, payouts, and collections on one ledger.", "You want each person to choose an EASETAG, a bank account, or mobile money themselves."],
    faq: [
      {
        question: "Is Easner Payroll an alternative to Deel?",
        answer:
          "For paying your own employees and contractors, yes. Easner Payroll pays from your Easner Business balance with approvals and pay stubs. Deel also offers an employer-of-record service, which is a different service from paying your own team.",
        links: [{"label": "Payroll", "href": "/payroll"}],
      },
    ],
    note: "Deel's global payroll price is not published, and its pages gave different country counts for employer of record, so those are not compared. Deel's tax-form handling and company funding method were not confirmed on a product page. Deel's contractor payout details come from its blog.",
  },

  {
    slug: "easner-business-vs-payoneer",
    otherName: "Payoneer",
    easnerName: "Easner Business",
    easnerHref: "/business",
    metadata: {
      title: "Easner Business vs Payoneer | International Payments",
      description:
        "Easner Business and Payoneer compared for receiving international payments and paying suppliers: account details, fees, reach, and cards. Sourced.",
      keywords: ["Easner Business vs Payoneer", "Payoneer alternative", "Payoneer alternative for business", "receive international payments comparison"],
    },
    h1: "Easner Business vs Payoneer",
    answer:
      "Easner Business gives a company USD and EUR account details, ways to collect from customers, and payouts to 80+ countries in one dashboard. Payoneer offers receiving accounts in 13 currencies, a card, and mass payouts for freelancers, marketplace sellers, and businesses.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "Account details",
        easner: "USD and EUR in the business's name, and GBP where supported.",
        other: "Payoneer says local receiving accounts cover 13 currencies, and also offers SWIFT receiving.",
        sourceUrl: "https://www.payoneer.com/receiving-accounts/",
      },
      {
        dimension: "Collecting from customers",
        easner: "Share account details, or use invoices, Payment Links, Checkout, Terminal, and QR Pay. Every payment lands in one ledger.",
        other: "Receiving accounts, marketplace payments, card payments (up to 3.99% + 0.49 USD), and US ACH (1%).",
        sourceUrl: "https://www.payoneer.com/pricing/",
        easnerHref: "/business",
      },
      {
        dimension: "Fees to receive",
        easner: "Set by your plan. See Pricing.",
        other: "A local-currency receiving account is free. A non-local-currency receiving account costs 1%, with a minimum of 1 USD.",
        sourceUrl: "https://www.payoneer.com/pricing/",
        easnerHref: "/pricing",
      },
      {
        dimension: "Account fee",
        easner: "Ease is $0 a month. Paid plans add team and payroll features.",
        other: "An annual fee of 29.95 USD applies only if the account receives less than 6,000 USD in any 12 consecutive months.",
        sourceUrl: "https://www.payoneer.com/pricing/",
        easnerHref: "/pricing",
      },
      {
        dimension: "Paying suppliers",
        easner: "Bank accounts, mobile money, and stablecoin wallets in 80+ countries. The rate and fees are shown before you confirm.",
        other: "Sending from the balance to another country costs up to 1% plus up to 4 USD.",
        sourceUrl: "https://www.payoneer.com/pricing/",
        easnerHref: "/answers/business",
      },
      {
        dimension: "Reach",
        easner: "Business accounts can be opened from 174 countries, and payouts go to 80+ countries.",
        other: "Payoneer says 190+ countries and territories and 70+ currencies.",
        sourceUrl: "https://www.payoneer.com/",
      },
      {
        dimension: "Cards",
        easner: "Cards, once they are available for your account and you are approved.",
        other: "Corporate cards, virtual and physical, with an annual card fee of 29.95 USD.",
        sourceUrl: "https://www.payoneer.com/pricing/",
      },
    ],
    chooseEasner: ["You collect with invoices, Payment Links, Checkout, Terminal, and QR Pay and want them on one ledger.", "You pay suppliers by mobile money or to stablecoin wallets as well as to bank accounts.", "You want a $0-a-month plan with team access and payroll on higher plans."],
    faq: [
      {
        question: "Is Easner Business an alternative to Payoneer?",
        answer:
          "For a company that receives international payments and pays suppliers, yes. Easner Business combines accounts, collection tools, and payouts in one dashboard. Easner is a financial technology company, not a bank, and banking services come from licensed partners.",
        links: [{"label": "Business Banking", "href": "/business"}],
      },
    ],
    note: "Payoneer's pricing page lists estimates dated 1 January 2026. Marketplace receiving fees vary by marketplace, and withdrawal timing was not confirmed, so neither is compared.",
  },

  {
    slug: "easner-checkout-vs-paddle",
    otherName: "Paddle",
    easnerName: "Easner Checkout",
    easnerHref: "/checkout",
    metadata: {
      title: "Easner Checkout vs Paddle | Who Is the Merchant of Record",
      description:
        "Easner Checkout and Paddle compared: who is the merchant of record, tax, payment methods, what you can sell, and when you get paid. Sourced and dated.",
      keywords: ["Easner Checkout vs Paddle", "Paddle alternative", "merchant of record comparison", "Paddle alternative for software"],
    },
    h1: "Easner Checkout vs Paddle",
    answer:
      "On Easner Checkout, your business is the merchant of record, and your name is on the customer's statement. With Paddle, Paddle is the merchant of record and handles sales tax, but it sells only certain software and digital products.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "Merchant of record",
        easner: "Your business. Easner is not the merchant of record.",
        other: "Paddle is the legal seller and takes on sales tax, refund, and chargeback liabilities.",
        sourceUrl: "https://developer.paddle.com/get-started/how-paddle-works/",
        easnerHref: "/checkout",
      },
      {
        dimension: "Fees",
        easner: "Set by your plan. See Pricing.",
        other: "5% + 50¢ per transaction, with no monthly fees.",
        sourceUrl: "https://www.paddle.com/pricing",
        easnerHref: "/pricing",
      },
      {
        dimension: "Payment methods",
        easner: "Card, bank payment methods, and digital wallets, with stablecoin where enabled.",
        other: "Paddle lists 18 methods, including cards, Apple Pay, Google Pay, PayPal, Alipay, Pix, and UPI, and shows the ones that fit each customer.",
        sourceUrl: "https://developer.paddle.com/concepts/payment-methods/",
      },
      {
        dimension: "What you can sell",
        easner: "The Checkout page's use cases include software, digital products, and marketplaces, subject to verification.",
        other: "Software and digital products. Paddle's acceptable use page lists physical goods, consulting, coaching, donations, and marketplaces as not allowed.",
        sourceUrl: "https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle",
      },
      {
        dimension: "When you get paid",
        easner: "Payments settle into your Easner Business account and show in one ledger.",
        other: "Payouts are monthly and sent by the 15th, with a $100 minimum. Sellers cannot withdraw on demand.",
        sourceUrl: "https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid",
        easnerHref: "/answers/business",
      },
    ],
    chooseEasner: ["You want to be the merchant of record, with your name on the customer's statement.", "You want payments to settle into one Easner Business account next to invoices and payouts.", "You sell something Paddle's acceptable use page excludes, such as a marketplace, subject to Easner's verification."],
    faq: [
      {
        question: "Is Easner Checkout an alternative to Paddle?",
        answer:
          "For taking payments on your own website, yes, with a different model. On Easner Checkout your business is the merchant of record. With Paddle, Paddle is.",
        links: [{"label": "Checkout", "href": "/checkout"}],
      },
    ],
    note: "Paddle's payout currencies and a verified country count were not confirmed, so they are not compared. Paddle's acceptable use page is described as not exhaustive.",
  },

  {
    slug: "easner-personal-banking-vs-wise",
    otherName: "Wise",
    easnerName: "Easner Personal Banking",
    easnerHref: "/personal",
    metadata: {
      title: "Easner Personal Banking vs Wise | Multi-Currency Accounts",
      description:
        "How Easner Personal Banking and the Wise account differ: currencies, account details, sending reach, top-ups, speed, and cards. Sources and dates included.",
      keywords: ["Easner Personal Banking vs Wise", "Wise alternative", "multi-currency account comparison", "Wise account alternative"],
    },
    h1: "Easner Personal Banking vs Wise",
    answer:
      "Easner Personal Banking and the Wise account both let you hold several currencies and send abroad. Easner gives USD and EUR account details, and GBP where supported, and sends to 80+ countries. Wise says you can hold 40 currencies and send to 140+ countries.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "Currencies",
        easner: "USD and EUR, and GBP where supported, each with account details in your name.",
        other: "Wise says you can hold 40 currencies. Its pages give different counts for currencies with local account details, so that figure is not stated here.",
        sourceUrl: "https://wise.com/us/multi-currency-account",
        easnerHref: "/personal",
      },
      {
        dimension: "Account details fee",
        easner: "Set by your plan. Ease is $0 a month.",
        other: "Wise's pricing page lists getting account details as free.",
        sourceUrl: "https://wise.com/us/pricing",
        easnerHref: "/pricing",
      },
      {
        dimension: "Sending reach",
        easner: "Bank accounts and mobile money in 80+ countries, and other Easner users by EASETAG.",
        other: "Wise says it delivers to 140+ countries, with bank and mobile money payouts.",
        sourceUrl: "https://wise.com/us/send-money/",
        easnerHref: "/answers/personal",
      },
      {
        dimension: "Adding money",
        easner: "Card, Apple Pay, Google Pay, ACH, bank transfer, or stablecoin deposit where enabled.",
        other: "Bank transfer (ACH direct debit and wire), debit or credit card, Apple Pay, and Google Pay.",
        sourceUrl: "https://wise.com/us/pricing",
      },
      {
        dimension: "Speed",
        easner: "Typically minutes to hours, same-day where supported.",
        other: "Wise says 77% of transfers arrive in under 20 seconds and 95% in a day.",
        sourceUrl: "https://wise.com/us/send-money/",
      },
      {
        dimension: "Card",
        easner: "Cards, once they are available for your account and you are approved.",
        other: "A debit card for eligible customers, with a one-time fee of $9.",
        sourceUrl: "https://wise.com/us/card",
      },
      {
        dimension: "Regulation",
        easner: "Easner is a financial technology company, not a bank. Banking services come from licensed partners.",
        other: "Wise says it is a money service business registered with FinCEN and not an FDIC-insured bank. Opt-in interest balances have pass-through FDIC insurance.",
        sourceUrl: "https://wise.com/us/interest/",
      },
    ],
    chooseEasner: ["You want an EASETAG to pay other Easner users and a plan with a $0 monthly tier.", "You also run a company on Easner Business and want one provider for both.", "You mainly need USD and EUR details."],
    faq: [
      {
        question: "Is Easner Personal Banking an alternative to Wise?",
        answer:
          "For holding USD and EUR and sending abroad, yes. Easner Personal Banking adds EASETAG payments between Easner users and sits alongside Easner Business.",
        links: [{"label": "Personal Banking", "href": "/personal"}],
      },
    ],
    note: "Wise's pages give different figures for the number of currencies with local account details (20 and 22) and for the lowest sending fee (0.1% and 0.23%), so neither is compared. Wise's mobile money country list was not available.",
  },

  {
    slug: "easner-white-label-vs-wise-platform",
    otherName: "Wise Platform",
    easnerName: "Easner White-label",
    easnerHref: "/white-label",
    metadata: {
      title: "Easner White-label vs Wise Platform | Branded Payments",
      description:
        "Easner White-label and Wise Platform compared for offering cross-border payments under your brand: what you get, compliance, coverage, and pricing. Sourced.",
      keywords: ["Easner White-label vs Wise Platform", "Wise Platform alternative", "white-label payments comparison", "embedded cross-border payments comparison"],
    },
    h1: "Easner White-label vs Wise Platform",
    answer:
      "Easner White-label is a live payments product that runs under your name, logo, and colour on Easner infrastructure, with Easner running verification and screening. Wise Platform lets banks, fintechs, and enterprises embed Wise's payments through an API or Swift, and says your product stays the customer-facing experience.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What you get",
        easner: "A live payments product under your name, logo, and colour. Easner runs the infrastructure, verification, screening, payout connections, and operations.",
        other: "Payment infrastructure you integrate through an API or Swift, with send, receive, card issuing, and account building blocks.",
        sourceUrl: "https://wise.com/platform",
        easnerHref: "/white-label",
      },
      {
        dimension: "Who it is for",
        easner: "Money transfer agents, OTC agents, and faith and nonprofit networks moving money across borders, among others.",
        other: "Banks and financial institutions, plus enterprises such as marketplaces, travel, and spend management, and fintechs and SaaS providers.",
        sourceUrl: "https://docs.wise.com/guides/product/account-setup",
      },
      {
        dimension: "Branding",
        easner: "Your name, logo, and colour on a ready product.",
        other: "Partners can build a branded send-money experience. Wise's page does not name white-label as an option.",
        sourceUrl: "https://docs.wise.com/guides/product/send-money/use-cases/embedded",
      },
      {
        dimension: "Compliance",
        easner: "Easner runs verification and screening. You run the brand and the customer relationship.",
        other: "Wise says it manages compliance checks and payout execution for embedded partners without a financial licence, and each end user is verified under the agreed KYC model.",
        sourceUrl: "https://docs.wise.com/guides/product/send-money/use-cases/embedded",
      },
      {
        dimension: "Coverage",
        easner: "Payouts to bank accounts and mobile money in 80+ countries.",
        other: "Wise says 200+ countries and 110+ currencies for sending.",
        sourceUrl: "https://wise.com/platform",
        easnerHref: "/answers/white-label",
      },
      {
        dimension: "Pricing",
        easner: "Terms depend on the model, corridors, and volume. Ease Gold includes White-label pricing in the contract.",
        other: "No partner price list is published on the Platform page, which points to Wise's sales team.",
        sourceUrl: "https://www.wise.com/platform/contact",
        easnerHref: "/pricing",
      },
      {
        dimension: "Getting started",
        easner: "Talk to the Easner team, complete business verification, configure your branded product, then go live.",
        other: "Contact the Wise Platform sales team.",
        sourceUrl: "https://www.wise.com/platform/contact",
        easnerHref: "/contact",
      },
    ],
    chooseEasner: ["You want a ready, branded payments product without building the app yourself.", "You want Easner to run verification, screening, payout connections, and operations.", "You are a money transfer agent, OTC agent, or network moving money across borders."],
    faq: [
      {
        question: "Is Easner White-label an alternative to Wise Platform?",
        answer:
          "For offering cross-border payments under your own name, yes, with a different model. Easner White-label is a ready branded product that Easner operates. Wise Platform is infrastructure that partners integrate into their own products.",
        links: [{"label": "White-label", "href": "/white-label"}],
      },
    ],
    note: "Wise's pages list 23+ countries for local account details, while its docs list three countries for one account-details endpoint, so account details are not compared. Wise's partner price list, minimum volume, and licensing requirements were not confirmed.",
  },
  {
    slug: "easner-business-vs-airwallex",
    otherName: "Airwallex",
    easnerName: "Easner Business",
    easnerHref: "/business",
    metadata: {
      title: "Easner Business vs Airwallex | International Accounts",
      description:
        "Easner Business and Airwallex compared for receiving and sending money internationally: account details, fees, reach, cards, and eligibility. Sourced.",
      keywords: ["Easner Business vs Airwallex", "Airwallex alternative", "Airwallex alternative for business accounts", "multi-currency business account comparison"],
    },
    h1: "Easner Business vs Airwallex",
    answer:
      "Easner Business gives a company USD and EUR account details, ways to collect from customers, and payouts to 80+ countries, including mobile money and stablecoin wallets. Airwallex says it offers local accounts in 20+ currencies and sends to 200+ countries by SWIFT.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "Account details",
        easner: "USD and EUR in the business's name, and GBP where supported.",
        other: "Airwallex says you can open local accounts in 20+ currencies. Its pages name 23 and 24 currencies in different places.",
        sourceUrl: "https://www.airwallex.com/en-us/business-account/global-accounts",
        easnerHref: "/business",
      },
      {
        dimension: "Account fees",
        easner: "Ease is $0 a month. Paid plans add team and payroll features.",
        other: "Airwallex lists no account opening fee or monthly maintenance charge. Its Explore plan is $0 per user per month, and Grow is $12 per user per month plus a platform fee.",
        sourceUrl: "https://www.airwallex.com/us/pricing",
        easnerHref: "/pricing",
      },
      {
        dimension: "Paying abroad",
        easner: "Bank accounts, mobile money, and stablecoin wallets in 80+ countries. The rate and fees are shown before you confirm.",
        other: "Local transfers to 120+ countries and SWIFT to 200+. SWIFT costs $15–$25 per transfer, and the FX markup is 0.5% above interbank rates for major currencies and 1% for others.",
        sourceUrl: "https://www.airwallex.com/us/pricing",
        easnerHref: "/answers/business",
      },
      {
        dimension: "Cards",
        easner: "Cards, once they are available for your account and you are approved.",
        other: "Company cards are virtual only. Employee cards can be virtual or physical. Airwallex lists 0% foreign card transaction fees.",
        sourceUrl: "https://www.airwallex.com/en-us/spend-management/cards",
      },
      {
        dimension: "API",
        easner: "API keys and webhooks are part of Easner Business.",
        other: "Airwallex says the API is available on all tiers.",
        sourceUrl: "https://www.airwallex.com/us/pricing",
      },
      {
        dimension: "Who can open an account",
        easner: "Companies from 174 countries, subject to verification.",
        other: "The business must be registered in a country Airwallex supports. Its help centre lists 69 countries and territories.",
        sourceUrl: "https://help.airwallex.com/hc/en-gb/articles/4408591334937-Eligible-Countries-and-Territories",
      },
      {
        dimension: "Speed",
        easner: "Typically minutes to hours, same-day where supported.",
        other: "Airwallex says 93% of global transfers arrive within the same day.",
        sourceUrl: "https://www.airwallex.com/en-us/business-account",
      },
    ],
    chooseEasner: ["You collect with invoices, Payment Links, Checkout, Terminal, and QR Pay and want them on one ledger.", "You pay suppliers by mobile money or to stablecoin wallets as well as to bank accounts.", "Your company is registered in a country outside Airwallex's list, and Easner can verify it."],
    faq: [
      {
        question: "Is Easner Business an alternative to Airwallex?",
        answer:
          "For a company that holds multiple currencies and pays suppliers abroad, yes. Easner Business combines accounts, collection tools, and payouts in one dashboard. Easner is a financial technology company, not a bank, and banking services come from licensed partners.",
        links: [{"label": "Business Banking", "href": "/business"}],
      },
    ],
    note: "Airwallex's help-centre country list may be out of date. Its fees to receive payments, local transfer fees outside the US and Canada, and batch limits were not confirmed, so they are not compared.",
  },

  {
    slug: "easner-banking-api-vs-wise-platform",
    otherName: "Wise Platform",
    easnerName: "Easner Banking API",
    easnerHref: "/developers",
    metadata: {
      title: "Easner Banking API vs Wise Platform | Accounts and Payouts",
      description:
        "Easner Banking API and Wise Platform compared for embedding accounts, verification, and payouts in your product: scope, onboarding, coverage, and access.",
      keywords: ["Easner Banking API vs Wise Platform", "Wise Platform API alternative", "embedded accounts and payouts API comparison", "cross-border payouts API comparison"],
    },
    h1: "Easner Banking API vs Wise Platform",
    answer:
      "The Easner Banking API lets a platform verify its own customers, open multi-currency accounts for them, and send cross-border payouts, with customers seeing regular currencies. Wise Platform offers send, receive, card issuing, and account building blocks through an API or Swift.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What you get",
        easner: "An API to verify your own customers, open multi-currency accounts, and send cross-border payouts, with hosted KYC/KYB, webhooks, and events.",
        other: "Send, receive, card issuing, and account building blocks, through an API or Swift.",
        sourceUrl: "https://wise.com/platform",
        easnerHref: "/developers",
      },
      {
        dimension: "Who it is for",
        easner: "Platforms with their own customers, such as fintech apps, marketplaces, SME platforms, and global trade platforms.",
        other: "Banks and financial institutions, plus enterprises, neobanks, fintech platforms, and SaaS providers.",
        sourceUrl: "https://docs.wise.com/guides/product/account-setup",
      },
      {
        dimension: "Customer verification",
        easner: "Hosted KYC/KYB verifies your own customers.",
        other: "Each end user is onboarded and verified under the agreed KYC model.",
        sourceUrl: "https://docs.wise.com/guides/product/send-money/use-cases/embedded",
      },
      {
        dimension: "Coverage",
        easner: "Payouts to bank accounts and mobile money in 80+ countries.",
        other: "Wise says 200+ countries and 110+ currencies for sending.",
        sourceUrl: "https://wise.com/platform",
        easnerHref: "/answers/developers",
      },
      {
        dimension: "Access",
        easner: "Credentials and sandbox keys come with commercial onboarding. The API reference is online.",
        other: "Contact the Wise Platform sales team. Wise's developer docs are public.",
        sourceUrl: "https://www.wise.com/platform/contact",
        easnerHref: "https://docs.easner.com/",
      },
      {
        dimension: "Pricing",
        easner: "Agreed in a contract. See Pricing.",
        other: "No partner price list is published on the Platform page.",
        sourceUrl: "https://wise.com/platform",
        easnerHref: "/pricing",
      },
    ],
    chooseEasner: ["You are a platform that wants accounts, verification, and payouts for your own customers behind one API.", "You want customers to see regular currencies while Easner runs the settlement.", "You want Easner's hosted KYC/KYB and webhooks without building your own."],
    faq: [
      {
        question: "Is the Easner Banking API an alternative to Wise Platform?",
        answer:
          "For embedding accounts and cross-border payouts in your own product, yes, with a different scope. The Easner Banking API covers verification, accounts, and payouts for a platform's own customers.",
        links: [{"label": "Developers", "href": "/developers"}, {"label": "API reference", "href": "https://docs.easner.com/"}],
      },
    ],
    note: "Wise's partner price list, minimum volume, and licensing requirements were not confirmed. Wise's docs list three countries for one account-details endpoint while its marketing lists 23+, so local account details are not compared.",
  },
  {
    slug: "easner-invoicing-vs-freshbooks",
    otherName: "FreshBooks",
    easnerName: "Easner Invoicing",
    easnerHref: "/invoicing",
    metadata: {
      title: "Easner Invoicing vs FreshBooks | International Invoicing",
      description:
        "Easner Invoicing and FreshBooks compared for invoicing and getting paid: what each is, how customers pay, fees, payout timing, and international customers.",
      keywords: ["Easner Invoicing vs FreshBooks", "FreshBooks alternative", "FreshBooks alternative for international invoicing", "invoicing software comparison"],
    },
    h1: "Easner Invoicing vs FreshBooks",
    answer:
      "Easner Invoicing lets a business send itemized invoices and collect by card, bank transfer, or supported stablecoins, with every payment on the same Easner Business ledger. FreshBooks is small-business software that combines invoicing with double-entry accounting, time tracking, and expenses.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What it is",
        easner: "Itemized invoices to a named customer, run from Easner Business, with every payment on the same ledger as your payouts and collections.",
        other: "Small-business software that combines invoicing with double-entry accounting, time tracking, and expenses.",
        sourceUrl: "https://www.freshbooks.com",
        easnerHref: "/invoicing",
      },
      {
        dimension: "How customers pay",
        easner: "Card, Apple Pay or Google Pay, bank transfer, or stablecoin where enabled, from one hosted invoice page.",
        other: "Credit card, debit card, Apple Pay, Google Pay, and ACH bank transfer, with ACH available only in the US.",
        sourceUrl: "https://www.freshbooks.com/hub/payments/freshbooks-payments",
      },
      {
        dimension: "Fees",
        easner: "Set by your plan. See Pricing.",
        other: "Standard cards are 2.9% + $0.30 and ACH is 1%. FreshBooks adds 2% when the invoice currency differs from the account currency, and 1.5% for cards issued outside the account's country.",
        sourceUrl: "https://support.freshbooks.com/hc/en-us/articles/25362149006349-What-are-the-transaction-fees-for-FreshBooks-Payments-USD",
        easnerHref: "/pricing",
      },
      {
        dimension: "Plans",
        easner: "Invoicing is part of Easner Business. Ease is $0 a month with 10 invoices a month, and Ease Plus has unlimited invoices.",
        other: "Plans are $23, $43, and $70 a month at regular prices, with 5, 50, and unlimited billable clients.",
        sourceUrl: "https://www.freshbooks.com/pricing",
        easnerHref: "/pricing",
      },
      {
        dimension: "Invoice tools",
        easner: "A customer directory and a view of who owes what.",
        other: "Recurring invoices, late-payment reminders, time tracking, and expenses on every plan.",
        sourceUrl: "https://www.freshbooks.com/pricing",
      },
      {
        dimension: "International customers",
        easner: "Built for customers in the US and abroad, with bank pay-in and stablecoin where enabled.",
        other: "FreshBooks says it can present invoices in local currencies in 195+ countries. Its payments account is in USD or CAD.",
        sourceUrl: "https://www.freshbooks.com/hub/payments/accept-international-payments",
      },
      {
        dimension: "Payout timing",
        easner: "Payments land in your Easner Business account.",
        other: "Payouts are daily by default. Cards take 2 business days and US ACH takes 4, and the first payout takes 7 business days.",
        sourceUrl: "https://support.freshbooks.com/hc/en-us/articles/47262906310669-How-do-I-manage-my-payouts-with-FreshBooks-Payments",
      },
    ],
    chooseEasner: ["You want invoices, payouts, payroll, and collections on one ledger in one account.", "Your customers are abroad and you want bank pay-in or stablecoin as options."],
    faq: [
      {
        question: "Is Easner Invoicing an alternative to FreshBooks?",
        answer:
          "For sending invoices and getting paid, yes. Easner Invoicing sits inside Easner Business next to payouts, payroll, and collections. FreshBooks combines invoicing with accounting, time tracking, and expenses.",
        links: [{"label": "Invoicing", "href": "/invoicing"}],
      },
    ],
    note: "FreshBooks's promotional prices are not compared, only its regular prices. Which countries FreshBooks Payments supports, and whether multi-currency invoicing is on every plan, were not confirmed, so they are not compared.",
  },

  {
    slug: "easner-payment-links-vs-square",
    otherName: "Square Payment Links",
    easnerName: "Easner Payment Links",
    easnerHref: "/payment-links",
    metadata: {
      title: "Easner Payment Links vs Square | No-Code Payment Pages",
      description:
        "How Easner Payment Links and Square Payment Links differ: what you need, payment methods, fees, countries, and when you get paid. Sources and dates included.",
      keywords: ["Easner Payment Links vs Square Payment Links", "Square Payment Links alternative", "payment link comparison", "no-code payment links comparison"],
    },
    h1: "Easner Payment Links vs Square Payment Links",
    answer:
      "Easner Payment Links are shareable payment pages that need no website or code, with payments settling into your Easner Business account. Square Payment Links also work without a dedicated website, but Square accepts card payments in only eight countries.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What you need",
        easner: "No website or code. Create a link in Easner Business and share it.",
        other: "No dedicated eCommerce website. Create a link in the Square Dashboard or Point of Sale app.",
        sourceUrl: "https://squareup.com/help/us/en/article/6692-get-started-with-square-checkout-links",
        easnerHref: "/payment-links",
      },
      {
        dimension: "One-time or recurring",
        easner: "Both, with an optional free trial and a renewal disclosure before customers pay.",
        other: "One-time or recurring where available. ACH is not available on subscription links.",
        sourceUrl: "https://squareup.com/help/us/en/article/8364-customize-square-payment-links",
      },
      {
        dimension: "Payment methods",
        easner: "Card, Apple Pay or Google Pay, a US bank account, or stablecoin where enabled.",
        other: "Apple Pay, Google Pay, Cash App Pay, Afterpay, and credit or debit cards. ACH is available to eligible US sellers on one-time links.",
        sourceUrl: "https://squareup.com/us/en/payment-links",
      },
      {
        dimension: "Fees",
        easner: "Set by your plan. See Pricing.",
        other: "Square Free is 3.3% + 30¢ per online transaction, and Plus and Premium are 2.9% + 30¢. ACH is 1% with a $5 cap.",
        sourceUrl: "https://squareup.com/help/us/en/article/5068-what-are-square-s-fees",
        easnerHref: "/pricing",
      },
      {
        dimension: "Where it works",
        easner: "Businesses from 174 countries can open Easner Business, subject to verification.",
        other: "Square says card acceptance is available in the US, Canada, Australia, Japan, the UK, Ireland, France, and Spain.",
        sourceUrl: "https://squareup.com/help/us/en/article/4956-international-availability",
        easnerHref: "/business",
      },
      {
        dimension: "When you get paid",
        easner: "Payments settle into your Easner Business account and reconcile with invoices and payouts.",
        other: "Standard transfers are free. Payments before the 5 PM PT cutoff are generally available the next business day, and instant transfers cost 1.95%.",
        sourceUrl: "https://squareup.com/help/us/en/article/3807-deposit-options-with-square",
      },
    ],
    chooseEasner: ["Your business is outside the eight countries where Square accepts cards.", "You want links to settle next to invoices, payouts, and payroll on one ledger.", "You want customers to be able to pay with stablecoin where enabled."],
    faq: [
      {
        question: "Is Easner Payment Links an alternative to Square Payment Links?",
        answer:
          "For collecting payments without a website, yes. Both create a shareable payment page. Easner Payment Links settle into Easner Business and are open to businesses from 174 countries, subject to verification.",
        links: [{"label": "Payment Links", "href": "/payment-links"}],
      },
    ],
    note: "Square's payment-links page says its 3.3% + 30¢ rate applies to new Square customers. Square's fee for cards issued abroad on a US page, and whether links can be priced in another currency, were not confirmed, so they are not compared.",
  },

  {
    slug: "easner-stablecoin-vs-bvnk",
    otherName: "BVNK",
    easnerName: "Easner stablecoin payments",
    easnerHref: "/stablecoin",
    metadata: {
      title: "Easner Stablecoin Payments vs BVNK | Infrastructure",
      description:
        "Easner stablecoin payments and BVNK compared: who each serves, stablecoins supported, what customers see, coverage, pricing, and access. Sourced and dated.",
      keywords: ["Easner stablecoin payments vs BVNK", "BVNK alternative", "stablecoin payments infrastructure comparison", "stablecoin settlement comparison"],
    },
    h1: "Easner stablecoin payments vs BVNK",
    answer:
      "Easner settles cross-border payments on stablecoin rails behind regular dollar and euro balances, so customers need no crypto wallet. BVNK describes itself as stablecoin infrastructure for builders, with products to send, receive, store, convert, and spend, and states a minimum customer size.",
    lastChecked: CHECKED,
    rows: [
      {
        dimension: "What it is",
        easner: "Stablecoin-native banking and payment infrastructure. You work in dollars and euros on a banking-simple dashboard.",
        other: "Stablecoin infrastructure for builders, with send, receive, store, convert, spend, and earn products.",
        sourceUrl: "https://www.bvnk.com",
        easnerHref: "/stablecoin",
      },
      {
        dimension: "Who it serves",
        easner: "Individuals and businesses, from most countries, subject to verification.",
        other: "Businesses and financial institutions. BVNK's FAQ states at least $500,000 a month in payments and six months of operating history.",
        sourceUrl: "https://www.bvnk.com",
      },
      {
        dimension: "Stablecoins",
        easner: "USDC, USDT, and EURC on supported networks, where enabled.",
        other: "BVNK lists USDT, USDC, EURC, and others. Availability depends on the customer's jurisdiction.",
        sourceUrl: "https://docs.bvnk.com/bvnk/references/currencies/",
      },
      {
        dimension: "What customers see",
        easner: "Ordinary balances. No crypto wallet is required, and wallet send and receive are optional.",
        other: "Accounts that hold fiat and stablecoins, with virtual accounts in USD, EUR, and GBP.",
        sourceUrl: "https://www.bvnk.com",
      },
      {
        dimension: "Coverage",
        easner: "Payouts to bank accounts and mobile money in 80+ countries.",
        other: "BVNK says 130+ countries.",
        sourceUrl: "https://www.bvnk.com",
        easnerHref: "/answers/business",
      },
      {
        dimension: "Pricing",
        easner: "Set by your plan. See Pricing.",
        other: "BVNK's site publishes no fee figures.",
        sourceUrl: "https://www.bvnk.com/payments",
        easnerHref: "/pricing",
      },
      {
        dimension: "Access",
        easner: "Open an account and verify your identity or business.",
        other: "API, web portal, and a sandbox environment.",
        sourceUrl: "https://docs.bvnk.com",
      },
    ],
    chooseEasner: ["You want dollars and euros on screen, with stablecoin settlement running behind them.", "Your volume is below BVNK's stated minimum, or you are an individual.", "You want invoices, payouts, payroll, and collections in the same account."],
    faq: [
      {
        question: "Is Easner an alternative to BVNK?",
        answer:
          "For businesses that want to use stablecoin settlement, yes, with a different approach. Easner presents regular balances and runs settlement behind them. BVNK offers direct stablecoin accounts and payments tools for larger customers. Easner is a financial technology company, not a bank.",
        links: [{"label": "Stablecoin", "href": "/stablecoin"}],
      },
    ],
    note: "BVNK's minimum customer size is from its homepage FAQ. BVNK's settlement times, and any fee schedule, were not confirmed on its documentation, so they are not compared.",
  },
]

export function findComparePage(slug: string) {
  return comparePages.find((page) => page.slug === slug)
}

export const comparePath = (page: Pick<ComparePage, "slug">) => `/compare/${page.slug}`
