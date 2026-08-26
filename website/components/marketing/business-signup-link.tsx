"use client"

import type { ComponentProps, MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { captureCtaClicked, tagLinkWithPhId } from "@/lib/marketing/analytics"
import { buildBusinessSignupUrl } from "@/lib/marketing/business-signup-url"

interface BusinessSignupLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  campaign: string
  ctaLabel?: string
  source?: string
  medium?: string
  children: ReactNode
}

export function BusinessSignupLink({
  campaign,
  ctaLabel,
  source,
  medium,
  children,
  onClick,
  ...props
}: BusinessSignupLinkProps) {
  const href = buildBusinessSignupUrl(campaign, { source, medium })

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    captureCtaClicked({
      cta_location: campaign,
      cta_label: ctaLabel ?? (typeof children === "string" ? children : undefined),
      destination: "business.easner.com/auth/signup",
      destination_type: "business_signup",
    })
    tagLinkWithPhId(event.currentTarget)
    onClick?.(event)
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
