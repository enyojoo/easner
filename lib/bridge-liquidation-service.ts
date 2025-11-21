// Bridge Liquidation Address Service
// Handles Bridge Liquidation Addresses for automatic conversion and payout (bank payouts only)

const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

if (!BRIDGE_API_KEY) {
  console.warn("BRIDGE_API_KEY is not set. Bridge API calls will fail.")
}

interface BridgeLiquidationAddress {
  id: string
  customer_id: string
  chain: string
  currency: string
  address: string
  blockchain_memo?: string // For memo-based blockchains like Stellar
  external_account_id?: string
  destination_payment_rail: string
  destination_currency: string
  destination_wire_message?: string
  created_at: string
  updated_at: string
}

interface CreateLiquidationAddressRequest {
  chain: string // e.g., "ethereum", "stellar"
  currency: string // e.g., "usdc", "eurc"
  external_account_id: string
  destination_payment_rail: "wire"
  destination_currency: string
  destination_wire_message?: string
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
    throw new Error(`Bridge API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

export const bridgeLiquidationService = {
  /**
   * Create a liquidation address pointing to a bank account (wire payouts only)
   * Note: Cards use Top-Up deposit addresses, not Liquidation Addresses
   */
  async createLiquidationAddress(
    customerId: string,
    liquidationData: {
      chain: string // e.g., "ethereum", "stellar"
      currency: string // e.g., "usdc", "eurc"
      externalAccountId: string
      destinationCurrency: string
      destinationWireMessage?: string
      idempotencyKey?: string
    },
  ): Promise<BridgeLiquidationAddress> {
    const request: CreateLiquidationAddressRequest = {
      chain: liquidationData.chain,
      currency: liquidationData.currency,
      external_account_id: liquidationData.externalAccountId,
      destination_payment_rail: "wire",
      destination_currency: liquidationData.destinationCurrency,
      destination_wire_message: liquidationData.destinationWireMessage,
    }

    const headers: Record<string, string> = {}
    if (liquidationData.idempotencyKey) {
      headers["Idempotency-Key"] = liquidationData.idempotencyKey
    }

    const response = await bridgeApiRequest<{ data: BridgeLiquidationAddress }>(
      `/v0/customers/${customerId}/liquidation_addresses`,
      {
        method: "POST",
        body: JSON.stringify(request),
        headers,
      },
    )

    return response.data
  },

  /**
   * Get liquidation address details
   */
  async getLiquidationAddress(
    customerId: string,
    liquidationAddressId: string,
  ): Promise<BridgeLiquidationAddress> {
    const response = await bridgeApiRequest<{ data: BridgeLiquidationAddress }>(
      `/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * List all liquidation addresses for a customer
   */
  async listLiquidationAddresses(customerId: string): Promise<BridgeLiquidationAddress[]> {
    const response = await bridgeApiRequest<{ data: BridgeLiquidationAddress[] }>(
      `/v0/customers/${customerId}/liquidation_addresses`,
      {
        method: "GET",
      },
    )

    return response.data || []
  },

  /**
   * Delete a liquidation address (if needed)
   */
  async deleteLiquidationAddress(
    customerId: string,
    liquidationAddressId: string,
  ): Promise<void> {
    await bridgeApiRequest(
      `/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}`,
      {
        method: "DELETE",
      },
    )
  },
}


