import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { personalContent } from "@/lib/marketing/content/personal"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, CORRIDOR_AREA_SERVED, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: personalContent.metadata, path: "/personal" })

export default function PersonalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Personal Banking",
            description: personalContent.metadata.description,
            path: "/personal",
            serviceType: "Cross-border personal banking",
            areaServed: CORRIDOR_AREA_SERVED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Personal Banking", path: "/personal" },
          ]),
        ])}
      />
      <ProductPageSections content={personalContent} />
    </>
  )
}
