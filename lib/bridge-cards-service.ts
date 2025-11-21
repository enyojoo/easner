// Bridge Cards Service
// Handles Bridge Cards API operations with Top-Up funding strategy

const BRIDGE_CARDS_API_BASE_URL =
  process.env.BRIDGE_CARDS_API_BASE_URL || process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

if (!BRIDGE_API_KEY) {
  console.warn("BRIDGE_API_KEY is not set. Bridge Cards API calls will fail.")
}

interface BridgeCardAccount {
  id: string
  customer_id: string
  client_reference_id?: string
  cardholder_name: {
    first_name: string
    last_name: string
  }
  status: string
  freezes: any[]
  created_at: string
  card_details?: {
    last_4: string
    expiry: string
    bin: string
  }
  balances: {
    available: {
      amount: string
      currency: string
    }
    hold: {
      amount: string
      currency: string
    }
  }
  funding_instructions?: {
    address: string
    chain: string
    currency: string
  }
  crypto_account?: {
    account_type: "top_up" | "bridge_wallet" | "non_custodial"
    chain?: string
    address?: string
  }
}

interface CreateCardAccountRequest {
  chain: string // e.g., "solana", "ethereum", "stellar"
  currency: string // e.g., "usdc", "eurc"
  cardholder_name: {
    first_name: string
    last_name: string
  }
  client_reference_id?: string
  // Note: For Top-Up strategy, we don't specify crypto_account
  // Bridge automatically creates wallet and deposit addresses
}

interface BridgeCardTransaction {
  id: string
  card_account_id: string
  amount: string
  currency: string
  status: string
  type: string
  merchant_name?: string
  created_at: string
}

interface CreateWithdrawalRequest {
  amount: string
  currency: string
  destination: {
    type: string
    address: string
    chain?: string
  }
}

async function bridgeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BRIDGE_API_KEY) {
    throw new Error("BRIDGE_API_KEY is not configured")
  }

  const url = `${BRIDGE_CARDS_API_BASE_URL}${endpoint}`
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
    throw new Error(`Bridge Cards API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

export const bridgeCardsService = {
  /**
   * Create a Bridge customer for cards (if not already exists)
   * Note: This may be the same customer used for other Bridge services
   */
  async createCustomer(
    userId: string,
    customerData: {
      email?: string
      firstName: string
      lastName: string
    },
  ): Promise<{ id: string }> {
    const request = {
      email: customerData.email,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      client_reference_id: userId,
    }

    const response = await bridgeApiRequest<{ data: { id: string } }>("/v0/customers", {
      method: "POST",
      body: JSON.stringify(request),
    })

    return response.data
  },

  /**
   * Get Bridge customer details
   */
  async getCustomer(customerId: string): Promise<{ id: string; email?: string }> {
    const response = await bridgeApiRequest<{ data: { id: string; email?: string } }>(
      `/v0/customers/${customerId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * Create a card account with Top-Up funding strategy
   * Bridge automatically creates a wallet and deposit addresses
   */
  async createCardAccount(
    customerId: string,
    cardData: {
      chain: string // e.g., "solana", "ethereum", "stellar"
      currency: string // e.g., "usdc", "eurc"
      firstName: string
      lastName: string
      clientReferenceId?: string
    },
  ): Promise<BridgeCardAccount> {
    const request: CreateCardAccountRequest = {
      chain: cardData.chain,
      currency: cardData.currency,
      cardholder_name: {
        first_name: cardData.firstName,
        last_name: cardData.lastName,
      },
      client_reference_id: cardData.clientReferenceId,
      // No crypto_account specified = Top-Up strategy
    }

    const response = await bridgeApiRequest<{ data: BridgeCardAccount }>(
      `/v0/customers/${customerId}/card_accounts`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return response.data
  },

  /**
   * Get card account details from Bridge
   * Includes funding_instructions with deposit address for Top-Up strategy
   */
  async getCardAccount(cardAccountId: string): Promise<BridgeCardAccount> {
    const response = await bridgeApiRequest<{ data: BridgeCardAccount }>(
      `/v0/card_accounts/${cardAccountId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * Get card balance from Bridge card account (source of truth)
   */
  async getCardBalance(cardAccountId: string): Promise<{
    available: { amount: string; currency: string }
    hold: { amount: string; currency: string }
  }> {
    const cardAccount = await this.getCardAccount(cardAccountId)
    return cardAccount.balances
  },

  /**
   * Get card transaction history from Bridge
   */
  async getCardTransactions(
    cardAccountId: string,
    limit = 50,
  ): Promise<BridgeCardTransaction[]> {
    const response = await bridgeApiRequest<{ data: BridgeCardTransaction[] }>(
      `/v0/card_accounts/${cardAccountId}/transactions?limit=${limit}`,
      {
        method: "GET",
      },
    )

    return response.data || []
  },

  /**
   * Get deposit address from card account's funding_instructions
   * This is used for Top-Up strategy - users send stablecoins to this address
   */
  async getFundingInstructions(cardAccountId: string): Promise<{
    address: string
    chain: string
    currency: string
  }> {
    const cardAccount = await this.getCardAccount(cardAccountId)
    if (!cardAccount.funding_instructions) {
      throw new Error("Card account does not have funding instructions (not Top-Up strategy?)")
    }
    return cardAccount.funding_instructions
  },

  /**
   * Create a withdrawal request from card top-up wallet
   * Funds are held in the top-up wallet until withdrawn
   */
  async createWithdrawal(
    cardAccountId: string,
    withdrawalData: {
      amount: string
      currency: string
      destinationType: string
      destinationAddress: string
      destinationChain?: string
    },
  ): Promise<{ id: string; status: string }> {
    const request: CreateWithdrawalRequest = {
      amount: withdrawalData.amount,
      currency: withdrawalData.currency,
      destination: {
        type: withdrawalData.destinationType,
        address: withdrawalData.destinationAddress,
        chain: withdrawalData.destinationChain,
      },
    }

    const response = await bridgeApiRequest<{ data: { id: string; status: string } }>(
      `/v0/card_accounts/${cardAccountId}/withdrawals`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return response.data
  },

  /**
   * Get supported card currencies from Bridge
   */
  async getSupportedCurrencies(): Promise<string[]> {
    // This would typically come from Bridge's supported currencies endpoint
    // For now, return common currencies
    return ["usdc", "eurc"]
  },
}

