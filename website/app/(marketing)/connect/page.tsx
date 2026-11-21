import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { connectContent } from "@/lib/marketing/content/connect"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, faqPageJsonLd, financialServiceJsonLd, jsonLdScript, productAnswerJsonLd } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: connectContent.metadata, path: "/connect" })

export default function ConnectPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Connect",
            description: connectContent.metadata.description,
            path: "/connect",
            serviceType: "Platform payouts to people with Easner accounts",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Connect", path: "/connect" },
          ]),
          ...(connectContent.faq ? [faqPageJsonLd(connectContent.faq)] : []),
          ...productAnswerJsonLd(connectContent, "/connect"),
        ])}
      />
      <ProductPageSections content={connectContent} />
    </>
  )
}
