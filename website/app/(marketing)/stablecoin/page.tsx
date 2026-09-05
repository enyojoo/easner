import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, CORRIDOR_AREA_SERVED, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: stablecoinContent.metadata, path: "/stablecoin" })

export default function StablecoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Stablecoin Payments",
            description: stablecoinContent.metadata.description,
            path: "/stablecoin",
            serviceType: "Stablecoin settlement behind familiar banking screens",
            areaServed: CORRIDOR_AREA_SERVED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Stablecoin", path: "/stablecoin" },
          ]),
        ])}
      />
      <ProductPageSections content={stablecoinContent} />
    </>
  )
}
