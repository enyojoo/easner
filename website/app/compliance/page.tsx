import type { Metadata } from "next"
import { CompliancePolicyPage } from "@/components/legal/compliance-content"

export const metadata: Metadata = {
  title: "KYC/KYB and AML Policy",
}

export default function CompliancePage() {
  return <CompliancePolicyPage />
}
