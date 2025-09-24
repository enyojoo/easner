import type { Currency, ExchangeRate } from "@/types"

export const currencies: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#b22234" d="M0 0h32v2.4H0z"></path><path fill="#fff" d="M0 2.4h32v2.4H0z"></path><path fill="#b22234" d="M0 4.8h32v2.4H0z"></path><path fill="#fff" d="M0 7.2h32v2.4H0z"></path><path fill="#b22234" d="M0 9.6h32v2.4H0z"></path><path fill="#fff" d="M0 12h32v2.4H0z"></path><path fill="#b22234" d="M0 14.4h32v2.4H0z"></path><path fill="#fff" d="M0 16.8h32v2.4H0z"></path><path fill="#b22234" d="M0 19.2h32v2.4H0z"></path><path fill="#fff" d="M0 21.6h32v2.4H0z"></path><path fill="#b22234" d="M0 24h32v2.4H0z"></path><path fill="#fff" d="M0 26.4h32v2.4H0z"></path><path fill="#b22234" d="M0 28.8h32v2.4H0z"></path><path fill="#3c3b6e" d="M0 0h12.8v16.8H0z"></path><path fill="#fff" d="M1.6 1.6h9.6v1.6H1.6z"></path><path fill="#fff" d="M1.6 4.8h9.6v1.6H1.6z"></path><path fill="#fff" d="M1.6 8h9.6v1.6H1.6z"></path><path fill="#fff" d="M1.6 11.2h9.6v1.6H1.6z"></path><path fill="#fff" d="M1.6 14.4h9.6v1.6H1.6z"></path></svg>`,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#003399" d="M0 0h32v32H0z"></path><path fill="#ffcc00" d="M16 4c6.627 0 12 5.373 12 12s-5.373 12-12 12c-2.381 0-4.6-.694-6.47-1.89L16 20.5l6.47 5.61C20.6 27.306 18.381 28 16 28c-6.627 0-12-5.373-12-12S9.373 4 16 4z"></path><path fill="#003399" d="M16 6c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.657 0-3.2-.402-4.57-1.11L16 22.5l4.57 2.39C19.2 25.598 17.657 26 16 26c-5.523 0-10-4.477-10-10S10.477 6 16 6z"></path></svg>`,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#012169" d="M0 0h32v32H0z"></path><path fill="#fff" d="M0 0l32 32M32 0L0 32" stroke="#c8102e" stroke-width="6.4"></path><path fill="#c8102e" d="M0 0l32 32M32 0L0 32" stroke="#fff" stroke-width="2.4"></path><path fill="#c8102e" d="M16 0v32M0 16h32" stroke="#c8102e" stroke-width="4.8"></path><path fill="#c8102e" d="M16 0v32M0 16h32" stroke="#fff" stroke-width="2.4"></path></svg>`,
  },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#1435a1" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#fff"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#c53a28"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#3b8655"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#3b8655"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.657,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  },
]

export const exchangeRates: ExchangeRate[] = [
  {
    from: "RUB",
    to: "NGN",
    rate: 22.45,
    fee: {
      type: "free",
      amount: 0,
    },
  },
  {
    from: "NGN",
    to: "RUB",
    rate: 0.0445,
    fee: {
      type: "percentage",
      amount: 1.5, // 1.5%
    },
  },
]

export const getExchangeRate = (from: string, to: string): ExchangeRate | null => {
  return exchangeRates.find((r) => r.from === from && r.to === to) || null
}

export const convertCurrency = (amount: number, from: string, to: string): number => {
  const rateData = getExchangeRate(from, to)
  if (!rateData) return amount
  return amount * rateData.rate
}

export const calculateFee = (amount: number, from: string, to: string): { fee: number; feeType: string } => {
  const rateData = getExchangeRate(from, to)
  if (!rateData || rateData.fee.type === "free") {
    return { fee: 0, feeType: "free" }
  }

  if (rateData.fee.type === "fixed") {
    return { fee: rateData.fee.amount, feeType: "fixed" }
  }

  if (rateData.fee.type === "percentage") {
    return { fee: (amount * rateData.fee.amount) / 100, feeType: "percentage" }
  }

  return { fee: 0, feeType: "free" }
}

export const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toFixed(0)
}

export const formatCurrency = (amount: number, currency: string): string => {
  const curr = currencies.find((c) => c.code === currency)
  return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatCurrencyWithRounding = (amount: number, currency: string): string => {
  const curr = currencies.find((c) => c.code === currency)
  const formattedNumber = formatNumber(amount)
  return `${curr?.symbol || ""}${formattedNumber}`
}
