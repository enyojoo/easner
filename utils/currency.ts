import { supabase } from "@/lib/supabase"

// Cache for currencies and exchange rates
let currenciesCache: any[] | null = null
let exchangeRatesCache: any[] | null = null
let currenciesCacheTime = 0
let exchangeRatesCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fetch currencies from database
export async function getCurrencies() {
  const now = Date.now()

  if (currenciesCache && now - currenciesCacheTime < CACHE_DURATION) {
    return currenciesCache
  }

  try {
    const { data, error } = await supabase
      .from("currencies")
      .select("id, code, name, symbol, flag_svg, status")
      .eq("status", "active")
      .order("code")

    if (error) throw error

    currenciesCache = data || []
    currenciesCacheTime = now
    return currenciesCache
  } catch (error) {
    console.error("Error fetching currencies:", error)
    return []
  }
}

// Fetch exchange rates from database
export async function getExchangeRates() {
  const now = Date.now()

  if (exchangeRatesCache && now - exchangeRatesCacheTime < CACHE_DURATION) {
    return exchangeRatesCache
  }

  try {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("id, from_currency, to_currency, rate, fee_type, fee_amount, status")
      .eq("status", "active")

    if (error) throw error

    exchangeRatesCache = data || []
    exchangeRatesCacheTime = now
    return exchangeRatesCache
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return []
  }
}

// Get currency symbol from database
export async function getCurrencySymbol(currencyCode: string): Promise<string> {
  const currencies = await getCurrencies()
  const currency = currencies.find((c) => c.code === currencyCode)
  return currency?.symbol || currencyCode
}

// Get currency symbol synchronously from cache
export function getCurrencySymbolSync(currencyCode: string): string {
  if (currenciesCache) {
    const currency = currenciesCache.find((c) => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }
  return currencyCode
}

// Format currency with symbol (async version)
export async function formatCurrency(amount: number, currencyCode = "NGN"): Promise<string> {
  const symbol = await getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Format currency with symbol (sync version using cache)
export function formatCurrencySync(amount: number, currencyCode = "NGN"): string {
  const symbol = getCurrencySymbolSync(currencyCode)
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Get exchange rate between two currencies
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1

  const rates = await getExchangeRates()
  const rate = rates.find((r) => r.from_currency === fromCurrency && r.to_currency === toCurrency)

  if (rate) {
    return rate.rate
  }

  // Try reverse rate
  const reverseRate = rates.find((r) => r.from_currency === toCurrency && r.to_currency === fromCurrency)
  if (reverseRate && reverseRate.rate > 0) {
    return 1 / reverseRate.rate
  }

  return null
}

// Convert amount between currencies
export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, toCurrency)
  if (rate === null) {
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
    return amount
  }
  return amount * rate
}

// Get fee information for currency conversion
export async function getConversionFee(
  fromCurrency: string,
  toCurrency: string,
): Promise<{ type: string; amount: number } | null> {
  const rates = await getExchangeRates()
  const rate = rates.find((r) => r.from_currency === fromCurrency && r.to_currency === toCurrency)

  if (rate) {
    return {
      type: rate.fee_type || "free",
      amount: rate.fee_amount || 0,
    }
  }

  return null
}

// Calculate total amount including fees
export async function calculateTotalWithFees(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<{ convertedAmount: number; feeAmount: number; totalAmount: number }> {
  const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency)
  const feeInfo = await getConversionFee(fromCurrency, toCurrency)

  let feeAmount = 0
  if (feeInfo) {
    if (feeInfo.type === "fixed") {
      feeAmount = feeInfo.amount
    } else if (feeInfo.type === "percentage") {
      feeAmount = (amount * feeInfo.amount) / 100
    }
  }

  return {
    convertedAmount,
    feeAmount,
    totalAmount: amount + feeAmount,
  }
}

// Clear cache (useful for admin updates)
export function clearCurrencyCache() {
  currenciesCache = null
  exchangeRatesCache = null
  currenciesCacheTime = 0
  exchangeRatesCacheTime = 0
}
