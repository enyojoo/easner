/**
 * Easner money format (design system: Amount; mirrors formatMoneyDisplay in the product).
 * Symbol first, no space, comma thousands, dot decimals – the same for every currency:
 * "$24,190.32", "€12,480", "₦3,678.96", "KSh1,500.90". No ".00" on whole amounts unless
 * `cents: "always"` (balances and breakdowns). Symbols, never ISO codes; the CFA francs share
 * "CFA" with a space ("CFA 250,000"). Currencies without a minor unit never show decimals.
 * Negative amounts take a true minus (U+2212).
 */

const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  NGN: "₦",
  KES: "KSh",
  GHS: "₵",
  RWF: "R₣",
  ZAR: "R",
  RUB: "₽",
  XOF: "CFA",
  XAF: "CFA",
  USDC: "$",
  USDT: "$",
  EURC: "€",
}

const NO_MINOR = new Set(["XOF", "XAF", "RWF", "UGX", "JPY", "KRW"])

export const MINUS = "−"

export function currencySymbol(code: string): string {
  const upper = code.toUpperCase()
  if (SYMBOLS[upper]) return SYMBOLS[upper]
  try {
    const part = new Intl.NumberFormat("en-US", { style: "currency", currency: upper, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((p) => p.type === "currency")
    if (part?.value && part.value !== upper) return part.value
  } catch {
    // Unknown code: fall through to the code itself.
  }
  return upper
}

export interface MoneyParts {
  /** "−", "+" or "". */
  sign: string
  /** Symbol and whole units: "$24,190". */
  major: string
  /** ".32", or "" when no cents are shown. */
  minor: string
  /** The full string: "−$24,190.32". */
  text: string
}

export interface FormatMoneyOptions {
  /** "always" keeps ".00" (balances, breakdowns, receipts). */
  cents?: "auto" | "always"
  /** Prefix money in with "+". */
  signed?: boolean
}

export function moneyParts(
  value: number,
  currency = "USD",
  { cents = "auto", signed = false }: FormatMoneyOptions = {},
): MoneyParts {
  const code = currency.toUpperCase()
  const whole = Math.abs(Math.round(value * 100)) % 100 === 0
  const places = NO_MINOR.has(code) ? 0 : whole && cents !== "always" ? 0 : 2
  const digits = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places })
  const dot = digits.lastIndexOf(".")
  const symbol = currencySymbol(code)
  const major = symbol + (/^[A-Z]{3}$/.test(symbol) ? " " : "") + (dot === -1 ? digits : digits.slice(0, dot))
  const minor = dot === -1 ? "" : digits.slice(dot)
  const sign = value < 0 ? MINUS : signed && value > 0 ? "+" : ""
  return { sign, major, minor, text: sign + major + minor }
}

export function formatMoney(value: number, currency = "USD", options?: FormatMoneyOptions): string {
  return moneyParts(value, currency, options).text
}

/**
 * Exchange rate label with symbols on both sides: "$1 = ₦1,359", "$1 = ₵12.25", "₦1 = $0.00074".
 * Whole rates drop ".00"; rates of 1 or more show two decimals; smaller rates keep two or three significant digits.
 */
export function formatRate(from: string, to: string, rate: number): string {
  let digits: string
  if (Number.isInteger(rate)) digits = rate.toLocaleString("en-US")
  else if (rate >= 1) digits = rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  else {
    // Two significant digits, at least two decimals: 0.10, 0.049, 0.00098.
    const text = String(Number(rate.toPrecision(2)))
    const decimals = text.split(".")[1]?.length ?? 0
    digits = decimals < 2 ? Number(text).toFixed(2) : text
  }
  return `${currencySymbol(from)}1 = ${currencySymbol(to)}${digits}`
}
