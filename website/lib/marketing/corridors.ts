import type { FaqItem } from "./types"

/** Office payout and signup lists. Named-country answers use these. The site's "80+ countries" line stays. */

type Rail = "bank" | "mobile" | "both"

export interface PayoutCountry {
  name: string
  currency: string
  rail: Rail
}

const EUR = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Monaco",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Switzerland",
] as const

const LOCAL_BANK: { name: string; currency: string }[] = [
  { name: "United States", currency: "USD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Brazil", currency: "BRL" },
  { name: "Colombia", currency: "COP" },
  { name: "Mexico", currency: "MXN" },
  { name: "India", currency: "INR" },
  { name: "Indonesia", currency: "IDR" },
  { name: "Philippines", currency: "PHP" },
  { name: "Thailand", currency: "THB" },
  { name: "Nigeria", currency: "NGN" },
  { name: "South Africa", currency: "ZAR" },
  { name: "Ghana", currency: "GHS" },
  { name: "Kenya", currency: "KES" },
  { name: "Rwanda", currency: "RWF" },
  { name: "Congo", currency: "XAF" },
  { name: "DR Congo", currency: "CDF" },
]

const MOBILE = new Set(["Ghana", "Kenya", "Rwanda", "Cameroon", "Senegal", "Uganda"])
const MOBILE_ONLY = ["Cameroon", "Senegal", "Uganda"] as const
const MOBILE_CURRENCY: Record<(typeof MOBILE_ONLY)[number], string> = {
  Cameroon: "XAF",
  Senegal: "XOF",
  Uganda: "UGX",
}

const BOTH = new Set(["Ghana", "Kenya", "Rwanda"])

export const RECEIVE_ONLY = ["Kenya", "DR Congo"] as const

export const BUSINESS_ONLY = [
  "Algeria",
  "Bangladesh",
  "Burkina Faso",
  "Central African Republic",
  "China",
  "Japan",
  "Mali",
  "Morocco",
  "Nepal",
  "Nicaragua",
  "Niger",
  "Panama",
  "Tunisia",
  "Ukraine",
  "United Kingdom",
  "Vanuatu",
] as const

export const CLOSED_FOR_BOTH = [
  "Afghanistan",
  "Belarus",
  "Bhutan",
  "Burundi",
  "Cuba",
  "DR Congo",
  "Gaza and the West Bank",
  "Guinea-Bissau",
  "Haiti",
  "Iran",
  "Iraq",
  "Kenya",
  "Kosovo",
  "Lebanon",
  "Libya",
  "Mozambique",
  "Myanmar",
  "North Korea",
  "Pakistan",
  "Qatar",
  "Russia",
  "Somalia",
  "South Sudan",
  "Sudan",
  "Syria",
  "Venezuela",
  "Yemen",
  "Zimbabwe",
] as const

/** Business signup countries, as named for account opening. Czechia is the payout name for Czech Republic. */
export const BUSINESS_SIGNUP = [
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belgium",
  "Belize",
  "Benin",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lesotho",
  "Liberia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Romania",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Vietnam",
  "Zambia",
] as const

const SIGNUP_ALIAS: Record<string, string> = {
  Czechia: "Czech Republic",
}

const businessOnly = new Set<string>(BUSINESS_ONLY)
const closed = new Set<string>(CLOSED_FOR_BOTH)
const businessSignup = new Set<string>(BUSINESS_SIGNUP)

export function signupName(country: string) {
  return SIGNUP_ALIAS[country] ?? country
}

export function businessCanSignUp(country: string) {
  return businessSignup.has(signupName(country)) && !closed.has(country)
}

export function appCanSignUp(country: string) {
  return businessCanSignUp(country) && !businessOnly.has(signupName(country)) && !businessOnly.has(country)
}

function railOf(name: string): Rail {
  if (BOTH.has(name)) return "both"
  if (MOBILE.has(name) && !LOCAL_BANK.some((row) => row.name === name) && !EUR.includes(name as (typeof EUR)[number])) {
    return "mobile"
  }
  return "bank"
}

export const PAYOUT_COUNTRIES: PayoutCountry[] = [
  ...EUR.map((name) => ({ name, currency: "EUR", rail: "bank" as const })),
  ...LOCAL_BANK.map((row) => ({ name: row.name, currency: row.currency, rail: railOf(row.name) })),
  ...MOBILE_ONLY.map((name) => ({ name, currency: MOBILE_CURRENCY[name], rail: "mobile" as const })),
]

const payoutByName = new Map(PAYOUT_COUNTRIES.map((country) => [country.name, country]))

export const EUR_PAYOUT_COUNTRIES = EUR

export function spoken(name: string) {
  if (name === "Philippines") return "the Philippines"
  if (name === "United Kingdom") return "the United Kingdom"
  if (name === "Netherlands") return "the Netherlands"
  if (name === "United States") return "the United States"
  return name
}

