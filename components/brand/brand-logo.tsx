import Link from "next/link"
import { BRAND } from "./brand-constants"

interface BrandLogoProps {
  href?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ href = "/", className = "", size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  const logoElement = (
    <img
      src={BRAND.logo || "/placeholder.svg"}
      alt={`${BRAND.name} Logo`}
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
