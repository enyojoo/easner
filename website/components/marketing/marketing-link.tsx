"use client"

import type { ComponentProps, MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { captureCtaClicked, inferDestinationType } from "@/lib/marketing/analytics"
import {
  isBusinessEasnerUrl,
  resolveBusinessSignupHref,
} from "@/lib/marketing/business-signup-url"
import { isPersonalEasnerUrl, resolvePersonalAppHref } from "@/lib/marketing/personal-app-url"
import { registerOutboundAttribution } from "@/lib/marketing/outbound-attribution"

interface MarketingLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string
  external?: boolean
  analyticsLocation?: string
  ctaLabel?: string
  children: ReactNode
}

export function MarketingLink({
  href,
  external,
  analyticsLocation,
  ctaLabel,
  children,
  onClick,
  ...props
}: MarketingLinkProps) {
  const placeholder = href === "#"
  let resolvedHref = href

  if (analyticsLocation && isBusinessEasnerUrl(href)) {
    resolvedHref = resolveBusinessSignupHref(href, analyticsLocation)
  } else if (analyticsLocation && isPersonalEasnerUrl(href)) {
    resolvedHref = resolvePersonalAppHref(href)
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!placeholder && analyticsLocation) {
      if (isBusinessEasnerUrl(resolvedHref)) {
        registerOutboundAttribution(analyticsLocation, "business")
      } else if (isPersonalEasnerUrl(resolvedHref)) {
        registerOutboundAttribution(analyticsLocation, "personal")
      }

      captureCtaClicked({
        cta_location: analyticsLocation,
        cta_label: ctaLabel ?? (typeof children === "string" ? children : undefined),
        destination: resolvedHref,
        destination_type: inferDestinationType(resolvedHref, { external }),
      })
    }

    onClick?.(event)
  }

  return (
    <Link
      href={resolvedHref}
      target={external && !placeholder ? "_blank" : undefined}
      rel={external && !placeholder ? "noopener noreferrer" : undefined}
      onClick={placeholder ? (event) => event.preventDefault() : handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}
