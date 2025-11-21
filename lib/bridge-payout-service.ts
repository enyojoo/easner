// Bridge Payout Service
// Handles USD/EUR bank payouts (Send Money)

const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

if (!BRIDGE_API_KEY) {
  console.warn("BRIDGE_API_KEY is not set. Bridge Payout API calls will fail.")
}

interface BridgePayout {
  id: string
  customer_id: string
  external_account_id: string
  amount: string
  currency: string
  status: string
  payment_rail: "wire" | "ach" | "sepa"
  created_at: string
  completed_at?: string
  failure_reason?: string
}

interface CreatePayoutRequest {
  external_account_id: string
  amount: string
  currency: string
  payment_rail: "wire" | "ach" | "sepa"
  reference?: string
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
    throw new Error(`Bridge Payout API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

export const bridgePayoutService = {
  /**
   * Create a payout to USD/EUR bank account
   */
  async createPayout(
    customerId: string,
    payoutData: {
      externalAccountId: string
      amount: string
      currency: string
      paymentRail: "wire" | "ach" | "sepa"
      reference?: string
      idempotencyKey?: string
    },
  ): Promise<BridgePayout> {
    const request: CreatePayoutRequest = {
      external_account_id: payoutData.externalAccountId,
      amount: payoutData.amount,
      currency: payoutData.currency,
      payment_rail: payoutData.paymentRail,
      reference: payoutData.reference,
    }

    const headers: Record<string, string> = {}
    if (payoutData.idempotencyKey) {
      headers["Idempotency-Key"] = payoutData.idempotencyKey
    }

    const response = await bridgeApiRequest<{ data: BridgePayout }>(
      `/v0/customers/${customerId}/payouts`,
      {
        method: "POST",
        body: JSON.stringify(request),
        headers,
      },
    )

    return response.data
  },

  /**
   * Get payout status
   */
  async getPayoutStatus(customerId: string, payoutId: string): Promise<BridgePayout> {
    const response = await bridgeApiRequest<{ data: BridgePayout }>(
      `/v0/customers/${customerId}/payouts/${payoutId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * Get supported currencies (USD, EUR)
   */
  getSupportedCurrencies(): string[] {
    return ["USD", "EUR"]
  },
}


