import { ThreeColCards } from "./three-col-cards"
import { ALL_PRODUCT_CARDS } from "@/lib/marketing/shared-content"

export function ProductGrid() {
  return (
    <ThreeColCards
      id="products"
      analyticsSection="homepage_products"
      headline="One infrastructure. Many ways to use."
      headlineClassName="lg:whitespace-nowrap xl:text-4xl"
      items={ALL_PRODUCT_CARDS}
      showIcons
    />
  )
}
