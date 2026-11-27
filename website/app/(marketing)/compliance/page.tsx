import { CompliancePolicyPage } from "@/components/legal/compliance-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "KYC/KYB and AML Policy",
    description:
      "Easner's KYC, KYB, and AML policy for Personal Banking, Business Banking, and Partners. Verification, screening, and transaction controls.",
  },
  path: "/compliance",
})

export default function CompliancePage() {
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "KYC/KYB and AML Policy", path: "/compliance" }]} />
      <CompliancePolicyPage />
    </>
  )
}
