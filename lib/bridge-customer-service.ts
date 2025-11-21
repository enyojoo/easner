// Bridge Customer & External Account Service
// Handles Bridge customer creation and external bank account management

const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

if (!BRIDGE_API_KEY) {
  console.warn("BRIDGE_API_KEY is not set. Bridge API calls will fail.")
}

interface BridgeCustomer {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

interface BridgeExternalAccount {
  id: string
  customer_id: string
  account_type: "wire" | "ach" | "sepa"
  account_number?: string
  routing_number?: string
  iban?: string
  swift_bic?: string
  bank_name?: string
  account_holder_name?: string
  currency: string
  status: string
  created_at: string
  updated_at: string
}

interface CreateCustomerRequest {
  email?: string
  first_name?: string
  last_name?: string
  client_reference_id?: string
}

interface CreateExternalAccountRequest {
  account_type: "wire" | "ach" | "sepa"
  account_number?: string
  routing_number?: string
  iban?: string
  swift_bic?: string
  bank_name: string
  account_holder_name: string
  currency: string
  country?: string
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

export const bridgeCustomerService = {
  /**
   * Create a Bridge customer for a user
   */
  async createCustomer(
    userId: string,
    customerData: {
      email?: string
      firstName?: string
      lastName?: string
    },
  ): Promise<BridgeCustomer> {
    const request: CreateCustomerRequest = {
      email: customerData.email,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      client_reference_id: userId, // Use Easner user ID as reference
    }

    const response = await bridgeApiRequest<{ data: BridgeCustomer }>(
      "/v0/customers",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return response.data
  },

  /**
   * Get Bridge customer details
   */
  async getCustomer(customerId: string): Promise<BridgeCustomer> {
    const response = await bridgeApiRequest<{ data: BridgeCustomer }>(
      `/v0/customers/${customerId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * Create an external bank account for wire payouts
   */
  async createExternalAccount(
    customerId: string,
    accountData: {
      accountType: "wire" | "ach" | "sepa"
      accountNumber?: string
      routingNumber?: string
      iban?: string
      swiftBic?: string
      bankName: string
      accountHolderName: string
      currency: string
      country?: string
    },
  ): Promise<BridgeExternalAccount> {
    const request: CreateExternalAccountRequest = {
      account_type: accountData.accountType,
      account_number: accountData.accountNumber,
      routing_number: accountData.routingNumber,
      iban: accountData.iban,
      swift_bic: accountData.swiftBic,
      bank_name: accountData.bankName,
      account_holder_name: accountData.accountHolderName,
      currency: accountData.currency,
      country: accountData.country,
    }

    const response = await bridgeApiRequest<{ data: BridgeExternalAccount }>(
      `/v0/customers/${customerId}/external_accounts`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return response.data
  },

  /**
   * Get external account details
   */
  async getExternalAccount(
    customerId: string,
    externalAccountId: string,
  ): Promise<BridgeExternalAccount> {
    const response = await bridgeApiRequest<{ data: BridgeExternalAccount }>(
      `/v0/customers/${customerId}/external_accounts/${externalAccountId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * List all external accounts for a customer
   */
  async listExternalAccounts(customerId: string): Promise<BridgeExternalAccount[]> {
    const response = await bridgeApiRequest<{ data: BridgeExternalAccount[] }>(
      `/v0/customers/${customerId}/external_accounts`,
      {
        method: "GET",
      },
    )

    return response.data || []
  },
}


