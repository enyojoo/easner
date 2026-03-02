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
  address: string // The liquidation address (where to send crypto)
  blockchain_memo?: string // For memo-based blockchains like Stellar
  external_account_id?: string // For bank payouts
  bridge_wallet_id?: string // For wallet deposits (may not be in response)
  destination_payment_rail: string // e.g., "solana" for wallet deposits
  destination_currency: string // e.g., "usdc"
  destination_address?: string // The wallet address (destination for wallet deposits)
  destination_wire_message?: string
  state?: string // e.g., "active"
  created_at: string
  updated_at: string
}

interface CreateLiquidationAddressRequest {
  chain: string // e.g., "solana", "ethereum", "stellar"
  currency: string // e.g., "usdc", "eurc"
  external_account_id?: string // For bank payouts (wire)
  bridge_wallet_id?: string // For wallet deposits (solana, ethereum, etc.)
  destination_payment_rail: string // "wire" for bank, "solana"/"ethereum" etc. for wallet
  destination_currency: string // e.g., "usdc", "eurc"
  destination_wire_message?: string // Only for wire payouts
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
   * Create a liquidation address
   * For wallet deposits: use bridge_wallet_id as destination
   * For bank payouts: use external_account_id as destination
   */
  async createLiquidationAddress(
    customerId: string,
    liquidationData: {
      chain: string // e.g., "solana", "ethereum", "stellar"
      currency: string // e.g., "usdc", "eurc"
      externalAccountId?: string // For bank payouts (wire)
      bridgeWalletId?: string // For wallet deposits (solana, ethereum, etc.)
      destinationPaymentRail: string // "wire" for bank, "solana"/"ethereum" etc. for wallet
      destinationCurrency: string // e.g., "usdc", "eurc"
      destinationWireMessage?: string // Only for wire payouts
      idempotencyKey?: string
    },
  ): Promise<BridgeLiquidationAddress> {
    const request: CreateLiquidationAddressRequest = {
      chain: liquidationData.chain,
      currency: liquidationData.currency,
      destination_payment_rail: liquidationData.destinationPaymentRail,
      destination_currency: liquidationData.destinationCurrency,
    }

    // Add destination based on payment rail type
    if (liquidationData.destinationPaymentRail === "wire") {
      if (!liquidationData.externalAccountId) {
        throw new Error("externalAccountId is required for wire payouts")
      }
      request.external_account_id = liquidationData.externalAccountId
      request.destination_wire_message = liquidationData.destinationWireMessage
    } else {
      // For wallet deposits (solana, ethereum, etc.)
      if (!liquidationData.bridgeWalletId) {
        throw new Error("bridgeWalletId is required for wallet deposits")
      }
      request.bridge_wallet_id = liquidationData.bridgeWalletId
    }

    const headers: Record<string, string> = {}
    if (liquidationData.idempotencyKey) {
      headers["Idempotency-Key"] = liquidationData.idempotencyKey
    }

    const response = await bridgeApiRequest<BridgeLiquidationAddress | { data: BridgeLiquidationAddress }>(
      `/v0/customers/${customerId}/liquidation_addresses`,
      {
        method: "POST",
        body: JSON.stringify(request),
        headers,
      },
    )

    // Bridge API may return the object directly or wrapped in { data: ... }
    return (response as any).data || response
  },

  /**
   * Get liquidation address details
   */
  async getLiquidationAddress(
    customerId: string,
    liquidationAddressId: string,
  ): Promise<BridgeLiquidationAddress> {
    const response = await bridgeApiRequest<BridgeLiquidationAddress | { data: BridgeLiquidationAddress }>(
      `/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}`,
      {
        method: "GET",
      },
    )

    // Bridge API may return the object directly or wrapped in { data: ... }
    return (response as any).data || response
  },

  /**
   * List all liquidation addresses for a customer
   */
  async listLiquidationAddresses(customerId: string): Promise<BridgeLiquidationAddress[]> {
    const response = await bridgeApiRequest<BridgeLiquidationAddress[] | { data: BridgeLiquidationAddress[] }>(
      `/v0/customers/${customerId}/liquidation_addresses`,
      {
        method: "GET",
      },
    )

    // Bridge API may return the array directly or wrapped in { data: ... }
    return Array.isArray(response) ? response : (response as any).data || []
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

  /**
   * Get drain history for a liquidation address
   * Returns array of drain records (deposits to the liquidation address)
   */
  async getDrainHistory(
    customerId: string,
    liquidationAddressId: string,
  ): Promise<LiquidationDrain[]> {
    const response = await bridgeApiRequest<LiquidationDrain[] | { data: LiquidationDrain[] }>(
      `/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains`,
      {
        method: "GET",
      },
    )

    // Bridge API may return the array directly or wrapped in { data: ... }
    return Array.isArray(response) ? response : (response as any).data || []
  },
}

export interface LiquidationDrain {
  id: string
  amount: string
  currency: string
  state: string // 'in_review', 'funds_received', 'payment_submitted', 'payment_processed', etc.
  created_at: string
  destination?: {
    payment_rail?: string // 'solana', 'ethereum', 'wire', 'ach', etc.
    currency?: string // 'usdc', 'usd', etc.
    to_address?: string // For crypto destinations
    external_account_id?: string // For bank destinations
    imad?: string // For wire
    trace_number?: string // For ACH
  }
  destination_tx_hash?: string
  deposit_tx_hash?: string
}


