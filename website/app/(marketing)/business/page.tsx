import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { businessContent } from "@/lib/marketing/content/business"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, CORRIDOR_AREA_SERVED, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: businessContent.metadata, path: "/business" })

export default function BusinessPage() {
  return (
    <>
      <Script
        id="easner-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Business Banking",
            description: businessContent.metadata.description,
            path: "/business",
            serviceType: "Cross-border business banking",
            areaServed: CORRIDOR_AREA_SERVED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Business Banking", path: "/business" },
          ]),
        ])}
      />
      <ProductPageSections content={businessContent} />
    </>
  )
}
