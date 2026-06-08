import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: stablecoinContent.metadata, path: "/stablecoin" })

export default function StablecoinPage() {
  return <ProductPageSections content={stablecoinContent} />
}
