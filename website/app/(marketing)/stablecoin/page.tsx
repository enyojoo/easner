import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: stablecoinContent.metadata, path: "/stablecoin" })

export default function StablecoinPage() {
  return (
    <>
      <Script
        id="easner-stablecoin-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Stablecoin Payments",
            description: stablecoinContent.metadata.description,
            path: "/stablecoin",
            serviceType: "Stablecoin settlement behind familiar banking screens",
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
