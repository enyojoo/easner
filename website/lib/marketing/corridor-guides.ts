/**
 * Local content for the "Pay contractors in [country]" pages. Everything here is what makes one country's page
 * different from the next: what the contractor has to hand over, who businesses usually pay there, and what is
 * worth knowing. The currency and the payout rail are NOT here. They come from corridors.ts, so a page cannot
 * disagree with /answers or llms.txt.
 *
 * The bank-detail fields are the ones the product asks for (easnerbanking: yc-recipient-schema, bridge-recipient-schema).
 * Check them against the add-recipient form before changing a country.
 */
import { EUR_PAYOUT_COUNTRIES } from "./corridors"
import { europeGuides } from "./corridor-guides-europe"
import { moreGuides } from "./corridor-guides-more"
import type { CardItem, FaqItem } from "./types"

export interface CorridorGuide {
  /** Payout country exactly as it is named in corridors.ts. */
  country: string
  /** Page slug under /business. */
  slug: string
  /** ISO 3166-1 alpha-2, for the flag. */
  code: string
  /** Where the hub groups it. */
  area: "Africa" | "Americas" | "Asia" | "Europe"
  /** Skip the standard "supplier in X from the United States" answer, when it would not make sense for this page. */
  noCountryFaq?: boolean
  /** Name used in sentences when it is not the country ("Europe"). Its currency and rail come from `country`. */
  place?: string
  /** Name on the card that links here, when it is not the country. */
  label?: string
  /** One page for a group of countries that share the same details (the euro countries). */
  region?: boolean
  /** Currency in words, for sentences ("rupees"). */
  currencyName: string
  /** How the contractor receives it, for sentences. */
  delivery: string
  /** Tail of the page title, after "Pay Contractors in X | ". */
  titleTail: string
  /** Short line on the card that links here. */
  cardLine: string
  /** The one fact about time that matters when paying here. */
  intro: string
  /** What to ask the contractor for. */
  asks: { headline: string; body: string; bullets: string[] }
  /** Delivery line on the payout screen. */
  deliveryLabel: string
  /** What the contractor must hand over, in one line, for the key facts. */
  needs: string
  /** The step where the business adds the contractor. */
  addStep: string
  /** A made-up recipient for the screen. Never a real person or account. */
  demo: { name: string; detail: string; fields: { label: string; value: string }[] }
  goodToKnow: CardItem[]
  payees: CardItem[]
  faq: FaqItem[]
  keywords: string[]
}

