/** Local copies of marketing currency icons (tokens from Trust Wallet assets). */
export const TOKEN_LOGO = {
  USDC: "/marketing/tokens/usdc.png",
  EURC: "/marketing/tokens/eurc.png",
} as const

export const FIAT_FLAG = {
  USD: "/marketing/flags/us.png",
  EUR: "/marketing/flags/eu.png",
} as const

export type FiatCurrency = "USD" | "EUR"
export type StablecoinCurrency = "USDC" | "EURC"
export type CurrencyBadgeCode = FiatCurrency | StablecoinCurrency

export type FeatureDescriptionPart =
  | string
  | { badge: CurrencyBadgeCode }
