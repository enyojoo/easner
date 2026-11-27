/**
 * One guide per euro-payout country in corridors.ts (EUR list). They share the same rail (SEPA, by IBAN), so what makes
 * each page different is real and small: the IBAN length, whether the country uses the euro or its own currency, the
 * time difference, and who businesses typically pay there. The currency Easner pays in and the rail still come from
 * corridors.ts, never from here.
 *
 * IBAN lengths are the standard lengths from the SWIFT IBAN registry. Local currencies are the countries' own.
 */
import type { CorridorGuide } from "./corridor-guides"
import type { CardItem, FaqItem } from "./types"

type Kind = "nearshore" | "baltic" | "agencies" | "specialist" | "southern"

interface EuroCountry {
  country: string
  code: string
  iban: number
  /** Set when the country has its own currency, so Easner pays euros into an account that may be held in it. */
  local?: { name: string; adjective: string }
  kind: Kind
  demoName: string
  blurb: string
}

const COUNTRIES: EuroCountry[] = [
  { country: "Austria", code: "AT", iban: 20, kind: "agencies", demoName: "Anna Gruber", blurb: "Austria has a strong base of engineers, designers and consultants, many of them working with German-speaking clients across Europe." },
  { country: "Belgium", code: "BE", iban: 16, kind: "agencies", demoName: "Emma Peeters", blurb: "Belgium is home to translators, designers and consultants, with Dutch, French and German spoken across its regions." },
  { country: "Bulgaria", code: "BG", iban: 22, kind: "nearshore", demoName: "Georgi Petrov", blurb: "Bulgaria has an established software and outsourcing sector, and many companies abroad hire its developers and support teams." },
  { country: "Croatia", code: "HR", iban: 21, kind: "southern", demoName: "Ivana Horvat", blurb: "Croatia has a growing number of developers, designers and remote workers, and it has used the euro since 2023." },
  { country: "Cyprus", code: "CY", iban: 28, kind: "southern", demoName: "Andreas Georgiou", blurb: "Cyprus is home to remote professionals, agencies and service companies, and it uses the euro." },
  { country: "Czechia", code: "CZ", iban: 24, kind: "nearshore", local: { name: "koruna", adjective: "Czech" }, demoName: "Tomáš Novák", blurb: "Czechia has a deep pool of engineers and QA specialists, and many companies abroad build their teams there." },
  { country: "Denmark", code: "DK", iban: 18, kind: "specialist", local: { name: "krone", adjective: "Danish" }, demoName: "Mads Jensen", blurb: "Denmark has highly skilled consultants, designers and developers, and many work as independent specialists." },
  { country: "Estonia", code: "EE", iban: 20, kind: "baltic", demoName: "Karl Tamm", blurb: "Estonia is known for its digital economy, and for developers and product teams who work with companies abroad." },
  { country: "Finland", code: "FI", iban: 18, kind: "specialist", demoName: "Aino Virtanen", blurb: "Finland has strong engineers, designers and game and software specialists who take on contracts from abroad." },
  { country: "France", code: "FR", iban: 27, kind: "agencies", demoName: "Camille Martin", blurb: "France has a large community of freelance developers, designers, writers and consultants across many cities." },
  { country: "Germany", code: "DE", iban: 22, kind: "agencies", demoName: "Lena Fischer", blurb: "Germany has many freelance developers, designers and consultants, and they invoice clients in several countries." },
  { country: "Greece", code: "GR", iban: 27, kind: "southern", demoName: "Nikos Papadakis", blurb: "Greece has a growing group of remote developers, designers and support teams, and it uses the euro." },
  { country: "Hungary", code: "HU", iban: 28, kind: "nearshore", local: { name: "forint", adjective: "Hungarian" }, demoName: "Bence Kovács", blurb: "Hungary has an established engineering and design talent pool, and many companies hire there for software work." },
  { country: "Iceland", code: "IS", iban: 26, kind: "specialist", local: { name: "króna", adjective: "Icelandic" }, demoName: "Sigrún Jónsdóttir", blurb: "Iceland has a small but specialised group of developers, designers and creatives who work with clients abroad." },
  { country: "Ireland", code: "IE", iban: 22, kind: "agencies", demoName: "Aoife Murphy", blurb: "Ireland has many consultants, developers and marketers who work with clients abroad." },
  { country: "Italy", code: "IT", iban: 27, kind: "agencies", demoName: "Giulia Rossi", blurb: "Italy has talented designers, developers, translators and consultants, from Milan to Rome." },
  { country: "Latvia", code: "LV", iban: 21, kind: "baltic", demoName: "Jānis Bērziņš", blurb: "Latvia has developers, designers and product people in Riga and beyond who work with teams abroad." },
  { country: "Liechtenstein", code: "LI", iban: 21, kind: "specialist", local: { name: "franc", adjective: "Swiss" }, demoName: "Hans Meier", blurb: "Liechtenstein is small, with specialist consultants and companies that invoice clients abroad." },
  { country: "Lithuania", code: "LT", iban: 20, kind: "baltic", demoName: "Jonas Kazlauskas", blurb: "Lithuania has a strong fintech and software scene, and developers and product teams there take on contracts from abroad." },
  { country: "Luxembourg", code: "LU", iban: 20, kind: "specialist", demoName: "Marie Weber", blurb: "Luxembourg is home to finance, legal and tech specialists who consult for clients across Europe and beyond." },
  { country: "Malta", code: "MT", iban: 31, kind: "southern", demoName: "Mario Borg", blurb: "Malta has specialists in gaming, fintech and online services, and many of them work with companies abroad." },
  { country: "Monaco", code: "MC", iban: 27, kind: "specialist", demoName: "Louis Rossi", blurb: "Monaco is a small jurisdiction with consultants, agencies and service providers who invoice clients abroad." },
  { country: "Netherlands", code: "NL", iban: 18, kind: "agencies", demoName: "Sanne de Vries", blurb: "The Netherlands has many independent developers, designers and consultants, and Dutch freelancers often work across borders." },
  { country: "Norway", code: "NO", iban: 15, kind: "specialist", local: { name: "krone", adjective: "Norwegian" }, demoName: "Ola Hansen", blurb: "Norway has highly specialised engineers, consultants and designers, and many work independently." },
  { country: "Poland", code: "PL", iban: 28, kind: "nearshore", local: { name: "złoty", adjective: "Polish" }, demoName: "Katarzyna Nowak", blurb: "Poland has a large community of software developers, and many companies abroad build engineering teams there." },
  { country: "Portugal", code: "PT", iban: 25, kind: "southern", demoName: "Inês Silva", blurb: "Portugal has a growing group of remote developers, designers and support teams, and many work with clients abroad." },
  { country: "Romania", code: "RO", iban: 24, kind: "nearshore", local: { name: "leu", adjective: "Romanian" }, demoName: "Andrei Popescu", blurb: "Romania has a large technology workforce, and many companies abroad hire its developers and engineers." },
  { country: "Switzerland", code: "CH", iban: 21, kind: "specialist", local: { name: "franc", adjective: "Swiss" }, demoName: "Luca Keller", blurb: "Switzerland has specialist consultants, engineers and designers, and its accounts use IBANs even though it uses the Swiss franc." },
  { country: "Andorra", code: "AD", iban: 24, kind: "specialist", demoName: "Marc Ribas", blurb: "Andorra is a small jurisdiction with consultants, agencies and service providers who invoice clients abroad." },
  { country: "Moldova", code: "MD", iban: 24, kind: "nearshore", local: { name: "leu", adjective: "Moldovan" }, demoName: "Ion Rusu", blurb: "Moldova has a growing technology and outsourcing sector, and many companies abroad hire its developers." },
  { country: "Montenegro", code: "ME", iban: 22, kind: "southern", demoName: "Marko Petrović", blurb: "Montenegro uses the euro and has a growing group of remote developers, designers and service providers." },
  { country: "North Macedonia", code: "MK", iban: 19, kind: "nearshore", local: { name: "denar", adjective: "Macedonian" }, demoName: "Elena Stojanovska", blurb: "North Macedonia has a growing software and outsourcing sector, and many companies abroad hire its developers and support teams." },
  { country: "San Marino", code: "SM", iban: 27, kind: "specialist", demoName: "Luca Berti", blurb: "San Marino is a very small country with specialist consultants and companies that invoice clients abroad." },
  { country: "Serbia", code: "RS", iban: 22, kind: "nearshore", local: { name: "dinar", adjective: "Serbian" }, demoName: "Milan Jovanović", blurb: "Serbia has a strong software and game development scene, and many companies abroad hire its engineers." },
  { country: "Slovakia", code: "SK", iban: 24, kind: "nearshore", demoName: "Peter Horváth", blurb: "Slovakia has a solid base of engineers and software specialists, and many companies abroad work with them." },
  { country: "Slovenia", code: "SI", iban: 19, kind: "southern", demoName: "Maja Novak", blurb: "Slovenia has developers, designers and engineers who work with companies abroad, and it uses the euro." },
  { country: "Spain", code: "ES", iban: 24, kind: "agencies", demoName: "Lucía García", blurb: "Spain has a large community of freelance developers, designers, translators and marketers across many cities." },
  { country: "Sweden", code: "SE", iban: 24, kind: "specialist", local: { name: "krona", adjective: "Swedish" }, demoName: "Emma Lindberg", blurb: "Sweden has strong engineers, designers and product specialists, and many work as independent consultants." },
  { country: "Vatican City", code: "VA", iban: 22, kind: "specialist", demoName: "Paolo Bianchi", blurb: "Vatican City is the smallest country in the world, so contractors there are few and specialised." },
]

