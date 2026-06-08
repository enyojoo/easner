import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { cardsContent } from "@/lib/marketing/content/cards"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: cardsContent.metadata, path: "/cards" })

export default function CardsPage() {
  return <ProductPageSections content={cardsContent} />
}
