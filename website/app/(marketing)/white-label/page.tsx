import { ProductRelatedReading } from "@/components/blog/product-related-reading"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { partnersContent } from "@/lib/marketing/content/partners"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, faqPageJsonLd, financialServiceJsonLd, jsonLdScript, productAnswerJsonLd } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({
  metadata: partnersContent.metadata,
  path: "/white-label",
  titleAbsolute: partnersContent.metadata.title,
})

export default function PartnersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          ...(partnersContent.faq ? [faqPageJsonLd(partnersContent.faq)] : []),
          financialServiceJsonLd({
            name: "Easner White-label",
            description: partnersContent.metadata.description,
            path: "/white-label",
            serviceType: "Branded cross-border programs, Agency Model",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "White-label", path: "/white-label" },
          ]),
          ...productAnswerJsonLd(partnersContent, "/white-label"),
        ])}
      />
      <ProductPageSections content={partnersContent} beforeFaq={<ProductRelatedReading product="partners" />} />
    </>
  )
}
