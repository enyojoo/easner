import type { Metadata } from "next"
import { PrivacyPolicyPage } from "@/components/legal/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Easner Group, Inc. collects, uses, shares, and protects information across Easner Mobile (Easner Personal Banking), Easner Business (Easner Business Banking), and easner.com.",
}

export default function PrivacyPage() {
  return <PrivacyPolicyPage />
}
