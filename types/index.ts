export interface Currency {
  code: "RUB" | "NGN"
  name: string
  symbol: string
  flag: string
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  fee: {
    type: "free" | "fixed" | "percentage"
    amount: number // For fixed: actual amount, for percentage: percentage value
  }
}

export interface User {
  id: string
  email: string
  name: string
}

export interface Transaction {
  id: string
  amount: number
  fromCurrency: string
  toCurrency: string
  recipientAmount: number
  fee: number
  feeType: "free" | "fixed" | "percentage"
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: Date
  recipientName: string
}
