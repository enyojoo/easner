/**
 * Guides for the payout countries that are not in the first group and not euro-payout countries: the rest of Africa, the
 * Americas and Asia. The currency Easner pays in comes from corridors.ts, never from here. What is written here is what
 * differs by country: how the contractor gets paid (bank, mobile money or both), the details to ask for, the time
 * difference, and who businesses usually pay.
 *
 * Mobile money providers are named only where the product's own provider list names them (easnerbanking
 * yc-recipient-schema: Airtel Money, MTN, Orange, Moov Money, Wave, Free, TNM, TigoPesa, MyZaka). Elsewhere the page asks
 * the contractor "which provider they use". Argentina's details (CBU or CVU, and CUIT) come from the product's schema.
 */
import { payoutCountry } from "./corridors"
import type { CorridorGuide } from "./corridor-guides"
import type { CardItem, FaqItem } from "./types"

type Rail = "bank" | "mobile" | "both"

interface MoreCountry {
  country: string
  /** How the country is named in a sentence, when it is not the country name. */
  place?: string
  label?: string
  slug?: string
  /** Replaces the default tail of the page title, when the country's name is long. */
  titleTail?: string
  code: string
  area: CorridorGuide["area"]
  currencyName: string
  rail: Rail
  /** Mobile money providers the product lists for this country. */
  providers?: string[]
  phoneCode?: string
  samplePhone?: string
  demoName: string
  /** Offset from UTC in hours. None of these countries changes its clocks. */
  utc: number
  blurb: string
  payees: CardItem[]
  /** Replaces the plain "bank and account number" details, where the product asks for more. */
  bank?: {
    needs: string
    bullets: string[]
    fields: { label: string; value: string }[]
    add: string
    tip: CardItem
    faq: FaqItem
  }
}

const NO_ACCOUNT = "Your contractor doesn't need an Easner account."

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** "West African CFA francs" -> "CFA francs", "Ugandan shillings" -> "Shillings", "US dollars" -> "Dollars". */
function shortCurrency(name: string) {
  if (name.includes("CFA francs")) return "CFA francs"
  const last = name.split(" ").pop() ?? name
  return capitalise(last)
}

function hourLabel(hour: number) {
  const whole = Math.floor(hour)
  const minutes = Math.round((hour - whole) * 60)
  const suffix = whole % 24 >= 12 ? "p.m." : "a.m."
  const twelve = whole % 12 === 0 ? 12 : whole % 12
  return `${twelve}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${suffix}`
}

