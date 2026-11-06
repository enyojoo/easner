import { BusinessBankingDisclosurePage } from "@/components/legal/disclosure-business-banking-content"
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
  return <BusinessBankingDisclosurePage />
}
