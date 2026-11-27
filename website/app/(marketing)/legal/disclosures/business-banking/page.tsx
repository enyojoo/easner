import { BusinessBankingDisclosurePage } from "@/components/legal/disclosure-business-banking-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Business Banking product disclosure",
    description:
      "Short product disclosure for Easner Business Banking: not a bank, merchant and payroll responsibilities, and partner rails.",
  },
  path: "/legal/disclosures/business-banking",
})

export default function BusinessBankingDisclosureRoute() {
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "Legal", path: "/legal" }, { name: "Disclosures", path: "/legal/disclosures" }, { name: "Business Banking disclosure", path: "/legal/disclosures/business-banking" }]} />
      <BusinessBankingDisclosurePage />
    </>
  )
}
