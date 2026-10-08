"use client"

import {
  ArrowRightLeft,
  Briefcase,
  Code2,
  CreditCard,
  Landmark,
  Link2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Users2,
} from "lucide-react"
import Image, { type StaticImageData } from "next/image"
import developerPhoto from "@/assets/Developer.jpg"
import freelancerPhoto from "@/assets/Freelancer.jpg"
import otcAgentPhoto from "@/assets/otcagent.jpg"
import smePhoto from "@/assets/Sme.jpg"
import { cn } from "@/lib/utils"
import { CorridorCoverageVisual } from "./corridor-coverage-visual"
import { HomeHeroVisual, ScreenSlot, hasScreenSlot } from "./screens/screen-slots"

interface VisualSlotProps {
  assetId: string
  alt: string
  className?: string
  aspect?: "hero" | "feature" | "square" | "fill" | "card"
  priority?: boolean
  preload?: boolean
}

/** People photos for the homepage audience tabs: they keep a human feel beside the product screens elsewhere. */
const PERSONA_PHOTOS: Record<string, { src: StaticImageData; position: string }> = {
  "mkt-persona-diaspora": { src: freelancerPhoto, position: "50% 38%" },
  "mkt-persona-sme": { src: smePhoto, position: "50% 22%" },
  "mkt-persona-dev": { src: developerPhoto, position: "50% 42%" },
  "mkt-persona-otc": { src: otcAgentPhoto, position: "50% 35%" },
}

const iconByAsset = {
  "mkt-thumb-personal": Smartphone,
  "mkt-thumb-business": Landmark,
  "mkt-thumb-apis": Code2,
  "mkt-thumb-partners": Briefcase,
  "mkt-thumb-stablecoin": ArrowRightLeft,
  "mkt-thumb-invoicing": ReceiptText,
  "mkt-thumb-cards": CreditCard,
  "mkt-thumb-checkout": ShoppingCart,
  "mkt-thumb-paylinks": Link2,
  "mkt-thumb-payroll": Users2,
  "mkt-icon-api-banking": Landmark,
  "mkt-icon-api-agency": Users2,
  "mkt-icon-api-integration": Code2,
  "mkt-icon-security": LockKeyhole,
} as const

/**
 * A marketing visual by id. Product visuals are design-system screens (./screens); the corridor map and
 * icon tiles are the only other kinds.
 */
export function VisualSlot({ assetId, alt, className, aspect = "feature", priority = false }: VisualSlotProps) {
  if (assetId === "mkt-hero-home-01") return <HomeHeroVisual alt={alt} />

  const photo = PERSONA_PHOTOS[assetId]
  if (photo) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-web-band", className)}>
        <Image
          src={photo.src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition: photo.position }}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={priority}
          placeholder="blur"
        />
      </div>
    )
  }

  if (hasScreenSlot(assetId)) return <ScreenSlot assetId={assetId} alt={alt} className={className} />

  if (assetId === "mkt-map-corridors" || assetId === "mkt-diagram-invisible-rails") {
    if (aspect === "fill") {
      return (
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[1.75rem] border border-web-hairline bg-web-plate shadow-showcase",
            className,
          )}
          aria-label={alt}
        >
          <CorridorCoverageVisual className="h-full rounded-none border-0 shadow-none" />
        </div>
      )
    }
    return <CorridorCoverageVisual className={cn("aspect-[4/5] sm:aspect-[4/3]", className)} aria-label={alt} />
  }

  const Icon = iconByAsset[assetId as keyof typeof iconByAsset] ?? ShieldCheck
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[16px] border border-web-hairline bg-web-canvas text-brand-primary shadow-sm",
        aspect === "square" ? "aspect-square" : "aspect-[4/3]",
        className,
      )}
      aria-label={alt}
    >
      <Icon className="h-8 w-8" />
    </div>
  )
}
