import { DisclosuresIndexPage } from "@/components/legal/disclosures-index-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Product disclosures",
    description:
      "Short Easner product disclosures: Personal Banking, Business Banking, and digital assets and wallet.",
  },
  path: "/legal/disclosures",
})

export default function LegalDisclosuresIndexRoute() {
  return <DisclosuresIndexPage />
}
