import type { AnswerDefinition, FaqItem, HowToStep } from "../types"
import { aboutDefinition } from "./about"
import { contactDefinition, contactFaq } from "./contact"
import { businessContent, businessDefinition } from "./business"
import { cardsContent, cardsDefinition } from "./cards"
import { checkoutContent, checkoutDefinition } from "./checkout"
import { developersContent, developersDefinition } from "./developers"
import { homeDefinition, homeFaq } from "./home"
import { invoicingContent, invoicingDefinition } from "./invoicing"
import { partnersContent, partnersDefinition } from "./partners"
import { paymentLinksContent, paymentLinksDefinition } from "./payment-links"
import { payrollContent, payrollDefinition } from "./payroll"
import { personalContent, personalDefinition } from "./personal"
import { stablecoinContent, stablecoinDefinition } from "./stablecoin"

export const aiMetadata = {
  title: "Easner Answers | What It Is and How It Works",
  description:
    "Direct answers: what Easner is, whether it is a bank, who can sign up, how fees work, and how Personal, Business, Checkout, and payouts work.",
  keywords: [
    "what is Easner",
    "is Easner a bank",
    "is Easner FDIC insured",
    "Easner fees",
    "Easner Personal Banking",
    "Easner Business Banking",
    "stablecoin-native banking",
  ],
}

export interface AiAnswerSection {
  href: string
  label: string
  definition: AnswerDefinition
  faq?: FaqItem[]
  howTo?: { name: string; steps: HowToStep[] }
}

function howToFromSteps(
  name: string,
  steps?: { title: string; description: string }[],
): AiAnswerSection["howTo"] | undefined {
  if (!steps?.length) return undefined
  return {
    name,
    steps: steps.map((step) => ({ name: step.title, text: step.description })),
  }
}

export const aiCompanyFaq: FaqItem[] = [
  {
    question: "Is Easner FDIC-insured?",
    answer:
      "No. Easner is not FDIC-insured and does not hold customer deposits. Banking services are provided by third-party banking partners, not by Easner.",
    links: [{ label: "KYC/KYB and AML Policy", href: "/compliance" }],
  },
  {
    question: "How much does Easner cost?",
    answer:
      "Fees and exchange rates are shown before a payment is confirmed, including what your recipient gets.",
  },
  {
    question: "Who can sign up for Easner?",
    answer:
      "Easner accepts signups from most countries, and a small number are excluded for compliance and sanctions reasons. Opening an account always needs the person to verify their own identity. Choose Personal Banking in the app for your own money, or Business Banking on the web for a company.",
    links: [
      { label: "KYC/KYB and AML Policy", href: "/compliance" },
      { label: "Personal Banking", href: "/personal" },
      { label: "Business Banking", href: "/business" },
    ],
  },
  {
    question: "Where does Easner pay out?",
    answer:
      "To bank accounts and mobile money in 80+ countries across Africa, Latin America, Asia, the Middle East and Europe. North America covers personal and business accounts, USD balances, and domestic and international payments. Europe covers EUR and GBP balances, business collections, invoicing and EURC settlement. Africa includes Nigeria, Ghana, Kenya, South Africa, Egypt, Rwanda, Uganda, Tanzania, Senegal and Zambia. Latin America includes Mexico, Brazil, Colombia, Peru, Guatemala, Ecuador and Jamaica. Asia-Pacific and South Asia include India, China, the Philippines, Indonesia, Vietnam, Pakistan, Bangladesh, Sri Lanka, Thailand, Malaysia, Singapore and Hong Kong. The Middle East includes the United Arab Emirates and Israel. Payout coverage and account-opening eligibility are different.",
    links: [{ label: "Check eligibility and restrictions", href: "/compliance" }],
  },
]