const half = (n: number) => (Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`)

/** Time difference to New York for a country that does not change its clocks (New York is UTC-5, or UTC-4 in summer). */
function timeNote(rawPlace: string, utc: number) {
  const place = capitalise(rawPlace)
  const winter = utc + 5
  const summer = utc + 4
  const ahead = winter > 0 || (winter === 0 && summer > 0)
  const behind = !ahead && (summer < 0 || winter < 0)
  const lo = Math.min(Math.abs(winter), Math.abs(summer))
  const hi = Math.max(Math.abs(winter), Math.abs(summer))
  const range = lo === hi ? half(hi) : `${half(lo)} to ${half(hi)}`
  const direction = behind ? "behind" : "ahead of"
  const fact = `${range} hours ${direction} New York`
  const local = (((9 + winter) % 24) + 24) % 24
  const sentence =
    winter === 0
      ? `${place} does not change its clocks, so it matches New York in US winter time and is one hour ${"behind"} in US summer time.`
      : `${place} does not change its clocks, so it is ${half(Math.abs(winter))} hour${Math.abs(winter) === 1 ? "" : "s"} ${behind ? "behind" : "ahead of"} New York in US winter time and ${half(Math.abs(summer))} in US summer time.`
  return {
    fact,
    title: `${place} is ${range} hours ${direction} New York`,
    description: `${sentence} When it is 9 a.m. in New York in winter, it is ${hourLabel(local)} there. Payouts typically arrive in minutes to hours, same-day where supported. When timing matters, send earlier in your day.`,
  }
}

const SUPPORT_FR: CardItem = { title: "French-speaking support teams", description: "Customer support and back-office staff who work in French." }
const DEV: CardItem = { title: "Software developers", description: "Engineers and QA testers on project or monthly contracts." }
const DESIGN: CardItem = { title: "Designers and creatives", description: "Graphic, UI and brand designers and video editors." }
const WRITE: CardItem = { title: "Writers and content creators", description: "Copywriters, translators, editors and video creators." }
const SUPPLY: CardItem = { title: "Suppliers and agencies", description: "Local agencies and suppliers who invoice your business." }
const SUPPORT: CardItem = { title: "Support and operations teams", description: "Customer support, research and admin staff." }

const COUNTRIES: MoreCountry[] = [
  {
    country: "Uganda", code: "UG", area: "Africa", currencyName: "Ugandan shillings", rail: "both", providers: ["Airtel Money", "MTN"],
    phoneCode: "+256", samplePhone: "+256 772 123 456", demoName: "Grace Nakato", utc: 3,
    blurb: "Uganda has a young, growing community of developers, writers and support staff, and mobile money is widely used alongside bank accounts.",
    payees: [DEV, WRITE, { title: "Virtual assistants and support", description: "Admin, research and customer support staff." }, SUPPLY],
  },
  {
    country: "Benin", code: "BJ", area: "Africa", currencyName: "West African CFA francs", rail: "mobile", phoneCode: "+229", samplePhone: "+229 12 34 56 78", demoName: "Koffi Agbodjan", utc: 1,
    blurb: "Benin has a growing group of French-speaking developers, designers and support teams, and mobile money is widely used.",
    payees: [DEV, DESIGN, SUPPORT_FR, SUPPLY],
  },
  {
    country: "Botswana", code: "BW", area: "Africa", currencyName: "Botswana pula", rail: "both", providers: ["MyZaka"], phoneCode: "+267", samplePhone: "+267 71 234 567", demoName: "Neo Kgosi", utc: 2,
    blurb: "Botswana has a small, well-educated pool of developers, accountants and support staff, and mobile money sits alongside bank accounts.",
    payees: [DEV, { title: "Accountants and bookkeepers", description: "Remote finance and back-office help for small businesses." }, SUPPORT, SUPPLY],
  },
  {
    country: "Congo", place: "the Republic of the Congo", label: "Republic of the Congo", slug: "pay-contractors-in-the-republic-of-the-congo", titleTail: "Bank and Mobile Money", code: "CG", area: "Africa",
    currencyName: "Central African CFA francs", rail: "both", phoneCode: "+242", samplePhone: "+242 06 123 4567", demoName: "Grâce Mabiala", utc: 1,
    blurb: "The Republic of the Congo, also called Congo-Brazzaville and separate from the Democratic Republic of the Congo, has French-speaking professionals, agencies and suppliers, and people there use both bank accounts and mobile money.",
    payees: [DEV, DESIGN, SUPPORT_FR, SUPPLY],
  },
  {
    country: "Côte d'Ivoire", code: "CI", area: "Africa", slug: "pay-contractors-in-cote-divoire", currencyName: "West African CFA francs", rail: "mobile", phoneCode: "+225", samplePhone: "+225 07 12 34 56 78", demoName: "Aya Kouassi", utc: 0,
    blurb: "Côte d'Ivoire has a growing community of French-speaking developers, designers and customer support teams in Abidjan and beyond, and mobile money is widely used.",
    payees: [DEV, DESIGN, SUPPORT_FR, SUPPLY],
  },
  {
    country: "Ethiopia", code: "ET", area: "Africa", currencyName: "US dollars", rail: "bank", demoName: "Abel Tesfaye", utc: 3,
    blurb: "Ethiopia has a large, young population and a growing number of developers, designers and freelancers.",
    payees: [DEV, DESIGN, WRITE, SUPPLY],
  },
  {
    country: "Malawi", code: "MW", area: "Africa", currencyName: "Malawian kwacha", rail: "mobile", providers: ["Airtel Money", "TNM"], phoneCode: "+265", samplePhone: "+265 99 123 4567", demoName: "Chikondi Banda", utc: 2,
    blurb: "Malawi has a small but growing group of developers, writers and support staff, and mobile money is widely used.",
    payees: [DEV, WRITE, SUPPORT, SUPPLY],
  },
  {
    country: "Mali", code: "ML", area: "Africa", currencyName: "West African CFA francs", rail: "mobile", phoneCode: "+223", samplePhone: "+223 12 34 56 78", demoName: "Mamadou Traoré", utc: 0,
    blurb: "Mali has French-speaking professionals, agencies and suppliers, and mobile money is widely used.",
    payees: [DEV, DESIGN, SUPPORT_FR, SUPPLY],
  },
  {
    country: "Tanzania", code: "TZ", area: "Africa", currencyName: "Tanzanian shillings", rail: "both", providers: ["Airtel Money", "TigoPesa"], phoneCode: "+255", samplePhone: "+255 712 345 678", demoName: "Amani Mwakyusa", utc: 3,
    blurb: "Tanzania has a growing community of developers, writers and customer support teams, and mobile money is widely used alongside bank accounts.",
    payees: [DEV, WRITE, SUPPORT, SUPPLY],
  },
  {
    country: "Togo", code: "TG", area: "Africa", currencyName: "West African CFA francs", rail: "mobile", phoneCode: "+228", samplePhone: "+228 12 34 56 78", demoName: "Kodjo Amegah", utc: 0,
    blurb: "Togo has a growing group of French-speaking developers, designers and support teams, and mobile money is widely used.",
    payees: [DEV, DESIGN, SUPPORT_FR, SUPPLY],
  },
  {
    country: "Zambia", code: "ZM", area: "Africa", currencyName: "Zambian kwacha", rail: "both", providers: ["Airtel Money", "MTN"], phoneCode: "+260", samplePhone: "+260 97 123 4567", demoName: "Mutale Phiri", utc: 2,
    blurb: "Zambia has a growing community of developers, writers and support staff, and mobile money is widely used alongside bank accounts.",
    payees: [DEV, WRITE, SUPPORT, SUPPLY],
  },
  {
    country: "Argentina", code: "AR", area: "Americas", currencyName: "Argentine pesos", rail: "bank", demoName: "Martín Fernández", utc: -3,
    blurb: "Argentina has a deep pool of developers, designers and marketers, and many already work with companies abroad.",
    payees: [DEV, DESIGN, { title: "Marketers and content creators", description: "Social media, paid media and content freelancers." }, { title: "Bilingual support teams", description: "Spanish and English customer support and operations staff." }],
    bank: {
      needs: "Name, CBU or CVU, and CUIT",
      bullets: [
        "The account holder's name, as it appears at the bank",
        "Their CBU or CVU, a 22-digit number that identifies a bank or digital wallet account",
        "Their CUIT, the 11-digit tax ID",
      ],
      fields: [
        { label: "Account holder name", value: "Martín Fernández" },
        { label: "CVU / CBU", value: "0123 4567 8901 2345 6789 01" },
        { label: "CUIT", value: "20-12345678-9" },
      ],
      add: "Enter their name, their 22-digit CBU or CVU and their CUIT. They don't need an Easner account.",
      tip: {
        title: "Ask for the CBU or CVU, and the CUIT",
        description: "A CBU identifies a bank account and a CVU a digital wallet account. Both have 22 digits. Easner also asks for the contractor's CUIT, so ask for both together.",
      },
      faq: {
        question: "What details do I need to pay a contractor in Argentina?",
        answer: "The account holder's name, their 22-digit CBU or CVU, and their CUIT, the 11-digit tax ID. The contractor does not need an Easner account.",
      },
    },
  },
  {
    country: "Ecuador", code: "EC", area: "Americas", currencyName: "US dollars", rail: "bank", demoName: "Diego Andrade", utc: -5,
    blurb: "Ecuador uses the US dollar, and it has a growing group of developers, designers and support teams.",
    payees: [DEV, DESIGN, { title: "Bilingual support teams", description: "Spanish and English customer support and operations staff." }, SUPPLY],
  },
  {
    country: "El Salvador", code: "SV", area: "Americas", currencyName: "US dollars", rail: "bank", demoName: "Valeria Hernández", utc: -6,
    blurb: "El Salvador uses the US dollar, and it has a growing group of developers, designers and bilingual support teams.",
    payees: [DEV, DESIGN, { title: "Bilingual support teams", description: "Spanish and English customer support and operations staff." }, SUPPLY],
  },
  {
    country: "Peru", code: "PE", area: "Americas", currencyName: "Peruvian soles", rail: "bank", demoName: "Camila Quispe", utc: -5,
    blurb: "Peru has a growing community of developers, designers and bilingual support teams who work with companies abroad.",
    payees: [DEV, DESIGN, { title: "Bilingual support teams", description: "Spanish and English customer support and operations staff." }, SUPPLY],
  },
  {
    country: "Cambodia", code: "KH", area: "Asia", currencyName: "US dollars", rail: "bank", demoName: "Sokha Chan", utc: 7,
    blurb: "Cambodia uses the US dollar widely alongside its own riel, and it has a growing group of developers, designers and support teams.",
    payees: [DEV, DESIGN, WRITE, SUPPORT],
  },
  {
    country: "Sri Lanka", code: "LK", area: "Asia", currencyName: "Sri Lankan rupees", rail: "bank", demoName: "Nimali Perera", utc: 5.5,
    blurb: "Sri Lanka has an established base of developers, designers and accountants, many of them working with clients abroad.",
    payees: [DEV, DESIGN, { title: "Accountants and bookkeepers", description: "Remote finance and back-office help for small businesses." }, SUPPORT],
  },
]

function guideFor(entry: MoreCountry): CorridorGuide {
  const payout = payoutCountry(entry.country)
  if (!payout) throw new Error(`Guide for "${entry.country}" has no payout country in corridors.ts`)
  const place = entry.place ?? entry.country
  const cur = payout.currency
  const providerList = entry.providers?.length
    ? entry.providers.length === 1
      ? entry.providers[0]
      : `${entry.providers.slice(0, -1).join(", ")} or ${entry.providers[entry.providers.length - 1]}`
    : null

  const delivery = entry.rail === "bank" ? "in their own bank account" : entry.rail === "mobile" ? "by mobile money" : "by bank or mobile money"
  const deliveryLabel = entry.rail === "bank" ? "Bank transfer" : entry.rail === "mobile" ? "Mobile money" : "Bank or mobile money"
  const short = entry.rail === "bank" ? "to a bank account" : entry.rail === "mobile" ? "by mobile money" : "bank or mobile money"
  const slug = entry.slug ?? `pay-contractors-in-${place.toLowerCase().replace(/^the /, "the-").replace(/\s+/g, "-")}`

  const phoneBullet = providerList
    ? `For mobile money: their phone number, on ${providerList}`
    : "For mobile money: their phone number and mobile money provider"
  const bankBullet = "For a bank: the name of their bank and their account number"

  const bullets = entry.bank
    ? entry.bank.bullets
    : entry.rail === "bank"
      ? ["The account holder's name, as it appears at the bank", "The name of their bank", "Their bank account number"]
      : entry.rail === "mobile"
        ? [
            "The account holder's name",
            providerList ? `Their mobile money provider: ${providerList}` : "Their mobile money provider",
            "The phone number their mobile money account is on",
          ]
        : ["The account holder's name", bankBullet, phoneBullet]

  const needs = entry.bank
    ? entry.bank.needs
    : entry.rail === "bank"
      ? "Name, bank and account number"
      : entry.rail === "mobile"
        ? "Name, mobile money provider and phone number"
        : "Name, then a bank and account number, or a phone number and provider"

  const addStep = entry.bank
    ? entry.bank.add
    : entry.rail === "bank"
      ? "Enter their name, bank and account number. They don't need an Easner account."
      : entry.rail === "mobile"
        ? "Choose their mobile money provider and enter their phone number. They don't need an Easner account."
        : "Choose bank or mobile money, then enter their details. They don't need an Easner account."

  const demoFields = entry.bank
    ? entry.bank.fields
    : entry.rail === "bank"
      ? [
          { label: "Account holder name", value: entry.demoName },
          { label: "Account number", value: "0123 4567 8901" },
        ]
      : [
          { label: "Account holder name", value: entry.demoName },
          { label: "Provider", value: entry.providers?.[0] ?? "Choose a provider" },
          { label: "Phone number", value: entry.samplePhone ?? "" },
        ]
  const demoDetail =
    entry.rail === "bank" || entry.bank
      ? `Bank account • ${cur}`
      : `${entry.providers?.[0] ?? "Mobile money"} • ${entry.samplePhone}`

  const goodToKnow: CardItem[] = []
  if (entry.bank) goodToKnow.push(entry.bank.tip)
  else if (entry.rail === "bank")
    goodToKnow.push({
      title: "Bank accounts only",
      description: `Easner pays contractors in ${place} into bank accounts. Ask for the name of their bank and the full account number.`,
    })
  else if (entry.rail === "mobile")
    goodToKnow.push({
      title: "Mobile money goes to a phone number",
      description: `Enter the number with its country code, ${entry.phoneCode}${providerList ? `, and choose ${providerList}` : ", and choose their provider"}. Check every digit, because the payment goes to that number.`,
    })
  else
    goodToKnow.push({
      title: "Pick the way your contractor actually gets paid",
      description: `Easner pays ${place} by bank or mobile money. Ask which your contractor uses, so the money arrives where they use it. For mobile money, enter the number with its country code, ${entry.phoneCode}.`,
    })
  goodToKnow.push({
    title: `Paid in ${entry.currencyName}`,
    description:
      cur === "USD"
        ? `Your contractor receives USD. The fees and what they receive are shown before you confirm.`
        : `Your contractor receives ${cur}. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm.`,
  })

  const faq: FaqItem[] = []
  if (entry.bank) faq.push(entry.bank.faq)
  else if (entry.rail === "bank")
    faq.push({
      question: `What bank details do I need to pay a contractor in ${place}?`,
      answer: "The account holder's name, the name of their bank and their bank account number. The contractor does not need an Easner account.",
    })
  else
    faq.push({
      question: `Can I pay a contractor in ${place} by mobile money?`,
      answer: `Yes. Easner pays ${place} by ${entry.rail === "both" ? "bank or mobile money" : "mobile money"}, in ${entry.currencyName}. ${providerList ? `For mobile money, choose ${providerList} and enter` : "For mobile money, choose the contractor's provider and enter"} their phone number with its country code, ${entry.phoneCode}.`,
    })
  faq.push({
    question: `What currency does a contractor in ${place} receive?`,
    answer: `${capitalise(entry.currencyName)} (${cur}), ${entry.rail === "bank" ? "by bank transfer" : entry.rail === "mobile" ? "by mobile money" : "by bank transfer or mobile money"}. You pay from your Easner Business balance${cur === "USD" ? "" : " in dollars"}. The rate, the fees and what the recipient gets are shown before you confirm.`,
  })

  return {
    country: entry.country,
    area: entry.area,
    slug,
    code: entry.code,
    ...(entry.label ? { label: entry.label } : {}),
    ...(entry.place ? { place: entry.place } : {}),
    currencyName: entry.currencyName,
    delivery,
    deliveryLabel,
    needs,
    titleTail: entry.titleTail ?? (entry.rail === "bank" ? `${cur} Bank Payouts` : entry.rail === "mobile" ? `${cur} Mobile Money Payouts` : `${cur} Bank and Mobile Money`),
    cardLine: `${shortCurrency(entry.currencyName)}, ${short}`,
    timeNote: timeNote(place, entry.utc),
    intro: `${entry.blurb} Easner pays your contractor in ${entry.currencyName} ${delivery}. You pay from your Easner Business balance${cur === "USD" ? "" : " in dollars"}.`,
    asks: {
      headline: "What to ask your contractor for",
      body: `Ask for ${bullets.length === 2 ? "these two things" : bullets.length === 3 ? "these three things" : "these details"} before you pay. ${NO_ACCOUNT}`,
      bullets,
    },
    addStep,
    demo: { name: entry.demoName, detail: demoDetail, fields: demoFields },
    goodToKnow,
    payees: entry.payees,
    faq,
    keywords: [
      `pay contractors in ${place}`,
      `pay freelancers in ${place} from the US`,
      `pay suppliers in ${place}`,
      `send business payment to ${place}`,
      entry.rail === "bank" ? `pay developers in ${place}` : `pay with mobile money in ${place}`,
    ],
  }
}

export const moreGuides: CorridorGuide[] = COUNTRIES.map(guideFor)
