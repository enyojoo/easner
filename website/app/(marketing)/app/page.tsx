import type { Metadata } from "next"
import { DownloadCard } from "@/components/marketing/download-card"
import { DownloadHero } from "@/components/marketing/download-hero"
import { APP_LINK_PATH } from "@/lib/download-routing"
import { downloadMetadata } from "@/lib/marketing/content/download"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata: Metadata = {
  ...marketingMetadata({ metadata: downloadMetadata, path: APP_LINK_PATH }),
  robots: { index: true, follow: true },
}

export default function AppDownloadPage() {
  return (
    <>
      <DownloadHero />
      <DownloadCard />
    </>
  )
}
