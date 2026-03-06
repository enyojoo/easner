/** Returns payment instruction strings for a given currency and type (for PDF or text) */
export function getPaymentInstructions(
  currency: string,
  type: "bank" | "stablecoin"
): string[] {
  if (type === "bank") {
    if (currency === "USD") {
      return [
        "Only send ACH or domestic US Wire",
        "SWIFT is NOT supported",
        "Processing time: within 12–48 hours",
      ]
    }
    if (currency === "EUR") {
      return [
        "Only send SEPA transfers",
        "SWIFT is NOT supported",
        "Processing time: 1–3 business days",
      ]
    }
    if (currency === "GBP") {
      return [
        "Only send Faster Payments or BACS",
        "Processing time: same day or 1–2 business days",
      ]
    }
    if (currency === "NGN") {
      return ["Processing time: within 24 hours"]
    }
  }
  if (type === "stablecoin") {
    const stablecoin =
      currency === "USD"
        ? "USDC"
        : currency === "EUR"
          ? "EURC"
          : "USDC"
    return [
      `Only send ${stablecoin} on the supported network to this address`,
      "Sending unsupported assets will be lost",
      "Processing time: within seconds",
    ]
  }
  return []
}

/** Pass stablecoin name explicitly for send flow */
export function getStablecoinPaymentInstructions(stablecoin: "USDC" | "USDT"): string[] {
  return [
    `Only send ${stablecoin} on the supported network to this address`,
    "Sending unsupported assets will be lost",
    "Processing time: within seconds",
  ]
}
