import type { Metadata } from "next"
import { CompliancePolicyPage } from "@/components/legal/compliance-content"

export const metadata: Metadata = {
  title: "KYC/KYB and AML Policy – Easner",
  description:
    "Easner's know-your-customer, know-your-business, and anti-money laundering policy for Easner Personal and Easner Business.",
}

export default function CompliancePage() {
  return <CompliancePolicyPage />
}
