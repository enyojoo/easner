import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { personalContent } from "@/lib/marketing/content/personal"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: personalContent.metadata })

export default function PersonalPage() {
  return <ProductPageSections content={personalContent} />
}
