import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { businessContent } from "@/lib/marketing/content/business"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: businessContent.metadata, path: "/business" })

export default function BusinessPage() {
  return <ProductPageSections content={businessContent} />
}
