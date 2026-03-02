/**
 * Formatters for various input types
 */

/**
 * Format phone number as user types
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format based on length
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
}

/**
 * Format account number (spaces every 4 digits)
 */
export function formatAccountNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Format IBAN (spaces every 4 characters)
 */
export function formatIBAN(value: string): string {
  const cleaned = value.replace(/\s/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Format card number (spaces every 4 digits)
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Format sort code (spaces every 2 digits)
 */
export function formatSortCode(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/(.{2})/g, '$1-').replace(/-$/, '')
}

/**
 * Format routing number (9 digits, no spaces)
 */
export function formatRoutingNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 9)
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: string,
  showSymbol: boolean = true
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    KES: 'KSh',
    GHS: 'GH₵',
    RUB: '₽',
  }

  const symbol = symbols[currency] || currency
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return showSymbol ? `${symbol}${formatted}` : formatted
}

/**
 * Map Bridge API transaction status to user-friendly label and color
 * Matches logic used in BridgeTransactionDetailsScreen
 */
export function getTransactionStatusDisplay(status: string): { label: string; color: string } | null {
  if (!status) return null
  const statusLower = status.toLowerCase()
  if (statusLower.includes('processed') || statusLower.includes('completed')) {
    return { label: 'Completed', color: '#10B981' }
  }
  if (statusLower.includes('pending') || statusLower.includes('awaiting') || statusLower.includes('scheduled') || statusLower.includes('received') || statusLower.includes('submitted')) {
    return { label: 'Processing', color: '#1D4FF3' }
  }
  if (statusLower.includes('failed') || statusLower.includes('returned')) {
    return { label: 'Failed', color: '#EF4444' }
  }
  if (statusLower.includes('refunded')) {
    return { label: 'Refunded', color: '#EF4444' }
  }
  if (statusLower.includes('review')) {
    return { label: 'In Review', color: '#F59E0B' }
  }
  if (statusLower.includes('cancelled')) {
    return { label: 'Cancelled', color: '#6B7280' }
  }
  return { label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), color: '#6B7280' }
}

/**
 * Format large numbers (e.g., 1.5M for 1,500,000)
 */
export function formatLargeNumber(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toString()
}






















