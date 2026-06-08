import { PrivacyPolicyPage } from "@/components/legal/privacy-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Privacy Policy",
    description:
      "How Easner Group, Inc. collects, uses, shares, and protects information across Easner Mobile, Easner Business, and easner.com.",
  },
})

export default function PrivacyPage() {
  return <PrivacyPolicyPage />
}
