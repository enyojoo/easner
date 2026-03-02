// Bridge KYC Data Validator
// Validates KYC submissions before building Bridge customer payload

import { KYCSubmission } from "./kyc-service"

export interface KYCValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingFields: string[]
}

/**
 * Validate KYC submissions for Bridge customer creation
 */
export function validateKYCForBridge(
  identitySubmission: KYCSubmission | undefined,
  addressSubmission: KYCSubmission | undefined,
  userEmail?: string,
  userFirstName?: string,
  userLastName?: string
): KYCValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const missingFields: string[] = []

  // Check user data
  if (!userEmail) {
    errors.push("User email is required")
    missingFields.push("email")
  }
  if (!userFirstName) {
    errors.push("User first name is required")
    missingFields.push("first_name")
  }
  if (!userLastName) {
    errors.push("User last name is required")
    missingFields.push("last_name")
  }

  // Check identity submission
  if (!identitySubmission) {
    errors.push("Identity verification submission is required")
    missingFields.push("identity_submission")
  } else {
    // Required identity fields
    if (!identitySubmission.full_name) {
      errors.push("Identity submission missing: full_name")
      missingFields.push("identity.full_name")
    }
    if (!identitySubmission.date_of_birth) {
      errors.push("Identity submission missing: date_of_birth")
      missingFields.push("identity.date_of_birth")
    }
    if (!identitySubmission.country_code) {
      errors.push("Identity submission missing: country_code")
      missingFields.push("identity.country_code")
    }

    // Check metadata
    const metadata = identitySubmission.metadata
    if (!metadata) {
      warnings.push("Identity submission missing metadata (may be required for Bridge)")
    } else {
      const isUSA = identitySubmission.country_code?.toUpperCase() === 'US'
      
      if (isUSA) {
        // USA requires SSN
        if (!metadata.ssn) {
          errors.push("USA users require SSN in identity metadata")
          missingFields.push("identity.metadata.ssn")
        }
      } else {
        // Non-USA requires ID type and number
        if (!metadata.idType && !metadata.passportNumber && !metadata.nationalIdNumber) {
          warnings.push("Non-USA users should have ID type and number in metadata")
        }
        
        // Check for passport/ID document
        if (!identitySubmission.id_document_url) {
          warnings.push("Non-USA users should have ID document uploaded")
        }
      }
    }
  }

  // Check address submission
  if (!addressSubmission) {
    errors.push("Address verification submission is required")
    missingFields.push("address_submission")
  } else {
    // Check country code
    if (!addressSubmission.country_code) {
      errors.push("Address submission missing: country_code")
      missingFields.push("address.country_code")
    }

    // Check for structured address in metadata
    const metadata = addressSubmission.metadata
    if (metadata && typeof metadata === 'object' && metadata.address) {
      const addr = metadata.address
      if (!addr.line1) {
        errors.push("Address missing: line1")
        missingFields.push("address.metadata.address.line1")
      }
      if (!addr.city) {
        errors.push("Address missing: city")
        missingFields.push("address.metadata.address.city")
      }
      if (!addr.postalCode) {
        errors.push("Address missing: postalCode")
        missingFields.push("address.metadata.address.postalCode")
      }
      if (!addr.country) {
        errors.push("Address missing: country")
        missingFields.push("address.metadata.address.country")
      }
    } else if (!addressSubmission.address) {
      // Fallback: check free text address
      errors.push("Address submission missing: address (structured or free text)")
      missingFields.push("address.address")
    }

    // Check for proof of address document
    if (!addressSubmission.address_document_url) {
      warnings.push("Address verification should have proof of address document")
    }
  }

  // Check status
  if (identitySubmission && identitySubmission.status !== 'approved') {
    warnings.push(`Identity verification status is '${identitySubmission.status}' (should be 'approved' for production)`)
  }
  if (addressSubmission && addressSubmission.status !== 'approved') {
    warnings.push(`Address verification status is '${addressSubmission.status}' (should be 'approved' for production)`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingFields,
  }
}

/**
 * Get country-specific requirements for Bridge
 */
export function getBridgeRequirementsForCountry(countryCode: string): {
  requiredFields: string[]
  optionalFields: string[]
  requiredDocuments: string[]
  optionalDocuments: string[]
} {
  const isUSA = countryCode.toUpperCase() === 'US'
  const isEEA = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO'
  ].includes(countryCode.toUpperCase())

  if (isUSA) {
    return {
      requiredFields: ['email', 'first_name', 'last_name', 'date_of_birth', 'address', 'ssn'],
      optionalFields: ['phone', 'employment_status', 'expected_monthly_payments', 'account_purpose', 'source_of_funds'],
      requiredDocuments: [],
      optionalDocuments: ['drivers_license', 'proof_of_address'],
    }
  } else if (isEEA) {
    return {
      requiredFields: ['email', 'first_name', 'last_name', 'date_of_birth', 'address', 'phone'],
      optionalFields: ['employment_status', 'expected_monthly_payments', 'account_purpose', 'source_of_funds'],
      requiredDocuments: ['passport_or_id', 'proof_of_address'],
      optionalDocuments: [],
    }
  } else {
    // International (non-USA, non-EEA)
    return {
      requiredFields: ['email', 'first_name', 'last_name', 'date_of_birth', 'address', 'phone'],
      optionalFields: ['employment_status', 'expected_monthly_payments', 'account_purpose', 'source_of_funds'],
      requiredDocuments: ['passport_or_id', 'proof_of_address'],
      optionalDocuments: [],
    }
  }
}

