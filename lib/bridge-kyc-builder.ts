// Bridge KYC Payload Builder
// Builds Bridge customer payload from KYC submissions stored in database

import { supabase, createServerClient } from "./supabase"
import { buildCustomerPayload, BuildCustomerPayloadParams } from "./bridge-service"
import { kycService } from "./kyc-service"
import { validateKYCForBridge, getBridgeRequirementsForCountry } from "./bridge-kyc-validator"

/**
 * Convert ISO 3166-1 alpha-2 country code to alpha-3 (for Bridge API)
 */
function countryCodeAlpha2ToAlpha3(alpha2: string): string {
  const mapping: Record<string, string> = {
    'US': 'USA',
    'GB': 'GBR',
    'CA': 'CAN',
    'AU': 'AUS',
    'NG': 'NGA',
    'KE': 'KEN',
    'GH': 'GHA',
    'ZA': 'ZAF',
    'IN': 'IND',
    'PK': 'PAK',
    'BD': 'BGD',
    'PH': 'PHL',
    'ID': 'IDN',
    'MY': 'MYS',
    'SG': 'SGP',
    'TH': 'THA',
    'VN': 'VNM',
    'CN': 'CHN',
    'JP': 'JPN',
    'KR': 'KOR',
    'BR': 'BRA',
    'MX': 'MEX',
    'AR': 'ARG',
    'CO': 'COL',
    'PE': 'PER',
    'CL': 'CHL',
    'EG': 'EGY',
    'MA': 'MAR',
    'TN': 'TUN',
    'DZ': 'DZA',
    'ET': 'ETH',
    'TZ': 'TZA',
    'UG': 'UGA',
    'RW': 'RWA',
    'SN': 'SEN',
    'CI': 'CIV',
    'CM': 'CMR',
    'AO': 'AGO',
    'MZ': 'MOZ',
    'ZW': 'ZWE',
    'BW': 'BWA',
    'NA': 'NAM',
    // EEA countries
    'AT': 'AUT', 'BE': 'BEL', 'BG': 'BGR', 'HR': 'HRV', 'CY': 'CYP', 'CZ': 'CZE',
    'DK': 'DNK', 'EE': 'EST', 'FI': 'FIN', 'FR': 'FRA', 'DE': 'DEU', 'GR': 'GRC',
    'HU': 'HUN', 'IE': 'IRL', 'IT': 'ITA', 'LV': 'LVA', 'LT': 'LTU', 'LU': 'LUX',
    'MT': 'MLT', 'NL': 'NLD', 'PL': 'POL', 'PT': 'PRT', 'RO': 'ROU', 'SK': 'SVK',
    'SI': 'SVN', 'ES': 'ESP', 'SE': 'SWE', 'IS': 'ISL', 'LI': 'LIE', 'NO': 'NOR',
  }
  return mapping[alpha2.toUpperCase()] || alpha2.toUpperCase()
}

/**
 * Download file from Supabase storage and convert to base64
 */
async function fileToBase64(filePath: string): Promise<string> {
  console.log(`[BRIDGE-KYC-BUILDER] Converting file to base64: ${filePath}`)
  const serverClient = createServerClient()
  
  // Download file from storage
  const { data, error } = await serverClient.storage
    .from("kyc-documents")
    .download(filePath)
  
  if (error) {
    console.error(`[BRIDGE-KYC-BUILDER] ❌ Failed to download file from storage:`, {
      filePath,
      error: error.message,
      statusCode: error.statusCode,
    })
    throw new Error(`Failed to download file from storage: ${error.message} (path: ${filePath})`)
  }
  
  if (!data) {
    console.error(`[BRIDGE-KYC-BUILDER] ❌ File data is empty for path: ${filePath}`)
    throw new Error(`File data is empty for path: ${filePath}`)
  }
  
  // Convert blob to base64
  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  
  console.log(`[BRIDGE-KYC-BUILDER] ✅ File converted to base64: ${filePath} (${base64.length} chars)`)
  return base64
}

/**
 * Parse structured address from metadata or free text
 */
function parseAddress(
  addressSubmission: any,
  countryCode: string
): { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string } {
  // First try to get structured address from metadata
  if (addressSubmission.metadata?.address) {
    const addr = addressSubmission.metadata.address
    return {
      line1: addr.line1 || '',
      line2: addr.line2,
      city: addr.city || '',
      state: addr.state,
      postalCode: addr.postalCode || '',
      country: countryCodeAlpha2ToAlpha3(countryCode),
    }
  }
  
  // Fallback: try to parse free text address
  // This is a simple parser - can be improved
  const freeText = addressSubmission.address || ''
  const parts = freeText.split(',').map(p => p.trim())
  
  return {
    line1: parts[0] || freeText,
    line2: parts.length > 4 ? parts[1] : undefined,
    city: parts[parts.length - 3] || parts[parts.length - 2] || '',
    state: parts.length > 3 ? parts[parts.length - 2] : undefined,
    postalCode: parts[parts.length - 1] || '',
    country: countryCodeAlpha2ToAlpha3(countryCode),
  }
}

