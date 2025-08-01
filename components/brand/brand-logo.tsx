import { BRAND } from "./brand-constants"

interface BrandLogoProps {
  href?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ href, className = "", size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  return (
    <img
      src={BRAND.logo || "/placeholder.svg"}
      alt={`${BRAND.name} Logo`}
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  )
}
