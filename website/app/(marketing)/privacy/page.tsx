import { PrivacyPolicyPage } from "@/components/legal/privacy-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Privacy Policy",
    description:
      "How Easner Group, Inc. collects, uses, shares, and protects information across the Easner app, Easner Business, Easner for Partners, and easner.com.",
  },
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "Privacy Policy", path: "/privacy" }]} />
      <PrivacyPolicyPage />
    </>
  )
}
