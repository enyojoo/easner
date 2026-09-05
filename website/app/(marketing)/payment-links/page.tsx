import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { paymentLinksContent } from "@/lib/marketing/content/payment-links"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, faqPageJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: paymentLinksContent.metadata, path: "/payment-links" })

export default function PaymentLinksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Payment Links",
            description: paymentLinksContent.metadata.description,
            path: "/payment-links",
            serviceType: "No-code payment links for online collection",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Payment Links", path: "/payment-links" },
          ]),
          ...(paymentLinksContent.faq ? [faqPageJsonLd(paymentLinksContent.faq)] : []),
        ])}
      />
      <ProductPageSections content={paymentLinksContent} />
    </>
  )
}
