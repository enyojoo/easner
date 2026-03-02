/**
 * Currency Account Type Utilities
 * 
 * Determines account type and required fields based on currency code
 */

export type AccountType = "us" | "uk" | "euro" | "generic"

export interface AccountTypeConfig {
  accountType: AccountType
  requiredFields: string[]
  optionalFields: string[]
  fieldLabels: Record<string, string>
  fieldPlaceholders: Record<string, string>
  fieldFormatters?: Record<string, (value: string) => string>
}

/**
 * Determines the account type from a currency code
 */
export function getAccountTypeFromCurrency(currencyCode: string): AccountType {
  const code = currencyCode.toUpperCase()
  
  if (code === "USD") {
    return "us"
  } else if (code === "GBP") {
    return "uk"
  } else if (code === "EUR") {
    return "euro"
  }
  
  return "generic"
}

/**
 * Gets the configuration for an account type
 */
export function getAccountTypeConfig(accountType: AccountType): AccountTypeConfig {
  switch (accountType) {
    case "us":
      return {
        accountType: "us",
        requiredFields: ["routing_number", "account_number", "account_name", "bank_name", "address_line1", "city", "state", "postal_code", "checking_or_savings"],
        optionalFields: ["address_line2"],
        fieldLabels: {
          routing_number: "Routing Number",
          account_number: "Account Number",
          account_name: "Account Name",
          bank_name: "Bank Name",
          address_line1: "Address Line 1",
          address_line2: "Address Line 2",
          city: "City",
          state: "State",
          postal_code: "ZIP Code",
          checking_or_savings: "Account Type",
        },
        fieldPlaceholders: {
          routing_number: "e.g., 123456789",
          account_number: "e.g., 1234567890",
          account_name: "e.g., Company Name LLC",
          bank_name: "e.g., Bank of America",
          address_line1: "e.g., 123 Main Street",
          address_line2: "e.g., Apt 4B (optional)",
          city: "e.g., New York",
          state: "e.g., NY",
          postal_code: "e.g., 10001",
          checking_or_savings: "Select account type",
        },
        fieldFormatters: {
          routing_number: (value: string) => {
            // Return digits only, no dashes
            return value.replace(/\D/g, "")
          },
        },
      }
    
    case "uk":
      return {
        accountType: "uk",
        requiredFields: ["sort_code", "account_number", "account_name", "bank_name"],
        optionalFields: ["iban", "swift_bic"],
        fieldLabels: {
          sort_code: "Sort Code",
          account_number: "Account Number",
          iban: "IBAN",
          swift_bic: "SWIFT/BIC",
          account_name: "Account Name",
          bank_name: "Bank Name",
        },
        fieldPlaceholders: {
          sort_code: "e.g., 123456",
          account_number: "e.g., 12345678",
          iban: "e.g., GB82 WEST 1234 5698 7654 32",
          swift_bic: "e.g., NWBKGB2L",
          account_name: "e.g., Company Name Ltd",
          bank_name: "e.g., Barclays Bank",
        },
        fieldFormatters: {
          sort_code: (value: string) => {
            // Return digits only, no dashes
            return value.replace(/\D/g, "")
          },
          iban: (value: string) => {
            // Format IBAN with spaces every 4 characters
            return value.replace(/(.{4})/g, "$1 ").trim()
          },
        },
      }
    
    case "euro":
      return {
        accountType: "euro",
        requiredFields: ["iban", "account_name", "bank_name"],
        optionalFields: ["swift_bic"],
        fieldLabels: {
          iban: "IBAN",
          swift_bic: "SWIFT/BIC",
          account_name: "Account Name",
          bank_name: "Bank Name",
        },
        fieldPlaceholders: {
          iban: "e.g., DE89 3704 0044 0532 0130 00",
          swift_bic: "e.g., COBADEFFXXX",
          account_name: "e.g., Company Name GmbH",
          bank_name: "e.g., Deutsche Bank",
        },
        fieldFormatters: {
          iban: (value: string) => {
            // Format IBAN with spaces every 4 characters
            return value.replace(/(.{4})/g, "$1 ").trim()
          },
        },
      }
    
    case "generic":
    default:
      return {
        accountType: "generic",
        requiredFields: ["account_number", "account_name", "bank_name"],
        optionalFields: [],
        fieldLabels: {
          account_number: "Account Number",
          account_name: "Account Name",
          bank_name: "Bank Name",
        },
        fieldPlaceholders: {
          account_number: "e.g., 1234567890",
          account_name: "e.g., Company Name",
          bank_name: "e.g., Bank Name",
        },
      }
  }
}

/**
 * Gets account type configuration from currency code
 */
export function getAccountTypeConfigFromCurrency(currencyCode: string): AccountTypeConfig {
  const accountType = getAccountTypeFromCurrency(currencyCode)
  return getAccountTypeConfig(accountType)
}

/**
 * Validates a field value based on account type and field name
 */
export function validateField(
  accountType: AccountType,
  fieldName: string,
  value: string
): { isValid: boolean; error?: string } {
  const config = getAccountTypeConfig(accountType)
  
  // Check if field is required
  if (config.requiredFields.includes(fieldName) && !value?.trim()) {
    return { isValid: false, error: `${config.fieldLabels[fieldName]} is required` }
  }
  
  // Field-specific validation
  switch (fieldName) {
    case "routing_number":
      if (value && !/^\d{9}$/.test(value.replace(/\D/g, ""))) {
        return { isValid: false, error: "Routing number must be 9 digits" }
      }
      break
    
    case "sort_code":
      if (value && !/^\d{6}$/.test(value.replace(/\D/g, ""))) {
        return { isValid: false, error: "Sort code must be 6 digits" }
      }
      break
    
    case "iban":
      if (value) {
        const ibanDigits = value.replace(/\s/g, "").replace(/\D/g, "")
        if (ibanDigits.length < 15 || ibanDigits.length > 34) {
          return { isValid: false, error: "IBAN must be between 15 and 34 characters" }
        }
      }
      break
    
    case "swift_bic":
      if (value && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value.toUpperCase())) {
        return { isValid: false, error: "SWIFT/BIC must be 8 or 11 characters (e.g., AAAA-GB-XX or AAAA-GB-XX-XXX)" }
      }
      break
  }
  
  return { isValid: true }
}

/**
 * Formats a field value for display
 */
export function formatFieldValue(accountType: AccountType, fieldName: string, value: string): string {
  if (!value) return ""
  
  const config = getAccountTypeConfig(accountType)
  const formatter = config.fieldFormatters?.[fieldName]
  
  if (formatter) {
    return formatter(value)
  }
  
  return value
}

