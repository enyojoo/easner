// Bridge Service for Mobile App
// Client-side service for Bridge API operations

import { supabase } from './supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

interface BridgeTOSLink {
  tosLink: string
  tosLinkId: string
}

interface BridgeCustomer {
  customerId: string
  kycStatus: string
  endorsements: any[]
  walletId?: string
  usdVirtualAccountId?: string
  eurVirtualAccountId?: string
  rejectionReasons?: any[]
}

interface BridgeVirtualAccount {
  hasAccount: boolean
  currency?: string
  accountNumber?: string
  routingNumber?: string
  iban?: string
  bic?: string
  bankName?: string
  accountHolderName?: string
  bankAddress?: string
  bankBeneficiaryAddress?: string
  status?: string
}

interface BridgeWalletBalances {
  USD: string
  EUR: string
}

interface BridgeTransfer {
  id: string
  amount: string
  currency: string
  status: string
}

interface BridgeKycLink {
  kyc_link: string
  tos_link?: string
  kyc_status?: string
  tos_status?: string
  customer_id?: string
  kyc_link_id?: string
}

export const bridgeService = {
  /**
   * Get TOS link for user
   */
  async getTOSLink(email: string, type: 'individual' | 'business' = 'individual'): Promise<BridgeTOSLink> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/tos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, type }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create TOS link')
    }

    return await response.json()
  },

  /**
   * Check if TOS has been accepted
   */
  async checkTOSStatus(tosLinkId: string): Promise<{ signed: boolean; signedAgreementId?: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/tos?tosLinkId=${tosLinkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check TOS status')
    }

    return await response.json()
  },

  /**
   * Get KYC link for user
   */
  async getKycLink(full_name: string, email: string, type: 'individual' | 'business' = 'individual'): Promise<BridgeKycLink> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/kyc-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ full_name, email, type }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create KYC link')
    }

    return await response.json()
  },

  /**
   * Update customer with signed_agreement_id after TOS acceptance
   * This is required because accepting TOS via hosted link doesn't automatically update the customer
   */
  async updateCustomerTOS(signedAgreementId: string): Promise<{ success: boolean; hasAcceptedTOS: boolean }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/customers/update-tos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        signedAgreementId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update customer TOS')
    }

    return await response.json()
  },

  /**
   * Create Bridge customer with KYC data
   * @deprecated Use createCustomerWithKyc instead - it reads KYC data from database
   */
  async createCustomer(customerData: any): Promise<BridgeCustomer> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(customerData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create customer')
    }

    return await response.json()
  },

  /**
   * Create Bridge customer using KYC data from database
   * This is the preferred method - it reads KYC submissions from the database
   * instead of requiring the full payload to be sent from mobile
   */
  async createCustomerWithKyc(data: {
    signedAgreementId: string
    needsUSD?: boolean
    needsEUR?: boolean
  }): Promise<BridgeCustomer> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        signedAgreementId: data.signedAgreementId,
        needsUSD: data.needsUSD ?? true,
        needsEUR: data.needsEUR ?? false,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create customer')
    }

    return await response.json()
  },

  /**
   * Get customer status
   */
  async getCustomerStatus(): Promise<BridgeCustomer | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
    const response = await fetch(`${API_BASE_URL}/api/bridge/customers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
        signal: controller.signal,
    })
      clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get customer status')
    }

    const data = await response.json()
    if (!data.hasCustomer) return null

    return {
      customerId: data.customerId,
      kycStatus: data.kycStatus,
      endorsements: data.endorsements || [],
      rejectionReasons: data.rejectionReasons,
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  },

  /**
   * Sync Bridge customer status to database
   * Fetches latest data from Bridge and updates user record
   * Returns updated status data
   */
  async syncStatus(): Promise<{ success: boolean; synced: boolean; data?: { kycStatus: string; rejectionReasons?: any[]; endorsements?: any[] } }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/bridge/sync-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sync status')
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Sync request timed out')
      }
      throw error
    }
  },

  /**
   * Get customer KYC status (polling)
   */
  async getCustomerKYCStatus(customerId: string): Promise<{ kycStatus: string; endorsements: any[] }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/customers/${customerId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get KYC status')
    }

    return await response.json()
  },

  /**
   * Get endorsement status
   */
  async getEndorsementStatus(customerId: string, endorsementName: 'base' | 'sepa'): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${API_BASE_URL}/api/bridge/customers/${customerId}/endorsements?name=${endorsementName}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get endorsement status')
    }

    return await response.json()
  },

  /**
   * Get virtual account details
   */
  async getVirtualAccount(currency: 'usd' | 'eur'): Promise<BridgeVirtualAccount> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
    const response = await fetch(`${API_BASE_URL}/api/bridge/virtual-accounts?currency=${currency}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
        signal: controller.signal,
    })
      clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get virtual account')
    }

    return await response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  },

  /**
   * Get liquidation address for receiving crypto deposits
   */
  async getLiquidationAddress(currency: 'usdc' | 'eurc', chain: 'solana' = 'solana'): Promise<{
    hasAddress: boolean
    currency?: string
    chain?: string
    address?: string
    memo?: string
    liquidationAddressId?: string
  }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(`${API_BASE_URL}/api/bridge/liquidation-addresses?currency=${currency}&chain=${chain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get liquidation address')
      }

      return await response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  },

  /**
   * Create liquidation address for receiving crypto deposits
   */
  async createLiquidationAddress(currency: 'usdc' | 'eurc', chain: 'solana' = 'solana'): Promise<{
    hasAddress: boolean
    currency?: string
    chain?: string
    address?: string
    memo?: string
    liquidationAddressId?: string
  }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(`${API_BASE_URL}/api/bridge/liquidation-addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency, chain }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create liquidation address')
      }

      return await response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  },

  /**
   * Get wallet balances (USD/EUR)
   */
  async getWalletBalances(): Promise<BridgeWalletBalances> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      console.log('[BridgeService] Fetching wallet balances from API...')
      const response = await fetch(`${API_BASE_URL}/api/bridge/wallets/balances`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[BridgeService] API error ${response.status}:`, errorText)
        // Return zero balances on error
        return { USD: '0', EUR: '0' }
      }

      const data = await response.json()
      console.log('[BridgeService] Received balances:', data)
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      // Return zero balances on timeout or error
      console.error('[BridgeService] Error fetching wallet balances:', error)
      return { USD: '0', EUR: '0' }
    }
  },

  /**
   * Create transfer from wallet to external bank account
   */
  async createTransfer(transferData: {
    amount: string
    currency: 'usd' | 'eur'
    sourceWalletId: string
    destinationExternalAccountId: string
  }): Promise<BridgeTransfer> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(transferData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create transfer')
    }

    return await response.json()
  },

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<BridgeTransfer> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/bridge/transfers/${transferId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get transfer status')
    }

    return await response.json()
  },
}

