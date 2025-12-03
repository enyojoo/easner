/**
 * Mobile FX Engine
 * Self-contained FX calculation logic for mobile app
 * (Cannot import from root lib/ directory in React Native)
 */

import type { ExchangeRate } from '../types'

/**
 * Result of order amount calculation
 */
export interface OrderAmounts {
  sendAmount: number
  receiveAmount: number
  exchangeRate: number
  feeAmount: number
  feeType: string
  totalAmount: number
}

/**
 * Mobile FX Engine Service
 * Centralized exchange rate and fee calculation logic for mobile app
 */
export const mobileFxEngine = {
  /**
   * Find exchange rate from array
   * Tries direct rate first, then reverse rate (with inverse calculation)
   * 
   * @param exchangeRates - Array of exchange rates from database
   * @param fromCurrency - Source currency code (e.g., "USD")
   * @param toCurrency - Target currency code (e.g., "EUR")
   * @returns ExchangeRate object or null if not found
   */
  getRate(
    exchangeRates: ExchangeRate[],
    fromCurrency: string,
    toCurrency: string
  ): ExchangeRate | null {
    // Validate exchangeRates is an array
    if (!exchangeRates || !Array.isArray(exchangeRates)) {
      return null
    }

    // Same currency - no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        id: "",
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: 1,
        fee_type: "free",
        fee_amount: 0,
        status: "active",
        created_at: "",
        updated_at: "",
      }
    }

    // Try direct rate: fromCurrency → toCurrency
    const directRate = exchangeRates.find(
      (r) =>
        r.from_currency === fromCurrency &&
        r.to_currency === toCurrency &&
        r.status === "active"
    )
    if (directRate) return directRate

    // Try reverse rate: toCurrency → fromCurrency
    // If found, calculate inverse rate
    const reverseRate = exchangeRates.find(
      (r) =>
        r.from_currency === toCurrency &&
        r.to_currency === fromCurrency &&
        r.status === "active"
    )
    if (reverseRate && reverseRate.rate > 0) {
      // Calculate inverse rate and create a synthetic rate object
      // Note: Fee calculation should use the original rate's fee structure
      return {
        ...reverseRate,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: 1 / reverseRate.rate,
        // Keep original fee structure (fees are typically applied to send amount)
        fee_type: reverseRate.fee_type,
        fee_amount: reverseRate.fee_amount,
      }
    }

    return null
  },

  /**
   * Calculate fee based on rate data
   * 
   * @param amount - Amount to calculate fee on (typically send amount)
   * @param rateData - Exchange rate data containing fee information
   * @returns Fee amount
   */
  calculateFee(amount: number, rateData: ExchangeRate): number {
    if (!rateData || rateData.fee_type === "free") {
      return 0
    }

    if (rateData.fee_type === "fixed") {
      return rateData.fee_amount
    }

    if (rateData.fee_type === "percentage") {
      return (amount * rateData.fee_amount) / 100
    }

    return 0
  },

  /**
   * Calculate order amounts for currency conversion
   * Main calculation function used when creating transactions
   * Mobile app always uses 'receive' direction (user enters receive amount)
   * 
   * @param receiveAmount - Amount user entered (what recipient will receive)
   * @param sendCurrency - Source currency (what user is sending/paying with)
   * @param receiveCurrency - Target currency (what recipient receives)
   * @param exchangeRates - Array of exchange rates from UserDataContext
   * @returns Calculated order amounts including fees
   * @throws Error if exchange rate not found
   */
  calculateOrderAmounts(
    receiveAmount: number,
    sendCurrency: string,
    receiveCurrency: string,
    exchangeRates: ExchangeRate[]
  ): OrderAmounts {
    // Validate input
    if (receiveAmount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    if (!sendCurrency || !receiveCurrency) {
      throw new Error("Both sendCurrency and receiveCurrency are required")
    }

    // Get exchange rate
    const rateData = this.getRate(exchangeRates, sendCurrency, receiveCurrency)
    if (!rateData) {
      throw new Error(
        `Exchange rate not found for ${sendCurrency} to ${receiveCurrency}`
      )
    }

    // User entered receive amount (mobile app flow)
    // Calculate: sendAmount = receiveAmount / rate
    const receiveAmountFinal = receiveAmount
    const sendAmount = receiveAmountFinal / rateData.rate

    // Calculate fee on send amount
    const feeAmount = this.calculateFee(sendAmount, rateData)
    const totalAmount = sendAmount + feeAmount

    // Round all amounts to 2 decimal places
    return {
      sendAmount: Math.round(sendAmount * 100) / 100,
      receiveAmount: Math.round(receiveAmountFinal * 100) / 100,
      exchangeRate: rateData.rate,
      feeAmount: Math.round(feeAmount * 100) / 100,
      feeType: rateData.fee_type,
      totalAmount: Math.round(totalAmount * 100) / 100,
    }
  },

  /**
   * Validate that exchange rate exists
   * Simple validation function
   * 
   * @param exchangeRates - Array of exchange rates
   * @param fromCurrency - Source currency
   * @param toCurrency - Target currency
   * @returns true if rate exists, false otherwise
   */
  validateRate(
    exchangeRates: ExchangeRate[],
    fromCurrency: string,
    toCurrency: string
  ): boolean {
    return this.getRate(exchangeRates, fromCurrency, toCurrency) !== null
  },
}
