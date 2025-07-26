import type { Currency, ExchangeRate } from "@/types"

export const currencies: Currency[] = [
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

export const formatCurrency = (amount: number, currency: string): string => {
  const curr = currencies.find((c) => c.code === currency)
  return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
