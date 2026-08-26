"use client"

import type { ComponentProps, MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { captureCtaClicked, inferDestinationType, tagLinkWithPhId } from "@/lib/marketing/analytics"
import {
  isBusinessEasnerUrl,
  resolveBusinessSignupHref,
} from "@/lib/marketing/business-signup-url"

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
  const resolvedHref = resolveBusinessSignupHref(href, analyticsLocation)
  const isBusinessSignup = isBusinessEasnerUrl(resolvedHref)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!placeholder && analyticsLocation) {
      captureCtaClicked({
        cta_location: analyticsLocation,
        cta_label: ctaLabel ?? (typeof children === "string" ? children : undefined),
        destination: resolvedHref,
        destination_type: inferDestinationType(resolvedHref, { external }),
      })
    }

    if (isBusinessSignup) {
      tagLinkWithPhId(event.currentTarget)
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
