import { BRAND } from "../constants/brand"

export interface BrandLogoProps {
  href?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ href, className = "", size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-4",
    md: "h-6",
    lg: "h-7",
  }

  const img = (
    <img
      src={BRAND.logo || "/placeholder.svg"}
      alt={`${BRAND.name} Logo`}
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  )

  if (href) {
    return <a href={href}>{img}</a>
  }

  return img
}