const PAYEES: Record<Kind, CardItem[]> = {
  nearshore: [
    { title: "Software developers", description: "Engineers and QA specialists on project or monthly contracts." },
    { title: "DevOps and data engineers", description: "Infrastructure, data and security engineers." },
    { title: "Designers and creatives", description: "UI and brand designers, illustrators and video editors." },
    { title: "Support and back-office teams", description: "Customer support and operations staff." },
  ],
  baltic: [
    { title: "Software developers", description: "Engineers on project or monthly contracts." },
    { title: "Fintech and product teams", description: "Product managers, analysts and compliance specialists." },
    { title: "Designers and creatives", description: "UI and brand designers and video editors." },
    { title: "Translators and writers", description: "Translators, copywriters and editors." },
  ],
  agencies: [
    { title: "Freelance developers", description: "Engineers and technical contractors on day rates or retainers." },
    { title: "Designers and creatives", description: "Brand and UI designers, illustrators and photographers." },
    { title: "Consultants and agencies", description: "Independent consultants and small agencies who invoice your business." },
    { title: "Translators and writers", description: "Translators, copywriters and editors." },
  ],
  specialist: [
    { title: "Specialist consultants", description: "Independent experts in finance, legal, engineering and strategy." },
    { title: "Freelance developers", description: "Engineers and technical contractors on project contracts." },
    { title: "Designers and creatives", description: "Brand and UI designers and illustrators." },
    { title: "Agencies and suppliers", description: "Agencies and suppliers who invoice your business." },
  ],
  southern: [
    { title: "Remote developers and designers", description: "Engineers and designers working with teams abroad." },
    { title: "Customer support teams", description: "Multilingual support and operations staff." },
    { title: "Translators and writers", description: "Translators, copywriters and editors." },
    { title: "Agencies and suppliers", description: "Local agencies and suppliers who invoice your business." },
  ],
}

