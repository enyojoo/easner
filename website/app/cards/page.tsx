import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { cardsContent } from "@/lib/marketing/content/cards"

export const metadata: Metadata = {
  title: cardsContent.metadata.title,
  description: cardsContent.metadata.description,
  keywords: cardsContent.metadata.keywords,
}

export default function CardsPage() {
  return <ProductPage content={cardsContent} />
}