export const aiSections: AiAnswerSection[] = [
  { href: "/", label: "Home", definition: homeDefinition, faq: homeFaq },
  { href: "/about", label: "About", definition: aboutDefinition, faq: aiCompanyFaq },
  {
    href: "/contact",
    label: "Contact",
    definition: contactDefinition,
    faq: contactFaq,
    howTo: {
      name: "How to get in touch",
      steps: [
        {
          name: "Already a customer",
          text: "Chat on the site or in the Easner app and Business dashboard, or email support@easner.com, for help with transfers, accounts, verification, or transactions.",
        },
        {
          name: "Sales or partnerships",
          text: "Book a consultation on the Contact page, or email hello@easner.com.",
        },
        {
          name: "Prefer email",
          text: "hello@easner.com for sales and partnerships. support@easner.com for account help.",
        },
      ],
    },
  },
  {
    href: "/personal",
    label: "Personal Banking",
    definition: personalDefinition,
    faq: personalContent.faq,
    howTo: personalDefinition.steps
      ? { name: personalDefinition.stepsHeadline ?? "How to open an Easner Personal Banking account", steps: personalDefinition.steps }
      : undefined,
  },
  {
    href: "/business",
    label: "Business Banking",
    definition: businessDefinition,
    faq: businessContent.faq,
    howTo: {
      name: "How to open an Easner Business account",
      steps: [
        { name: "Open Easner Business", text: "Start on the web and create a company account." },
        {
          name: "Verify your business",
          text: "Provide your business registration details, the people who own and control it, and identity verification for each owner. You can track every step from your dashboard.",
        },
        {
          name: "Get paid or pay out",
          text: "Get account details in your business's name, collect customer payments, send invoices, and pay suppliers and contractors in 80+ countries.",
        },
      ],
    },
  },
  {
    href: "/checkout",
    label: "Checkout",
    definition: checkoutDefinition,
    faq: checkoutContent.faq,
    howTo: howToFromSteps(checkoutContent.integrationStepsHeadline ?? "How to add Easner Checkout", checkoutContent.integrationSteps),
  },
  {
    href: "/payment-links",
    label: "Payment Links",
    definition: paymentLinksDefinition,
    faq: paymentLinksContent.faq,
    howTo: {
      name: "How to get paid with an Easner Payment Link",
      steps: [
        { name: "Open Easner Business", text: "Payment Links run on an eligible Easner Business account." },
        { name: "Create a link", text: "Create a one-time or recurring payment page, with an optional free trial and a renewal disclosure before customers pay." },
        { name: "Share it", text: "Send the link by email, chat, or social media. Payments settle into your Easner Business account." },
      ],
    },
  },
  {
    href: "/invoicing",
    label: "Invoicing",
    definition: invoicingDefinition,
    faq: invoicingContent.faq,
    howTo: {
      name: "How to send an Easner invoice",
      steps: [
        { name: "Create the invoice", text: "Create an itemized invoice in Easner Business, with line items for a named customer." },
        { name: "Share the page", text: "Send the hosted invoice page so your customer can pay or download a PDF." },
        {
          name: "Get paid",
          text: "Customers pay by card, Apple Pay or Google Pay, bank transfer, or stablecoins where enabled. Every payment lands in the same Easner Business ledger.",
        },
      ],
    },
  },
  {
    href: "/payroll",
    label: "Payroll",
    definition: payrollDefinition,
    faq: payrollContent.faq,
    howTo: {
      name: "How to run payroll on Easner",
      steps: [
        { name: "Add your people", text: "Open an Easner Business account and add employees or contractors in 80+ countries." },
        { name: "Approve the payday", text: "Review and approve each run before any money moves. Maker-checker means the drafter is not the only signer." },
        {
          name: "Pay and record",
          text: "Payees choose how they get paid in the Easner app. A pay stub is generated for every payment, and finance sees the run on the same ledger.",
        },
      ],
    },
  },
  { href: "/stablecoin", label: "Stablecoin", definition: stablecoinDefinition, faq: stablecoinContent.faq },
  { href: "/cards", label: "Cards", definition: cardsDefinition, faq: cardsContent.faq },
  {
    href: "/partners",
    label: "Partners",
    definition: partnersDefinition,
    faq: partnersContent.faq,
    howTo: howToFromSteps(partnersContent.integrationStepsHeadline ?? "How to launch Easner for Partners", partnersContent.integrationSteps),
  },
  {
    href: "/developers",
    label: "Developers",
    definition: developersDefinition,
    faq: developersContent.faq,
    howTo: howToFromSteps(developersContent.integrationStepsHeadline ?? "How to get started with the Easner API", developersContent.integrationSteps),
  },
]

export const aiAllFaqs: FaqItem[] = [
  ...new Map(
    aiSections.flatMap((section) => section.faq ?? []).map((item) => [item.question, item]),
  ).values(),
]

export const aiGlossary = [
  ...new Map(
    aiSections
      .flatMap((section) => [
        { name: section.definition.term, description: section.definition.answer },
        ...(section.definition.facts ?? []).map((fact) => ({ name: fact.term, description: fact.definition })),
      ])
      .map((term) => [term.name, term]),
  ).values(),
]

export const aiHowTos = aiSections.filter((section) => section.howTo?.steps.length) as Array<
  AiAnswerSection & { howTo: NonNullable<AiAnswerSection["howTo"]> }
>
