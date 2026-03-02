// Payment Collection Service
// Handles collecting fiat payments (stateless) for Send Money flow
// Returns virtual account details for users to send payments to

import { yellowCardService } from "./yellow-card-service"

const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

if (!BRIDGE_API_KEY) {
  console.warn("BRIDGE_API_KEY is not set. Payment collection API calls will fail.")
}

interface PaymentLink {
  id: string
  customer_id: string
  amount: string
  currency: string
  status: string
  payment_url: string
  expires_at?: string
  created_at: string
}

interface CreatePaymentLinkRequest {
  customer_id: string
  amount: string
  currency: string
  reference?: string
  expires_in_seconds?: number
  success_url?: string
  failure_url?: string
}

interface PaymentStatus {
  id: string
  status: "pending" | "paid" | "failed" | "expired"
  amount: string
  currency: string
  paid_at?: string
  failure_reason?: string
}

async function bridgeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BRIDGE_API_KEY) {
    throw new Error("BRIDGE_API_KEY is not configured")
  }

  const url = `${BRIDGE_API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    "Api-Key": BRIDGE_API_KEY,
    ...options.headers,
  }

  // Generate idempotency key if not provided
  if (!headers["Idempotency-Key"] && options.method === "POST") {
    headers["Idempotency-Key"] = `${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Payment Collection API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

interface VirtualAccountDetails {
  provider: "yellow_card" | "bridge"
  accountName: string
  accountNumber?: string
  bankName: string
  routingNumber?: string
  sortCode?: string
  iban?: string
  swiftBic?: string
  mobileMoneyNumber?: string // For Yellow Card mobile money
  reference?: string
  currency: string
}

export const paymentCollectionService = {
  /**
   * Get virtual account details for payment collection
   * - African currencies (NGN, KES, etc.) → Yellow Card virtual account/mobile money
   * - USD/EUR → Bridge virtual account
   */
  async getVirtualAccountDetails(
    currency: string,
    amount: string,
    reference?: string,
  ): Promise<VirtualAccountDetails> {
    const currencyUpper = currency.toUpperCase()

    // Route based on currency
    if (yellowCardService.isCurrencySupported(currencyUpper)) {
      // African currency → Yellow Card virtual account
      // This would call Yellow Card's API to get/create virtual account
      // For now, return structure (replace with actual API call)
      return {
        provider: "yellow_card",
        accountName: "Easner Payments", // This would come from Yellow Card
        accountNumber: "1234567890", // This would come from Yellow Card
        bankName: "Yellow Card Bank", // This would come from Yellow Card
        mobileMoneyNumber: "1234567890", // For mobile money (if applicable)
        reference: reference,
        currency: currencyUpper,
      }
    } else if (["USD", "EUR"].includes(currencyUpper)) {
      // USD/EUR → Bridge virtual account
      // This would call Bridge's API to get/create virtual account
      // For now, return structure (replace with actual API call)
      return {
        provider: "bridge",
        accountName: "Easner Payments", // This would come from Bridge
        accountNumber: "1234567890", // This would come from Bridge
        bankName: "Bridge Bank", // This would come from Bridge
        routingNumber: "123456789", // For USD ACH
        iban: "GB82WEST12345698765432", // For EUR SEPA
        swiftBic: "BRIDGEUS33", // This would come from Bridge
        reference: reference,
        currency: currencyUpper,
      }
    } else {
      throw new Error(`Unsupported currency for payment collection: ${currencyUpper}`)
    }
  },

  /**
   * Check if payment has been received (via webhook or polling)
   * This would be called by webhook handlers or polling services
   */
  async checkPaymentStatus(
    provider: "yellow_card" | "bridge",
    paymentReference: string,
  ): Promise<{ received: boolean; receivedAt?: string }> {
    // This would check with Yellow Card or Bridge if payment was received
    // For now, return placeholder (implement based on provider webhooks/polling)
    return {
      received: false,
    }
  },
}

