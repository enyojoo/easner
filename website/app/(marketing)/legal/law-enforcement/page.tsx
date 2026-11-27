import { LawEnforcementPage } from "@/components/legal/law-enforcement-content"
import { BreadcrumbSchema } from "@/components/marketing/breadcrumb-schema"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Law enforcement and subpoenas",
    description:
      "How government and law enforcement agencies can submit legal process to Easner and what we can provide in response.",
  },
  path: "/legal/law-enforcement",
})

export default function LawEnforcementRoute() {
  return (
    <>
      <BreadcrumbSchema segments={[{ name: "Legal", path: "/legal" }, { name: "Law enforcement requests", path: "/legal/law-enforcement" }]} />
      <LawEnforcementPage />
    </>
  )
}
