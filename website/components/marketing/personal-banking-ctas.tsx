"use client"

import { cn } from "@/lib/utils"
import { useDownloadPlatform } from "@/hooks/use-download-platform"
import { DownloadAppButton } from "./download-app-button"
import { UseWebAppButton } from "./use-web-app-button"

interface PersonalBankingCtasProps {
  className?: string
  surface?: string
  downloadVariant?: "primary" | "dark" | "outline"
}

export function PersonalBankingCtas({
  className,
  surface = "persona",
  downloadVariant = "primary",
}: PersonalBankingCtasProps) {
  const platform = useDownloadPlatform()
  const showWebApp = platform === "desktop"

  return (
    <div className={cn("inline-flex flex-nowrap items-center gap-3", className)}>
      <DownloadAppButton variant={downloadVariant} surface={surface} />
      {showWebApp ? <UseWebAppButton surface={surface} /> : null}
    </div>
  )
}
