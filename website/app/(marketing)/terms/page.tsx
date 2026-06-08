import { TermsPolicyPage } from "@/components/legal/terms-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Terms of Service",
    description:
      "Terms for Easner Mobile, Easner Business, Easner for Partners, and related services. Easner is a fintech company, not a bank.",
  },
  path: "/terms",
})

export default function TermsPage() {
  return <TermsPolicyPage />
}
