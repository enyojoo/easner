import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { developersContent } from "@/lib/marketing/content/developers"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: developersContent.metadata })

export default function DevelopersPage() {
  return <ProductPageSections content={developersContent} />
}
