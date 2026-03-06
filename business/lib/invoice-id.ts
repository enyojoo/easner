/**
 * Generate Invoice ID
 * Format: EINV followed by 8 digits (matches ETID pattern)
 * Example: EINV27382930
 */
export function generateInvoiceId(): string {
  const timestamp = Date.now().toString()
  const last8Digits = timestamp.slice(-8)
  return `EINV${last8Digits}`
}