/**
 * Build Bridge customer payload from KYC submissions in database
 */
export async function buildBridgeCustomerPayloadFromKyc(
  userId: string,
  signedAgreementId: string,
  needsUSD: boolean = true,
  needsEUR: boolean = false,
  client?: any // Optional Supabase client (server client to bypass RLS)
): Promise<any> {
  // Use provided client or default to supabase
  const dbClient = client || supabase
  
  // Step 1: Fetch user data
  console.log(`[BRIDGE-KYC-BUILDER] Fetching user data for userId:`, userId)
  const { data: user, error: userError } = await dbClient
    .from("users")
    .select("email, first_name, last_name")
    .eq("id", userId)
    .maybeSingle() // Use maybeSingle() instead of single() to handle no rows gracefully
  
  if (userError) {
    console.error(`[BRIDGE-KYC-BUILDER] Error fetching user:`, {
      error: userError.message,
      code: userError.code,
      details: userError.details,
      hint: userError.hint,
      userId,
    })
    throw new Error(`User not found: ${userError.message || "Unknown error"}`)
  }
  
  if (!user) {
    // Try to check if user exists at all
    const { count } = await dbClient
      .from("users")
      .select("*", { count: 'exact', head: true })
      .eq("id", userId)
    console.error(`[BRIDGE-KYC-BUILDER] User not found in database:`, {
      userId,
      userExists: count !== null && count > 0,
      count,
    })
    throw new Error(`User not found: No user data returned for userId ${userId}. User may not exist in database.`)
  }
  
  console.log(`[BRIDGE-KYC-BUILDER] User found:`, {
    hasEmail: !!user.email,
    hasFirstName: !!user.first_name,
    hasLastName: !!user.last_name,
  })
  
  if (!user.email || !user.first_name || !user.last_name) {
    throw new Error(`User missing required fields. Email: ${!!user.email}, First Name: ${!!user.first_name}, Last Name: ${!!user.last_name}`)
  }
  
  // Step 2: Fetch KYC submissions (use same client to bypass RLS)
  const submissions = await kycService.getByUserId(userId, dbClient)
  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")
  
  console.log(`[BRIDGE-KYC-BUILDER] KYC submissions:`, {
    count: submissions.length,
    identityFound: !!identitySubmission,
    addressFound: !!addressSubmission,
    identityStatus: identitySubmission?.status,
    addressStatus: addressSubmission?.status,
  })
  
  if (!identitySubmission) {
    throw new Error("Identity verification not found. Please complete identity verification first.")
  }
  
  if (!addressSubmission) {
    throw new Error("Address verification not found. Please complete address verification first.")
  }

  // Validate KYC data before building payload
  console.log(`[BRIDGE-KYC-BUILDER] Validating KYC data...`)
  const validation = validateKYCForBridge(
    identitySubmission,
    addressSubmission,
    user.email,
    user.first_name,
    user.last_name
  )

  if (!validation.isValid) {
    console.error(`[BRIDGE-KYC-BUILDER] KYC validation failed:`, {
      errors: validation.errors,
      warnings: validation.warnings,
      missingFields: validation.missingFields,
    })
    throw new Error(
      `KYC data validation failed:\n${validation.errors.join('\n')}\n\nMissing fields: ${validation.missingFields.join(', ')}`
    )
  }

  if (validation.warnings.length > 0) {
    console.warn(`[BRIDGE-KYC-BUILDER] KYC validation warnings:`, validation.warnings)
  }

  // Log country-specific requirements
  const countryCode = addressSubmission.country_code || identitySubmission.country_code
  if (countryCode) {
    const requirements = getBridgeRequirementsForCountry(countryCode)
    console.log(`[BRIDGE-KYC-BUILDER] Country requirements for ${countryCode}:`, requirements)
  }
  
  // Step 3: Extract metadata
  console.log(`[BRIDGE-KYC-BUILDER] Extracting metadata from submissions:`, {
    identityHasMetadata: !!identitySubmission.metadata,
    addressHasMetadata: !!addressSubmission.metadata,
    identityMetadataType: typeof identitySubmission.metadata,
    addressMetadataType: typeof addressSubmission.metadata,
    identityMetadataKeys: identitySubmission.metadata ? Object.keys(identitySubmission.metadata) : [],
    addressMetadataKeys: addressSubmission.metadata ? Object.keys(addressSubmission.metadata) : [],
  })
  
  const identityMetadata = identitySubmission.metadata || {}
  const addressMetadata = addressSubmission.metadata || {}
  
  // If metadata is a string, try to parse it
  let parsedIdentityMetadata = identityMetadata
  let parsedAddressMetadata = addressMetadata
  
  if (typeof identityMetadata === 'string') {
    try {
      parsedIdentityMetadata = JSON.parse(identityMetadata)
      console.log(`[BRIDGE-KYC-BUILDER] Parsed identity metadata from string`)
    } catch (e) {
      console.warn(`[BRIDGE-KYC-BUILDER] Failed to parse identity metadata as JSON:`, e)
      parsedIdentityMetadata = {}
    }
  }
  
  if (typeof addressMetadata === 'string') {
    try {
      parsedAddressMetadata = JSON.parse(addressMetadata)
      console.log(`[BRIDGE-KYC-BUILDER] Parsed address metadata from string`)
    } catch (e) {
      console.warn(`[BRIDGE-KYC-BUILDER] Failed to parse address metadata as JSON:`, e)
      parsedAddressMetadata = {}
    }
  }
  
  console.log(`[BRIDGE-KYC-BUILDER] Extracted metadata values:`, {
    ssn: parsedIdentityMetadata.ssn,
    phone: parsedIdentityMetadata.phone,
    passportNumber: parsedIdentityMetadata.passportNumber || parsedIdentityMetadata.nationalIdNumber,
    employmentStatus: parsedIdentityMetadata.employmentStatus,
    hasStructuredAddress: !!parsedAddressMetadata.address,
  })
  
  // Step 4: Parse address
  const addressCountryCode = addressSubmission.country_code || identitySubmission.country_code
  if (!addressCountryCode) {
    throw new Error("Country code not found in KYC submissions")
  }
  
  // Use structured address from metadata if available, otherwise parse from address field
  let structuredAddress
  if (parsedAddressMetadata.address && typeof parsedAddressMetadata.address === 'object') {
    structuredAddress = parsedAddressMetadata.address
    // Ensure country is in alpha-3 format
    if (structuredAddress.country && structuredAddress.country.length === 2) {
      structuredAddress.country = countryCodeAlpha2ToAlpha3(structuredAddress.country)
    }
    console.log(`[BRIDGE-KYC-BUILDER] Using structured address from metadata:`, structuredAddress)
  } else {
    structuredAddress = parseAddress(addressSubmission, addressCountryCode)
    console.log(`[BRIDGE-KYC-BUILDER] Parsed address from address field:`, structuredAddress)
  }
  
  // Validate address has required fields
  if (!structuredAddress.line1 || !structuredAddress.city || !structuredAddress.postalCode || !structuredAddress.country) {
    console.error(`[BRIDGE-KYC-BUILDER] Invalid address structure:`, structuredAddress)
    throw new Error(`Address is missing required fields. Required: line1, city, postalCode, country. Got: ${JSON.stringify(structuredAddress)}`)
  }
  
  // Step 5: Extract identity fields
  const isUSA = addressCountryCode.toUpperCase() === 'US'
  
  // Step 6: Convert documents to base64
  let passportFrontBase64: string | undefined
  let nationalIdFrontBase64: string | undefined
  let nationalIdBackBase64: string | undefined
  let dlFrontBase64: string | undefined
  let dlBackBase64: string | undefined
  let proofOfAddressBase64: string | undefined
  
  // Get ID type from submission
  const idType = identitySubmission.id_type || parsedIdentityMetadata.idType
  
  try {
    // For USA: Check for driver's license in metadata (optional)
    if (isUSA) {
      if (parsedIdentityMetadata.dlFrontBase64) {
        dlFrontBase64 = parsedIdentityMetadata.dlFrontBase64
      } else if (identitySubmission.id_document_url) {
        // Fallback to uploaded file if not in metadata
        dlFrontBase64 = await fileToBase64(identitySubmission.id_document_url)
      }
      
      if (parsedIdentityMetadata.dlBackBase64) {
        dlBackBase64 = parsedIdentityMetadata.dlBackBase64
      }
    } else {
      // For non-USA: Check ID type to determine passport vs national_id
      if (idType === 'passport') {
        // Passport: Get from metadata first (already base64), then fallback to file
        // Passport only needs front (Bridge requirement)
        if (parsedIdentityMetadata.passportFrontBase64) {
          passportFrontBase64 = parsedIdentityMetadata.passportFrontBase64
          console.log(`[BRIDGE-KYC-BUILDER] Using passport front from metadata`)
        } else if (identitySubmission.id_document_url) {
          // Fallback to uploaded file if not in metadata
      passportFrontBase64 = await fileToBase64(identitySubmission.id_document_url)
          console.log(`[BRIDGE-KYC-BUILDER] Converted passport front from uploaded file`)
        }
      } else {
        // National ID or other ID types: Get from uploaded file
        // National ID needs both front and back
        if (identitySubmission.id_document_url) {
          // For now, we use the uploaded file as front
          // TODO: If mobile app starts storing front/back separately, update this
          nationalIdFrontBase64 = await fileToBase64(identitySubmission.id_document_url)
          console.log(`[BRIDGE-KYC-BUILDER] Converted national ID front from uploaded file`)
        }
        
        // Check metadata for National ID images if stored separately
        if (parsedIdentityMetadata.nationalIdFrontBase64) {
          nationalIdFrontBase64 = parsedIdentityMetadata.nationalIdFrontBase64
        }
        if (parsedIdentityMetadata.nationalIdBackBase64) {
          nationalIdBackBase64 = parsedIdentityMetadata.nationalIdBackBase64
        }
      }
    }
    
    // Get proof of address document
    if (addressSubmission.address_document_url) {
      console.log(`[BRIDGE-KYC-BUILDER] Converting address document to base64: ${addressSubmission.address_document_url}`)
      proofOfAddressBase64 = await fileToBase64(addressSubmission.address_document_url)
      console.log(`[BRIDGE-KYC-BUILDER] ✅ Address document converted successfully (${proofOfAddressBase64.length} chars)`)
    } else {
      console.warn(`[BRIDGE-KYC-BUILDER] ⚠️ No address document URL found for address submission`)
    }
  } catch (error: any) {
    console.error("[BRIDGE-KYC-BUILDER] ❌ Error converting documents to base64:", {
      error: error.message,
      stack: error.stack,
      filePath: error.filePath || "unknown",
    })
    // Don't silently continue - throw error so it's visible
    throw new Error(`Failed to convert document to base64: ${error.message}`)
  }
  
  // Log what documents we're sending
  console.log(`[BRIDGE-KYC-BUILDER] Documents prepared for Bridge:`, {
    hasPassport: !!passportFrontBase64,
    hasNationalIdFront: !!nationalIdFrontBase64,
    hasNationalIdBack: !!nationalIdBackBase64,
    hasDlFront: !!dlFrontBase64,
    hasDlBack: !!dlBackBase64,
    hasProofOfAddress: !!proofOfAddressBase64,
    idType,
  })
  
  // Step 7: Build payload parameters
  const payloadParams: BuildCustomerPayloadParams = {
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    birthDate: identitySubmission.date_of_birth,
    address: structuredAddress,
    signedAgreementId,
    
    // USA-specific fields
    ssn: parsedIdentityMetadata.ssn,
    
    // International fields (non-USA)
    phone: parsedIdentityMetadata.phone,
    employmentStatus: parsedIdentityMetadata.employmentStatus,
    expectedMonthly: parsedIdentityMetadata.expectedMonthly,
    accountPurpose: parsedIdentityMetadata.accountPurpose,
    sourceOfFunds: parsedIdentityMetadata.sourceOfFunds,
    mostRecentOccupation: parsedIdentityMetadata.mostRecentOccupation ? String(parsedIdentityMetadata.mostRecentOccupation) : undefined,
    actingAsIntermediary: parsedIdentityMetadata.actingAsIntermediary,
    
    // ID documents
    dlNumber: parsedIdentityMetadata.dlNumber,
    dlFrontBase64: dlFrontBase64,
    dlBackBase64: dlBackBase64,
    passportNumber: parsedIdentityMetadata.passportNumber,
    passportFrontBase64: passportFrontBase64,
    nationalIdNumber: parsedIdentityMetadata.nationalIdNumber,
    nationalIdFrontBase64: nationalIdFrontBase64,
    nationalIdBackBase64: nationalIdBackBase64,
    idType: idType, // Pass ID type to determine passport vs national_id
    
    // Proof of address (for EEA and international)
    proofOfAddressBase64: proofOfAddressBase64,
    
    // Endorsements
    needsUSD,
    needsEUR,
  }
  
  // Step 8: Build and return Bridge payload
  // Build customer payload with all required fields for Bridge
  return buildCustomerPayload(payloadParams)
}