const baseGuides: CorridorGuide[] = [
  {
    country: "India",
    area: "Asia",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank account number and IFSC code",
    slug: "pay-contractors-in-india",
    code: "IN",
    currencyName: "rupees",
    delivery: "in their own bank account",
    titleTail: "INR Bank Payouts",
    cardLine: "Rupees, to a bank account",
    intro:
      "India has a large pool of remote developers, designers, accountants and support staff, and many small businesses abroad work with them. Paying them is simple once you have the right bank details. Your contractor receives rupees in their own bank account, and you pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "Their bank account number",
        "The IFSC code, the 11-character code for their bank branch",
      ],
    },
    addStep: "Enter their name, bank account number and IFSC code. They don't need an Easner account.",
    demo: {
      name: "Priya Sharma",
      detail: "Bank account • INR",
      fields: [
        { label: "Account holder name", value: "Priya Sharma" },
        { label: "Account number", value: "0123 4567 8901" },
        { label: "IFSC", value: "ABCD0123456" },
      ],
    },
    goodToKnow: [
      {
        title: "Get the IFSC, not just the account number",
        description:
          "Every branch has its own 11-character IFSC. Easner needs it to send the payment, so ask for it up front.",
      },
      {
        title: "They're paid in rupees",
        description:
          "Your contractor receives INR. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm.",
      },
    ],
    payees: [
      { title: "Software developers", description: "Engineers, QA testers and data teams, hired by the project or by the month." },
      { title: "Designers and video editors", description: "UI designers, illustrators, motion designers and editors." },
      { title: "Accountants and bookkeepers", description: "Remote finance and back-office help for small businesses." },
      { title: "Support and operations teams", description: "Customer support, research and admin staff." },
    ],
    faq: [
      {
        question: "What bank details do I need to pay a contractor in India?",
        answer:
          "Three things: the account holder's name, the bank account number, and the IFSC code, which is the 11-character code for the bank branch. The contractor does not need an Easner account.",
      },
      {
        question: "What currency does a contractor in India receive?",
        answer:
          "Indian rupees (INR), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm.",
      },
    ],
    keywords: [
      "pay contractors in India",
      "pay freelancers in India from the US",
      "pay Indian contractors",
      "send business payment to India",
      "pay suppliers in India",
    ],
  },
  {
    country: "Philippines",
    area: "Asia",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank and account number",
    slug: "pay-contractors-in-the-philippines",
    code: "PH",
    currencyName: "Philippine pesos",
    delivery: "in their own bank account",
    titleTail: "PHP Bank Payouts",
    cardLine: "Pesos, to a bank account",
    intro:
      "The Philippines is a long-standing home for virtual assistants, customer support teams, designers and editors, and many businesses abroad rely on them. Easner pays your contractor in Philippine pesos, into a bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for bank details, not an e-wallet number. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "The name of their bank",
        "Their bank account number",
      ],
    },
    addStep: "Enter their name, bank and account number. They don't need an Easner account.",
    demo: {
      name: "Maria Santos",
      detail: "Bank account • PHP",
      fields: [
        { label: "Account holder name", value: "Maria Santos" },
        { label: "Account number", value: "0123 4567 8901" },
      ],
    },
    goodToKnow: [
      {
        title: "Bank accounts only, not e-wallets",
        description:
          "Easner pays into Philippine bank accounts. It doesn't pay wallets such as GCash or Maya, so ask your contractor for bank details.",
      },
      {
        title: "They're paid in pesos",
        description:
          "Your contractor receives PHP. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm.",
      },
    ],
    payees: [
      { title: "Virtual assistants", description: "Executive, admin and personal assistants working remotely." },
      { title: "Customer support agents", description: "Chat, email and phone support teams." },
      { title: "Designers and video editors", description: "Graphic designers, social media creatives and editors." },
      { title: "Developers and QA", description: "Web and app developers, and testers." },
    ],
    faq: [
      {
        question: "Can I pay a freelancer's GCash or Maya wallet?",
        answer:
          "No. Easner pays contractors in the Philippines by bank transfer, into a bank account, in Philippine pesos. Ask your freelancer for their bank name and account number.",
      },
      {
        question: "What currency does a contractor in the Philippines receive?",
        answer:
          "Philippine pesos (PHP), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm.",
      },
    ],
    keywords: [
      "pay contractors in the Philippines",
      "pay virtual assistants in the Philippines",
      "pay Filipino freelancers from the US",
      "send business payment to the Philippines",
      "pay suppliers in the Philippines",
    ],
  },
  {
    country: "Nigeria",
    area: "Africa",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank and 10-digit account number (NUBAN)",
    slug: "pay-contractors-in-nigeria",
    code: "NG",
    currencyName: "naira",
    delivery: "in their own bank account",
    titleTail: "NGN Bank Payouts",
    cardLine: "Naira, to a bank account",
    intro:
      "Nigeria has a large tech and creative workforce, and many companies abroad work with its developers, designers and writers. Easner pays your contractor in naira, into a Nigerian bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "The name of their bank",
        "Their 10-digit account number, called a NUBAN",
      ],
    },
    addStep: "Enter their name, bank and 10-digit account number. They don't need an Easner account.",
    demo: {
      name: "Adaeze Okafor",
      detail: "Bank account • NGN",
      fields: [
        { label: "Account holder name", value: "Adaeze Okafor" },
        { label: "Bank", value: "GTBank" },
        { label: "Account number", value: "0123456789" },
      ],
    },
    goodToKnow: [
      {
        title: "Naira, to bank accounts only",
        description:
          "Easner pays Nigerian contractors into bank accounts in NGN. It doesn't pay mobile money in Nigeria.",
      },
      {
        title: "Check the 10 digits",
        description:
          "Nigerian bank accounts use a 10-digit NUBAN. A missing or extra digit means the payment can't be matched to an account, so check it twice.",
      },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and product teams on project or monthly contracts." },
      { title: "Designers and product teams", description: "Product designers, brand designers and illustrators." },
      { title: "Writers and content creators", description: "Copywriters, editors and video creators." },
      { title: "Agencies and suppliers", description: "Digital agencies and suppliers who invoice your business." },
    ],
    faq: [
      {
        question: "What is a NUBAN number?",
        answer:
          "The 10-digit account number that Nigerian banks use, short for Nigeria Uniform Bank Account Number. Ask your contractor for it along with the name of their bank.",
      },
      {
        question: "Can I pay a Nigerian contractor by mobile money?",
        answer:
          "No. Easner pays Nigeria by bank transfer only, in naira. Ask your contractor for their bank name and account number.",
      },
    ],
    keywords: [
      "pay contractors in Nigeria",
      "pay Nigerian freelancers from the US",
      "pay developers in Nigeria",
      "send business payment to Nigeria",
      "pay suppliers in Nigeria",
    ],
  },
  {
    country: "Mexico",
    area: "Americas",
    deliveryLabel: "Bank transfer (SPEI)",
    needs: "Name and 18-digit CLABE",
    slug: "pay-contractors-in-mexico",
    code: "MX",
    currencyName: "Mexican pesos",
    delivery: "by bank transfer",
    titleTail: "MXN Bank Payouts",
    cardLine: "Pesos, by bank transfer",
    intro:
      "Mexico is a popular choice for US businesses that want contractors and teams close to home. Easner pays your contractor in Mexican pesos, by bank transfer to their CLABE. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "The CLABE is the number Mexican banks use to receive transfers. Your contractor doesn't need an Easner account.",
      bullets: ["The account holder's name, as it appears at the bank", "Their 18-digit CLABE number"],
    },
    addStep: "Enter their name and 18-digit CLABE. They don't need an Easner account.",
    demo: {
      name: "Sofía Hernández",
      detail: "Bank account • MXN",
      fields: [
        { label: "Account holder name", value: "Sofía Hernández" },
        { label: "CLABE", value: "012 345 67890123456 7" },
      ],
    },
    goodToKnow: [
      {
        title: "Use the CLABE, not the card number",
        description:
          "A CLABE has 18 digits. It is different from a debit card number and from the shorter account number on a statement, so ask your contractor for the CLABE itself.",
      },
      {
        title: "Pesos, over SPEI",
        description:
          "Your contractor receives MXN through SPEI, Mexico's bank transfer network. The rate, the fees and what they receive are shown before you confirm.",
      },
    ],
    payees: [
      { title: "Nearshore developers", description: "Engineers and QA teams." },
      { title: "Designers and marketers", description: "Brand, UI and performance marketing freelancers." },
      { title: "Customer support teams", description: "Bilingual support and operations staff." },
      { title: "Suppliers and manufacturers", description: "Companies you buy parts and goods from." },
    ],
    faq: [
      {
        question: "What is a CLABE?",
        answer:
          "An 18-digit number that identifies a Mexican bank account for transfers. It is different from a debit card number and from the shorter account number printed on a statement. Ask your contractor for the CLABE.",
      },
      {
        question: "What currency does a contractor in Mexico receive?",
        answer:
          "Mexican pesos (MXN), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm.",
      },
    ],
    keywords: [
      "pay contractors in Mexico",
      "pay Mexican freelancers from the US",
      "pay nearshore developers in Mexico",
      "send business payment to Mexico",
      "pay suppliers in Mexico",
    ],
  },
  {
    country: "Brazil",
    area: "Americas",
    deliveryLabel: "Pix",
    needs: "Name, Pix key and key type, plus CPF or CNPJ if the key isn't one",
    slug: "pay-contractors-in-brazil",
    code: "BR",
    currencyName: "Brazilian reais",
    delivery: "through Pix",
    titleTail: "BRL Payouts Through Pix",
    cardLine: "Reais, through Pix",
    intro:
      "Brazil has a deep pool of developers, designers and marketers, and Pix is the instant payment system most Brazilians use every day. Easner pays your contractor in Brazilian reais through Pix. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for their Pix key and what type it is. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "Their Pix key, and its type: CPF, CNPJ, email, phone number or a random key",
        "Their CPF (a person) or CNPJ (a company), if the Pix key isn't one of those",
      ],
    },
    addStep: "Enter their name, the type of Pix key and the key. They don't need an Easner account.",
    demo: {
      name: "Lucas Almeida",
      detail: "Pix • Email",
      fields: [
        { label: "Account holder name", value: "Lucas Almeida" },
        { label: "Pix key type", value: "Email" },
        { label: "Pix key", value: "lucas@example.com" },
      ],
    },
    goodToKnow: [
      {
        title: "Ask for the Pix key and its type",
        description:
          "A Pix key can be a CPF or CNPJ tax number, an email address, a phone number or a random key from the bank. Ask which one your contractor uses and choose that type.",
      },
      {
        title: "Add the tax ID when the key isn't one",
        description:
          "If the Pix key is an email, a phone number or a random key, add the contractor's CPF (a person) or CNPJ (a company) as well.",
      },
    ],
    payees: [
      { title: "Developers and engineers", description: "Software, mobile and data engineers." },
      { title: "Designers and video editors", description: "Brand, UI and motion designers, and editors." },
      { title: "Marketing and social media", description: "Content, paid media and community managers." },
      { title: "Companies with a CNPJ", description: "Freelancers and small studios that invoice as a company." },
    ],
    faq: [
      {
        question: "What is a Pix key?",
        answer:
          "The identifier a person or company in Brazil links to their bank account for Pix: a CPF or CNPJ tax number, an email address, a phone number or a random key the bank creates. Ask your contractor which they use.",
      },
      {
        question: "Do I need a CPF or CNPJ to pay a contractor in Brazil?",
        answer:
          "If the contractor's Pix key is a CPF or CNPJ, that is the tax ID. If the key is an email, a phone number or a random key, add their CPF (for a person) or CNPJ (for a company) as well.",
      },
    ],
    keywords: [
      "pay contractors in Brazil",
      "pay Brazilian freelancers from the US",
      "pay with Pix from the US",
      "send business payment to Brazil",
      "pay suppliers in Brazil",
    ],
  },
  {
    country: "Kenya",
    area: "Africa",
    deliveryLabel: "Bank or mobile money",
    needs: "Name, then a phone number and provider, or a bank and account number",
    slug: "pay-contractors-in-kenya",
    code: "KE",
    currencyName: "Kenyan shillings",
    delivery: "by bank or mobile money",
    titleTail: "KES Bank and Mobile Money",
    cardLine: "Shillings, bank or mobile money",
    intro:
      "Kenya has a strong community of developers, writers and virtual assistants, and mobile money is how many people there receive money day to day. Easner pays your contractor in Kenyan shillings, by bank transfer or mobile money. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask which one they use, bank or mobile money. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "For mobile money: their phone number and provider, M-PESA or Airtel Money",
        "For a bank: the name of their bank and their account number",
      ],
    },
    addStep: "Choose bank or mobile money, then enter their details. They don't need an Easner account.",
    demo: {
      name: "Wanjiru Kamau",
      detail: "M-PESA • +254 712 345 678",
      fields: [
        { label: "Account holder name", value: "Wanjiru Kamau" },
        { label: "Provider", value: "M-PESA" },
        { label: "Phone number", value: "+254 712 345 678" },
      ],
    },
    goodToKnow: [
      {
        title: "Pick the way your contractor actually gets paid",
        description:
          "Easner pays Kenya by bank or mobile money. Ask which your contractor uses, so the money arrives where they use it.",
      },
      {
        title: "Mobile money goes to a phone number",
        description:
          "Enter the number with its country code, +254, and choose M-PESA or Airtel Money. Check every digit, because the payment goes to that number.",
      },
    ],
    payees: [
      { title: "Developers and data teams", description: "Software engineers and analysts on project or monthly contracts." },
      { title: "Writers and content creators", description: "Copywriters, editors and video creators." },
      { title: "Virtual assistants and support", description: "Admin, research and customer support staff." },
      { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." },
    ],
    faq: [
      {
        question: "Can I pay a Kenyan contractor by M-PESA?",
        answer:
          "Yes. Easner pays Kenya by bank or mobile money. For mobile money, choose M-PESA or Airtel Money and enter the contractor's phone number with its country code.",
      },
      {
        question: "What currency does a contractor in Kenya receive?",
        answer:
          "Kenyan shillings (KES), by bank transfer or mobile money. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm.",
      },
    ],
    keywords: [
      "pay contractors in Kenya",
      "pay Kenyan freelancers from the US",
      "pay with M-PESA from the US",
      "send business payment to Kenya",
      "pay suppliers in Kenya",
    ],
  },
  {
    country: "United Kingdom",
    area: "Europe",
    slug: "pay-contractors-in-the-united-kingdom",
    code: "GB",
    currencyName: "pounds",
    delivery: "in their own bank account",
    deliveryLabel: "Bank transfer (Faster Payments)",
    needs: "Name, 6-digit sort code and account number",
    titleTail: "GBP Bank Payouts",
    cardLine: "Pounds, to a bank account",
    intro:
      "The UK has a deep pool of freelancers, agencies and specialist contractors, and many US businesses pay them every month. Easner pays your contractor in pounds, by bank transfer to a UK bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "Their 6-digit sort code",
        "Their bank account number, usually 8 digits",
      ],
    },
    addStep: "Enter their name, sort code and account number. They don't need an Easner account.",
    demo: {
      name: "Oliver Smith",
      detail: "Bank account • GBP",
      fields: [
        { label: "Account holder name", value: "Oliver Smith" },
        { label: "Sort code", value: "12-34-56" },
        { label: "Account number", value: "12345678" },
      ],
    },
    goodToKnow: [
      { title: "Sort code and account number, not an IBAN", description: "Easner pays UK bank accounts by sort code and account number. Ask your contractor for those two rather than an IBAN." },
      { title: "Pounds, over Faster Payments", description: "Your contractor receives GBP by bank transfer. The rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Freelance developers", description: "Engineers and technical contractors on day rates or monthly retainers." },
      { title: "Designers and creatives", description: "Brand, UI and motion designers, illustrators and photographers." },
      { title: "Writers and editors", description: "Copywriters, journalists and editors." },
      { title: "Agencies and consultants", description: "Small agencies and specialist consultants who invoice your business." },
    ],
    faq: [
      { question: "What is a sort code?", answer: "A 6-digit number that identifies a UK bank branch, usually written as three pairs, like 12-34-56. Ask your contractor for it along with their account number." },
      { question: "What currency does a contractor in the UK receive?", answer: "Pounds (GBP), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in the UK",
      "pay UK freelancers from the US",
      "pay suppliers in the United Kingdom",
      "send business payment to the UK",
      "pay UK contractors in pounds",
    ],
  },
  {
    country: "Germany",
    area: "Europe",
    slug: "pay-contractors-in-europe",
    code: "EU",
    place: "Europe",
    label: "Europe",
    region: true,
    currencyName: "euros",
    delivery: "by bank transfer",
    deliveryLabel: "Bank transfer (SEPA)",
    needs: "Name and IBAN",
    titleTail: "EUR Bank Payouts (SEPA)",
    cardLine: `Euros, to ${EUR_PAYOUT_COUNTRIES.length} countries`,
    intro:
      `Many businesses abroad work with developers, designers, translators and agencies across Europe. Easner pays your contractor in euros, by bank transfer to an account in one of ${EUR_PAYOUT_COUNTRIES.length} countries. You pay from your Easner Business balance in dollars.`,
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these two things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "Their IBAN, the international bank account number",
      ],
    },
    addStep: "Enter their name and IBAN. They don't need an Easner account.",
    demo: {
      name: "Lena Fischer",
      detail: "Bank account • EUR",
      fields: [
        { label: "Account holder name", value: "Lena Fischer" },
        { label: "IBAN", value: "DE89 3704 0044 0532 0130 00" },
      ],
    },
    goodToKnow: [
      { title: "Use the IBAN", description: "An IBAN identifies the account and the bank in one number. Easner needs it to send the payment, so ask your contractor for the full IBAN." },
      { title: "Euros, even outside the euro area", description: `Easner pays euros to ${EUR_PAYOUT_COUNTRIES.length} countries, including some that use their own currency, such as Denmark and Poland. Your contractor receives euros there, not local currency.` },
    ],
    payees: [
      { title: "Freelance developers", description: "Engineers and technical contractors across Europe." },
      { title: "Designers and creatives", description: "Brand, UI and motion designers, illustrators and photographers." },
      { title: "Translators and writers", description: "Translators, copywriters and editors." },
      { title: "Agencies and suppliers", description: "Agencies and suppliers who invoice your business in euros." },
    ],
    faq: [
      { question: "What is an IBAN?", answer: "The International Bank Account Number: a single number that identifies a bank account and its bank. Europe uses it for transfers. Ask your contractor for their full IBAN." },
      { question: "What currency does a contractor in Europe receive?", answer: "Euros (EUR), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Europe",
      "pay European freelancers from the US",
      "pay suppliers in euros from the US",
      "send euros to Europe for business",
      "SEPA payments from the US",
    ],
  },
  {
    country: "Ghana",
    area: "Africa",
    slug: "pay-contractors-in-ghana",
    code: "GH",
    currencyName: "Ghanaian cedis",
    delivery: "by bank or mobile money",
    deliveryLabel: "Bank or mobile money",
    needs: "Name, then a bank and account number, or a phone number and provider",
    titleTail: "GHS Bank and Mobile Money",
    cardLine: "Cedis, bank or mobile money",
    intro:
      "Ghana has a growing community of developers, designers and customer support teams, and mobile money is widely used alongside bank accounts. Easner pays your contractor in Ghanaian cedis, by bank transfer or mobile money. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask which one they use, bank or mobile money. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "For a bank: the name of their bank and their account number",
        "For mobile money: their phone number and mobile money provider",
      ],
    },
    addStep: "Choose bank or mobile money, then enter their details. They don't need an Easner account.",
    demo: {
      name: "Kwame Mensah",
      detail: "Bank account • GHS",
      fields: [
        { label: "Account holder name", value: "Kwame Mensah" },
        { label: "Account number", value: "0123 4567 8901" },
      ],
    },
    goodToKnow: [
      { title: "Pick the way your contractor actually gets paid", description: "Easner pays Ghana by bank or mobile money. Ask which your contractor uses, so the money arrives where they use it." },
      { title: "They're paid in cedis", description: "Your contractor receives GHS. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." },
      { title: "Designers and creatives", description: "Graphic, UI and brand designers and video editors." },
      { title: "Customer support teams", description: "Chat, email and phone support staff." },
      { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." },
    ],
    faq: [
      { question: "Can I pay a Ghanaian contractor by mobile money?", answer: "Yes. Easner pays Ghana by bank or mobile money, in Ghanaian cedis. For mobile money, ask your contractor for their phone number and their mobile money provider." },
      { question: "What currency does a contractor in Ghana receive?", answer: "Ghanaian cedis (GHS), by bank transfer or mobile money. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Ghana",
      "pay Ghanaian freelancers from the US",
      "pay developers in Ghana",
      "send business payment to Ghana",
      "pay suppliers in Ghana",
    ],
  },
  {
    country: "South Africa",
    area: "Africa",
    slug: "pay-contractors-in-south-africa",
    code: "ZA",
    currencyName: "rand",
    delivery: "in their own bank account",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank and account number",
    titleTail: "ZAR Bank Payouts",
    cardLine: "Rand, to a bank account",
    intro:
      "South Africa has an established market of developers, designers, writers and support teams. Easner pays your contractor in rand, into a South African bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "The name of their bank",
        "Their bank account number",
      ],
    },
    addStep: "Enter their name, bank and account number. They don't need an Easner account.",
    demo: {
      name: "Thabo Nkosi",
      detail: "Bank account • ZAR",
      fields: [
        { label: "Account holder name", value: "Thabo Nkosi" },
        { label: "Account number", value: "0123 4567 89" },
      ],
    },
    goodToKnow: [
      { title: "Rand, to a bank account", description: "Your contractor receives ZAR by bank transfer. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm." },
      { title: "Check the account number", description: "Ask your contractor for the full account number and the name of their bank. A missing digit means the payment can't be matched to an account." },
    ],
    payees: [
      { title: "Developers and engineers", description: "Software, mobile and data engineers." },
      { title: "Designers and creatives", description: "Brand and UI designers, illustrators and video editors." },
      { title: "Writers and marketers", description: "Copywriters, editors and marketing freelancers." },
      { title: "Support and operations teams", description: "Customer support and back-office staff." },
    ],
    faq: [
      { question: "What bank details do I need to pay a contractor in South Africa?", answer: "The account holder's name, the name of their bank and their bank account number. The contractor does not need an Easner account." },
      { question: "What currency does a contractor in South Africa receive?", answer: "South African rand (ZAR), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in South Africa",
      "pay South African freelancers from the US",
      "pay developers in South Africa",
      "send business payment to South Africa",
      "pay suppliers in South Africa",
    ],
  },
  {
    country: "Rwanda",
    area: "Africa",
    slug: "pay-contractors-in-rwanda",
    code: "RW",
    currencyName: "Rwandan francs",
    delivery: "by bank or mobile money",
    deliveryLabel: "Bank or mobile money",
    needs: "Name, then a bank and account number, or a phone number and provider",
    titleTail: "RWF Bank and Mobile Money",
    cardLine: "Francs, bank or mobile money",
    intro:
      "Rwanda has a fast-growing tech scene centred on Kigali, and many companies abroad work with its developers and designers. Easner pays your contractor in Rwandan francs, by bank transfer or mobile money. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask which one they use, bank or mobile money. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "For a bank: the name of their bank and their account number",
        "For mobile money: their phone number, on Airtel Money",
      ],
    },
    addStep: "Choose bank or mobile money, then enter their details. They don't need an Easner account.",
    demo: {
      name: "Aline Uwase",
      detail: "Airtel Money • +250 788 123 456",
      fields: [
        { label: "Account holder name", value: "Aline Uwase" },
        { label: "Provider", value: "Airtel Money" },
        { label: "Phone number", value: "+250 788 123 456" },
      ],
    },
    goodToKnow: [
      { title: "Pick the way your contractor actually gets paid", description: "Easner pays Rwanda by bank or mobile money. Ask which your contractor uses, so the money arrives where they use it." },
      { title: "Mobile money goes to a phone number", description: "Enter the number with its country code, +250, and choose Airtel Money. Check every digit, because the payment goes to that number." },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." },
      { title: "Designers and creatives", description: "Graphic, UI and brand designers and video editors." },
      { title: "Writers and researchers", description: "Content writers, translators and research staff." },
      { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." },
    ],
    faq: [
      { question: "Can I pay a Rwandan contractor by mobile money?", answer: "Yes. Easner pays Rwanda by bank or mobile money. For mobile money, choose Airtel Money and enter the contractor's phone number with its country code, +250." },
      { question: "What currency does a contractor in Rwanda receive?", answer: "Rwandan francs (RWF), by bank transfer or mobile money. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Rwanda",
      "pay Rwandan freelancers from the US",
      "pay developers in Kigali",
      "send business payment to Rwanda",
      "pay suppliers in Rwanda",
    ],
  },
  {
    country: "Cameroon",
    area: "Africa",
    slug: "pay-contractors-in-cameroon",
    code: "CM",
    currencyName: "Central African CFA francs",
    delivery: "by mobile money",
    deliveryLabel: "Mobile money",
    needs: "Name, mobile money provider and phone number",
    titleTail: "XAF Mobile Money Payouts",
    cardLine: "CFA francs, by mobile money",
    intro:
      "Cameroon has a growing community of developers, designers and bilingual French and English support teams, and mobile money is widely used. Easner pays your contractor in Central African CFA francs, by mobile money. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask which mobile money provider they use. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "Their mobile money provider: MTN, Orange or Moov Money",
        "The phone number their mobile money account is on",
      ],
    },
    addStep: "Choose their mobile money provider and enter their phone number. They don't need an Easner account.",
    demo: {
      name: "Jean Mbarga",
      detail: "MTN • +237 671 234 567",
      fields: [
        { label: "Account holder name", value: "Jean Mbarga" },
        { label: "Provider", value: "MTN" },
        { label: "Phone number", value: "+237 671 234 567" },
      ],
    },
    goodToKnow: [
      { title: "Mobile money goes to a phone number", description: "Enter the number with its country code, +237, and choose MTN, Orange or Moov Money. Check every digit, because the payment goes to that number." },
      { title: "They're paid in CFA francs", description: "Your contractor receives XAF. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Developers and data teams", description: "Software engineers and analysts on project or monthly contracts." },
      { title: "Designers and creatives", description: "Graphic and UI designers and video editors." },
      { title: "Bilingual support teams", description: "French and English customer support and admin staff." },
      { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." },
    ],
    faq: [
      { question: "Can I pay a Cameroonian contractor by mobile money?", answer: "Yes. Easner pays Cameroon by mobile money. Choose MTN, Orange or Moov Money and enter the contractor's phone number with its country code, +237." },
      { question: "What currency does a contractor in Cameroon receive?", answer: "Central African CFA francs (XAF), by mobile money. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Cameroon",
      "pay Cameroonian freelancers from the US",
      "pay with MTN or Orange Money from the US",
      "send business payment to Cameroon",
      "pay suppliers in Cameroon",
    ],
  },
  {
    country: "Senegal",
    area: "Africa",
    slug: "pay-contractors-in-senegal",
    code: "SN",
    currencyName: "West African CFA francs",
    delivery: "by mobile money",
    deliveryLabel: "Mobile money",
    needs: "Name, mobile money provider and phone number",
    titleTail: "XOF Mobile Money Payouts",
    cardLine: "CFA francs, by mobile money",
    intro:
      "Senegal has a growing community of developers, designers and French-speaking support teams, and mobile money is widely used. Easner pays your contractor in West African CFA francs, by mobile money. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask which mobile money provider they use. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "Their mobile money provider: MTN, Orange, Moov Money, Wave or Free",
        "The phone number their mobile money account is on",
      ],
    },
    addStep: "Choose their mobile money provider and enter their phone number. They don't need an Easner account.",
    demo: {
      name: "Awa Diop",
      detail: "Wave • +221 77 123 45 67",
      fields: [
        { label: "Account holder name", value: "Awa Diop" },
        { label: "Provider", value: "Wave" },
        { label: "Phone number", value: "+221 77 123 45 67" },
      ],
    },
    goodToKnow: [
      { title: "Five providers to choose from", description: "Senegal payouts go to MTN, Orange, Moov Money, Wave or Free. Ask which one your contractor actually uses, so the money arrives in the right wallet." },
      { title: "Mobile money goes to a phone number", description: "Enter the number with its country code, +221. Check every digit, because the payment goes to that number." },
    ],
    payees: [
      { title: "Developers and data teams", description: "Software engineers and analysts on project or monthly contracts." },
      { title: "Designers and creatives", description: "Graphic and UI designers and video editors." },
      { title: "French-speaking support teams", description: "Customer support and back-office staff who work in French." },
      { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." },
    ],
    faq: [
      { question: "Can I pay a Senegalese contractor by Wave or Orange Money?", answer: "Yes. Easner pays Senegal by mobile money. Choose the contractor's provider (MTN, Orange, Moov Money, Wave or Free) and enter their phone number with its country code, +221." },
      { question: "What currency does a contractor in Senegal receive?", answer: "West African CFA francs (XOF), by mobile money. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Senegal",
      "pay Senegalese freelancers from the US",
      "pay with Wave or Orange Money from the US",
      "send business payment to Senegal",
      "pay suppliers in Senegal",
    ],
  },
  {
    country: "United States",
    area: "Americas",
    slug: "pay-contractors-in-the-united-states",
    code: "US",
    noCountryFaq: true,
    currencyName: "US dollars",
    delivery: "by RTP, FedNow or ACH",
    deliveryLabel: "RTP, FedNow or ACH",
    needs: "Name, routing number, account number, account type and address",
    titleTail: "USD Instant and ACH Payouts",
    cardLine: "Dollars, instant or ACH",
    intro:
      "Businesses outside the US pay US contractors, agencies and suppliers all the time. Easner pays your contractor in US dollars, to a US bank account over the instant networks RTP and FedNow, or by ACH. You pay from your Easner Business balance, and your company can be based in any of 174 countries.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these details before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "Their 9-digit ABA routing number",
        "Their bank account number",
        "Whether the account is checking or savings",
        "Their address",
      ],
    },
    addStep: "Enter their name, routing number, account number, account type and address. They don't need an Easner account.",
    demo: {
      name: "Jordan Lee",
      detail: "Bank account • USD",
      fields: [
        { label: "Account holder name", value: "Jordan Lee" },
        { label: "Routing number", value: "123456789" },
        { label: "Account number", value: "000123456789" },
        { label: "Account type", value: "Checking" },
      ],
    },
    goodToKnow: [
      { title: "Routing number and account number", description: "A US bank account is identified by a 9-digit routing number and an account number. They are two different numbers, so ask your contractor for both." },
      { title: "They're paid in dollars", description: "Your contractor receives USD over RTP, FedNow or ACH. The rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Freelance developers", description: "Engineers and technical contractors on project or monthly contracts." },
      { title: "Designers and creatives", description: "Brand and UI designers, illustrators, photographers and video editors." },
      { title: "Agencies and consultants", description: "Agencies and independent consultants who invoice your business." },
      { title: "Suppliers and manufacturers", description: "Companies you buy goods and services from." },
    ],
    faq: [
      { question: "What bank details do I need to pay a contractor in the United States?", answer: "The account holder's name, the 9-digit routing number, the account number, whether the account is checking or savings, and the contractor's address. The contractor does not need an Easner account." },
      { question: "Can a business outside the US pay a contractor in the US?", answer: "Yes. A company can open Easner Business from 174 countries, subject to verification, and pay a US contractor in US dollars by bank. Opening an account needs each owner to verify their identity. The rate, the fees and what the recipient gets are shown before you confirm." },
      { question: "Can I pay a US contractor instantly?", answer: "Easner pays US bank accounts over the instant networks RTP and FedNow, as well as by ACH. Instant payments depend on the contractor's bank taking part in those networks. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in the United States",
      "pay US freelancers from abroad",
      "pay US suppliers in dollars",
      "send business payment to the US",
      "pay US contractors by ACH",
      "pay US contractors instantly with RTP or FedNow",
    ],
  },
  {
    country: "Colombia",
    area: "Americas",
    slug: "pay-contractors-in-colombia",
    code: "CO",
    currencyName: "Colombian pesos",
    delivery: "through Bre-B",
    deliveryLabel: "Bre-B",
    needs: "Name and Bre-B key",
    titleTail: "COP Payouts Through Bre-B",
    cardLine: "Pesos, through Bre-B",
    intro:
      "Colombia has a growing community of developers, designers and bilingual support teams. Bre-B is Colombia's instant payment system, and Easner pays your contractor in Colombian pesos through it. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these two things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name",
        "Their Bre-B key, the key linked to their bank account",
      ],
    },
    addStep: "Enter their name and Bre-B key. They don't need an Easner account.",
    demo: {
      name: "Camila Rojas",
      detail: "Bre-B key • COP",
      fields: [
        { label: "Account holder name", value: "Camila Rojas" },
        { label: "Bre-B key", value: "camila@example.com" },
      ],
    },
    goodToKnow: [
      { title: "Ask for the Bre-B key", description: "A Bre-B key is the identifier a person links to their bank account, such as a phone number or an email address. Ask your contractor which key they use, and enter it exactly." },
      { title: "Paid in pesos, through an instant system", description: "Your contractor receives COP through Bre-B, Colombia's instant payment system. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." },
      { title: "Designers and creatives", description: "Brand and UI designers, illustrators and video editors." },
      { title: "Bilingual support teams", description: "Spanish and English customer support and operations staff." },
      { title: "Marketers and content creators", description: "Social media, paid media and content freelancers." },
    ],
    faq: [
      { question: "What is a Bre-B key?", answer: "Bre-B is Colombia's instant payment system. A Bre-B key is the identifier a person links to their bank account, such as a phone number or an email address. Ask your contractor which key they use." },
      { question: "What currency does a contractor in Colombia receive?", answer: "Colombian pesos (COP), through Bre-B. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Colombia",
      "pay Colombian freelancers from the US",
      "pay developers in Colombia",
      "send business payment to Colombia",
      "pay suppliers in Colombia",
    ],
  },
  {
    country: "Indonesia",
    area: "Asia",
    slug: "pay-contractors-in-indonesia",
    code: "ID",
    currencyName: "Indonesian rupiah",
    delivery: "in their own bank account",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank and account number",
    titleTail: "IDR Bank Payouts",
    cardLine: "Rupiah, to a bank account",
    intro:
      "Indonesia has a large community of developers, designers, digital marketers and virtual assistants, and many remote workers are based in places like Bali. Easner pays your contractor in Indonesian rupiah, into a bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "The name of their bank",
        "Their bank account number",
      ],
    },
    addStep: "Enter their name, bank and account number. They don't need an Easner account.",
    demo: {
      name: "Putri Wijaya",
      detail: "Bank account • IDR",
      fields: [
        { label: "Account holder name", value: "Putri Wijaya" },
        { label: "Account number", value: "0123456789" },
      ],
    },
    goodToKnow: [
      { title: "Bank accounts, in rupiah", description: "Easner pays Indonesian contractors into bank accounts in IDR. Ask for the name of their bank and the full account number." },
      { title: "Check the bank name", description: "Indonesia has many banks, and the payment is matched to the account at the bank you enter, so make sure the bank name is right." },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." },
      { title: "Designers and video editors", description: "UI designers, illustrators, motion designers and editors." },
      { title: "Digital marketers", description: "Social media, SEO and paid media freelancers." },
      { title: "Virtual assistants and support", description: "Admin, research and customer support staff." },
    ],
    faq: [
      { question: "What bank details do I need to pay a contractor in Indonesia?", answer: "The account holder's name, the name of their bank and their bank account number. The contractor does not need an Easner account." },
      { question: "What currency does a contractor in Indonesia receive?", answer: "Indonesian rupiah (IDR), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Indonesia",
      "pay Indonesian freelancers from the US",
      "pay developers in Indonesia",
      "send business payment to Indonesia",
      "pay suppliers in Indonesia",
    ],
  },
  {
    country: "Thailand",
    area: "Asia",
    slug: "pay-contractors-in-thailand",
    code: "TH",
    currencyName: "Thai baht",
    delivery: "in their own bank account",
    deliveryLabel: "Bank transfer",
    needs: "Name, bank and account number",
    titleTail: "THB Bank Payouts",
    cardLine: "Baht, to a bank account",
    intro:
      "Thailand has a growing base of developers, designers and content creators, and many remote workers base themselves there. Easner pays your contractor in Thai baht, into a bank account. You pay from your Easner Business balance in dollars.",
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these three things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "The name of their bank",
        "Their bank account number",
      ],
    },
    addStep: "Enter their name, bank and account number. They don't need an Easner account.",
    demo: {
      name: "Napat Chaiyasit",
      detail: "Bank account • THB",
      fields: [
        { label: "Account holder name", value: "Napat Chaiyasit" },
        { label: "Account number", value: "123 4 56789 0" },
      ],
    },
    goodToKnow: [
      { title: "Bank accounts, in baht", description: "Easner pays Thai contractors into bank accounts in THB. Ask for the name of their bank and the full account number." },
      { title: "They're paid in baht", description: "Your contractor receives THB. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm." },
    ],
    payees: [
      { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." },
      { title: "Designers and creatives", description: "Graphic and UI designers, illustrators and video editors." },
      { title: "Content creators and writers", description: "Writers, translators and social media creators." },
      { title: "Virtual assistants and support", description: "Admin, research and customer support staff." },
    ],
    faq: [
      { question: "What bank details do I need to pay a contractor in Thailand?", answer: "The account holder's name, the name of their bank and their bank account number. The contractor does not need an Easner account." },
      { question: "What currency does a contractor in Thailand receive?", answer: "Thai baht (THB), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm." },
    ],
    keywords: [
      "pay contractors in Thailand",
      "pay Thai freelancers from the US",
      "pay developers in Thailand",
      "send business payment to Thailand",
      "pay suppliers in Thailand",
    ],
  },
]

/** Every guide: the first countries, then the rest of Africa, the Americas and Asia, then the euro-payout countries. */
export const corridorGuides: CorridorGuide[] = [...baseGuides, ...moreGuides, ...europeGuides]
