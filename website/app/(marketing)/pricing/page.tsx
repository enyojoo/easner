import { FaqSection } from "@/components/marketing/faq-section"
import { PricingComparison } from "@/components/marketing/pricing-comparison"
import { PricingPlans } from "@/components/marketing/pricing-plans"
import { ComplianceStrip } from "@/components/marketing/compliance-strip"
import { pricingDefinition, pricingFaq, pricingMetadata } from "@/lib/marketing/content/pricing"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { answerEngineJsonLd, breadcrumbJsonLd, faqPageJsonLd, jsonLdScript, pricingOfferCatalogJsonLd } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({
  metadata: pricingMetadata,
  path: "/pricing",
  titleAbsolute: pricingMetadata.title,
})

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
          faqPageJsonLd(pricingFaq),
          ...answerEngineJsonLd({
            name: pricingMetadata.title,
            description: pricingMetadata.description,
            path: "/pricing",
            definition: pricingDefinition,
          }),
          pricingOfferCatalogJsonLd(),
        ])}
      />
      <PricingPlans />
      <PricingComparison />
      <FaqSection items={pricingFaq} />
      <ComplianceStrip />
    </>
  )
}
