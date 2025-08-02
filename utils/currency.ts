import type { Currency, ExchangeRate } from "@/types"
import { currencyService } from "@/lib/database"

// Cache for currencies and exchange rates
let currenciesCache: Currency[] | null = null
let exchangeRatesCache: any[] | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Get currencies from database
export const getCurrencies = async (): Promise<Currency[]> => {
  // Check cache first
  if (currenciesCache && Date.now() - lastFetch < CACHE_DURATION) {
    return currenciesCache
  }

  const currencies = await currencyService.getAll()
  currenciesCache = currencies
  lastFetch = Date.now()
  return currencies
}

// Get exchange rates from database
export const getExchangeRates = async (): Promise<any[]> => {
  // Check cache first
  if (exchangeRatesCache && Date.now() - lastFetch < CACHE_DURATION) {
    return exchangeRatesCache
  }

  const rates = await currencyService.getExchangeRates()
  exchangeRatesCache = rates
  return rates
}

// Legacy exports - now empty arrays, should use async functions above
export const currencies: Currency[] = []
export const exchangeRates: ExchangeRate[] = []

export const getExchangeRate = async (from: string, to: string): Promise<any | null> => {
  const rates = await getExchangeRates()
  return rates.find((r) => r.from_currency === from && r.to_currency === to) || null
}

export const convertCurrency = async (amount: number, from: string, to: string): Promise<number> => {
  if (from === to) return amount

  const rateData = await getExchangeRate(from, to)
  if (!rateData) return amount

  return amount * rateData.rate
}

export const calculateFee = async (
  amount: number,
  from: string,
  to: string,
): Promise<{ fee: number; feeType: string }> => {
  const rateData = await getExchangeRate(from, to)
  if (!rateData || rateData.fee_type === "free") {
    return { fee: 0, feeType: "free" }
  }

  if (rateData.fee_type === "fixed") {
    return { fee: rateData.fee_amount, feeType: "fixed" }
  }

  if (rateData.fee_type === "percentage") {
    return { fee: (amount * rateData.fee_amount) / 100, feeType: "percentage" }
  }

  return { fee: 0, feeType: "free" }
}

export const formatCurrency = async (amount: number, currency: string): Promise<string> => {
  const currencies = await getCurrencies()
  const curr = currencies.find((c) => c.code === currency)
  return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Synchronous version for components that need immediate formatting (uses cache)
export const formatCurrencySync = (amount: number, currency: string): string => {
  if (currenciesCache) {
    const curr = currenciesCache.find((c) => c.code === currency)
    if (curr) {
      return `${curr.symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }

  // If no cache available, return without symbol
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
