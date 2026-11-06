import { LawEnforcementPage } from "@/components/legal/law-enforcement-content"
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
  return <LawEnforcementPage />
}
