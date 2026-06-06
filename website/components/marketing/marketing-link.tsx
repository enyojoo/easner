"use client"

import type { ComponentProps, ReactNode } from "react"
import Link from "next/link"

interface MarketingLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string
  external?: boolean
  children: ReactNode
}

export function MarketingLink({ href, external, children, ...props }: MarketingLinkProps) {
  const placeholder = href === "#"

  return (
    <Link
      href={href}
      target={external && !placeholder ? "_blank" : undefined}
      rel={external && !placeholder ? "noopener noreferrer" : undefined}
      onClick={placeholder ? (event) => event.preventDefault() : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}
