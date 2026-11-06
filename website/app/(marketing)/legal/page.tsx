import { LegalHubPage } from "@/components/legal/legal-index-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Legal",
    description:
      "Easner legal hub: Terms, Privacy, compliance, partners register, disclosures, account deletion, and law enforcement requests.",
  },
  path: "/legal",
})

export default function LegalHubRoute() {
  return <LegalHubPage />
}
