import { SUPPORT_EMAIL } from "../constants"

/** App Store Connect / Google Play listing copy for Easner Mobile (Personal Banking). */

export const APP_STORE_PERSONAL_SUMMARY =
  "Easner is mobile banking for global money – send, receive, and manage funds in global and local currencies. Bank transfers and stablecoin, built so you can bank globally with Ease."

/** App Store subtitle (max 30 characters). */
export const APP_STORE_PERSONAL_SUBTITLE = "Bank globally with Ease"

/** App Store promotional text (max 170 characters; updatable without a new release). */
export const APP_STORE_PERSONAL_PROMOTIONAL_TEXT =
  "Send, receive, and manage money in global and local currencies. Bank transfers and stablecoin – bank globally with Ease."

/** Google Play short description (max 80 characters). */
export const APP_STORE_PERSONAL_PLAY_SHORT_DESCRIPTION =
  "Bank globally – send, receive, and manage money in global and local currencies."

/** App Store keywords (max 100 characters; comma-separated, no spaces after commas). */
export const APP_STORE_PERSONAL_KEYWORDS =
  "mobile banking,money transfer,multi-currency,stablecoin,cross-border,freelancer,diaspora,remittance"

export const APP_STORE_PERSONAL_SECTIONS = [
  {
    heading: "BANK GLOBALLY WITH EASE",
    body: "Manage multi-currency balances, send to saved recipients, receive by account details or stablecoin deposit address, and track every transaction in one place.",
  },
  {
    heading: "SEND MONEY YOUR WAY",
    body: "Send payments by bank transfer, stablecoin, open banking, or mobile money, and keep track of your activity in the app.",
  },
  {
    heading: "RECEIVE MONEY",
    body: "Get paid using account details or a stablecoin deposit address – choose Bank or Stablecoin on the Receive tab. No external crypto wallet setup required.",
  },
  {
    heading: "CARDS",
    body: "Spend from your Easner balances with personal cards – controls and activity, right in the app.",
  },
  {
    heading: "RECIPIENTS & EASETAG",
    body: "Save recipients, send by EASETAG (@handle), and move money between people you trust.",
  },
  {
    heading: "SECURITY YOU CAN USE",
    body: "Multi-factor authentication, PIN, and biometric unlock on supported devices.",
  },
  {
    heading: "WHO IT'S FOR",
    body: "Individuals 18 or older – freelancers, remote workers, diaspora, students, and families managing cross-border money.",
  },
] as const

export const APP_STORE_PERSONAL_IMPORTANT_DISCLAIMER =
  "Easner Group, Inc. is a financial technology company, not a bank. Banking and related services are provided by regulated partners. Easner is not FDIC-insured and does not hold customer deposits. Stablecoin and wallet features may operate on public blockchains. Digital assets are not legal tender and are not FDIC-insured or SIPC-protected. Blockchain transactions may be public and irreversible. Card products, when available, are subject to issuer approval. Fees and FX may apply. Processing times vary by corridor and review. Some features depend on verification status, jurisdiction, and product availability."

export const APP_STORE_PERSONAL_LEGAL_FOOTER =
  "Legals: easner.com/terms · easner.com/privacy · easner.com/delete-account · easner.com/compliance"

export const APP_STORE_PERSONAL_SUPPORT_FOOTER = `Questions? easner.com/contact or ${SUPPORT_EMAIL}`

/** Full listing description for App Store Connect and Google Play (copy-paste ready). */
export const APP_STORE_PERSONAL_FULL_DESCRIPTION = [
  APP_STORE_PERSONAL_SUMMARY,
  "",
  ...APP_STORE_PERSONAL_SECTIONS.flatMap(({ heading, body }) => [`${heading}: ${body}`, ""]),
  `IMPORTANT: ${APP_STORE_PERSONAL_IMPORTANT_DISCLAIMER}`,
  "",
  APP_STORE_PERSONAL_LEGAL_FOOTER,
  APP_STORE_PERSONAL_SUPPORT_FOOTER,
].join("\n")
