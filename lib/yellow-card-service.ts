// Yellow Card Service
// Handles African fiat payouts and collections (Send Money only)

const YELLOW_CARD_API_BASE_URL = process.env.YELLOW_CARD_API_BASE_URL || "https://api.yellowcard.io"
const YELLOW_CARD_API_KEY = process.env.YELLOW_CARD_API_KEY
const YELLOW_CARD_API_SECRET = process.env.YELLOW_CARD_API_SECRET
const YELLOW_CARD_SUPPORTED_CURRENCIES =
  process.env.YELLOW_CARD_SUPPORTED_CURRENCIES?.split(",") || ["NGN", "KES", "GHS"]

if (!YELLOW_CARD_API_KEY || !YELLOW_CARD_API_SECRET) {
  console.warn("YELLOW_CARD_API_KEY or YELLOW_CARD_API_SECRET is not set. Yellow Card API calls will fail.")
}

interface YellowCardDisbursement {
  id: string
  status: string
  amount: number
  currency: string
  recipient_account_number: string
  recipient_bank_name?: string
  recipient_name?: string
  fee: number
  created_at: string
  completed_at?: string
  failure_reason?: string
}

interface CreateDisbursementRequest {
  amount: number
  currency: string
  recipient_account_number: string
  recipient_bank_name?: string
  recipient_name?: string
  recipient_phone?: string
  recipient_email?: string
  reference?: string
}

interface YellowCardFeeEstimate {
  amount: number
  currency: string
  fee: number
  total: number
}

async function yellowCardApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!YELLOW_CARD_API_KEY || !YELLOW_CARD_API_SECRET) {
    throw new Error("Yellow Card API credentials are not configured")
  }

  const url = `${YELLOW_CARD_API_BASE_URL}${endpoint}`
  
  // Create basic auth header
  const credentials = Buffer.from(`${YELLOW_CARD_API_KEY}:${YELLOW_CARD_API_SECRET}`).toString("base64")
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Yellow Card API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

export const yellowCardService = {
  /**
   * Create a disbursement to African bank/mobile money
   */
  async createDisbursement(
    disbursementData: {
      amount: number
      currency: string
      recipientAccountNumber: string
      recipientBankName?: string
      recipientName?: string
      recipientPhone?: string
      recipientEmail?: string
      reference?: string
    },
  ): Promise<YellowCardDisbursement> {
    const request: CreateDisbursementRequest = {
      amount: disbursementData.amount,
      currency: disbursementData.currency,
      recipient_account_number: disbursementData.recipientAccountNumber,
      recipient_bank_name: disbursementData.recipientBankName,
      recipient_name: disbursementData.recipientName,
      recipient_phone: disbursementData.recipientPhone,
      recipient_email: disbursementData.recipientEmail,
      reference: disbursementData.reference,
    }

    const response = await yellowCardApiRequest<{ data: YellowCardDisbursement }>(
      "/v1/disbursements",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return response.data
  },

  /**
   * Get disbursement status
   */
  async getDisbursementStatus(disbursementId: string): Promise<YellowCardDisbursement> {
    const response = await yellowCardApiRequest<{ data: YellowCardDisbursement }>(
      `/v1/disbursements/${disbursementId}`,
      {
        method: "GET",
      },
    )

    return response.data
  },

  /**
   * Get supported African currencies
   */
  getSupportedCurrencies(): string[] {
    return YELLOW_CARD_SUPPORTED_CURRENCIES
  },

  /**
   * Estimate fees for a disbursement
   */
  async estimateFee(
    amount: number,
    currency: string,
  ): Promise<YellowCardFeeEstimate> {
    // This would typically call Yellow Card's fee estimation endpoint
    // For now, return a simple estimate (this should be replaced with actual API call)
    const feePercentage = 0.02 // 2% fee (example)
    const fee = amount * feePercentage
    const total = amount + fee

    return {
      amount,
      currency,
      fee,
      total,
    }
  },

  /**
   * Check if a currency is supported by Yellow Card
   */
  isCurrencySupported(currency: string): boolean {
    return YELLOW_CARD_SUPPORTED_CURRENCIES.includes(currency.toUpperCase())
  },
}


