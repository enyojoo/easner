/**
 * Generate Transaction ID
 * Format: ETID followed by 8 digits
 * Example: ETID27382930
 */
export function generateTransactionId(): string {
  // Get last 8 digits of timestamp to ensure uniqueness
  const timestamp = Date.now().toString()
  const last8Digits = timestamp.slice(-8)
  return `ETID${last8Digits}`
}

