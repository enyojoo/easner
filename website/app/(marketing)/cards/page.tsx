import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { cardsContent } from "@/lib/marketing/content/cards"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: cardsContent.metadata, path: "/cards" })

export default function CardsPage() {
  return (
    <>
      <Script
        id="easner-cards-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Cards",
            description: cardsContent.metadata.description,
            path: "/cards",
            serviceType: "Virtual and physical cards with spend controls",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Cards", path: "/cards" },
          ]),
        ])}
      />
      <ProductPageSections content={cardsContent} />
    </>
  )
}
