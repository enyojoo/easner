import { PartnersPolicyPage } from "@/components/legal/partners-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Partners and service providers",
    description:
      "Register of financial partners and technology subprocessors that support Easner Personal Banking, Business Banking, and Easner Checkout.",
  },
  path: "/legal/partners",
})

export default function LegalPartnersPage() {
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "Legal", path: "/legal" }, { name: "Partners register", path: "/legal/partners" }]} />
      <PartnersPolicyPage />
    </>
  )
}
