import type { Metadata } from "next"
import { DownloadCard } from "@/components/marketing/download-card"
import { DownloadHero } from "@/components/marketing/download-hero"
import { DOWNLOAD_PATH } from "@/lib/marketing/constants"
import { downloadMetadata } from "@/lib/marketing/content/download"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata: Metadata = {
  ...marketingMetadata({ metadata: downloadMetadata, path: DOWNLOAD_PATH }),
  robots: { index: true, follow: true },
}

export default function DownloadPage() {
  return (
    <>
      <DownloadHero />
      <DownloadCard />
    </>
  )
}
