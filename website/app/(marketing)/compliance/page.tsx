import { CompliancePolicyPage } from "@/components/legal/compliance-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "KYC/KYB and AML Policy",
    description:
      "Easner's KYC, KYB, and AML policy for Easner Mobile (Personal Banking) and Easner Business (Business Banking). Verification, screening, and transaction controls.",
  },
})

export default function CompliancePage() {
  return <CompliancePolicyPage />
}
