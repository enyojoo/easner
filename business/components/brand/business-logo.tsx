import Link from "next/link"
import { BrandLogo } from "./brand-logo"

interface BusinessLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Link href - if provided, wraps in Link */
  href?: string
  className?: string
}

const brandLogoSize = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
}

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
}

export function BusinessLogo({ size = "md", href = "/", className = "" }: BusinessLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex shrink-0 items-center">
        <BrandLogo size={brandLogoSize[size]} />
      </span>
      <span className={`font-medium text-muted-foreground leading-none ${textSizes[size]}`}>Business</span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
