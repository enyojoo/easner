import { TermsPolicyPage } from "@/components/legal/terms-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Terms of Service",
    description:
      "Terms of Service for Easner Mobile (Easner Personal Banking), Easner Business (Easner Business Banking), and related services. Easner is a fintech company, not a bank.",
  },
})

export default function TermsPage() {
  return <TermsPolicyPage />
}
