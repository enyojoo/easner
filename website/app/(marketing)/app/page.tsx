import type { Metadata } from "next"
import { DownloadCard } from "@/components/marketing/download-card"
import { DownloadHero } from "@/components/marketing/download-hero"
import { APP_LINK_PATH } from "@/lib/download-routing"
import { APP_STORE_URL, PLAY_STORE_URL, EASNER_PRODUCT_PERSONAL } from "@/lib/marketing/constants"
import { downloadMetadata } from "@/lib/marketing/content/download"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, jsonLdScript, mobileApplicationJsonLd } from "@/lib/marketing/structured-data"

export const metadata: Metadata = {
  ...marketingMetadata({ metadata: downloadMetadata, path: APP_LINK_PATH, titleAbsolute: downloadMetadata.title }),
  robots: { index: true, follow: true },
}

export default function AppDownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          mobileApplicationJsonLd({
            name: EASNER_PRODUCT_PERSONAL,
            description: downloadMetadata.description,
            path: APP_LINK_PATH,
            downloadUrls: [APP_STORE_URL, PLAY_STORE_URL],
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Download", path: APP_LINK_PATH },
          ]),
        ])}
      />
      <DownloadHero />
      <DownloadCard />
    </>
  )
}
