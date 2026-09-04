import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { personalContent } from "@/lib/marketing/content/personal"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: personalContent.metadata, path: "/personal" })

export default function PersonalPage() {
  return (
    <>
      <Script
        id="easner-personal-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Personal Banking",
            description: personalContent.metadata.description,
            path: "/personal",
            serviceType: "Cross-border personal banking",
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
