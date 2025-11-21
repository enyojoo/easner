// Circle Anchor Service for Fiat Operations
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY
const CIRCLE_API_SECRET = process.env.CIRCLE_API_SECRET
const CIRCLE_API_BASE_URL = process.env.CIRCLE_API_BASE_URL || "https://api.circle.com/v1"

interface CircleConversionRequest {
  source: {
    type: "wallet"
    id: string
  }
  destination: {
    type: "wallet"
    id: string
  }
  amount: {
    amount: string
    currency: string
  }
}

interface CircleConversionResponse {
  data: {
    id: string
    status: string
    source: {
      type: string
      id: string
    }
    destination: {
      type: string
      id: string
    }
    amount: {
      amount: string
      currency: string
    }
    fee: {
      amount: string
      currency: string
    }
    createDate: string
    updateDate: string
  }
}

interface CirclePayoutRequest {
  source: {
    type: "wallet"
    id: string
  }
  destination: {
    type: "wire"
    id: string
  }
  amount: {
    amount: string
    currency: string
  }
  idempotencyKey: string
}

interface CirclePayoutResponse {
  data: {
    id: string
    status: string
    source: {
      type: string
      id: string
    }
    destination: {
      type: string
      id: string
    }
    amount: {
      amount: string
      currency: string
    }
    fee: {
      amount: string
      currency: string
    }
    createDate: string
    updateDate: string
  }
}

interface CircleExchangeRateResponse {
  data: {
    base: string
    quote: string
    rate: string
  }
}

async function circleApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!CIRCLE_API_KEY) {
    throw new Error("CIRCLE_API_KEY must be set")
  }

  const response = await fetch(`${CIRCLE_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CIRCLE_API_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(`Circle API error: ${error.message || response.statusText}`)
  }

  return response.json()
}

export const circleAnchorService = {
  /**
   * Convert USDC to fiat currency via Circle Anchor
   */
  async convertCryptoToFiat(
    cryptoAmount: number,
    cryptoCurrency: string,
    fiatCurrency: string,
    sourceWalletId: string,
    destinationWalletId: string,
  ): Promise<{
    conversionId: string
    status: string
    fiatAmount: number
    fee: number
  }> {
    const request: CircleConversionRequest = {
      source: {
        type: "wallet",
        id: sourceWalletId,
      },
      destination: {
        type: "wallet",
        id: destinationWalletId,
      },
      amount: {
        amount: cryptoAmount.toFixed(2),
        currency: cryptoCurrency,
      },
    }

    const response = await circleApiRequest<CircleConversionResponse>(
      "/exchanges",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return {
      conversionId: response.data.id,
      status: response.data.status,
      fiatAmount: parseFloat(response.data.amount.amount),
      fee: parseFloat(response.data.fee.amount),
    }
  },

  /**
   * Initiate fiat deposit to bank account via Circle Anchor
   */
  async initiateFiatDeposit(
    transactionId: string,
    sourceWalletId: string,
    destinationId: string,
    amount: number,
    currency: string,
  ): Promise<{
    payoutId: string
    status: string
  }> {
    const request: CirclePayoutRequest = {
      source: {
        type: "wallet",
        id: sourceWalletId,
      },
      destination: {
        type: "wire",
        id: destinationId,
      },
      amount: {
        amount: amount.toFixed(2),
        currency: currency,
      },
      idempotencyKey: transactionId,
    }

    const response = await circleApiRequest<CirclePayoutResponse>(
      "/transfers",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    )

    return {
      payoutId: response.data.id,
      status: response.data.status,
    }
  },

  /**
   * Get conversion status
   */
  async getConversionStatus(conversionId: string): Promise<{
    status: string
    amount: number
    fee: number
  }> {
    const response = await circleApiRequest<CircleConversionResponse>(`/exchanges/${conversionId}`)

    return {
      status: response.data.status,
      amount: parseFloat(response.data.amount.amount),
      fee: parseFloat(response.data.fee.amount),
    }
  },

  /**
   * Get payout status
   */
  async getPayoutStatus(payoutId: string): Promise<{
    status: string
    amount: number
  }> {
    const response = await circleApiRequest<CirclePayoutResponse>(`/transfers/${payoutId}`)

    return {
      status: response.data.status,
      amount: parseFloat(response.data.amount.amount),
    }
  },

  /**
   * Get current exchange rate
   */
  async getExchangeRate(cryptoCurrency: string, fiatCurrency: string): Promise<number> {
    const response = await circleApiRequest<CircleExchangeRateResponse>(
      `/exchanges/rates?base=${cryptoCurrency}&quote=${fiatCurrency}`,
    )

    return parseFloat(response.data.rate)
  },
}

