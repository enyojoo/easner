import Link from "next/link"
import { BRAND } from "./brand-constants"

interface BusinessLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Link href - if provided, wraps in Link */
  href?: string
  className?: string
}

const sizeClasses = {
  sm: "h-4",
  md: "h-6",
  lg: "h-7",
}

export function BusinessLogo({ size = "md", href = "/", className = "" }: BusinessLogoProps) {
  const img = (
    <img
      src={BRAND.logoBusiness}
      alt="Easner Business"
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {img}
      </Link>
    )
  }

  return img
}
