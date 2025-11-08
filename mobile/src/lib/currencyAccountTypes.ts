/**
 * Currency Account Type Utilities (Mobile)
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
        requiredFields: ["account_name", "bank_name", "routing_number", "account_number"],
        optionalFields: [],
        fieldLabels: {
          account_name: "Account Name",
          bank_name: "Bank Name",
          routing_number: "Routing Number",
          account_number: "Account Number",
        },
        fieldPlaceholders: {
          account_name: "e.g., John Doe",
          bank_name: "e.g., Bank of America",
          routing_number: "e.g., 123456789",
          account_number: "e.g., 1234567890",
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
        requiredFields: ["account_name", "bank_name", "sort_code", "account_number"],
        optionalFields: ["iban", "swift_bic"],
        fieldLabels: {
          account_name: "Account Name",
          bank_name: "Bank Name",
          sort_code: "Sort Code",
          account_number: "Account Number",
          iban: "IBAN",
          swift_bic: "SWIFT/BIC",
        },
        fieldPlaceholders: {
          account_name: "e.g., Jane Smith",
          bank_name: "e.g., Barclays Bank",
          sort_code: "e.g., 123456",
          account_number: "e.g., 12345678",
          iban: "e.g., GB82 WEST 1234 5698 7654 32",
          swift_bic: "e.g., NWBKGB2L",
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
        requiredFields: ["account_name", "bank_name", "iban"],
        optionalFields: ["swift_bic"],
        fieldLabels: {
          account_name: "Account Name",
          bank_name: "Bank Name",
          iban: "IBAN",
          swift_bic: "SWIFT/BIC",
        },
        fieldPlaceholders: {
          account_name: "e.g., Max Mustermann",
          bank_name: "e.g., Deutsche Bank",
          iban: "e.g., DE89 3704 0044 0532 0130 00",
          swift_bic: "e.g., COBADEFFXXX",
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
        requiredFields: ["account_name", "bank_name", "account_number"],
        optionalFields: [],
        fieldLabels: {
          account_name: "Account Name",
          bank_name: "Bank Name",
          account_number: "Account Number",
        },
        fieldPlaceholders: {
          account_name: "e.g., Recipient Name",
          bank_name: "e.g., Local Bank",
          account_number: "e.g., 1234567890",
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

