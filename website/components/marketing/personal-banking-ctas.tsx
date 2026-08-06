"use client"

import { cn } from "@/lib/utils"
import { PERSONAL_BANKING_CTA_DESCRIPTION_WEB_APP_ONLY } from "@/lib/marketing/constants"
import { useShowWebAppCta, usePersonalBankingCtaDescription } from "@/hooks/use-download-platform"
import { DownloadAppButton } from "./download-app-button"
import { UseWebAppButton } from "./use-web-app-button"

interface PersonalBankingCtasProps {
  className?: string
  surface?: string
  downloadVariant?: "primary" | "dark" | "outline"
  /** Override copy; `false` hides. Default: dynamic desktop/mobile copy. */
  description?: string | false
  compact?: boolean
  /** Center CTAs on mobile; use "center" for footer-style bands. */
  align?: "start" | "center" | "responsive"
  descriptionVariant?: "default" | "open-account"
  /** Download page: QR/email already present — hide download button, web app only. */
  webAppOnly?: boolean
}

export function PersonalBankingCtas({
  className,
  surface = "persona",
  downloadVariant = "primary",
  description,
  compact = false,
  align = "responsive",
  descriptionVariant = "default",
  webAppOnly = false,
}: PersonalBankingCtasProps) {
  const showWebApp = useShowWebAppCta()
  const dynamicDescription = usePersonalBankingCtaDescription(descriptionVariant)
  const resolvedDescription =
    description === false
      ? null
      : description ??
        (webAppOnly
          ? PERSONAL_BANKING_CTA_DESCRIPTION_WEB_APP_ONLY
          : dynamicDescription)

  // `responsive` matches split layouts (`lg:grid-cols-2`): center while stacked, left beside visual.
  const descriptionAlign =
    align === "center"
      ? "text-center"
      : align === "start"
        ? "text-left"
        : "text-center lg:text-left"

  const rowAlign =
    align === "center"
      ? "justify-center"
      : align === "start"
        ? "justify-start"
        : "justify-center lg:justify-start"

  return (
    <div className={cn("w-full min-w-0", className)}>
      {resolvedDescription ? (
        <p
          className={cn(
            "text-sm leading-6 text-[#5F665F]",
            descriptionAlign,
            compact ? "mb-3" : "mb-4"
          )}
        >
          {resolvedDescription}
        </p>
      ) : null}
      <div
        className={cn(
          "flex min-w-0 flex-nowrap items-center",
          rowAlign,
          compact ? "gap-2" : "gap-3"
        )}
      >
        {!webAppOnly ? (
          <DownloadAppButton variant={downloadVariant} surface={surface} compact={compact} />
        ) : null}
        {webAppOnly || showWebApp ? (
          <UseWebAppButton surface={surface} compact={compact} />
        ) : null}
      </div>
    </div>
  )
}
