import { DigitalAssetsDisclosurePage } from "@/components/legal/disclosure-digital-assets-content"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({
  metadata: {
    title: "Disclosure: Digital assets and wallet",
    description:
      "Summary of digital asset and wallet features: not bank deposits, Turnkey self-custody signing, and irreversibility.",
  },
  path: "/legal/disclosures/digital-assets",
})

export default function DigitalAssetsDisclosureRoute() {
  return <DigitalAssetsDisclosurePage />
}
