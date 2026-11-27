import { LegalHubPage } from "@/components/legal/legal-index-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
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
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "Legal", path: "/legal" }]} />
      <LegalHubPage />
    </>
  )
}
