import { LightsparkEutFullPage } from "@/components/legal/lightspark-eut-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Lightspark Grid End User Terms",
    description:
      "Lightspark Grid End User Terms incorporated into Easner’s Terms of Service (Section 20) for eligible money transmission and Grid services.",
  },
  path: "/legal/lightspark-eut",
})

export default function LightsparkEutPage() {
  return <LightsparkEutFullPage />
}
