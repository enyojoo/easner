import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"

export const alt = "Easner KYC/KYB and AML Policy"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: "KYC/KYB and AML Policy",
    subhead:
      "Easner's know-your-customer, know-your-business, and anti-money laundering policy for Easner Personal and Easner Business.",
  })
}