export function railPhrase(country: PayoutCountry) {
  if (country.name === "Nigeria") return "bank only"
  if (country.rail === "both") return "bank or mobile money"
  if (country.rail === "mobile") return "mobile money"
  return "bank"
}

const shown =
  "Fees and the exchange rate are shown before you confirm, including what the recipient gets. Transfers typically arrive in minutes to hours, same-day where supported."

const usPartners =
  "The United States is open for a personal and a business account. New York cannot use the main account partner. California, New York, and Connecticut cannot use the backup partner."

function personalTo(country: PayoutCountry): FaqItem {
  return {
    question: `How do I send money from the United States to ${spoken(country.name)}?`,
    answer: `From the Easner app on iPhone, Android, or the [web](https://app.easner.com), you send from a USD balance. The recipient in ${spoken(country.name)} gets ${country.currency} by ${railPhrase(country)}. ${shown} ${usPartners}`,
    links: [{ label: "Personal Banking", href: "/personal" }],
  }
}

function personalFromApp(country: string): FaqItem {
  return {
    question: `How do I send money from ${spoken(country)} to the United States?`,
    answer: `Someone in ${spoken(country)} can open the Easner app on iPhone, Android, or the [web](https://app.easner.com) and send USD to a bank account in the United States. The app can be opened from 158 countries. Opening an account needs the person to verify their own identity. ${shown}`,
    links: [{ label: "Personal Banking", href: "/personal" }],
  }
}

function personalFromBusinessOnly(country: string): FaqItem {
  return {
    question: `How do I send money from ${spoken(country)} to the United States?`,
    answer: `The Easner app is not available in ${spoken(country)}. A business account can be opened there, and that business can pay a supplier in the United States from Easner Business. Opening an account needs the person to verify their own identity.`,
    links: [{ label: "Business Banking", href: "/business" }],
  }
}

function personalReceiveOnly(country: PayoutCountry): FaqItem {
  return {
    question: `How do I send money from ${spoken(country.name)} to the United States?`,
    answer: `A payout to ${spoken(country.name)} can be received in ${country.currency} by ${railPhrase(country)}. People and companies in ${spoken(country.name)} cannot open an Easner account.`,
    links: [{ label: "Personal Banking", href: "/personal" }],
  }
}

export function personalCorridorFaqs(): FaqItem[] {
  const items: FaqItem[] = []
  for (const country of PAYOUT_COUNTRIES) {
    if (country.name === "United States") continue
    items.push(personalTo(country))
  }
  items.push({
    question: "How do I send money from the United States to Europe?",
    answer: `From the United States you can send euros by bank to ${EUR.join(", ")}. This is not every European country. The United Kingdom is separate: the recipient gets GBP by bank. ${shown}`,
    links: [{ label: "Personal Banking", href: "/personal" }],
  })
  for (const country of PAYOUT_COUNTRIES) {
    if (country.name === "United States") continue
    if (RECEIVE_ONLY.includes(country.name as (typeof RECEIVE_ONLY)[number])) {
      items.push(personalReceiveOnly(country))
      continue
    }
    if (appCanSignUp(country.name)) items.push(personalFromApp(country.name))
    else if (businessCanSignUp(country.name)) items.push(personalFromBusinessOnly(country.name))
  }
  for (const country of BUSINESS_ONLY) {
    if (payoutByName.has(country)) continue
    items.push(personalFromBusinessOnly(country))
  }
  return items
}

function businessTo(country: PayoutCountry): FaqItem {
  return {
    question: `How do I pay a supplier in ${spoken(country.name)} from the United States?`,
    answer: `From Easner Business, a company pays a supplier in ${spoken(country.name)}. The supplier receives ${country.currency} by ${railPhrase(country)}. ${shown} ${usPartners}`,
    links: [{ label: "Business Banking", href: "/business" }],
  }
}

function businessFrom(country: string): FaqItem {
  return {
    question: `How do I pay a supplier in the United States from ${spoken(country)}?`,
    answer: `A business in ${spoken(country)} can open Easner Business and pay a supplier in the United States in USD by bank. Business accounts can be opened from 174 countries. Opening an account needs the person to verify their own identity. ${shown}`,
    links: [{ label: "Business Banking", href: "/business" }],
  }
}

/** A named payout country, or undefined. Corridor pages read their currency and rail from here, so they cannot drift. */
export function payoutCountry(name: string): PayoutCountry | undefined {
  return payoutByName.get(name)
}

/** The business answer for one payout country, as it appears on /answers. */
export function businessPayFaq(name: string): FaqItem {
  const country = payoutByName.get(name)
  if (!country) throw new Error(`No payout country named "${name}"`)
  return businessTo(country)
}

export function businessCorridorFaqs(): FaqItem[] {
  const items: FaqItem[] = []
  for (const country of PAYOUT_COUNTRIES) {
    if (country.name === "United States") continue
    items.push(businessTo(country))
  }
  for (const country of BUSINESS_SIGNUP) {
    if (country === "United States") continue
    if (closed.has(country)) continue
    items.push(businessFrom(country))
  }
  return items
}

