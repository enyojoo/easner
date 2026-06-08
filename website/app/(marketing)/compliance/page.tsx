import type { Metadata } from "next"
import { CompliancePolicyPage } from "@/components/legal/compliance-content"

export const metadata: Metadata = {
  title: "KYC/KYB and AML Policy",
  description:
    "Easner's know-your-customer, know-your-business, and anti-money laundering policy for Easner Mobile (Easner Personal Banking) and Easner Business (Easner Business Banking).",
}

export default function CompliancePage() {
  return <CompliancePolicyPage />
}
