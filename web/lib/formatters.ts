/**
 * Formatters for various input types
 * Used for formatting user input in recipient forms
 */

/**
 * Format routing number (9 digits, no spaces)
 */
export function formatRoutingNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9)
}

/**
 * Format sort code (6 digits, formatted as XX-XX-XX)
 */
export function formatSortCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

/**
 * Format IBAN (spaces every 4 characters)
 */
export function formatIBAN(value: string): string {
  const cleaned = value.replace(/\s/g, "").toUpperCase()
  return cleaned.replace(/(.{4})/g, "$1 ").trim()
}

/**
 * Format account number (spaces every 4 digits)
 */
export function formatAccountNumber(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

