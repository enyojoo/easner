import Image from "next/image"
import { mediaUrl } from "@/lib/blog/urls"
import type { FocalPoint } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

interface CoverImageProps {
  path: string | null
  alt: string | null
  focal: FocalPoint | null
  /** Tailwind aspect class. The design uses 16:9 for cards and 21:9 for the post header on desktop. */
  aspect?: string
  sizes: string
  priority?: boolean
  className?: string
  /** Intrinsic size hints (no layout shift). The box crops with object-fit. */
  width?: number
  height?: number
}

/**
 * The post's uploaded cover, cropped around its focal point. Nothing is drawn on top of it (BlogCover guide). A post
 * with no cover shows a quiet plate instead of a broken image.
 */
export function CoverImage({
  path,
  alt,
  focal,
  aspect = "aspect-video",
  sizes,
  priority,
  className,
  width = 1200,
  height = 675,
}: CoverImageProps) {
  if (!path) return <div className={cn("w-full bg-web-plate", aspect, className)} aria-hidden="true" />
  const src = mediaUrl(path)
  return (
    <div className={cn("relative w-full overflow-hidden bg-web-plate", aspect, className)}>
      <Image
        src={src}
        alt={alt ?? ""}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("/")}
        className="h-full w-full object-cover"
        style={focal ? { objectPosition: `${Math.round(focal.x * 100)}% ${Math.round(focal.y * 100)}%` } : undefined}
      />
    </div>
  )
}
