import type { Metadata } from "next"
import { PrivacyPolicyPage } from "@/components/legal/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Easner Group, Inc. collects, uses, shares, and protects information across Easner Personal, Easner Business, and easner.com.",
}

export default function PrivacyPage() {
  return <PrivacyPolicyPage />
}
