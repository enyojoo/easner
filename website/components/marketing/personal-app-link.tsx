"use client"

import type { ComponentProps, MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { captureCtaClicked } from "@/lib/marketing/analytics"
import { registerOutboundAttribution } from "@/lib/marketing/outbound-attribution"
import { buildPersonalAppUrl } from "@/lib/marketing/personal-app-url"
import { posthog } from "@/lib/posthog"

interface PersonalAppLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  campaign: string
  ctaLabel?: string
  href?: string
  children: ReactNode
}

export function PersonalAppLink({
  campaign,
  ctaLabel,
  href: hrefProp,
  children,
  onClick,
  ...props
}: PersonalAppLinkProps) {
  const href = buildPersonalAppUrl(hrefProp)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    registerOutboundAttribution(campaign, "personal")
    posthog.capture("web_app_click", { surface: campaign })
    captureCtaClicked({
      cta_location: campaign,
      cta_label: ctaLabel ?? (typeof children === "string" ? children : undefined),
      destination: "app.easner.com",
      destination_type: "personal_app",
    })
    onClick?.(event)
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
