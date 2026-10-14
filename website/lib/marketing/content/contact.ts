import type { AnswerDefinition, FaqItem } from "../types"

export const contactMetadata = {
  title: "Contact | Sales, Demos & Partnerships",
  description:
    "Book a call with Easner to discuss personal banking, business accounts, Easner for Partners, coverage, or partnership opportunities.",
  keywords: ["contact Easner", "book a demo", "Easner sales", "Easner API consultation"],
}

export const contactHero = {
  headline: "Let's talk",
  subhead:
    "Whether you're opening an account or exploring Easner for Partners or embedded money rails, get in touch with the Easner team.",
  prospectPreface: "New to Easner?",
  prospectLinkLabel: "Book a consultation",
  emailPreface: "Prefer to email?",
}

export const contactBooking = {
  anchor: "book-consultation",
  headline: "Book a consultation",
  emailNote: "Prefer email?",
}

export const contactSupport = {
  anchor: "product-support",
  headline: "Already using Easner?",
  body: "For help with transfers, accounts, verification, or transactions, reach support directly – this page is for sales and partnership conversations.",
  chatLabel: "Chat with us",
  emailPreface: "Prefer email?",
  alsoAvailable: "Also available in the Easner app and Business dashboard.",
}

export const contactDefinition: AnswerDefinition = {
  term: "Contact Easner",
  question: "How do I contact Easner?",
  answer:
    "For sales, partnerships, or a consultation, book a call on the Contact page or email hello@easner.com. For help with transfers, accounts, verification, or transactions, chat on the site or email support@easner.com. Chat is also available in the Easner app and Business dashboard.",
  facts: [
    {
      term: "Sales and partnerships",
      definition: "Book a consultation at easner.com/contact or email hello@easner.com.",
    },
    {
      term: "Product support",
      definition:
        "Chat on the site, email support@easner.com, or use chat in the Easner app and Business dashboard.",
    },
  ],
}

export const contactFaq: FaqItem[] = [
  {
    question: "How do I get help with my account?",
    answer:
      "For help with transfers, accounts, verification, or transactions, chat on easner.com or email support@easner.com. Chat is also available in the Easner app and Business dashboard. The Contact page is for sales and partnership conversations.",
    links: [{ label: "Open Contact", href: "/contact" }],
  },
  {
    question: "How do I book a call with Easner?",
    answer:
      "Book a consultation on the Contact page. That page is for sales, demos, coverage questions, and partnership conversations.",
    links: [{ label: "Book a consultation", href: "/contact" }],
  },
  {
    question: "How do I contact Easner about the API or a partner programme?",
    answer:
      "Use the Contact page or email hello@easner.com. Sandbox and API reference are provided during commercial onboarding.",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Developers", href: "/developers" },
      { label: "Partners", href: "/partners" },
    ],
  },
]
