/**
 * Generate Transaction ID
 * Format: ETID followed by 8 digits (matches web app)
 * Example: ETID27382930
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString()
  const last8Digits = timestamp.slice(-8)
  return `ETID${last8Digits}`
}