export function payoutCountriesNamed() {
  return PAYOUT_COUNTRIES.map((country) => country.name)
}

function payoutFor(name: string): PayoutCountry | undefined {
  const direct = payoutByName.get(name)
  if (direct) return direct
  const alias = Object.entries(SIGNUP_ALIAS).find(([, signup]) => signup === name)?.[0]
  return alias ? payoutByName.get(alias) : undefined
}

/** Signup countries, then countries closed for both. Each name appears once. */
function accountCountries() {
  return [...BUSINESS_SIGNUP, ...CLOSED_FOR_BOTH]
}

function cashOut(country: string) {
  const payout = payoutFor(country)
  const place = spoken(country)
  if (!payout) return `Easner does not pay out local currency in ${place}.`
  return `They can keep dollars, or cash out in ${payout.currency} by ${railPhrase(payout)}.`
}

/** A country earns its own Connect answer only if Connect can pay there, or a person there can open an account. */
export function connectPayeeFaqs(): FaqItem[] {
  return accountCountries().filter((country) => businessCanSignUp(country) || payoutFor(country)).map((country) => {
    const place = spoken(country)
    const question = `How do I pay someone in ${place} with Easner Connect?`
    const links = [{ label: "Connect", href: "/connect" }]
    const payout = payoutFor(country)
    if (RECEIVE_ONLY.includes(country as (typeof RECEIVE_ONLY)[number]) && payout) {
      return {
        question,
        answer: `A payout to ${place} can be received in ${payout.currency} by ${railPhrase(payout)}. People and companies in ${place} cannot open an Easner account, so Easner Connect cannot pay them.`,
        links,
      }
    }
    if (!businessCanSignUp(country)) {
      return {
        question,
        answer: `People and companies in ${place} cannot open an Easner account, so Easner Connect cannot pay them.`,
        links,
      }
    }
    if (!appCanSignUp(country)) {
      return {
        question,
        answer: `The Easner app is not available in ${place}. A company there can open Easner Business, link once, and receive US dollars into that business account. A person there cannot open the app, so Connect cannot pay them into a personal Easner account. ${cashOut(country)}`,
        links,
      }
    }
    const us = country === "United States" ? ` ${usPartners}` : ""
    return {
      question,
      answer: `A person in ${place} opens the Easner app on iPhone, Android, or the [web](https://app.easner.com), verifies their identity, and links once. The platform pays from its Easner Business balance into that person's Easner account. Receiving into Easner is free for them. ${cashOut(country)}${us}`,
      links,
    }
  })
}

/** A country earns its own Payroll answer only if someone there can connect in the app, or gets a local payout. */
export function payrollPayeeFaqs(): FaqItem[] {
  return accountCountries().filter((country) => appCanSignUp(country) || payoutFor(country)).map((country) => {
    const place = spoken(country)
    const question = `How do I pay a contractor in ${place} with Easner Payroll?`
    const links = [{ label: "Payroll", href: "/payroll" }]
    if (!appCanSignUp(country)) {
      const reason = businessCanSignUp(country)
        ? `The Easner app is not available in ${place}, so a contractor there cannot connect to payroll in the app.`
        : `People in ${place} cannot open an Easner account, so they cannot connect to payroll in the app.`
      return {
        question,
        answer: `${reason} Payroll pays the company's own employees and contractors from Easner Business.`,
        links,
      }
    }
    const payout = payoutFor(country)
    const rail = payout
      ? `The local payout in ${place} is ${payout.currency} by ${railPhrase(payout)}.`
      : `Easner does not pay out local currency in ${place}. They can be paid to an EASETAG in US dollars.`
    const us = country === "United States" ? ` ${usPartners}` : ""
    return {
      question,
      answer: `Add the contractor in Easner Business and pay from the business balance. They connect in the Easner app on iPhone, Android, or the [web](https://app.easner.com). ${rail} A second person approves the payday before money moves.${us}`,
      links,
    }
  })
}

export function developerPayoutFaqs(): FaqItem[] {
  return PAYOUT_COUNTRIES.map((country) => ({
    question: `How do I send a payout to ${spoken(country.name)} with the Easner API?`,
    answer: `The Developer Banking API sends a payout to ${spoken(country.name)}. The recipient gets ${country.currency} by ${railPhrase(country)}. Customers see balances in regular currencies. This is not Connect and not White-label.`,
    links: [
      { label: "Developers", href: "/developers" },
      { label: "API docs", href: "https://docs.easner.com/" },
    ],
  }))
}

export function whiteLabelPayoutFaqs(): FaqItem[] {
  return PAYOUT_COUNTRIES.map((country) => ({
    question: `How do I offer a payout to ${spoken(country.name)} under my own brand?`,
    answer: `White-label runs that payout under your name, logo, and colour. The recipient in ${spoken(country.name)} gets ${country.currency} by ${railPhrase(country)}. Easner runs the infrastructure. You run the brand.`,
    links: [{ label: "White-label", href: "/white-label" }],
  }))
}