const ADJECTIVE_PLACE: Record<string, string> = { Netherlands: "the Netherlands" }
const placeName = (country: string) => ADJECTIVE_PLACE[country] ?? country

/** A made-up IBAN of the right length for the country, grouped in fours. Not a real account. */
function demoIban(code: string, length: number) {
  const digits = "3456789012345678901234567890123456789012345678901234567890"
  const body = `${code}12${digits}`.slice(0, length)
  return body.replace(/(.{4})/g, "$1 ").trim()
}

function guideFor(entry: EuroCountry): CorridorGuide {
  const place = placeName(entry.country)
  const euro = !entry.local
  const slug = `pay-contractors-in-${place.toLowerCase().replace(/\s+/g, "-")}`

  const goodToKnow: CardItem[] = [
    {
      title: "Check the IBAN length",
      description: `A ${place} IBAN has ${entry.iban} characters and starts with ${entry.code}. A missing or extra character means the payment can't be matched to an account, so ask for the full IBAN.`,
    },
    euro
      ? {
          title: "They're paid in euros",
          description: `${entry.country} uses the euro. You pay from your USD balance, and the rate, the fees and what they receive are shown before you confirm.`,
        }
      : {
          title: `Paid in euros, not ${entry.local!.adjective} ${entry.local!.name}`,
          description: `Easner pays euros into bank accounts in ${place}. If your contractor's account is in ${entry.local!.adjective} ${entry.local!.name}, their bank may convert the euros. The rate, the fees and what they receive in euros are shown before you confirm.`,
        },
  ]

  const faq: FaqItem[] = [
    {
      question: `How long is an IBAN in ${place}?`,
      answer: `An IBAN in ${place} has ${entry.iban} characters and starts with ${entry.code}. Ask your contractor for the full IBAN, without leaving anything out.`,
    },
    euro
      ? {
          question: `What currency does a contractor in ${place} receive?`,
          answer: `Euros (EUR), by bank transfer. You pay from your Easner Business balance in dollars. The rate, the fees and what the recipient gets are shown before you confirm.`,
        }
      : {
          question: `Does a contractor in ${place} receive euros or ${entry.local!.adjective} ${entry.local!.name}?`,
          answer: `Euros (EUR), by bank transfer. Easner pays euros into bank accounts in ${place}. If the contractor's account is in ${entry.local!.adjective} ${entry.local!.name}, their bank may convert the euros. The rate, the fees and what the recipient gets are shown before you confirm.`,
        },
  ]

  return {
    country: entry.country,
    area: "Europe",
    slug,
    code: entry.code,
    deliveryLabel: "Bank transfer (SEPA)",
    needs: "Name and IBAN",
    currencyName: "euros",
    delivery: "by bank transfer",
    titleTail: "EUR Bank Payouts (SEPA)",
    cardLine: euro ? "Euros, by bank transfer" : `Euros, for ${entry.local!.adjective} accounts`,
    intro: `${entry.blurb} Easner pays your contractor in euros, by bank transfer to an account in ${place}. You pay from your Easner Business balance in dollars.`,
    asks: {
      headline: "What to ask your contractor for",
      body: "Ask for these two things before you pay. Your contractor doesn't need an Easner account.",
      bullets: [
        "The account holder's name, as it appears at the bank",
        `Their IBAN: ${entry.iban} characters, starting with ${entry.code}`,
      ],
    },
    addStep: "Enter their name and IBAN. They don't need an Easner account.",
    demo: {
      name: entry.demoName,
      detail: "Bank account • EUR",
      fields: [
        { label: "Account holder name", value: entry.demoName },
        { label: "IBAN", value: demoIban(entry.code, entry.iban) },
      ],
    },
    goodToKnow,
    payees: PAYEES[entry.kind],
    faq,
    keywords: [
      `pay contractors in ${place}`,
      `pay freelancers in ${place} from the US`,
      `pay suppliers in ${place}`,
      `send business payment to ${place}`,
      `SEPA payments to ${place}`,
    ],
  }
}

export const europeGuides: CorridorGuide[] = COUNTRIES.map(guideFor)
