import { PersonalBankingDisclosurePage } from "@/components/legal/disclosure-personal-banking-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Personal Banking product disclosure",
    description:
      "Short product disclosure for Easner Personal Banking: not a bank, partner-provided rails, and digital asset features.",
  },
  path: "/legal/disclosures/personal-banking",
})

export default function PersonalBankingDisclosureRoute() {
  return <PersonalBankingDisclosurePage />
}
