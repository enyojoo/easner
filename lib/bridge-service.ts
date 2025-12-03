// Unified Bridge Service
// Consolidates all Bridge API operations with authentication

const BRIDGE_API_BASE_URL = process.env.BRIDGE_API_BASE_URL || "https://api.bridge.xyz"
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

// Log API key status on module load (for debugging)
if (!BRIDGE_API_KEY) {
  console.warn("⚠️ BRIDGE_API_KEY is not set. Bridge API calls will fail.")
} else {
  console.log(`✅ BRIDGE_API_KEY loaded: ${BRIDGE_API_KEY.substring(0, 10)}... (length: ${BRIDGE_API_KEY.length})`)
  // Validate API key format
  if (!BRIDGE_API_KEY.startsWith('sk-')) {
    console.warn(`⚠️ BRIDGE_API_KEY doesn't start with 'sk-' - this might be invalid. Expected format: sk-live-...`)
  }
  if (!BRIDGE_API_KEY.startsWith('sk-live')) {
    console.warn(`⚠️ API key doesn't start with 'sk-live' - ensure you're using a production API key`)
  }
}

/**
 * Make authenticated request to Bridge API
 */
async function bridgeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BRIDGE_API_KEY) {
    throw new Error("BRIDGE_API_KEY is not configured. Please set BRIDGE_API_KEY in your environment variables.")
  }

  const url = `${BRIDGE_API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Api-Key": BRIDGE_API_KEY!,
    ...(options.headers as Record<string, string>),
  }
  
  // Log request details (without exposing full API key)
  console.log(`[BRIDGE-API] Making request:`, {
    method: options.method || 'GET',
    url,
    endpoint,
    hasApiKey: !!BRIDGE_API_KEY,
    apiKeyPrefix: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 10)}...` : 'NOT SET',
    apiKeyLength: BRIDGE_API_KEY?.length || 0,
    headerKeys: Object.keys(headers),
    hasApiKeyHeader: !!headers["Api-Key"],
  })

  // Generate idempotency key if not provided for POST requests only
  // Note: PUT requests to /v0/customers/{customerID} do NOT support Idempotency-Key
  // Only add it for POST requests
  if (!headers["Idempotency-Key"] && options.method === "POST") {
    headers["Idempotency-Key"] = `${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  // Add timeout to fetch request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  let response: Response
  try {
    response = await fetch(url, {
    ...options,
    headers,
      signal: controller.signal,
  })
    clearTimeout(timeoutId)
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Bridge API request timed out after 30 seconds: ${endpoint}`)
    }
    throw error
  }

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Bridge API error: ${response.status}`
    let errorDetails: any = {}
    
    // Log authentication errors with more detail - including FULL response from Bridge
    if (response.status === 401) {
      // Get all response headers for debugging
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      // Log the FULL Bridge response - this is critical for debugging
      console.error(`\n========== BRIDGE API 401 ERROR - FULL RESPONSE ==========`)
      console.error(`[BRIDGE-API] Endpoint: ${endpoint}`)
      console.error(`[BRIDGE-API] URL: ${url}`)
      console.error(`[BRIDGE-API] Status: ${response.status} ${response.statusText}`)
      console.error(`[BRIDGE-API] Response Headers:`, JSON.stringify(responseHeaders, null, 2))
      console.error(`[BRIDGE-API] Response Body (RAW from Bridge):`, errorText)
      console.error(`[BRIDGE-API] Request Method: ${options.method || 'GET'}`)
      console.error(`[BRIDGE-API] Request Body:`, options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : 'NO BODY')
      console.error(`[BRIDGE-API] Request Headers:`, {
        'Content-Type': headers['Content-Type'],
        'Api-Key': headers['Api-Key'] ? `${headers['Api-Key'].substring(0, 10)}...` : 'NOT SET',
        'Idempotency-Key': headers['Idempotency-Key'] || 'NOT SET',
      })
      console.error(`[BRIDGE-API] API Key Info:`, {
        hasApiKey: !!BRIDGE_API_KEY,
        apiKeyPrefix: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 10)}...` : 'NOT SET',
        apiKeyLength: BRIDGE_API_KEY?.length || 0,
        apiKeyStartsWith: BRIDGE_API_KEY?.substring(0, 7) || 'NOT SET',
        baseUrl: BRIDGE_API_BASE_URL,
      })
      console.error(`===========================================================\n`)
    }
    
    try {
      const errorJson = JSON.parse(errorText)
      // Bridge API may return detailed error information
      errorMessage = errorJson.message || errorJson.error || errorMessage
      errorDetails = errorJson
      
      // Log the FULL error JSON from Bridge for 401 errors
      if (response.status === 401) {
        console.error(`\n[BRIDGE-API] Parsed Error JSON from Bridge:`)
        console.error(JSON.stringify(errorJson, null, 2))
        console.error(`[BRIDGE-API] Raw error text (exact response from Bridge):`, errorText)
        console.error(`\n`)
      }
      
      // Extract missing/invalid parameters if provided
      if (errorJson.missing_parameters || errorJson.invalid_parameters) {
        const missing = errorJson.missing_parameters || []
        const invalid = errorJson.invalid_parameters || []
        const paramErrors = []
        if (missing.length > 0) {
          paramErrors.push(`Missing: ${missing.join(', ')}`)
        }
        if (invalid.length > 0) {
          paramErrors.push(`Invalid: ${invalid.join(', ')}`)
        }
        if (paramErrors.length > 0) {
          errorMessage = `${errorMessage}. ${paramErrors.join('. ')}`
        }
      }
      
      // Extract specific field errors from source.key object
      if (errorJson.source?.key && typeof errorJson.source.key === 'object') {
        const fieldErrors: string[] = []
        Object.entries(errorJson.source.key).forEach(([field, message]) => {
          fieldErrors.push(`${field}: ${message}`)
        })
        if (fieldErrors.length > 0) {
          errorMessage = `${errorMessage}. ${fieldErrors.join('. ')}`
        }
      }
      
      // Check for validation errors
      if (errorJson.validation_errors) {
        const validationErrors = Array.isArray(errorJson.validation_errors) 
          ? errorJson.validation_errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
          : JSON.stringify(errorJson.validation_errors)
        errorMessage = `${errorMessage}. Validation errors: ${validationErrors}`
      }
    } catch {
      errorMessage = errorText || errorMessage
    }
    // Log full error details for debugging
    console.error(`[BRIDGE-API] Request failed:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      details: errorDetails,
      url,
      errorText,
      fullErrorJson: errorDetails,
    })
    
    // For 401 errors, provide more helpful error message
    if (response.status === 401) {
      // Don't duplicate "Authentication failed" if errorMessage already contains it
      let helpfulMessage = errorMessage
      if (!errorMessage.toLowerCase().includes('authentication failed')) {
        helpfulMessage = `Authentication failed: ${errorMessage}`
      }
      helpfulMessage += `. Please check that BRIDGE_API_KEY is set correctly in your environment variables. ` +
        `Current API key: ${BRIDGE_API_KEY ? `Present (${BRIDGE_API_KEY.substring(0, 10)}...)` : 'NOT SET'}. ` +
        `If you just updated the API key, make sure to restart your Next.js server. ` +
        `If the API key is correct, it may be invalid, expired, or lack permissions for this endpoint.`
      throw new Error(helpfulMessage)
    }
    
    throw new Error(errorMessage)
  }

  // Get response text first to see what we're actually getting
  const responseText = await response.text()
  console.log(`[BRIDGE-API] Response text (first 500 chars):`, responseText.substring(0, 500))
  
  let parsedResponse: any
  try {
    parsedResponse = JSON.parse(responseText)
    console.log(`[BRIDGE-API] Parsed response type:`, typeof parsedResponse, `keys:`, parsedResponse ? Object.keys(parsedResponse) : [])
  } catch (parseError: any) {
    console.error(`[BRIDGE-API] Failed to parse JSON response:`, parseError.message)
    console.error(`[BRIDGE-API] Response text:`, responseText)
    throw new Error(`Bridge API returned invalid JSON: ${parseError.message}`)
  }
  
  return parsedResponse
}

// ============================================================================
// TOS (Terms of Service) Methods
// ============================================================================

interface TOSLink {
  id: string
  tos_link: string
}

interface SignedAgreementStatus {
  signed: boolean
  signed_agreement_id?: string
}

// ============================================================================
// Customer Methods
// ============================================================================

interface BridgeCustomer {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  kyc_status?: string
  endorsements?: any[]
  rejection_reasons?: any[]
  created_at: string
  updated_at: string
}

interface CustomerStatus {
  kyc_status: string
  endorsements: any[]
  rejection_reasons?: any[]
}

interface EndorsementStatus {
  status: string
  requirements?: any[]
  missing_requirements?: any[]
}

// ============================================================================
// Virtual Account Methods
// ============================================================================

interface VirtualAccount {
  id: string
  currency: string
  status: string
  source_deposit_instructions?: {
    bank_account_number?: string
    bank_routing_number?: string
    iban?: string
    bic?: string
    bank_name?: string
    account_holder_name?: string
  }
  created_at: string
  updated_at: string
}

// ============================================================================
// Wallet Methods
// ============================================================================

interface BridgeWallet {
  id: string
  customer_id: string
  chain: string
  address: string
  status: string
  balances?: {
    [currency: string]: string
  }
  created_at: string
  updated_at: string
}

interface WalletBalance {
  [currency: string]: string
}

// ============================================================================
// Transfer Methods
// ============================================================================

interface Transfer {
  id: string
  customer_id: string
  amount: string
  currency: string
  status: string
  source: {
    type: string
    payment_rail: string
    bridge_wallet_id?: string
  }
  destination: {
    type: string
    payment_rail: string
    external_account_id?: string
  }
  created_at: string
  updated_at: string
}

// ============================================================================
// Customer Payload Builder
// ============================================================================

interface BuildCustomerPayloadParams {
  email: string
  firstName: string
  lastName: string
  birthDate: string
  address: any
  signedAgreementId: string
  ssn?: string
  dlNumber?: string
  dlFrontBase64?: string
  dlBackBase64?: string
  phone?: string
  employmentStatus?: string
  expectedMonthly?: string
  accountPurpose?: string
  sourceOfFunds?: string
  passportNumber?: string
  passportFrontBase64?: string
  nationalIdNumber?: string
  nationalIdFrontBase64?: string
  nationalIdBackBase64?: string
  idType?: string // 'passport', 'national_id', 'drivers_license', etc.
  proofOfAddressBase64?: string
  needsUSD?: boolean
  needsEUR?: boolean
}

export const bridgeService = {
  // ============================================================================
  // TOS Methods
  // ============================================================================

  /**
   * Get TOS link for a NEW customer (before customer exists)
   * Uses POST /v0/customers/tos_links (Bridge production endpoint)
   */
  async getTOSLink(
    email: string, 
    type: 'individual' | 'business' = 'individual',
    redirectUri?: string
  ): Promise<TOSLink> {
    console.log(`[BRIDGE-SERVICE] getTOSLink: Creating TOS link for NEW customer (email: ${email}, type: ${type})`)
    console.log(`[BRIDGE-SERVICE] getTOSLink: API config:`, {
      hasApiKey: !!BRIDGE_API_KEY,
      apiKeyPrefix: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 7)}...` : 'NOT SET',
      baseUrl: BRIDGE_API_BASE_URL,
      hasRedirectUri: !!redirectUri,
    })
    
    try {
      const payload: any = {
        email,
        type,
      }
      
      // Add redirect_uri if provided (for production TOS flow)
      if (redirectUri) {
        payload.redirect_uri = redirectUri
        console.log(`[BRIDGE-SERVICE] getTOSLink: Including redirect_uri for callback`)
      }
      
      // Use POST /v0/customers/tos_links for new customers (Bridge production endpoint)
      const endpoint = '/v0/customers/tos_links'
      console.log(`[BRIDGE-SERVICE] getTOSLink: Using endpoint: ${endpoint} (for new customers)`)
      
      const response = await bridgeApiRequest<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
      
      console.log(`[BRIDGE-SERVICE] getTOSLink: Response received:`, {
        hasResponse: !!response,
        responseType: typeof response,
        isArray: Array.isArray(response),
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        hasData: !!(response && response.data),
        hasUrl: !!(response && (response.url || (response.data && response.data.url))),
        hasId: !!(response && (response.id || (response.data && response.data.id))),
        fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
      })
      
      // Bridge API returns TOS URL in 'url' field (not 'tos_link')
      let tosLink: TOSLink | null = null
      
      if (response) {
        // Check if response has data field
        if (response.data && typeof response.data === 'object' && response.data.url) {
          tosLink = { id: response.data.id, tos_link: response.data.url }
          console.log(`[BRIDGE-SERVICE] getTOSLink: Using response.data.url`)
        } 
        // Check if response is directly the TOS object with url field
        else if (response.url && response.id) {
          tosLink = { id: response.id, tos_link: response.url }
          console.log(`[BRIDGE-SERVICE] getTOSLink: Using response.url directly`)
        }
        // Check if response has url field without data wrapper
        else if (response.url && typeof response.url === 'string') {
          tosLink = { id: response.id || 'new-customer', tos_link: response.url }
          console.log(`[BRIDGE-SERVICE] getTOSLink: Using response.url as TOSLink`)
        }
      }
      
      if (!tosLink || !tosLink.tos_link) {
        console.error(`[BRIDGE-SERVICE] getTOSLink: Invalid response format:`, JSON.stringify(response, null, 2))
        throw new Error('Bridge API returned invalid response: missing url field')
      }
      
      console.log(`[BRIDGE-SERVICE] getTOSLink: Successfully created TOS link:`, { id: tosLink.id, hasLink: !!tosLink.tos_link })
      return tosLink
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] getTOSLink: Error creating TOS link:`, {
        error: error.message,
        stack: error.stack,
        email,
        type,
        bridgeApiKey: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 7)}...` : 'NOT SET',
        bridgeApiBaseUrl: BRIDGE_API_BASE_URL,
      })
      throw error
    }
  },

  /**
   * Get TOS acceptance link for an EXISTING customer
   * Uses GET /v0/customers/{customerID}/tos_acceptance_link (Bridge production endpoint)
   */
  async getTOSLinkForCustomer(
    customerId: string,
    redirectUri?: string
  ): Promise<TOSLink> {
    console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Getting TOS link for existing customer ${customerId}`)
    console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: API config:`, {
      hasApiKey: !!BRIDGE_API_KEY,
      apiKeyPrefix: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 7)}...` : 'NOT SET',
      baseUrl: BRIDGE_API_BASE_URL,
      hasRedirectUri: !!redirectUri,
      customerId,
    })
    
    try {
      // Use GET /v0/customers/{customerID}/tos_acceptance_link for existing customers
      let endpoint = `/v0/customers/${customerId}/tos_acceptance_link`
      
      // Add redirect_uri as query parameter if provided
      if (redirectUri) {
        endpoint = `${endpoint}?redirect_uri=${encodeURIComponent(redirectUri)}`
        console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Including redirect_uri in query params`)
      }
      
      console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Using endpoint: ${endpoint}`)
      
      const response = await bridgeApiRequest<any>(endpoint, {
        method: 'GET',
      })
      
      console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Response received:`, {
        hasResponse: !!response,
        responseType: typeof response,
        isArray: Array.isArray(response),
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        hasData: !!(response && response.data),
        hasUrl: !!(response && (response.url || (response.data && response.data.url))),
        hasId: !!(response && (response.id || (response.data && response.data.id))),
        fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
      })

      // Bridge API returns TOS URL in 'url' field
      let tosLink: TOSLink | null = null

      if (response) {
        // Check if response has data field
        if (response.data && typeof response.data === 'object' && response.data.url) {
          tosLink = { id: response.data.id || customerId, tos_link: response.data.url }
          console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Using response.data.url`)
        }
        // Check if response has url field directly
        else if (response.url) {
          tosLink = { id: response.id || customerId, tos_link: response.url }
          console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Using response.url directly`)
        }
        // Check if response has url field without data wrapper
        else if (typeof response === 'object' && response.url && typeof response.url === 'string') {
          tosLink = { id: response.id || customerId, tos_link: response.url }
          console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Using response.url as TOSLink`)
        }
      }

      if (!tosLink || !tosLink.tos_link) {
        console.error(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Invalid response format:`, JSON.stringify(response, null, 2))
        throw new Error('Bridge API returned invalid response: missing url field')
      }
      
      console.log(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Successfully retrieved TOS link:`, { id: tosLink.id, hasLink: !!tosLink.tos_link })
      return tosLink
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] getTOSLinkForCustomer: Error getting TOS link for customer:`, {
        error: error.message,
        stack: error.stack,
        customerId,
        bridgeApiKey: BRIDGE_API_KEY ? `${BRIDGE_API_KEY.substring(0, 7)}...` : 'NOT SET',
        bridgeApiBaseUrl: BRIDGE_API_BASE_URL,
      })
      throw error
    }
  },

  /**
   * Get KYC link for an EXISTING customer (missing requirements)
   * Uses GET /v0/customers/{customerID}/kyc_link (Bridge production endpoint)
   */
  async getKycLink(
    customerId: string,
    redirectUri?: string
  ): Promise<{ kyc_link: string }> {
    console.log(`[BRIDGE-SERVICE] getKycLink: Getting KYC link for existing customer ${customerId}`)
    
    try {
      let endpoint = `/v0/customers/${customerId}/kyc_link`
      
      // Add redirect_uri as query parameter if provided
      if (redirectUri) {
        endpoint = `${endpoint}?redirect_uri=${encodeURIComponent(redirectUri)}`
        console.log(`[BRIDGE-SERVICE] getKycLink: Including redirect_uri in query params`)
      }
      
      console.log(`[BRIDGE-SERVICE] getKycLink: Using endpoint: ${endpoint}`)
      
      const response = await bridgeApiRequest<any>(endpoint, {
        method: 'GET',
      })
      
      console.log(`[BRIDGE-SERVICE] getKycLink: Response received:`, {
        hasResponse: !!response,
        responseType: typeof response,
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        hasUrl: !!(response && (response.url || response.kyc_link || (response.data && (response.data.url || response.data.kyc_link)))),
        fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
      })
      
      // Bridge returns { url: "https://..." } or { kyc_link: "https://..." }
      let kycLink: string | null = null
      
      if (response) {
        if (response.url) {
          kycLink = response.url
        } else if (response.kyc_link) {
          kycLink = response.kyc_link
        } else if (response.data) {
          if (response.data.url) {
            kycLink = response.data.url
          } else if (response.data.kyc_link) {
            kycLink = response.data.kyc_link
          }
        }
      }
      
      if (!kycLink) {
        throw new Error('Bridge API returned invalid response: missing url or kyc_link field')
      }
      
      console.log(`[BRIDGE-SERVICE] getKycLink: Successfully retrieved KYC link`)
      return { kyc_link: kycLink }
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] getKycLink: Error getting KYC link:`, error.message)
      throw error
    }
  },

  /**
   * List customers by email (to find existing customers)
   * Uses GET /v0/customers?email={email} (Bridge production endpoint)
   */
  async listCustomersByEmail(email: string): Promise<any[]> {
    console.log(`[BRIDGE-SERVICE] listCustomersByEmail: Finding customers for email ${email}`)
    
    try {
      const endpoint = `/v0/customers?email=${encodeURIComponent(email)}`
      console.log(`[BRIDGE-SERVICE] listCustomersByEmail: Using endpoint: ${endpoint}`)
      
      const response = await bridgeApiRequest<any>(endpoint, {
        method: 'GET',
      })
      
      console.log(`[BRIDGE-SERVICE] listCustomersByEmail: Response received:`, {
        hasResponse: !!response,
        responseType: typeof response,
        isArray: Array.isArray(response),
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        hasData: !!(response && response.data),
        fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
      })
      
      // Bridge returns array of customers or { data: [...] }
      if (Array.isArray(response)) {
        return response
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data
      }
      
      return []
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] listCustomersByEmail: Error listing customers:`, error.message)
      throw error
    }
  },

  /**
   * Check if TOS has been signed
   */
  async getSignedAgreementStatus(tosLinkId: string): Promise<SignedAgreementStatus> {
    const response = await bridgeApiRequest<{ data: { signed: boolean; signed_agreement_id?: string } }>(
      `/v0/tos_links/${tosLinkId}`,
      {
        method: 'GET',
      },
    )
    return response.data
  },

  // ============================================================================
  // Customer Methods
  // ============================================================================

  /**
   * Create a Bridge customer with full KYC data
   */
  async createCustomer(userId: string, customerPayload: any): Promise<BridgeCustomer> {
    console.log(`[BRIDGE-SERVICE] Creating customer with payload:`, {
      hasEmail: !!customerPayload.email,
      hasFirstName: !!customerPayload.first_name,
      hasLastName: !!customerPayload.last_name,
      hasAddress: !!customerPayload.address,
      hasDateOfBirth: !!customerPayload.date_of_birth,
      hasSignedAgreementId: !!customerPayload.signed_agreement_id,
      hasSsn: !!customerPayload.ssn,
      hasEndorsements: !!customerPayload.endorsements,
      payloadKeys: Object.keys(customerPayload),
      fullPayload: JSON.stringify(customerPayload, null, 2).substring(0, 1000),
    })
    
    try {
      const response = await bridgeApiRequest<any>('/v0/customers', {
      method: 'POST',
      body: JSON.stringify({
        ...customerPayload,
        client_reference_id: userId,
      }),
    })
      
      console.log(`[BRIDGE-SERVICE] Customer creation response (raw):`, {
        hasResponse: !!response,
        responseType: typeof response,
        isArray: Array.isArray(response),
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        fullResponse: JSON.stringify(response, null, 2).substring(0, 2000),
      })
      
      // Bridge API may return customer directly or wrapped in { data: ... }
      let customer: any = null
      
      if (response) {
        if (response.data && typeof response.data === 'object') {
          customer = response.data
          console.log(`[BRIDGE-SERVICE] Using response.data`)
        } else if (response.id) {
          customer = response
          console.log(`[BRIDGE-SERVICE] Using response directly (has id)`)
        } else {
          // Try to find customer object in response
          console.log(`[BRIDGE-SERVICE] Searching for customer in response...`)
          customer = response
        }
      }
      
      if (!customer) {
        console.error(`[BRIDGE-SERVICE] Customer is null/undefined. Full response:`, JSON.stringify(response, null, 2))
        throw new Error(`Bridge customer creation returned null or undefined. Response: ${JSON.stringify(response)}`)
      }
      
      console.log(`[BRIDGE-SERVICE] Extracted customer:`, {
        hasCustomer: !!customer,
        customerType: typeof customer,
        customerKeys: customer && typeof customer === 'object' ? Object.keys(customer) : [],
        hasId: !!customer.id,
        customerId: customer.id,
        fullCustomer: JSON.stringify(customer, null, 2).substring(0, 1000),
      })
      
      if (!customer.id) {
        console.error(`[BRIDGE-SERVICE] Customer response missing id. Full customer:`, JSON.stringify(customer, null, 2))
        throw new Error(`Bridge customer creation failed: Response missing customer ID. Response: ${JSON.stringify(response)}`)
      }
      
      return customer
    } catch (error: any) {
      // Handle duplicate email error - try to find existing customer
      if (error.message?.toLowerCase().includes('duplicate') || 
          error.message?.toLowerCase().includes('already exists') ||
          error.message?.toLowerCase().includes('email already') ||
          error.fullErrorDetails?.error?.code === 'invalid_parameters') {
        console.log(`[BRIDGE-SERVICE] Customer creation failed - possible duplicate email. Attempting to find existing customer...`)
        
        try {
          // Extract email from customerPayload
          const email = customerPayload.email
          if (email) {
            const existingCustomers = await bridgeService.listCustomersByEmail(email)
            if (existingCustomers && existingCustomers.length > 0) {
              const existingCustomer = existingCustomers[0]
              console.log(`[BRIDGE-SERVICE] Found existing customer with email ${email}: ${existingCustomer.id}`)
              return existingCustomer
            }
          }
        } catch (listError: any) {
          console.error(`[BRIDGE-SERVICE] Error listing customers by email:`, listError.message)
          // Fall through to throw original error
        }
      }
      
      // Enhanced error logging to capture full error details
      const errorDetails: any = {
        error: error.message,
        stack: error.stack,
        name: error.name,
      }
      
      // Try to extract more details from the error
      if (error.response) {
        errorDetails.response = error.response
      }
      if (error.data) {
        errorDetails.data = error.data
      }
      if (error.body) {
        errorDetails.body = error.body
      }
      
      // Log the full error for debugging
      console.error(`[BRIDGE-SERVICE] Error creating customer:`, JSON.stringify(errorDetails, null, 2))
      
      // Attach full error details to the error object for downstream handling
      error.fullErrorDetails = errorDetails
      throw error
    }
  },

  /**
   * List all customers
   * GET /v0/customers returns an object with { count, data } where data is an array of customers
   */
  async listCustomers(): Promise<BridgeCustomer[]> {
    console.log(`[BRIDGE-SERVICE] listCustomers: Fetching all customers`)
    const response = await bridgeApiRequest<any>('/v0/customers', {
      method: 'GET',
    })
    
    console.log(`[BRIDGE-SERVICE] listCustomers: Response received:`, {
      hasResponse: !!response,
      responseType: typeof response,
      isArray: Array.isArray(response),
      hasData: !!(response && response.data),
      hasCount: !!(response && response.count),
      dataIsArray: !!(response && response.data && Array.isArray(response.data)),
      dataLength: response && response.data && Array.isArray(response.data) ? response.data.length : 0,
    })
    
    // Bridge API returns { count: number, data: BridgeCustomer[] }
    if (!response) {
      console.error(`[BRIDGE-SERVICE] listCustomers: Response is null or undefined`)
      return []
    }
    
    // Extract customers from response.data
    if (response.data && Array.isArray(response.data)) {
      console.log(`[BRIDGE-SERVICE] listCustomers: Returning ${response.data.length} customers from response.data`)
      return response.data as BridgeCustomer[]
    }
    
    // Fallback: if response is directly an array (shouldn't happen, but handle it)
    if (Array.isArray(response)) {
      console.log(`[BRIDGE-SERVICE] listCustomers: Response is directly an array, returning ${response.length} customers`)
      return response as BridgeCustomer[]
    }
    
    console.warn(`[BRIDGE-SERVICE] listCustomers: Unexpected response format, returning empty array. Response keys:`, response && typeof response === 'object' ? Object.keys(response) : [])
    return []
  },

  /**
   * Find customer by email
   * Uses listCustomers and filters by email
   */
  async findCustomerByEmail(email: string): Promise<BridgeCustomer | null> {
    console.log(`[BRIDGE-SERVICE] findCustomerByEmail: Searching for customer with email: ${email}`)
    try {
      const customers = await this.listCustomers()
      const customer = customers.find(
        (c) => c.email && c.email.toLowerCase() === email.toLowerCase()
      )
      
      if (customer) {
        console.log(`[BRIDGE-SERVICE] findCustomerByEmail: Found customer ${customer.id} for email ${email}`)
        return customer
      } else {
        console.log(`[BRIDGE-SERVICE] findCustomerByEmail: No customer found for email ${email}`)
        return null
      }
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] findCustomerByEmail: Error searching for customer:`, error.message)
      return null
    }
  },

  /**
   * Get customer details
   */
  async getCustomer(customerId: string): Promise<BridgeCustomer> {
    console.log(`[BRIDGE-SERVICE] getCustomer: Fetching customer ${customerId}`)
    const response = await bridgeApiRequest<any>(`/v0/customers/${customerId}`, {
      method: 'GET',
    })
    
    console.log(`[BRIDGE-SERVICE] getCustomer: Response received:`, {
      hasResponse: !!response,
      responseType: typeof response,
      isArray: Array.isArray(response),
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
      hasId: !!(response && response.id),
      responseId: response?.id,
      fullResponsePreview: response && typeof response === 'object' ? JSON.stringify(response, null, 2).substring(0, 500) : String(response),
    })
    
    // Bridge API returns the customer object DIRECTLY (not wrapped in { data: ... })
    // GET /v0/customers/{customerID} returns the customer object as-is in the response body
    if (!response) {
      console.error(`[BRIDGE-SERVICE] getCustomer: Response is null or undefined`)
      throw new Error(`Bridge API returned null or undefined for customer ${customerId}`)
    }
    
    // The response IS the customer object directly - return it as-is
    if (response.id && typeof response.id === 'string') {
      console.log(`[BRIDGE-SERVICE] getCustomer: Returning customer object directly (id: ${response.id})`)
      return response as BridgeCustomer
    }
    
    // If response doesn't have an 'id' property, it's an unexpected format
    console.error(`[BRIDGE-SERVICE] getCustomer: Response missing 'id' property:`, {
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
      responseType: typeof response,
      fullResponse: JSON.stringify(response, null, 2).substring(0, 2000),
    })
    throw new Error(`Bridge API returned unexpected response format for customer ${customerId}. Expected customer object with 'id' property, but got: ${JSON.stringify(response).substring(0, 500)}`)
  },

  /**
   * Delete a Bridge customer
   * Note: This may not be available in all environments
   */
  async deleteCustomer(customerId: string): Promise<void> {
    console.log(`[BRIDGE-SERVICE] deleteCustomer: Deleting customer ${customerId}`)
    
    try {
      await bridgeApiRequest<any>(`/v0/customers/${customerId}`, {
        method: 'DELETE',
      })
      
      console.log(`[BRIDGE-SERVICE] deleteCustomer: Customer deleted successfully`)
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] deleteCustomer: Error deleting customer:`, {
        error: error.message,
        customerId,
      })
      throw error
    }
  },

  /**
   * Update customer with missing fields to complete KYC requirements
   */
  async updateCustomer(customerId: string, updates: {
    date_of_birth?: string
    tax_identification_number?: string
    address?: any
    signed_agreement_id?: string
  }): Promise<BridgeCustomer> {
    console.log(`[BRIDGE-SERVICE] updateCustomer: Updating customer ${customerId} with missing fields:`, {
      hasDateOfBirth: !!updates.date_of_birth,
      hasTaxId: !!updates.tax_identification_number,
      hasAddress: !!updates.address,
      hasSignedAgreementId: !!updates.signed_agreement_id,
    })
    
    try {
      const payload: any = {}
      if (updates.date_of_birth) payload.date_of_birth = updates.date_of_birth
      if (updates.tax_identification_number) {
        payload.tax_identification_number = updates.tax_identification_number
        payload.ssn = updates.tax_identification_number // Also include ssn for backward compatibility
      }
      if (updates.address) payload.address = updates.address
      if (updates.signed_agreement_id) payload.signed_agreement_id = updates.signed_agreement_id
      
      const response = await bridgeApiRequest<BridgeCustomer>(
        `/v0/customers/${customerId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      )
      
      console.log(`[BRIDGE-SERVICE] updateCustomer: Customer updated successfully`)
      return response
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] updateCustomer: Error updating customer:`, {
        error: error.message,
        customerId,
        updates,
      })
      throw error
    }
  },

  /**
   * Update customer to mark TOS as accepted
   * Update customer TOS status after TOS acceptance
   */
  async updateCustomerTOS(customerId: string, signedAgreementId: string): Promise<BridgeCustomer> {
    console.log(`[BRIDGE-SERVICE] updateCustomerTOS: Updating customer ${customerId} to mark TOS as accepted`)
    
    try {
      const response = await bridgeApiRequest<any>(`/v0/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify({
          signed_agreement_id: signedAgreementId,
        }),
      })
      
      console.log(`[BRIDGE-SERVICE] updateCustomerTOS: Response received:`, {
        hasResponse: !!response,
        hasId: !!(response && response.id),
        customerId: response?.id,
        hasAcceptedTOS: (response as any)?.has_accepted_terms_of_service,
      })
      
      // Bridge API returns the customer object directly
      if (!response || !response.id) {
        throw new Error(`Bridge API returned invalid response when updating customer TOS`)
      }
      
      return response as BridgeCustomer
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] updateCustomerTOS: Error updating customer TOS:`, {
        error: error.message,
        customerId,
        signedAgreementId,
      })
      throw error
    }
  },

  /**
   * Get customer KYC status
   */
  async getCustomerStatus(customerId: string): Promise<CustomerStatus> {
    const customer = await this.getCustomer(customerId)
    return {
      kyc_status: customer.kyc_status || 'pending',
      endorsements: customer.endorsements || [],
      rejection_reasons: customer.rejection_reasons,
    }
  },

  /**
   * Check endorsement status (base for USD, sepa for EUR)
   */
  async checkEndorsementStatus(customerId: string, endorsementName: 'base' | 'sepa'): Promise<EndorsementStatus | null> {
    try {
    const customer = await this.getCustomer(customerId)
      
      // Handle cases where customer or endorsements might be undefined
      if (!customer) {
        console.warn(`[BRIDGE-SERVICE] Customer not found for ID: ${customerId}`)
        return null
      }
      
      const endorsements = (customer.endorsements || []) as any[]
    const endorsement = endorsements.find((e: any) => e.name === endorsementName)
    
    if (!endorsement) {
      return null
    }

    return {
      status: endorsement.status || 'pending',
      requirements: endorsement.requirements,
      missing_requirements: endorsement.missing_requirements,
      }
    } catch (error: any) {
      console.error(`[BRIDGE-SERVICE] Error checking endorsement status:`, error)
      return null
    }
  },

  // ============================================================================
  // Virtual Account Methods
  // ============================================================================

  /**
   * Create a virtual account (USD or EUR)
   */
  async createVirtualAccount(
    customerId: string,
    currency: 'usd' | 'eur',
    walletId?: string,
  ): Promise<VirtualAccount> {
    // Determine destination currency (usdc for USD, eurc for EUR)
    const destinationCurrency = currency === 'usd' ? 'usdc' : 'eurc'
    
    const payload: any = {
      source: {
        currency,
      },
      destination: {
        payment_rail: 'solana',
        currency: destinationCurrency,
      },
    }
    
    // Add wallet ID if provided
    if (walletId) {
      payload.destination.bridge_wallet_id = walletId
    }
    
    const response = await bridgeApiRequest<{ data: VirtualAccount }>(`/v0/customers/${customerId}/virtual_accounts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return response.data
  },

  /**
   * Get virtual account details
   */
  async getVirtualAccountDetails(virtualAccountId: string): Promise<VirtualAccount> {
    const response = await bridgeApiRequest<{ data: VirtualAccount }>(
      `/v0/virtual_accounts/${virtualAccountId}`,
      {
        method: 'GET',
      },
    )
    return response.data
  },

  /**
   * List all virtual accounts for a customer
   */
  async listVirtualAccounts(customerId: string): Promise<VirtualAccount[]> {
    const response = await bridgeApiRequest<{ data: VirtualAccount[] }>(
      `/v0/virtual_accounts?customer_id=${customerId}`,
      {
        method: 'GET',
      },
    )
    return response.data
  },

  // ============================================================================
  // Wallet Methods
  // ============================================================================

  /**
   * Create a wallet for a customer
   */
  async createWallet(customerId: string, chain: string = 'solana'): Promise<BridgeWallet> {
    const response = await bridgeApiRequest<{ data: BridgeWallet }>(`/v0/customers/${customerId}/wallets`, {
      method: 'POST',
      body: JSON.stringify({
        chain,
      }),
    })
    return response.data
  },

  /**
   * List wallets for a customer
   */
  async listWallets(customerId: string): Promise<BridgeWallet[]> {
    const response = await bridgeApiRequest<{ data: BridgeWallet[] }>(`/v0/customers/${customerId}/wallets`, {
      method: 'GET',
    })
    return response.data || []
  },

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<WalletBalance> {
    const response = await bridgeApiRequest<{ data: BridgeWallet }>(`/v0/wallets/${walletId}`, {
      method: 'GET',
    })
    
    // Bridge returns balances in the wallet object
    // Map usdb to USD and eurc to EUR for consistency
    const balances: WalletBalance = {}
    if (response.data.balances) {
      Object.entries(response.data.balances).forEach(([key, value]) => {
        if (key === 'usdb' || key === 'usdc') {
          balances.USD = value
        } else if (key === 'eurc') {
          balances.EUR = value
        } else {
          balances[key.toUpperCase()] = value
        }
      })
    }
    
    return balances
  },

  // ============================================================================
  // Transfer Methods
  // ============================================================================

  /**
   * Create a transfer from wallet to external bank account
   */
  async createTransfer(
    customerId: string,
    transferData: {
      amount: string
      currency: string
      sourceWalletId: string
      destinationExternalAccountId: string
    },
  ): Promise<Transfer> {
    const response = await bridgeApiRequest<{ data: Transfer }>('/v0/transfers', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        amount: transferData.amount,
        currency: transferData.currency,
        source: {
          type: 'wallet',
          bridge_wallet_id: transferData.sourceWalletId,
        },
        destination: {
          type: 'external_account',
          external_account_id: transferData.destinationExternalAccountId,
        },
      }),
    })
    return response.data
  },

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<Transfer> {
    const response = await bridgeApiRequest<{ data: Transfer }>(`/v0/transfers/${transferId}`, {
      method: 'GET',
    })
    return response.data
  },
}

// ============================================================================
// Customer Payload Builder
// ============================================================================

/**
 * Normalize state/province name to ISO 3166-2 subdivision code
 * Handles US states (most common case) and attempts to normalize other countries
 */
function normalizeSubdivisionCode(state: string, countryCode: string): string | null {
  if (!state) return null
  
  // Remove country prefix if present (e.g., "US-CA" -> "CA")
  let code = state.trim()
  if (code.includes('-')) {
    code = code.split('-').pop() || code
  }
  
  // First, normalize to lowercase for comparison
  const normalized = code.toLowerCase().trim()
  
  // CRITICAL: Always uppercase 2-3 letter codes immediately
  // Bridge requires uppercase ISO 3166-2 codes (e.g., "LA" not "La", "CA" not "ca")
  // This handles cases like "La" -> "LA", "ca" -> "CA", etc. for ALL countries
  if (code.length >= 2 && code.length <= 3 && /^[A-Za-z]+$/.test(code)) {
    return code.toUpperCase()
  }
  
  // For USA, convert state names to codes
  if (countryCode === 'USA' || countryCode === 'US') {
    const usStateMap: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
      'district of columbia': 'DC', 'washington dc': 'DC', 'dc': 'DC'
    }
    
    if (usStateMap[normalized]) {
      return usStateMap[normalized]
    }
    
    // If it's already a valid 2-letter code, return uppercase
    if (/^[A-Z]{2}$/i.test(code)) {
      return code.toUpperCase()
    }
  }
  
  // For Canada, convert province names to codes
  if (countryCode === 'CAN' || countryCode === 'CA') {
    const canadaProvinceMap: Record<string, string> = {
      'alberta': 'AB', 'british columbia': 'BC', 'manitoba': 'MB', 'new brunswick': 'NB',
      'newfoundland and labrador': 'NL', 'northwest territories': 'NT', 'nova scotia': 'NS',
      'nunavut': 'NU', 'ontario': 'ON', 'prince edward island': 'PE', 'quebec': 'QC',
      'saskatchewan': 'SK', 'yukon': 'YT'
    }
    
    if (canadaProvinceMap[normalized]) {
      return canadaProvinceMap[normalized]
    }
    
    // If it's already a valid 2-letter code, return uppercase
    if (/^[A-Z]{2}$/i.test(code)) {
      return code.toUpperCase()
    }
  }
  
  // For Australia, convert state names to codes
  if (countryCode === 'AUS' || countryCode === 'AU') {
    const australiaStateMap: Record<string, string> = {
      'new south wales': 'NSW', 'victoria': 'VIC', 'queensland': 'QLD', 'western australia': 'WA',
      'south australia': 'SA', 'tasmania': 'TAS', 'australian capital territory': 'ACT',
      'northern territory': 'NT'
    }
    
    if (australiaStateMap[normalized]) {
      return australiaStateMap[normalized]
    }
    
    // If it's already a valid 2-3 letter code, return uppercase
    if (/^[A-Z]{2,3}$/i.test(code)) {
      return code.toUpperCase()
    }
  }
  
  // Countries that don't use states/provinces OR Bridge doesn't accept subdivision codes
  // Bridge may reject subdivision codes for countries where it's not required or not supported
  const countriesWithoutSubdivision = [
    'GBR', 'GB', // United Kingdom
    'DEU', 'DE', // Germany
    'FRA', 'FR', // France
    'ITA', 'IT', // Italy
    'ESP', 'ES', // Spain
    'NLD', 'NL', // Netherlands
    'BEL', 'BE', // Belgium
    'CHE', 'CH', // Switzerland
    'AUT', 'AT', // Austria
    'SWE', 'SE', // Sweden
    'NOR', 'NO', // Norway
    'DNK', 'DK', // Denmark
    'FIN', 'FI', // Finland
    'POL', 'PL', // Poland
    'PRT', 'PT', // Portugal
    'GRC', 'GR', // Greece
    'IRL', 'IE', // Ireland
    'CZE', 'CZ', // Czech Republic
    'HUN', 'HU', // Hungary
    'ROU', 'RO', // Romania
    'BGR', 'BG', // Bulgaria
    'HRV', 'HR', // Croatia
    'SVK', 'SK', // Slovakia
    'SVN', 'SI', // Slovenia
    'EST', 'EE', // Estonia
    'LVA', 'LV', // Latvia
    'LTU', 'LT', // Lithuania
    'LUX', 'LU', // Luxembourg
    'MLT', 'MT', // Malta
    'CYP', 'CY', // Cyprus
    // African countries - Bridge may not accept subdivision codes
    'NGA', 'NG', // Nigeria
    'KEN', 'KE', // Kenya
    'GHA', 'GH', // Ghana
    'ZAF', 'ZA', // South Africa
    // Asian countries - Bridge may not accept subdivision codes
    'IND', 'IN', // India
    'PAK', 'PK', // Pakistan
    'BGD', 'BD', // Bangladesh
    'PHL', 'PH', // Philippines
    'IDN', 'ID', // Indonesia
    'MYS', 'MY', // Malaysia
    'SGP', 'SG', // Singapore
    'THA', 'TH', // Thailand
    'VNM', 'VN', // Vietnam
    'JPN', 'JP', // Japan
    'KOR', 'KR', // South Korea
    // Latin American countries
    'BRA', 'BR', // Brazil
    'MEX', 'MX', // Mexico
  ]
  
  if (countriesWithoutSubdivision.includes(countryCode)) {
    // These countries don't use subdivision - return null to skip
    return null
  }
  
  // For other countries, try to normalize if it looks like a code
  // If it's 2-3 characters and all letters, uppercase it
  // This handles cases like "La" -> "LA", "ca" -> "CA", etc.
  if (code.length >= 2 && code.length <= 3 && /^[A-Za-z]+$/.test(code)) {
    return code.toUpperCase()
  }
  
  // If it's longer or doesn't match code pattern, we can't reliably convert it
  // Return null to skip subdivision - Bridge may accept addresses without subdivision for some countries
  return null
}

/**
 * Build customer payload for Bridge API based on country-specific requirements
 */
export function buildCustomerPayload(params: BuildCustomerPayloadParams): any {
  const {
    email,
    firstName,
    lastName,
    birthDate,
    address,
    signedAgreementId,
    ssn,
    dlNumber,
    dlFrontBase64,
    dlBackBase64,
    phone,
    employmentStatus,
    expectedMonthly,
    accountPurpose,
    sourceOfFunds,
    passportNumber,
    passportFrontBase64,
    nationalIdNumber,
    nationalIdFrontBase64,
    nationalIdBackBase64,
    idType,
    proofOfAddressBase64,
    needsUSD = true,
    needsEUR = false,
  } = params
  
  // Validate required fields
  if (!email) {
    throw new Error("Email is required for Bridge customer creation")
  }
  if (!firstName) {
    throw new Error("First name is required for Bridge customer creation")
  }
  if (!lastName) {
    throw new Error("Last name is required for Bridge customer creation")
  }
  if (!birthDate) {
    throw new Error("Date of birth is required for Bridge customer creation")
  }
  if (!address || !address.line1 || !address.city || !address.postalCode || !address.country) {
    throw new Error("Complete address (line1, city, postal_code, country) is required for Bridge customer creation")
  }
  
  // Build base payload
  const payload: any = {
    email,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate, // Bridge expects birth_date (not date_of_birth)
    type: 'individual', // Always individual for now
  }
  
  // Build residential_address (Bridge expects this structure)
  // Country should be ISO 3166-1 alpha-3 (e.g., "USA", "GBR")
  // If we receive alpha-2, we need to convert it
  let countryCode = address.country
  if (countryCode && countryCode.length === 2) {
    // Convert alpha-2 to alpha-3
    const alpha2ToAlpha3: Record<string, string> = {
      'US': 'USA', 'GB': 'GBR', 'CA': 'CAN', 'AU': 'AUS', 'NG': 'NGA',
      'KE': 'KEN', 'GH': 'GHA', 'ZA': 'ZAF', 'IN': 'IND', 'PK': 'PAK',
      // Add more as needed
    }
    countryCode = alpha2ToAlpha3[countryCode.toUpperCase()] || countryCode.toUpperCase()
  }
  
  const residentialAddress: any = {
    street_line_1: address.line1,
    city: address.city,
    postal_code: address.postalCode,
    country: countryCode, // ISO 3166-1 alpha-3 code
  }
  
  // Add optional fields
  if (address.line2) {
    residentialAddress.street_line_2 = address.line2
  }
  if (address.state) {
    // Bridge expects subdivision as ISO 3166-2 code without country prefix
    // e.g., "CA" for California, not "US-CA"
    // Normalize state name to ISO 3166-2 code
    const subdivision = normalizeSubdivisionCode(address.state, countryCode)
    if (subdivision) {
      residentialAddress.subdivision = subdivision
    } else {
      console.warn(`[BRIDGE-SERVICE] Could not normalize subdivision code: ${address.state} for country ${countryCode}. Skipping subdivision.`)
      // Don't include subdivision if we can't normalize it - Bridge may accept addresses without subdivision for some countries
    }
  }
  
  payload.residential_address = residentialAddress
  
  // Add signed_agreement_id if provided
  // This must be a real signed_agreement_id from Bridge's TOS flow
  if (signedAgreementId) {
    // Validate that it's not a placeholder
    if (signedAgreementId.startsWith('sandbox-test-')) {
      console.error(`[BRIDGE-SERVICE] ERROR: Placeholder signed_agreement_id detected: ${signedAgreementId}`)
      throw new Error('Invalid signed_agreement_id: Placeholder IDs are not allowed. Please sign the Terms of Service to get a valid signed_agreement_id.')
    }
    payload.signed_agreement_id = signedAgreementId
    console.log(`[BRIDGE-SERVICE] Using signed_agreement_id from database: ${signedAgreementId}`)
  } else {
    console.warn(`[BRIDGE-SERVICE] WARNING: No signed_agreement_id provided. Customer creation may fail if TOS is required.`)
  }

  // Note: SSN is now included in identifying_information array (see below)
  // tax_identification_number may still be needed for some cases, but SSN goes in identifying_information
  
  // Phone number (standard customer field)
  if (phone) {
    payload.phone = phone
  }
  
  // Additional KYC fields (employment, account purpose, etc.)
  if (employmentStatus) {
    payload.employment_status = employmentStatus
  }
  if (expectedMonthly) {
    payload.expected_monthly_payments = expectedMonthly
  }
  if (accountPurpose) {
    payload.account_purpose = accountPurpose
  }
  if (sourceOfFunds) {
    // Map source_of_funds values to Bridge's expected format
    // Bridge API may have specific valid values - if value is not recognized, skip the field
    const sourceOfFundsMapping: Record<string, string> = {
      'salary': 'salary',
      'business_income': 'business', // Bridge expects 'business' not 'business_income'
      'investments': 'investment', // Bridge expects 'investment' (singular) not 'investments'
      'inheritance': 'inheritance',
      'gift': 'gift',
      'savings': 'savings',
      'other': 'other',
    }
    const normalizedValue = sourceOfFunds.toLowerCase().trim()
    const mappedValue = sourceOfFundsMapping[normalizedValue]
    if (mappedValue) {
      payload.source_of_funds = mappedValue
      console.log(`[BRIDGE-SERVICE] Mapped source_of_funds from '${sourceOfFunds}' to '${mappedValue}'`)
    } else {
      // If value is not in our mapping, skip the field to avoid Bridge API errors
      console.warn(`[BRIDGE-SERVICE] Unknown or invalid source_of_funds value: '${sourceOfFunds}'. Skipping field to avoid API error.`)
    }
  }
  
  // Identifying Information Array - Bridge requires this format
  console.log(`[BRIDGE-SERVICE] Building identifying_information array`)
  
  const identifyingInformation: any[] = []
  
  // For US residents: SSN and optional driver's license
  const isUSA = countryCode === 'USA' || countryCode === 'US'
  
  if (isUSA) {
    // SSN (required for US)
    if (ssn) {
      // Remove dashes and format
      const ssnNumber = ssn.replace(/-/g, '')
      identifyingInformation.push({
        type: 'ssn',
        issuing_country: 'usa', // Bridge expects lowercase for issuing_country
        number: ssnNumber,
      })
      console.log(`[BRIDGE-SERVICE] Added SSN to identifying_information`)
    }
    
    // Driver's License (optional for US)
    if (dlNumber && dlFrontBase64 && dlBackBase64) {
      // Ensure base64 strings have the data URI prefix
      const frontImage = dlFrontBase64.startsWith('data:') ? dlFrontBase64 : `data:image/jpg;base64,${dlFrontBase64}`
      const backImage = dlBackBase64.startsWith('data:') ? dlBackBase64 : `data:image/jpg;base64,${dlBackBase64}`
      
      identifyingInformation.push({
        type: 'drivers_license',
        issuing_country: 'usa', // Bridge expects lowercase for issuing_country
        number: dlNumber,
        image_front: frontImage,
        image_back: backImage,
      })
      console.log(`[BRIDGE-SERVICE] Added driver's license to identifying_information`)
    }
  } else {
    // For non-US residents: Passport or National ID
    // Bridge expects issuing_country as alpha-3 code in lowercase (e.g., "gbr", "can")
    const issuingCountry = countryCode.toLowerCase()
    
    // Check ID type to determine which document to add
    if (idType === 'passport' && passportNumber && passportFrontBase64) {
      // Passport only needs front image
      const frontImage = passportFrontBase64.startsWith('data:') ? passportFrontBase64 : `data:image/jpg;base64,${passportFrontBase64}`
      
      identifyingInformation.push({
        type: 'passport',
        issuing_country: issuingCountry,
        number: passportNumber,
        image_front: frontImage, // Passport only needs front
      })
      console.log(`[BRIDGE-SERVICE] Added passport to identifying_information`)
    } else if ((idType === 'national_id' || !idType) && nationalIdNumber && nationalIdFrontBase64) {
      // National ID needs both front and back images
      const frontImage = nationalIdFrontBase64.startsWith('data:') ? nationalIdFrontBase64 : `data:image/jpg;base64,${nationalIdFrontBase64}`
      
      const nationalIdEntry: any = {
        type: 'national_id',
        issuing_country: issuingCountry,
        number: nationalIdNumber,
        image_front: frontImage,
      }
      
      // Add back image if available
      if (nationalIdBackBase64) {
        const backImage = nationalIdBackBase64.startsWith('data:') ? nationalIdBackBase64 : `data:image/jpg;base64,${nationalIdBackBase64}`
        nationalIdEntry.image_back = backImage
      }
      
      identifyingInformation.push(nationalIdEntry)
      console.log(`[BRIDGE-SERVICE] Added national ID to identifying_information`)
    } else if (passportNumber && passportFrontBase64) {
      // Fallback: if no idType specified but we have passport data, use it
      const frontImage = passportFrontBase64.startsWith('data:') ? passportFrontBase64 : `data:image/jpg;base64,${passportFrontBase64}`
      
      identifyingInformation.push({
        type: 'passport',
        issuing_country: issuingCountry,
        number: passportNumber,
        image_front: frontImage,
      })
      console.log(`[BRIDGE-SERVICE] Added passport to identifying_information (fallback)`)
    }
  }
  
  // Add identifying_information array to payload
  if (identifyingInformation.length > 0) {
    payload.identifying_information = identifyingInformation
    console.log(`[BRIDGE-SERVICE] Added ${identifyingInformation.length} items to identifying_information array`)
  } else {
    console.warn(`[BRIDGE-SERVICE] WARNING: No identifying_information provided. Customer creation may fail if ID documents are required.`)
  }

  // Documents - Proof of address (Bridge expects this format)
  if (proofOfAddressBase64) {
    // Ensure base64 string has the data URI prefix
    const addressImage = proofOfAddressBase64.startsWith('data:') ? proofOfAddressBase64 : `data:image/jpg;base64,${proofOfAddressBase64}`
    
    payload.documents = [{
      purposes: ['proof_of_address'],
      file: addressImage,
    }]
    console.log(`[BRIDGE-SERVICE] Added proof_of_address document to payload`)
  }

  // Request endorsements (for USD/EUR virtual accounts)
  const endorsements: string[] = []
  if (needsUSD) {
    endorsements.push('base')
  }
  if (needsEUR) {
    endorsements.push('sepa')
  }
  if (endorsements.length > 0) {
    payload.endorsements = endorsements
  }

  // Log final payload structure (without base64 images to avoid log spam)
  const payloadForLogging = { ...payload }
  if (payloadForLogging.identifying_information) {
    payloadForLogging.identifying_information = payloadForLogging.identifying_information.map((item: any) => ({
      ...item,
      image_front: item.image_front ? '[BASE64_IMAGE]' : undefined,
      image_back: item.image_back ? '[BASE64_IMAGE]' : undefined,
    }))
  }
  if (payloadForLogging.documents) {
    payloadForLogging.documents = payloadForLogging.documents.map((doc: any) => ({
      ...doc,
      file: doc.file ? '[BASE64_IMAGE]' : undefined,
    }))
  }
  
  console.log(`[BRIDGE-SERVICE] Final payload:`, JSON.stringify(payloadForLogging, null, 2))
  console.log(`[BRIDGE-SERVICE] Final payload keys:`, Object.keys(payload))

  return payload
}
