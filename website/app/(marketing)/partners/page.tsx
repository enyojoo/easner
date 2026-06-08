import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { partnersContent } from "@/lib/marketing/content/partners"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: partnersContent.metadata })

export default function PartnersPage() {
  return <ProductPageSections content={partnersContent} />
}
