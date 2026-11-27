import type { AnswerDefinition, ProductPageContent } from "../types"
import { BUSINESS_SIGNUP_URL, CONTACT_PATH } from "../constants"
import { connectPayeeFaqs } from "../corridors"

export const connectDefinition: AnswerDefinition = {
  term: "Easner Connect",
  question: "What is Easner Connect?",
  answer:
    "Easner Connect lets a platform pay the people it owes into their own Easner accounts. People link once with the Easner app, the platform pays from its Easner Business balance, and tax forms are collected once and shared with each platform. Try it in test mode; talk to Easner to go live.",
  facts: [
    {
      term: "Who is it for?",
      definition: "Platforms with many people to pay, not a company paying its own team.",
    },
    {
      term: "Does the person need an account?",
      definition: "Yes. They create one in the Easner app and verify their identity.",
    },
  ],
}

export const connectContent: ProductPageContent = {
  metadata: {
    title: "Platform Payouts API | Pay Everyone You Owe",
    description:
      "Pay the people on your platform into their own Easner accounts. They link once, you pay from your balance, and tax forms are collected for you. Try it in test.",
    keywords: [
      "platform payouts",
      "pay marketplace sellers",
      "pay affiliates",
      "pay gig workers internationally",
      "music distributor payouts",
      "course platform payouts",
      "pay out to many people",
      "payout API",
      "withdraw page integration",
      "payee onboarding",
      "tax form collection W-9 W-8BEN",
    ],
  },
  hero: {
    h1: "Pay everyone you owe",
    subhead:
      "Add Easner to your withdraw page. The people on your platform link once, you pay them from your Easner Business balance, and the money lands in their own Easner account, typically within seconds.",
    visualSlot: "mkt-hero-connect-01",
    altText:
      "A platform's withdraw page with the Easner Connect sheet open, and a phone beside it showing the same connection to approve",
    ctas: [
      { label: "Try it in test", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "connect_hero" },
      { label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "connect_hero_contact" },
    ],
  },
  integrationStepsHeadline: "Link once. Paid every time.",
  integrationSteps: [
    {
      title: "Turn on Connect",
      description: "Switch it on in Console. Easner reviews your program first.",
    },
    {
      title: "Register people",
      description: "Add each person with your own user id, using the API.",
    },
    {
      title: "They approve once",
      description:
        "They tap Get paid with Easner and approve in the app with Face ID or a PIN, after a QR scan, an 8-character code or a tap on a phone.",
    },
    {
      title: "Record earnings",
      description: "Add what people earned, or let them withdraw and make one API call.",
    },
    {
      title: "Money moves",
      description:
        "It goes from your Easner Business balance to the person's own Easner account, typically within seconds.",
    },
  ],
  featuresLayout: "bento",
  featuresHeadline: "Built for everyone in the payment",
  features: [
    {
      title: "The person paid",
      description:
        "One button and one approval in the app, with no account or SWIFT details to type. They keep dollars, or cash out where supported.",
      visualSlot: "mkt-ui-connect-app",
      altText: "The Earnings screen in the Easner app: paid this year, who pays you, and recent payments",
    },
    {
      title: "Your finance team",
      description:
        "Pay from your Easner Business balance, follow every payment in a feed that matches your ledger line for line, and find tax forms already collected.",
      visualSlot: "mkt-ui-connect-console",
      altText: "The Connect overview in Easner Business: what went out, what is waiting, and what needs attention",
    },
    {
      title: "Your engineer",
      description:
        "Add Easner's connect and withdraw screens with three components, then create payees, add earnings and request payments with one API. Test keys work today.",
      visualSlot: "mkt-ui-connect-sheet",
      altText: "The Easner withdraw sheet showing a confirmed withdrawal",
    },
    {
      title: "Right person, right amount",
      description:
        "Money goes only to the account the person linked. A payment your balance can't cover waits and goes out on its own, and you can hold earnings until a date for return and dispute windows.",
      visualSlot: "mkt-ui-connect-payees",
      altText: "A payees list with linked, invited and waiting-for-tax-form rows",
    },
  ],
  useCasesHeadline: "Built for platforms with many people to pay",
  useCasesSubhead: "For platforms that owe money to many people who signed up themselves.",
  useCases: [
    {
      title: "Music distributors",
      description: "Pay everyone owed from a release, from one withdraw page.",
    },
    {
      title: "Freelance and talent marketplaces",
      description: "Pay people for finished work without collecting their payment details.",
    },
    {
      title: "Course and community platforms",
      description: "Pay the people who teach or host on your platform.",
    },
    {
      title: "Gig and delivery apps",
      description: "Pay riders and drivers for each completed job.",
    },
    {
      title: "Affiliate and referral programs",
      description: "Pay partners what they earned, with tax forms collected once.",
    },
    {
      title: "Marketplace sellers",
      description: "Pay sellers what they have earned on your marketplace.",
    },
  ],
  useCaseLinks: [{ label: "Paying your own team? See Payroll", href: "/payroll" }],
  definition: connectDefinition,
  faq: [
    {
      question: "Who is Connect for?",
      answer:
        "Platforms that owe money to many people who signed up themselves, such as a music distributor, a freelance marketplace or a course platform. Connect is not for paying your own team.",
    },
    {
      question: "Do the people we pay need an Easner account?",
      answer:
        "Yes. They create one in the Easner app and verify their identity once. Receiving money into Easner is free for them.",
    },
    {
      question: "Which currency do you pay in?",
      answer:
        "US dollars. People can keep dollars in their Easner account, or cash out where Easner supports it.",
    },
    {
      question: "How do people link their account?",
      answer:
        "They tap Get paid with Easner on your page, then scan a QR code, type an 8-character code, or open the Easner app straight from a phone. They approve once with Face ID or a PIN, and see what you will see (their verified name, country and tax-form status) before they do. Identity documents are never shared.",
    },
    {
      question: "What if our balance is low or a tax form is missing?",
      answer:
        "The payment waits and goes out on its own, oldest first. It does not fail. If a tax form is missing, the person is asked to sign it.",
    },
    {
      question: "Who handles tax forms?",
      answer:
        "The person signs a W-9 (US) or W-8BEN (foreign individual) once, in the Easner app, and can share it with each platform that needs it. Your platform stays the filer; Easner does not file for you.",
    },
    {
      question: "Do we have to move our ledger?",
      answer:
        "No. With pay on request your ledger stays the source of truth: the person taps Withdraw and you make one API call. If you would rather Easner keep each person's balance, payee balances do that, and both work on the same person.",
    },
    {
      question: "Can we try it first?",
      answer:
        "Yes. Test keys work at once with a virtual balance, and Approve as a test payee finishes a link on a laptop, so you can run every step before going live. Easner reviews your program before live access.",
    },
    {
      question: "How much does Easner Connect cost?",
      answer:
        "Receiving into Easner is free for the person. Ease and Ease Plus do not include Connect. On Ease Pro each payment costs $0.50 plus 0.50%, capped at $15. On Ease Gold the fee is Contract.",
      links: [{ label: "Pricing", href: "/pricing" }],
    },
    {
      question: "How do I pay marketplace sellers or affiliates into their own accounts?",
      answer:
        "Easner Connect pays marketplace sellers, affiliates, and other people who are not your employees into their own Easner accounts, in US dollars, from your Easner Business balance. They link once in the Easner app. This is not Payroll, and it is not White-label.",
      links: [{ label: "Payroll", href: "/payroll" }],
    },
    {
      question: "What is Easner Connect?",
      answer:
        "Easner Connect pays the people a platform owes into their own Easner accounts, in US dollars. The platform turns it on in Console, Easner reviews the program, and the person approves once in the Easner app on iPhone, Android, or the web.",
    },
    {
      question: "Do payees need an Easner account?",
      answer:
        "Yes. They create one in the Easner app and verify their identity once. Receiving into Easner is free for them. A business can link an Easner Business account the same way, and the payout lands in that business's dollar balance.",
    },
    {
      question: "Does Easner collect a W-9?",
      answer:
        "A US person signs a W-9 once in the Easner app. The form is prefilled from verification. The platform sees that the form is done, the form type, and the last four digits. The full tax number stays with Easner. The platform stays the filer.",
    },
    {
      question: "Do foreign payees fill out a W-8BEN?",
      answer:
        "A person outside the US signs a W-8BEN once in the Easner app. Each platform needs its own consent. If the form is missing, the payout waits until the person signs it. It does not fail.",
    },
    {
      question: "Does a company payee sign a W-8BEN-E?",
      answer:
        "A US business signs a W-9. A business outside the US signs a W-8BEN-E, signed by an Owner or Admin, in Easner Business. Do not call that business form a W-8BEN. The form belongs to the business.",
    },
    {
      question: "Does Easner file 1099s for my platform?",
      answer:
        "No. Easner does not file with the IRS and does not hold tax back from a Connect payout. The platform stays the filer and the withholding agent.",
    },
    {
      question: "Does Easner withhold 30%?",
      answer:
        "No. Easner does not hold money back. A payout can show a suggested rate, which is not tax advice: no valid form, 24% backup withholding; W-9, none; W-8BEN for services performed outside the US, none; W-8BEN for royalties, other income, or services performed in the US, the treaty rate claimed, otherwise 30%. The platform decides what to withhold.",
    },
    {
      question: "What happens if a payee has no tax form?",
      answer:
        "The payout waits until the person signs the form. It does not fail. It goes out on its own, oldest first, once the form is signed.",
    },
    {
      question: "Which Easner tax form do I sign?",
      answer:
        "On Connect, a US person signs a W-9. A person outside the US signs a W-8BEN. A US business signs a W-9. A business outside the US signs a W-8BEN-E. Do not use these forms for a company's own employees. Payroll uses a different set.",
    },
    {
      question: "What is the difference between a W-8BEN and a W-8BEN-E?",
      answer:
        "A W-8BEN is for a person outside the US. A W-8BEN-E is for a business outside the US. An Owner or Admin signs the W-8BEN-E for the business.",
    },
    {
      question: "Does Easner file my taxes?",
      answer:
        "No. Easner does not file with the IRS. On Connect, the platform stays the filer and the withholding agent. On Payroll, the employer stays the filer.",
    },
    {
      question: "Can I pay contractors by direct deposit?",
      answer:
        "Yes. Connect pays contractors and affiliates who are not employees, in US dollars, into their own Easner accounts. They link once in the Easner app. This is not Payroll.",
      links: [{ label: "Payroll", href: "/payroll" }],
    },
    ...connectPayeeFaqs(),
  ],
  ctaBand: {
    headline: "Try Connect in test",
    subhead: "Test keys work today. Talk to us when you are ready to go live.",
    ctas: [
      { label: "Try it in test", href: BUSINESS_SIGNUP_URL, external: true, analyticsLocation: "connect_cta_band" },
      { label: "Talk to our team", href: CONTACT_PATH, analyticsLocation: "connect_cta_band_contact" },
    ],
  },
  complianceNote:
    "People you pay with Connect verify their identity in the Easner app, and payments run through the same screening as the rest of your Easner Business account.",
}
